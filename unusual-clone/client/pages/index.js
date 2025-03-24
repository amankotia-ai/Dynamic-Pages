import React from 'react';
import App from '../src/App';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="app-container">
      <Head>
        <title>Dynamic Pages - Personalization Service</title>
        <meta name="description" content="Dynamic content personalization using Supabase Edge Functions" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <App />
    </div>
  );
} 