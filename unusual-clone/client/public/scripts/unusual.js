/**
 * Unusual Clone - Client-side personalization script
 * This script fetches personalized content based on referrer and URL parameters
 * and applies it to the target website.
 * Version 1.2.0
 */
(function() {
  // Function to extract user_id from script tag or URL params
  const getUserId = function() {
    // First try to get from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('user_id');
    
    if (userIdFromUrl) return userIdFromUrl;
    
    // If not in URL, try to extract from script tag
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.includes('unusual.js')) {
        try {
          const scriptUrl = new URL(scripts[i].src);
          return scriptUrl.searchParams.get('user_id');
        } catch (e) {
          console.error('Unusual: Error parsing script URL:', e);
        }
      }
    }
    
    // No user ID found
    return null;
  };

  // Function to apply replacements to the DOM
  const applyReplacements = function(replacements) {
    if (!replacements || !Array.isArray(replacements)) return;
    
    replacements.forEach(function(replacement) {
      try {
        const elements = document.querySelectorAll(replacement.selector);
        
        if (elements && elements.length > 0) {
          elements.forEach(function(element) {
            element.innerHTML = replacement.content;
          });
          console.log(`Unusual: Applied replacement to selector "${replacement.selector}"`);
        } else {
          console.log('Unusual: No elements found for selector', replacement.selector);
        }
      } catch (error) {
        console.error('Unusual: Error applying replacement', error);
      }
    });
  };

  // Main function to fetch and apply content
  const fetchAndApplyContent = function(apiUrl, userId, referrer, url) {
    // Use a more reliable approach - prefer edge function but with better retry logic
    fetchFromEdgeFunction(apiUrl, userId, referrer, url)
      .then(function(result) {
        // Log success or error
        if (result.success) {
          console.log('Unusual: Successfully applied content from Edge Function');
        } else {
          console.error('Unusual: Edge Function failed:', result.error);
          console.log('Unusual: Falling back to database method');
          
          return fetchFromDatabase(apiUrl, userId, referrer, url);
        }
      })
      .then(function(result) {
        if (result && result.success) {
          console.log('Unusual: Successfully applied content from database method');
        } else if (result) {
          console.error('Unusual: Database method failed:', result.error);
        }
      })
      .catch(function(error) {
        console.error('Unusual: All content fetch methods failed with error:', error);
      });
  };
  
  // Process API response
  const processApiResponse = function(response) {
    // Check for opaque response (from no-cors mode)
    if (response.type === 'opaque') {
      console.log('Unusual: Received opaque response (expected with no-cors)');
      return { success: false, error: 'Opaque response', opaque: true };
    }
    
    // Log response details for debugging
    console.log('Unusual: API response status:', response.status);
    
    if (!response.ok) {
      // Handle non-200 responses
      return response.text()
        .then(text => {
          let errorDetails = text;
          try {
            const errorData = JSON.parse(text);
            errorDetails = errorData.error || text;
            console.error('Unusual: API error details:', errorData);
          } catch (e) {
            console.error('Unusual: API error response:', text);
          }
          return { success: false, error: errorDetails, status: response.status };
        })
        .catch(error => {
          console.error('Unusual: Failed to read error response:', error);
          return { success: false, error: 'Failed to parse error response' };
        });
    }
    
    // Process successful response
    return response.json()
      .then(data => {
        if (data && data.replacements) {
          applyReplacements(data.replacements);
          return { success: true, data };
        }
        return { success: false, error: 'No replacements found in response' };
      })
      .catch(error => {
        console.error('Unusual: Failed to parse JSON response:', error);
        return { success: false, error: 'Invalid JSON response' };
      });
  };

  // Enhanced edge function fetch with retries
  const fetchFromEdgeFunction = function(apiUrl, userId, referrer, url, retryCount = 0) {
    const MAX_RETRIES = 2;
    const payload = {
      user_id: userId,
      referrer: referrer || null,
      url: url
    };
    
    console.log('Unusual: Fetching from Edge Function with payload:', JSON.stringify(payload));
    
    // Determine if we're using the proxy server, Vercel, or direct Supabase
    const isVercel = window.location.hostname.includes('vercel.app');
    const isUsingProxy = apiUrl.includes('localhost') || !apiUrl.includes('supabase.co');
    
    // Construct the endpoint URL based on environment
    let endpointUrl;
    if (isVercel) {
      // When on Vercel, use the relative API route
      endpointUrl = '/api/get_content';
      console.log('Unusual: Using Vercel API route');
    } else {
      // Otherwise use the standard edge function endpoint
      endpointUrl = `${apiUrl}/functions/v1/get_content`;
      console.log('Unusual: Using standard edge function endpoint');
    }
    
    // Fetch options
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-info': 'unusual-client/1.2.0'
      },
      body: JSON.stringify(payload)
    };
    
    // Add authorization header if not on Vercel (Vercel API route handles auth)
    if (!isVercel) {
      fetchOptions.headers['Authorization'] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja3Zqb3ZvenVwdnRlcWl2aml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyODcsImV4cCI6MjA1ODQwNzI4N30.jKqHs21xpUtAcooiAOL-e04fkYEGVqEdpdSfB7PLnrs`;
    }
    
    // Only use no-cors mode when not using the proxy server or Vercel
    if (!isUsingProxy && !isVercel) {
      fetchOptions.mode = 'no-cors';
      console.log('Unusual: Using no-cors mode (direct Supabase connection)');
    } else {
      console.log('Unusual: Using proxy server or Vercel, CORS should be handled');
    }
    
    return fetch(endpointUrl, fetchOptions)
      .then(processApiResponse)
      .catch(error => {
        console.error(`Unusual: Edge function error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);
        
        // If we haven't exceeded max retries, try again
        if (retryCount < MAX_RETRIES) {
          console.log(`Unusual: Retrying edge function (${retryCount + 1}/${MAX_RETRIES})...`);
          return new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)))
            .then(() => fetchFromEdgeFunction(apiUrl, userId, referrer, url, retryCount + 1));
        }
        
        return { success: false, error: error.message || 'Network error' };
      });
  };
  
  // Fetch content using direct database access (fallback method)
  const fetchFromDatabase = function(apiUrl, userId, referrer, url) {
    console.log('Unusual: Fetching from database...');
    
    // For simplicity, use the most reliable RPC format based on our testing
    const payload = {
      "_user_id": userId,
      "_referrer": referrer || null,
      "_url": url
    };
    
    // Determine if we're using Vercel deployment
    const isVercel = window.location.hostname.includes('vercel.app');
    
    // If on Vercel, use the API route for database access too
    if (isVercel) {
      return fetchFromEdgeFunction(apiUrl, userId, referrer, url);
    }
    
    // Determine if we're using the proxy server
    const isUsingProxy = apiUrl.includes('localhost') || !apiUrl.includes('supabase.co');
    
    // Fetch options
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja3Zqb3ZvenVwdnRlcWl2aml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyODcsImV4cCI6MjA1ODQwNzI4N30.jKqHs21xpUtAcooiAOL-e04fkYEGVqEdpdSfB7PLnrs',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdja3Zqb3ZvenVwdnRlcWl2aml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzEyODcsImV4cCI6MjA1ODQwNzI4N30.jKqHs21xpUtAcooiAOL-e04fkYEGVqEdpdSfB7PLnrs',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    };
    
    // Only use no-cors mode when not using the proxy server
    if (!isUsingProxy) {
      fetchOptions.mode = 'no-cors';
    }
    
    return fetch(`${apiUrl}/rest/v1/rpc/get_content`, fetchOptions)
      .then(processApiResponse)
      .catch(error => {
        console.error('Unusual: Database method error:', error);
        return { success: false, error: error.message || 'Network error' };
      });
  };

  // Main execution logic
  const init = function() {
    // Get the user ID
    const userId = getUserId();
    
    if (!userId) {
      console.error('Unusual: No user ID found. Add user_id parameter to the script URL.');
      return; // Exit early if no userId
    }
    
    // Get referrer and current URL
    const referrer = document.referrer || '';
    let currentUrl = window.location.href;
    
    // Ensure URL is valid
    try {
      new URL(currentUrl); // This will throw if URL is invalid
    } catch (e) {
      console.error('Unusual: Invalid current URL:', currentUrl);
      currentUrl = window.location.origin + window.location.pathname;
      console.log('Unusual: Using fallback URL:', currentUrl);
    }
    
    // Define API URL based on environment
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('.webflow.io');
    const isVercel = window.location.hostname.includes('vercel.app');
    
    let apiUrl;
    if (isVercel) {
      // When on Vercel, use the current origin
      apiUrl = window.location.origin;
    } else if (isLocalhost) {
      // Local development proxy
      apiUrl = 'http://localhost:3000';
    } else {
      // Direct Supabase when not on Vercel or localhost
      apiUrl = 'https://gckvjovozupvteqivjiv.supabase.co';
    }
    
    console.log('Unusual: Using API URL:', apiUrl);
    
    // Log request information for debugging
    console.log('Unusual: Fetching content with:', {
      user_id: userId,
      referrer: referrer,
      url: currentUrl,
      hostname: window.location.hostname,
      isVercel: isVercel
    });
    
    // Fetch and apply content
    fetchAndApplyContent(apiUrl, userId, referrer, currentUrl);
  };

  // Start personalization after DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 