import { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    // Check for URL parameters - this will help with testing
    const params = new URLSearchParams(window.location.search);
    const testParam = params.get('test');
    
    if (testParam === 'true') {
      window.location.href = '/test.html';
    }
  }, []);

  return (
    <div className="container" style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem'
    }}>
      <Head>
        <title>Dynamic Pages - Personalization Service</title>
        <meta name="description" content="Dynamic content personalization using Supabase Edge Functions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Dynamic Pages
        </h1>

        <p style={{ fontSize: '1.2rem', lineHeight: '1.5', marginBottom: '2rem' }}>
          A powerful content personalization system using Supabase Edge Functions to dynamically modify web page content based on referrer information and URL parameters.
        </p>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.8rem' }}>Testing Resources</h2>
          
          <div style={{ 
            border: '1px solid #eaeaea', 
            borderRadius: '10px', 
            padding: '1.5rem',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Test Page</h3>
            <p>Use our test page to see the content personalization in action:</p>
            <a 
              href="/test.html" 
              style={{ 
                display: 'inline-block',
                margin: '0.5rem 0',
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
                color: '#fff',
                borderRadius: '5px',
                textDecoration: 'none'
              }}
            >
              Open Test Page
            </a>
          </div>

          <div style={{ 
            border: '1px solid #eaeaea', 
            borderRadius: '10px', 
            padding: '1.5rem',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Edge Function Status</h3>
            <p>Check if the Edge Function is working correctly:</p>
            <a 
              href="/api/get_content_status" 
              style={{ 
                display: 'inline-block',
                margin: '0.5rem 0',
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
                color: '#fff',
                borderRadius: '5px',
                textDecoration: 'none'
              }}
            >
              Check Status
            </a>
          </div>

          <div style={{ 
            border: '1px solid #eaeaea', 
            borderRadius: '10px', 
            padding: '1.5rem',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Integration Instructions</h3>
            <p>Add this script tag to your website to enable dynamic content personalization:</p>
            <div style={{ 
              backgroundColor: '#f0f0f0', 
              padding: '1rem', 
              borderRadius: '5px',
              overflowX: 'auto',
              fontFamily: 'monospace',
              marginTop: '0.5rem'
            }}>
              &lt;script src=&quot;{typeof window !== 'undefined' ? window.location.origin : ''}/scripts/unusual.js?user_id=YOUR_USER_ID&quot;&gt;&lt;/script&gt;
            </div>
          </div>
        </div>
      </main>

      <footer style={{ 
        padding: '2rem 0', 
        borderTop: '1px solid #eaeaea',
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <p>
          Powered by Supabase Edge Functions
        </p>
      </footer>
    </div>
  );
} 