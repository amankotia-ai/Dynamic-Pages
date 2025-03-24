import React from 'react';
import { Link } from 'react-router-dom';
import { Source } from '../types';

interface SourcesListProps {
  sources: Source[];
  onDeleteSource?: (id: string) => void;
  isLoading?: boolean;
}

// Reusable component for displaying a list of sources
const SourcesList: React.FC<SourcesListProps> = ({ 
  sources, 
  onDeleteSource,
  isLoading = false
}) => {
  // Format date string to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If there are no sources, show empty state
  if (sources.length === 0 && !isLoading) {
    return (
      <div className="px-6 py-12 text-center">
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
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No sources found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new source.</p>
        <div className="mt-6">
          <Link
            to="/sources/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            aria-label="Create new source"
            tabIndex={0}
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Source
          </Link>
        </div>
      </div>
    );
  }

  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="overflow-hidden">
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="mt-3 ml-9">
                <div className="h-3 w-40 bg-gray-200 rounded"></div>
                <div className="mt-2 h-3 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Otherwise, render the sources list
  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {sources.map((source) => (
          <li key={source.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`h-5 w-5 rounded-full ${source.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <Link
                  to={`/sources/${source.id}`}
                  className="text-lg font-medium text-gray-900 hover:text-primary-600"
                  aria-label={`Edit ${source.name}`}
                  tabIndex={0}
                >
                  {source.name}
                </Link>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/sources/${source.id}`}
                  className="px-3 py-1 text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                  aria-label={`Edit ${source.name}`}
                  tabIndex={0}
                >
                  Edit
                </Link>
                {onDeleteSource && (
                  <button
                    onClick={() => onDeleteSource(source.id!)}
                    className="px-3 py-1 text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    aria-label={`Delete ${source.name}`}
                    tabIndex={0}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 ml-8">
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium text-gray-600">
                  {source.rule_type === 'referrer_contains' ? 'Referrer contains:' : 'URL param equals:'}
                </span>
                <span className="ml-1 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {source.rule_type === 'referrer_contains' 
                    ? source.rule_value 
                    : `${source.param_name}=${source.param_value}`}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                <span className="font-medium text-gray-600">Created:</span>{' '}
                {source.created_at ? formatDate(source.created_at) : 'Unknown date'}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SourcesList; 