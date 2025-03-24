import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SourceForm, { SourceFormData } from '../components/SourceForm';
import { sourcesApi } from '../utils/api';
import AuthContext from '../contexts/AuthContext';
import { Source } from '../types';

// Edit Source component
const EditSource: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [source, setSource] = useState<Source | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch source data on component mount
  useEffect(() => {
    const fetchSource = async () => {
      if (!id || !user) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const sourceData = await sourcesApi.getSourceById(id);
        setSource(sourceData);
      } catch (err: any) {
        console.error('Error fetching source:', err);
        setError('Failed to load source. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSource();
  }, [id, user]);

  // Form initial values
  const initialValues = source
    ? {
        name: source.name,
        rule_type: source.rule_type,
        rule_value: source.rule_value,
        param_name: source.param_name || '',
        param_value: source.param_value || '',
        replacements: source.replacements,
        priority: source.priority,
        active: source.active
      }
    : null;

  // Handle form submission
  const handleSubmit = async (formData: SourceFormData) => {
    if (!id || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await sourcesApi.updateSource(id, {
        ...formData,
        user_id: user.id,
      });

      // Redirect to sources list on success
      navigate('/sources', { replace: true });
    } catch (err: any) {
      console.error('Error updating source:', err);
      setError(err.message || 'Failed to update source. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle delete button click
  const handleDelete = async () => {
    if (!id) return;

    if (!window.confirm('Are you sure you want to delete this source? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await sourcesApi.deleteSource(id);
      navigate('/sources', { replace: true });
    } catch (err: any) {
      console.error('Error deleting source:', err);
      setError(err.message || 'Failed to delete source. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isLoading ? 'Loading...' : `Edit Source: ${source?.name}`}
          </h1>
          <button
            onClick={handleDelete}
            disabled={isLoading || isDeleting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            aria-label="Delete source"
            tabIndex={0}
          >
            {isDeleting ? 'Deleting...' : 'Delete Source'}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
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
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : initialValues ? (
          <SourceForm
            initialData={initialValues}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Source not found or you don't have permission to edit it.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditSource; 