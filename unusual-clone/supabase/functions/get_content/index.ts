import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

console.log('Unusual Content Edge Function v1.1.0 loaded');

// Define the interface for request body
interface RequestBody {
  user_id: string;
  referrer: string | null;
  url: string;
}

interface Replacement {
  selector: string;
  content: string;
}

// Helper function to add CORS headers to all responses
const addCorsHeaders = (response: Response): Response => {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, x-client-info');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

// Helper function to create standardized error responses
const createErrorResponse = (message: string, status = 400, details: any = null) => {
  const errorBody = { 
    error: message,
    ...(details && { details })
  };
  
  return addCorsHeaders(new Response(
    JSON.stringify(errorBody),
    { 
      headers: { 'Content-Type': 'application/json' },
      status
    }
  ));
};

serve(async (req) => {
  // Add request logging for debugging
  console.log(`Request received: ${req.method} ${new URL(req.url).pathname}`);
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return addCorsHeaders(new Response(null, {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 204,
    }));
  }

  try {
    // Check content type
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return createErrorResponse('Content-Type must be application/json', 415);
    }

    // Validate request method
    if (req.method !== 'POST') {
      return createErrorResponse('Method not allowed', 405);
    }

    // Parse request body with error handling
    let reqData: RequestBody;
    try {
      reqData = await req.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON payload', 400, error.message);
    }

    const { user_id, referrer, url } = reqData;

    // Validate required fields
    if (!user_id) {
      return createErrorResponse('User ID is required');
    }

    if (!url) {
      return createErrorResponse('URL is required');
    }

    // Log request parameters
    console.log('Processing request:', { 
      user_id, 
      referrer: referrer?.substring(0, 50) || 'null', 
      url: url?.substring(0, 50) + '...' 
    });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://gckvjovozupvteqivjiv.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja3Zqb3ZvenVwdnRlcWl2aml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyODcsImV4cCI6MjA1ODQwNzI4N30.jKqHs21xpUtAcooiAOL-e04fkYEGVqEdpdSfB7PLnrs';
    
    // Validate Supabase credentials
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing');
      return createErrorResponse('Server configuration error', 500);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First query: Get all active sources for the user without joining replacements
    // This avoids the ambiguous param_name issue completely
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('id, rule_type, rule_value, param_name, param_value')
      .eq('user_id', user_id)
      .eq('active', true)
      .order('priority', { ascending: true });

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      return createErrorResponse('Failed to fetch sources', 500, sourcesError);
    }

    console.log(`Found ${sources?.length || 0} potential sources`);

    // No sources found - return empty replacements
    if (!sources || sources.length === 0) {
      return addCorsHeaders(new Response(
        JSON.stringify({ replacements: [] }),
        { headers: { 'Content-Type': 'application/json' } }
      ));
    }

    try {
      // Parse URL for parameters with proper error handling
      let urlObj: URL;
      let urlParams: URLSearchParams;
      
      try {
        urlObj = new URL(url);
        urlParams = new URLSearchParams(urlObj.search);
      } catch (error) {
        console.error('Invalid URL format:', error);
        return createErrorResponse('Invalid URL format', 400);
      }

      // Find matching source based on rules
      let matchingSourceId = null;

      for (const source of sources) {
        // Rule 1: referrer_contains
        if (source.rule_type === 'referrer_contains' && 
            referrer && 
            source.rule_value && 
            referrer.includes(source.rule_value)) {
          
          console.log(`Found matching source by referrer: ${source.id}`);
          matchingSourceId = source.id;
          break;
        } 
        // Rule 2: url_param_equals
        else if (source.rule_type === 'url_param_equals' &&
                source.param_name &&
                source.param_value &&
                urlParams.get(source.param_name) === source.param_value) {
          
          console.log(`Found matching source by URL param: ${source.id}`);
          matchingSourceId = source.id;
          break;
        }
      }

      // If we found a matching source, get its replacements with a separate query
      if (matchingSourceId) {
        const { data: replacements, error: replacementsError } = await supabase
          .from('replacements')
          .select('selector, content')
          .eq('source_id', matchingSourceId);

        if (replacementsError) {
          console.error('Error fetching replacements:', replacementsError);
          return createErrorResponse('Failed to fetch replacements', 500, replacementsError);
        }

        // Handle null replacements case
        const finalReplacements: Replacement[] = replacements || [];
        console.log(`Returning ${finalReplacements.length} replacements`);
        
        return addCorsHeaders(new Response(
          JSON.stringify({ 
            replacements: finalReplacements,
            success: true,
            source_id: matchingSourceId
          }),
          { headers: { 'Content-Type': 'application/json' } }
        ));
      }
      
      // No matching rules found
      console.log('No matching source found');
      return addCorsHeaders(new Response(
        JSON.stringify({ replacements: [], success: true }),
        { headers: { 'Content-Type': 'application/json' } }
      ));
      
    } catch (error) {
      console.error('Error processing URL:', error);
      return createErrorResponse('Error processing request', 500, error.message);
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return createErrorResponse('Internal server error', 500, error.message);
  }
}); 