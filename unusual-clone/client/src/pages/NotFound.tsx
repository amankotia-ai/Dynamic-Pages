import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

/**
 * NotFound component for 404 errors
 * Displays a friendly error message and provides navigation options
 */
const NotFound: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-extrabold text-gray-700">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Return to dashboard"
              tabIndex={0}
            >
              Return to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Go to login"
              tabIndex={0}
            >
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound; 