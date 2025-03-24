import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

/**
 * A wrapper component that protects routes by checking if the user is authenticated
 * Redirects to login if not authenticated, preserving the intended destination
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // If authentication is still being determined, show a loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login page, but save the location they tried to access
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 