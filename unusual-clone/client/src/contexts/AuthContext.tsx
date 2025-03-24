import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthContext with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
});

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Check for existing session when the component mounts
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            setState({
              user: {
                id: user.id,
                email: user.email!,
                created_at: user.created_at!
              },
              loading: false,
              error: null
            });
          } else {
            setState({ user: null, loading: false, error: null });
          }
        } else {
          setState({ user: null, loading: false, error: null });
        }
      } catch (error) {
        setState({ user: null, loading: false, error: 'Session retrieval failed' });
      }
    };

    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setState({
              user: {
                id: user.id,
                email: user.email!,
                created_at: user.created_at!
              },
              loading: false,
              error: null
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, loading: false, error: null });
        }
      }
    );

    getUser();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setState({ ...state, loading: false, error: error.message });
        throw error;
      }
      
      // Auth state will be updated via the onAuthStateChange listener
    } catch (error: any) {
      setState({ ...state, loading: false, error: error.message });
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      
      // Get the current hostname for the redirectTo URL
      const origin = window.location.origin;
      const redirectTo = `${origin}/dashboard`;
      
      // Email confirmation is disabled via Supabase project settings
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            registered_at: new Date().toISOString()
          }
          // Note: Email confirmation is controlled in Supabase Auth settings,
          // not through the API. It has been disabled for this project.
        }
      });
      
      if (error) {
        setState({ ...state, loading: false, error: error.message });
        throw error;
      }
      
      // On successful registration, the user will be signed in automatically
      // Auth state will be updated via the onAuthStateChange listener
    } catch (error: any) {
      setState({ ...state, loading: false, error: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setState({ ...state, error: error.message });
        throw error;
      }
      // Auth state will be updated via the onAuthStateChange listener
    } catch (error: any) {
      setState({ ...state, error: error.message });
      throw error;
    }
  };

  const clearError = () => {
    setState({ ...state, error: null });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.user,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 