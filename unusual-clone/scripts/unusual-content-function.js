/**
 * Alternative Edge Function Implementation for get_content
 * This function does not rely on the database stored procedure with the ambiguous param_name issue
 */

// Function handler for Supabase Edge Function
export async function handler(req, res) {
  // Allow CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
    res.status(204).send('');
    return;
  }

  // Ensure headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Parse request body
    const { user_id, referrer, url } = req.body;

    if (!user_id) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Create Supabase client
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL || 'https://gckvjovozupvteqivjiv.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja3Zqb3ZvenVwdnRlcWl2aml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyODcsImV4cCI6MjA1ODQwNzI4N30.jKqHs21xpUtAcooiAOL-e04fkYEGVqEdpdSfB7PLnrs';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active sources for the user - AVOIDING the ambiguous param_name issue
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('id, rule_type, rule_value, param_name, param_value')
      .eq('user_id', user_id)
      .eq('active', true)
      .order('priority', { ascending: true });

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      res.status(500).json({ error: 'Failed to fetch sources' });
      return;
    }

    // No sources found
    if (!sources || sources.length === 0) {
      res.status(200).json({ replacements: [] });
      return;
    }

    try {
      // Parse URL for parameters
      const urlObj = new URL(url);
      const urlParams = new URLSearchParams(urlObj.search);

      // Find matching source based on rules
      let matchingSourceId = null;

      for (const source of sources) {
        if (source.rule_type === 'referrer_contains' && referrer && referrer.includes(source.rule_value)) {
          matchingSourceId = source.id;
          break;
        } else if (
          source.rule_type === 'url_param_equals' &&
          source.param_name &&
          source.param_value &&
          urlParams.get(source.param_name) === source.param_value
        ) {
          matchingSourceId = source.id;
          break;
        }
      }

      // If we found a matching source, get its replacements
      if (matchingSourceId) {
        const { data: replacements, error: replacementsError } = await supabase
          .from('replacements')
          .select('selector, content')
          .eq('source_id', matchingSourceId);

        if (replacementsError) {
          console.error('Error fetching replacements:', replacementsError);
          res.status(500).json({ error: 'Failed to fetch replacements' });
          return;
        }

        res.status(200).json({ replacements: replacements || [] });
        return;
      }
      
      // No matching rules found
      res.status(200).json({ replacements: [] });
      
    } catch (urlError) {
      console.error('Error parsing URL:', urlError);
      // Continue with empty replacements instead of failing
      res.status(200).json({ replacements: [] });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 