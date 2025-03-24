import { createClient } from '@supabase/supabase-js';

/**
 * API route handler to check the status of the Supabase edge function
 */
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-client-info');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Create Supabase client using env variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gckvjovozupvteqivjiv.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja3Zqb3ZvenVwdnRlcWl2aml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyODcsImV4cCI6MjA1ODQwNzI4N30.jKqHs21xpUtAcooiAOL-e04fkYEGVqEdpdSfB7PLnrs';
    
    // Try to ping the edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/get_content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'x-client-info': 'vercel-status-check/1.0.0'
      },
      body: JSON.stringify({ 
        user_id: '94ea550b-0f42-4266-81a6-94888a1eb91a',
        referrer: 'https://status-check.com',
        url: 'https://example.com'
      })
    });

    const data = await response.json();
    
    return res.status(200).json({
      status: 'success',
      message: 'Edge function is responding correctly',
      edge_function_status: response.status,
      edge_function_response: data,
      vercel_api_proxy: {
        status: 'active',
        url: `${req.headers.host}/api/get_content`
      },
      script_url: `${req.headers.host}/scripts/unusual.js`
    });
  } catch (error) {
    console.error('Error checking edge function status:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Could not connect to Supabase Edge Function',
      error: error.message,
      vercel_api_proxy: {
        status: 'active',
        url: `${req.headers.host}/api/get_content`
      }
    });
  }
} 