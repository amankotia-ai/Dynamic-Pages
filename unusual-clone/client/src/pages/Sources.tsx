import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import SourcesList from '../components/SourcesList';
import { Source } from '../types';
import { sourcesApi } from '../utils/api';
import AuthContext from '../contexts/AuthContext';

// Page for viewing and managing all sources
const Sources: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch sources on component mount
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

  // Handle source deletion
  const handleDeleteSource = async (id: string) => {
    try {
      setIsDeleting(true);
      await sourcesApi.deleteSource(id);
      setSources(prevSources => prevSources.filter(source => source.id !== id));
    } catch (err) {
      console.error('Error deleting source:', err);
      setError('Failed to delete source. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter active sources
  const activeSources = sources.filter(source => source.active);
  
  // Filter inactive sources
  const inactiveSources = sources.filter(source => !source.active);

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Sources</h1>
            <Link
              to="/sources/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              aria-label="Create new source"
              tabIndex={0}
            >
              Create New Source
            </Link>
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 text-red-700 border-b border-red-200">
            {error}
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="text-sm text-gray-700">
            <p>
              Total Sources: <span className="font-semibold">{sources.length}</span> • 
              Active: <span className="font-semibold">{activeSources.length}</span> • 
              Inactive: <span className="font-semibold">{inactiveSources.length}</span>
            </p>
          </div>
        </div>

        <SourcesList 
          sources={sources} 
          onDeleteSource={handleDeleteSource} 
          isLoading={loading || isDeleting} 
        />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">About Sources</h2>
        <div className="space-y-4 text-gray-600">
          <p>
            Sources define when and how your content is personalized. Each source has a rule (like "visitor comes from Facebook") 
            and content replacements that apply when the rule matches.
          </p>
          <p>
            <span className="font-semibold">Priority</span>: Sources with lower priority numbers run first. 
            Only the first matching source's replacements will be applied.
          </p>
          <p>
            <span className="font-semibold">Testing</span>: Use the "Test" button to simulate different visitor scenarios 
            and see how your content would change.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sources; 