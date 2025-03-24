/**
 * Unusual Clone - Client-side personalization script
 * This script fetches personalized content based on referrer and URL parameters
 * and applies it to the target website.
 * Version 1.3.0
 */
(function() {
  let proxyFrame = null;
  let pendingProxyRequests = {};
  let proxyReady = false;
  let requestCounter = 0;

  // Initialize proxy iframe if needed
  const initProxyIfNeeded = function(apiUrl) {
    if (proxyFrame) return Promise.resolve();
    
    return new Promise((resolve) => {
      // Create hidden iframe
      proxyFrame = document.createElement('iframe');
      proxyFrame.style.display = 'none';
      proxyFrame.src = `${apiUrl}/api/proxy.html`;
      
      // Listen for messages from the proxy iframe
      window.addEventListener('message', function(event) {
        // Check if message is from our proxy
        if (!event.data || !event.data.type) return;
        
        if (event.data.type === 'proxy-ready') {
          proxyReady = true;
          resolve();
        } else if (event.data.type === 'proxy-response') {
          // Handle proxy response
          const requestId = event.data.requestId;
          if (pendingProxyRequests[requestId]) {
            const { resolve, reject } = pendingProxyRequests[requestId];
            
            if (event.data.success) {
              resolve(event.data.data);
            } else {
              reject(new Error(event.data.error || 'Proxy error'));
            }
            
            // Clean up
            delete pendingProxyRequests[requestId];
          }
        }
      });
      
      // Add to DOM
      document.body.appendChild(proxyFrame);
    });
  };

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
        if (result && result.replacements) {
          applyReplacements(result.replacements);
          console.log('Unusual: Successfully applied content from Edge Function');
        } else {
          throw new Error('No valid replacements found');
        }
      })
      .catch(function(error) {
        console.error('Unusual: Error applying content:', error);
        console.log('Unusual: Trying proxy method...');
        
        return fetchViaProxy(apiUrl, userId, referrer, url)
          .then(function(result) {
            if (result && result.replacements) {
              applyReplacements(result.replacements);
              console.log('Unusual: Successfully applied content via proxy');
            } else {
              throw new Error('No valid replacements found via proxy');
            }
          });
      })
      .catch(function(error) {
        console.error('Unusual: All content fetch methods failed with error:', error);
      });
  };

  // Fetch via proxy iframe using postMessage
  const fetchViaProxy = function(apiUrl, userId, referrer, url) {
    return initProxyIfNeeded(apiUrl)
      .then(() => {
        return new Promise((resolve, reject) => {
          const requestId = `req_${Date.now()}_${requestCounter++}`;
          
          // Save callbacks
          pendingProxyRequests[requestId] = { resolve, reject };
          
          // Send request to proxy
          proxyFrame.contentWindow.postMessage({
            type: 'proxy-request',
            requestId: requestId,
            userId: userId,
            payload: {
              referrer: referrer || null,
              url: url
            }
          }, '*');
          
          // Set timeout
          setTimeout(() => {
            if (pendingProxyRequests[requestId]) {
              delete pendingProxyRequests[requestId];
              reject(new Error('Proxy request timed out'));
            }
          }, 10000);
        });
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
    
    // Construct the endpoint URL
    const endpointUrl = `${apiUrl}/api/get_content`;
    
    // Fetch options
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-info': 'unusual-client/1.3.0'
      },
      body: JSON.stringify(payload)
    };
    
    return fetch(endpointUrl, fetchOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error(`Unusual: Edge function error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);
        
        // If we haven't exceeded max retries, try again
        if (retryCount < MAX_RETRIES) {
          console.log(`Unusual: Retrying edge function (${retryCount + 1}/${MAX_RETRIES})...`);
          return new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)))
            .then(() => fetchFromEdgeFunction(apiUrl, userId, referrer, url, retryCount + 1));
        }
        
        throw error;
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
    
    // Extract the script source URL to determine API URL
    let apiUrl = null;
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.includes('unusual.js')) {
        try {
          const scriptUrl = new URL(scripts[i].src);
          apiUrl = scriptUrl.origin;
          break;
        } catch (e) {
          console.error('Unusual: Error parsing script URL:', e);
        }
      }
    }
    
    if (!apiUrl) {
      console.error('Unusual: Could not determine API URL from script source.');
      return;
    }
    
    console.log('Unusual: Using API URL:', apiUrl);
    
    // Log request information for debugging
    console.log('Unusual: Fetching content with:', {
      user_id: userId,
      referrer: referrer,
      url: currentUrl,
      apiUrl: apiUrl
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