import React from 'react';
import { Outlet } from 'react-router-dom';

// Temporarily bypassing authentication check for testing
const RouteGuard: React.FC = () => {
  // Simply render the child routes without authentication check
  return <Outlet />;
};

export default RouteGuard; 