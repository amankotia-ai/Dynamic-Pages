import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import SourcesList from '../components/SourcesList';
import { Source } from '../types';
import { sourcesApi } from '../utils/api';

// Dashboard component - the main landing page after authentication
const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's sources on component mount
  useEffect(() => {
    const fetchSources = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const fetchedSources = await sourcesApi.getSources();
        setSources(fetchedSources);
      } catch (err) {
        console.error('Error fetching sources:', err);
        setError('Failed to load sources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user?.email}</h1>
        <p className="text-gray-600">
          Manage your personalization sources and generate scripts for your websites.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Personalization Sources
            </h2>
            <div className="flex space-x-3">
              <Link
                to="/sources"
                className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                aria-label="View all sources"
                tabIndex={0}
              >
                View All
              </Link>
              <Link
                to="/sources/new"
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label="Create new source"
                tabIndex={0}
              >
                Create New
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 text-red-700 border-b border-red-200">
            {error}
          </div>
        )}

        <SourcesList sources={sources} isLoading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Start</h2>
          <ol className="space-y-4 list-decimal list-inside text-gray-600">
            <li className="pl-2">
              <span className="font-medium text-gray-900">Create a Source</span> - Define a personalization rule and its content changes
            </li>
            <li className="pl-2">
              <span className="font-medium text-gray-900">Get Your Script</span> - Copy the script from the Script page
            </li>
            <li className="pl-2">
              <span className="font-medium text-gray-900">Add to Website</span> - Add the script to your website before the closing body tag
            </li>
            <li className="pl-2">
              <span className="font-medium text-gray-900">Test</span> - Visit your site with matching conditions to see personalization
            </li>
          </ol>
          <div className="mt-6">
            <Link
              to="/script"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              aria-label="Generate script"
              tabIndex={0}
            >
              Generate Script
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Webflow Integration</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Add the script to your Webflow site's custom code section before the closing body tag:
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <ol className="space-y-2 list-decimal list-inside">
                <li>In Webflow, go to <span className="font-mono text-xs bg-gray-200 p-1 rounded">Project Settings</span></li>
                <li>Navigate to <span className="font-mono text-xs bg-gray-200 p-1 rounded">Custom Code</span> tab</li>
                <li>Paste your script in <span className="font-mono text-xs bg-gray-200 p-1 rounded">Footer Code</span> section</li>
                <li>Save and publish your site</li>
              </ol>
            </div>
            <p>
              Use CSS selectors like <span className="font-mono text-xs bg-gray-200 p-1 rounded">#hero-text</span> or 
              <span className="font-mono text-xs bg-gray-200 p-1 rounded">.custom-class</span> to target elements.
            </p>
          </div>
          <div className="mt-4">
            <Link
              to="/script"
              className="text-primary-600 hover:text-primary-700 font-medium"
              aria-label="Learn more about Webflow integration"
              tabIndex={0}
            >
              View Integration Guide →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 