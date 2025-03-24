import React from 'react';

/**
 * Loading screen component for authentication and data loading states
 * Shows a simple animation to indicate the app is working
 */
const LoadingScreen: React.FC = () => {
  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-primary-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 