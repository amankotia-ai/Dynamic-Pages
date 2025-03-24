import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SourceFormData } from '../components/SourceForm';
import { sourcesApi } from '../utils/api';
import AuthContext from '../contexts/AuthContext';
import { Source } from '../types';

interface TestResult {
  matches: boolean;
  message: string;
  appliedReplacements: {
    selector: string;
    content: string;
  }[];
}

// Test Source component - allows testing personalization against different scenarios
const TestSource: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [source, setSource] = useState<Source | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test inputs
  const [testReferrer, setTestReferrer] = useState('');
  const [testUrl, setTestUrl] = useState('https://example.com');
  
  // Test results
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [hasRun, setHasRun] = useState(false);

  // Fetch source data on component mount
  useEffect(() => {
    const fetchSource = async () => {
      if (!id || !user) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const sourceData = await sourcesApi.getSourceById(id);
        setSource(sourceData);
        
        // Set default test values based on source rules
        if (sourceData.rule_type === 'referrer_contains') {
          setTestReferrer(sourceData.rule_value);
        } else if (sourceData.rule_type === 'url_param_equals' && sourceData.param_name && sourceData.param_value) {
          setTestUrl(`https://example.com?${sourceData.param_name}=${sourceData.param_value}`);
        }
      } catch (err: any) {
        console.error('Error fetching source:', err);
        setError('Failed to load source. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSource();
  }, [id, user]);

  // Function to check if source would match given referrer and URL
  const doesSourceMatch = (source: Source, testReferrer: string, testUrl: string): boolean => {
    if (source.rule_type === 'referrer_contains') {
      return testReferrer.includes(source.rule_value);
    } else if (source.rule_type === 'url_param_equals') {
      try {
        const url = new URL(testUrl);
        const paramValue = url.searchParams.get(source.param_name || '');
        return paramValue === source.param_value;
      } catch (err) {
        // Invalid URL
        return false;
      }
    }
    return false;
  };

  // Handle running the test
  const handleRunTest = () => {
    if (!source) return;

    setHasRun(true);
    
    const matches = doesSourceMatch(source, testReferrer, testUrl);
    
    if (matches) {
      setTestResult({
        matches: true,
        message: 'This source would match the test conditions!',
        appliedReplacements: source.replacements
      });
    } else {
      let message = 'This source would NOT match the test conditions. ';
      
      if (source.rule_type === 'referrer_contains') {
        message += `The referrer must contain "${source.rule_value}".`;
      } else if (source.rule_type === 'url_param_equals' && source.param_name && source.param_value) {
        message += `The URL must have parameter "${source.param_name}=${source.param_value}".`;
      }
      
      setTestResult({
        matches: false,
        message,
        appliedReplacements: []
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !source) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Source</h3>
          <p className="mt-1 text-sm text-gray-500">{error || 'Source not found'}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/sources')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              type="button"
              aria-label="Return to sources"
              tabIndex={0}
            >
              Return to Sources
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Source: {source.name}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Test how your source personalization would appear under different conditions.
              </p>
            </div>
            <Link
              to={`/sources/${id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              aria-label="Edit source"
              tabIndex={0}
            >
              Edit Source
            </Link>
          </div>
        </div>

        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
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
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                {source.rule_type === 'referrer_contains'
                  ? `This source applies when referrer contains "${source.rule_value}"`
                  : `This source applies when URL parameter "${source.param_name}=${source.param_value}"`}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Test Conditions</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="test-referrer" className="block text-sm font-medium text-gray-700">
                Referrer URL
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="test-referrer"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://facebook.com"
                  value={testReferrer}
                  onChange={(e) => setTestReferrer(e.target.value)}
                  aria-label="Test referrer URL"
                  tabIndex={0}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                The URL where the visitor came from (e.g., facebook.com).
              </p>
            </div>

            <div>
              <label htmlFor="test-url" className="block text-sm font-medium text-gray-700">
                Current Page URL
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="test-url"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://example.com?source=email"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  aria-label="Test current page URL"
                  tabIndex={0}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                The current URL with any parameters (e.g., ?source=email).
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={handleRunTest}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                aria-label="Run test"
                tabIndex={0}
              >
                Run Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {hasRun && testResult && (
        <div className={`bg-white shadow rounded-lg overflow-hidden ${testResult.matches ? 'border-green-200' : 'border-red-200'} border-2`}>
          <div className={`px-6 py-4 ${testResult.matches ? 'bg-green-50' : 'bg-red-50'} border-b ${testResult.matches ? 'border-green-200' : 'border-red-200'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {testResult.matches ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${testResult.matches ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.message}
                </h3>
              </div>
            </div>
          </div>

          {testResult.matches && (
            <div className="px-6 py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content Replacements</h3>
              
              {testResult.appliedReplacements.length > 0 ? (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          Selector
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Content
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {testResult.appliedReplacements.map((replacement, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-gray-900 sm:pl-6">
                            {replacement.selector}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <div className="border border-gray-200 rounded p-2 bg-gray-50">
                              <div dangerouslySetInnerHTML={{ __html: replacement.content }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No content replacements defined for this source.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestSource; 