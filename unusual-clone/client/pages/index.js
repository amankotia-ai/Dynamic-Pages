import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Content Personalization Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3">API Tools</h2>
          <p className="text-gray-600 mb-4">
            Access the content personalization service through different methods.
          </p>
          <div className="flex flex-col space-y-2">
            <Link href="/tools/direct.html" className="text-blue-500 hover:underline">
              Direct API Access
            </Link>
            <Link href="/tools/proxy.html" className="text-blue-500 hover:underline">
              Next.js API Proxy
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-3">Documentation</h2>
          <p className="text-gray-600 mb-4">
            Learn more about implementation and how to use the service.
          </p>
          <Link href="/api/get_content_status" className="text-blue-500 hover:underline">
            API Status Check
          </Link>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-3">About</h2>
        <p className="text-gray-700">
          This application provides tools for testing and integrating with the content 
          personalization service. Use the links above to access different features.
        </p>
      </div>
    </div>
  );
} 