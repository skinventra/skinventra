import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types/user';

// In development with path-based routing: leave VITE_API_URL empty
// In production: set VITE_API_URL to your backend domain
const API_URL = import.meta.env.VITE_API_URL || '';

export type { User };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/auth/status`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to check auth status');
      }

      const data = await response.json();
      
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = () => {
    window.location.href = `${API_URL}/auth/steam`;
  };

  const logout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      // Always clear user state, even if logout request fails
      setUser(null);
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    loading,
    isLoggingOut,
    error,
    login,
    logout,
    refetch: checkAuthStatus,
  };
}

