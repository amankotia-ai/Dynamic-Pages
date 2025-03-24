import '../src/index.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // This code only runs on the client side where document is available
    // Check if we're on a client-side route that should be handled by React Router
    // These routes should be caught by React Router in src/App.tsx
    const clientRoutes = [
      '/login',
      '/register',
      '/dashboard',
      '/script',
      '/sources',
      '/sources/new'
    ];
    
    // Also match routes that start with these patterns
    const patternRoutes = [
      '/sources/'
    ];
    
    const path = window.location.pathname;
    
    // If the current path is in our list of client routes OR
    // matches a pattern, redirect to the root where React Router will handle it
    const isClientRoute = clientRoutes.includes(path);
    const matchesPattern = patternRoutes.some(pattern => path.startsWith(pattern));
    
    if (path !== '/' && (isClientRoute || matchesPattern)) {
      // For client-side routes, we'll render the root component
      // and let React Router handle the routing
      window.history.replaceState({}, '', '/');
    }
  }, []); // This useEffect only runs on the client side

  return <Component {...pageProps} />;
}

export default MyApp; 