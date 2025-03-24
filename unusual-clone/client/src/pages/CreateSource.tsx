import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SourceForm, { SourceFormData } from '../components/SourceForm';
import { sourcesApi } from '../utils/api';
import AuthContext from '../contexts/AuthContext';

// Page for creating a new personalization source
const CreateSource: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Handle form submission
  const handleSubmit = async (formData: SourceFormData) => {
    if (!user) {
      setError('You must be logged in to create a source');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the source using our API
      await sourcesApi.createSource({
        ...formData,
        user_id: user.id,
        active: true,
        priority: formData.priority || 0, // Default priority to 0 if not provided
      });

      // Redirect to sources list on success
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Error creating source:', err);
      setError(err.message || 'Failed to create source. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Create New Source</h1>
        <p className="mt-1 text-sm text-gray-600">
          Define a personalization source and its content replacements.
        </p>
      </div>

      <div className="px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
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

        <SourceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default CreateSource; 