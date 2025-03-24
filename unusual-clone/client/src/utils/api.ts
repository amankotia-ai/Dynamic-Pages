import axios from 'axios';
import { supabase } from './supabaseClient';
import type { Source, Replacement } from '../types';

// Define API URL based on environment - using your local server
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TEMPORARILY DISABLED FOR TESTING:
// Add request interceptor to attach auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// TEMPORARILY DISABLED FOR TESTING:
// Add response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle 401 Unauthorized errors (token expired, etc.)
//     if (error.response && error.response.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// Mock API responses
interface MockResponses {
  [key: string]: any;
}

// Create a mock adaptation layer for API calls
const mockResponses: MockResponses = {
  '/sources': [
    {
      _id: '1',
      name: 'Facebook Traffic',
      rule_type: 'referrer_contains',
      rule_value: 'facebook.com',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Email Campaign',
      rule_type: 'url_param_equals',
      rule_value: 'email',
      active: true,
      createdAt: new Date().toISOString()
    }
  ]
};

// Store the original get method
const originalGet = api.get;

// Override with mock implementation
api.get = function<T = any>(url: string, config?: any): Promise<T> {
  // Check if we have mock data for this URL
  if (mockResponses[url]) {
    console.log(`Using mock data for ${url}`);
    // Create a simulated axios response with our mock data
    return Promise.resolve(mockResponses[url] as T);
  }
  
  // If no mock data, use the original implementation
  return originalGet(url, config);
};

// Sources API
export const sourcesApi = {
  // Get all sources for the current user
  getSources: async () => {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .order('priority', { ascending: true });
    
    if (error) throw error;
    return data as Source[];
  },

  // Get a single source by ID
  getSourceById: async (id: string) => {
    const { data, error } = await supabase
      .from('sources')
      .select(`
        *,
        replacements(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Source;
  },

  // Create a new source
  createSource: async (source: Source) => {
    // First create the source
    const { data: sourceData, error: sourceError } = await supabase
      .from('sources')
      .insert([{
        name: source.name,
        user_id: source.user_id,
        rule_type: source.rule_type,
        rule_value: source.rule_value,
        param_name: source.param_name || null,
        param_value: source.param_value || null,
        priority: source.priority,
        active: source.active
      }])
      .select()
      .single();
    
    if (sourceError) throw sourceError;
    
    // Then create the replacements
    if (source.replacements && source.replacements.length > 0) {
      const replacementsWithSourceId = source.replacements.map((replacement: Replacement) => ({
        source_id: sourceData.id,
        selector: replacement.selector,
        content: replacement.content
      }));
      
      const { error: replacementsError } = await supabase
        .from('replacements')
        .insert(replacementsWithSourceId);
      
      if (replacementsError) throw replacementsError;
    }
    
    // Return the complete source with replacements
    return await sourcesApi.getSourceById(sourceData.id);
  },

  // Update an existing source
  updateSource: async (id: string, source: Partial<Source>) => {
    // First update the source
    const sourceUpdateData: any = {};
    
    if (source.name) sourceUpdateData.name = source.name;
    if (source.rule_type) sourceUpdateData.rule_type = source.rule_type;
    if (source.rule_value) sourceUpdateData.rule_value = source.rule_value;
    if ('param_name' in source) sourceUpdateData.param_name = source.param_name || null;
    if ('param_value' in source) sourceUpdateData.param_value = source.param_value || null;
    if (source.priority !== undefined) sourceUpdateData.priority = source.priority;
    if (source.active !== undefined) sourceUpdateData.active = source.active;
    
    const { error: sourceError } = await supabase
      .from('sources')
      .update(sourceUpdateData)
      .eq('id', id);
    
    if (sourceError) throw sourceError;
    
    // Delete existing replacements
    const { error: deleteError } = await supabase
      .from('replacements')
      .delete()
      .eq('source_id', id);
    
    if (deleteError) throw deleteError;
    
    // Add new replacements if any
    if (source.replacements && source.replacements.length > 0) {
      const replacementsWithSourceId = source.replacements.map((replacement: Replacement) => ({
        source_id: id,
        selector: replacement.selector,
        content: replacement.content
      }));
      
      const { error: replacementsError } = await supabase
        .from('replacements')
        .insert(replacementsWithSourceId);
      
      if (replacementsError) throw replacementsError;
    }
    
    // Return the updated source with replacements
    return await sourcesApi.getSourceById(id);
  },

  // Delete a source
  deleteSource: async (id: string) => {
    // Delete the source (cascading delete should handle replacements)
    const { error } = await supabase
      .from('sources')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// Content API
export const contentApi = {
  // Get content based on referrer and URL
  getContent: async (userId: string, referrer: string, url: string) => {
    // First, get all sources for this user ordered by priority
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select(`
        *,
        replacements(*)
      `)
      .eq('user_id', userId)
      .eq('active', true)
      .order('priority', { ascending: true });
    
    if (sourcesError) throw sourcesError;
    
    // Parse the URL to extract parameters
    const urlObj = new URL(url);
    const urlParams = new URLSearchParams(urlObj.search);
    
    // Check each source to find a match
    for (const source of sources) {
      if (source.rule_type === 'referrer_contains' && referrer.includes(source.rule_value)) {
        return { replacements: source.replacements };
      } else if (source.rule_type === 'url_param_equals' && 
                source.param_name && 
                source.param_value && 
                urlParams.get(source.param_name) === source.param_value) {
        return { replacements: source.replacements };
      }
    }
    
    // No matches found
    return { replacements: [] };
  }
};

export default {
  sources: sourcesApi,
  content: contentApi
}; 