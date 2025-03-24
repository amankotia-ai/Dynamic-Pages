import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import Script from './pages/Script';
import CreateSource from './pages/CreateSource';
import EditSource from './pages/EditSource';
import Sources from './pages/Sources';
import TestSource from './pages/TestSource';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Declare global window property for TypeScript
declare global {
  interface Window {
    __spaPath: string | null;
  }
}

// Path initializer component for direct spa navigation
const PathInitializer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check if we have a SPA path saved from the _app.js script
    if (typeof window !== 'undefined' && window.__spaPath && location.pathname === '/') {
      // Navigate to the stored path
      const path = window.__spaPath;
      // Clear the stored path to prevent future redirects
      window.__spaPath = null;
      // Use navigate instead of history.replaceState to ensure proper routing
      navigate(path, { replace: true });
    }
  }, [navigate, location]);
  
  return null;
};

// Main App component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <PathInitializer />
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/script" element={<Script />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/sources/new" element={<CreateSource />} />
              <Route path="/sources/:id" element={<EditSource />} />
              <Route path="/sources/test/:id" element={<TestSource />} />
            </Route>
          </Route>
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all other routes and show NotFound page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
