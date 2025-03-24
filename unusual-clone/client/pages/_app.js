import '../src/index.css';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* Add a script to handle client-side SPA routing */}
      <Script id="spa-routing" strategy="beforeInteractive">
        {`
          // Handle SPA routing for React Router
          (function() {
            // Only run on the client
            if (typeof window === 'undefined') return;
            
            // Routes that should be handled by React Router
            const spaRoutes = ['/login', '/register', '/dashboard', '/script', '/sources', '/sources/new'];
            const spaPatterns = ['/sources/'];
            
            // Check if the current path matches SPA routes
            const path = window.location.pathname;
            const isSpaRoute = spaRoutes.includes(path);
            const matchesPattern = spaPatterns.some(pattern => path.startsWith(pattern));
            
            // If this is a SPA route and not the root, use history API to manage SPA routing
            if (path !== '/' && (isSpaRoute || matchesPattern)) {
              // We need to preserve the original URL for React Router to read
              // but Next.js static export only has index.html at the root
              window.__spaPath = path;
            }
          })();
        `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 