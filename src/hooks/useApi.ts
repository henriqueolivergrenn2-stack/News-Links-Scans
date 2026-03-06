import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(async (endpoint: string, options?: RequestInit): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      setState({ data: null, loading: false, error });
      return null;
    }
  }, []);

  return { ...state, request };
}

// Specific API hooks
export function useExtensionsApi() {
  const { data, loading, error, request } = useApi<any[]>();
  
  const fetchExtensions = useCallback(() => {
    return request('/extensions');
  }, [request]);
  
  return { extensions: data, loading, error, fetchExtensions };
}

export function useUsersApi() {
  const { data, loading, error, request } = useApi<any>();
  
  const fetchUsers = useCallback(() => request('/users'), [request]);
  const createUser = useCallback((userData: any) => 
    request('/users', { method: 'POST', body: JSON.stringify(userData) }), [request]);
  const login = useCallback((username: string) => 
    request('/users/login', { method: 'POST', body: JSON.stringify({ username }) }), [request]);
  const logout = useCallback((id: string) => 
    request('/users/logout', { method: 'POST', body: JSON.stringify({ id }) }), [request]);
  
  return { data, loading, error, fetchUsers, createUser, login, logout };
}

export function useSitesApi() {
  const { data, loading, error, request } = useApi<any[]>();
  
  const fetchSites = useCallback(() => request('/sites'), [request]);
  const submitSite = useCallback((siteData: any) => 
    request('/sites', { method: 'POST', body: JSON.stringify(siteData) }), [request]);
  
  return { sites: data, loading, error, fetchSites, submitSite };
}

export function useSharesApi() {
  const { data, loading, error, request } = useApi<any[]>();
  
  const fetchShares = useCallback(() => request('/shares'), [request]);
  const createShare = useCallback((shareData: any) => 
    request('/shares', { method: 'POST', body: JSON.stringify(shareData) }), [request]);
  
  return { shares: data, loading, error, fetchShares, createShare };
}

export function useStatusApi() {
  const { data, loading, error, request } = useApi<any>();
  
  const fetchStatuses = useCallback(() => request('/status'), [request]);
  const checkStatus = useCallback((url: string) => 
    request('/status/check', { method: 'POST', body: JSON.stringify({ url }) }), [request]);
  const checkBatch = useCallback((urls: string[]) => 
    request('/status/check-batch', { method: 'POST', body: JSON.stringify({ urls }) }), [request]);
  
  return { statuses: data, loading, error, fetchStatuses, checkStatus, checkBatch };
}
