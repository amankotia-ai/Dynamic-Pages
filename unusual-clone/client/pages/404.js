import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    // Only redirect on the client side
    if (typeof window !== 'undefined') {
      // Redirect to the root
      router.replace('/');
    }
  }, []); // This only runs on the client

  // Return minimal markup for server-side rendering
  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
} 