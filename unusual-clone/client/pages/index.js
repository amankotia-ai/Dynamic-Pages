import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Import App with no SSR to avoid document reference errors during build
const AppWithNoSSR = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>
});

export default function Home() {
  return (
    <div className="app-container">
      <Head>
        <title>Dynamic Pages - Personalization Service</title>
        <meta name="description" content="Dynamic content personalization using Supabase Edge Functions" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* The App component will only render on client-side */}
      <AppWithNoSSR />
    </div>
  );
} 