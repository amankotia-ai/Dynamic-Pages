import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import App dynamically with no SSR to avoid document reference issues
const AppWithNoSSR = dynamic(() => import('../src/App'), {
  ssr: false,
});

export default function Home() {
  // Use client-side rendering for the main App component
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This runs only on the client
    setIsClient(true);
  }, []);

  return (
    <div className="app-container">
      <Head>
        <title>Dynamic Pages - Personalization Service</title>
        <meta name="description" content="Dynamic content personalization using Supabase Edge Functions" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Render the App component only on the client side */}
      {isClient && <AppWithNoSSR />}
    </div>
  );
} 