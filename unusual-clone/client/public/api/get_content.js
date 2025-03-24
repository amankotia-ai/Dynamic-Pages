// This is a static file that redirects to the Supabase Edge Function
// It will be available as /api/get_content in the static deployment

// Redirect to the actual function with CORS headers
export default function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-client-info');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Forward to Supabase Edge Function
  res.redirect(307, 'https://gckvjovozupvteqivjiv.supabase.co/functions/v1/get_content');
} 