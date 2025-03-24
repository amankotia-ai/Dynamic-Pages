import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

// Layout component for authenticated pages with common UI elements
const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout; 