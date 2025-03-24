import { createClient } from '@supabase/supabase-js';

/**
 * API route handler for content personalization
 * Acts as a proxy to the Supabase edge function
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, referrer, url } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Create Supabase client using env variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gckvjovozupvteqivjiv.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja3Zqb3ZvenVwdnRlcWl2aml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyODcsImV4cCI6MjA1ODQwNzI4N30.jKqHs21xpUtAcooiAOL-e04fkYEGVqEdpdSfB7PLnrs';
    
    console.log(`Proxying request to ${supabaseUrl}/functions/v1/get_content`);
    
    // Forward the request to Supabase Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/get_content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'x-client-info': 'vercel-proxy/1.0.0'
      },
      body: JSON.stringify({ user_id, referrer, url })
    });

    // Get response from Supabase
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
} 