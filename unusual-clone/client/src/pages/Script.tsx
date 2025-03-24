import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../contexts/AuthContext';

// Script component for generating the embed code
const Script: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'standard' | 'webflow'>('standard');
  const [deploymentUrl, setDeploymentUrl] = useState<string>('');

  useEffect(() => {
    // Get the current origin (the Vercel deployment URL)
    const origin = window.location.origin;
    setDeploymentUrl(origin);
  }, []);

  // Construct the script URL with the user ID
  const scriptUrl = `${deploymentUrl}/scripts/unusual.js?user_id=${user?.id}`;
  
  // The standard embed code for websites
  const embedCode = `<script src="${scriptUrl}"></script>`;
  
  // Webflow-specific instructions
  const webflowInstructions = `
1. In your Webflow project, go to "Project Settings" (cog icon).
2. Navigate to the "Custom Code" tab.
3. Paste the following code in the "Before </body> tag" section:

${embedCode}

4. Save your changes and publish your site.
  `;

  // Handle click on the copy button
  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle key press on the copy button
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCopy();
    }
  };

  // Handle tab selection
  const handleTabClick = (tab: 'standard' | 'webflow') => {
    setActiveTab(tab);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Your Integration Script</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add this script to your website to enable personalization.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            className={`${
              activeTab === 'standard'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            onClick={() => handleTabClick('standard')}
            aria-label="Standard integration"
            aria-current={activeTab === 'standard' ? 'page' : undefined}
            tabIndex={0}
          >
            Standard
          </button>
          <button
            className={`${
              activeTab === 'webflow'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            onClick={() => handleTabClick('webflow')}
            aria-label="Webflow integration"
            aria-current={activeTab === 'webflow' ? 'page' : undefined}
            tabIndex={0}
          >
            Webflow
          </button>
        </nav>
      </div>

      <div className="px-6 py-6">
        {activeTab === 'standard' ? (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Add this script to your website's HTML, just before the <code>&lt;/body&gt;</code> tag:
              </p>
              <div className="relative">
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">{embedCode}</pre>
                <button
                  onClick={handleCopy}
                  onKeyDown={handleKeyDown}
                  className={`absolute top-2 right-2 px-3 py-1 text-xs font-medium rounded ${
                    copied
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  aria-label="Copy to clipboard"
                  tabIndex={0}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Make sure to add this script to every page where you want personalization to work.
                      The script runs asynchronously and won't affect your page load speed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Follow these steps to add the script to your Webflow site:
              </p>
              <pre className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm">
                {webflowInstructions}
              </pre>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Tip</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Use CSS selectors or custom attributes (like 
                      <code className="bg-blue-100 px-1 rounded">data-unusual</code>) to target elements 
                      in your Webflow site when creating personalization sources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Script; 