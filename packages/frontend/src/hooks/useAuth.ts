import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '../types/user';
import { STALE_TIME, GARBAGE_COLLECTION_TIME } from '../config/reactQuery';

// In development with path-based routing: leave VITE_API_URL empty
// In production: set VITE_API_URL to your backend domain
const API_URL = import.meta.env.VITE_API_URL || '';

export type { User };

interface AuthStatusResponse {
  authenticated: boolean;
  user?: User;
}

// Fetch auth status
async function fetchAuthStatus(): Promise<User | null> {
  const response = await fetch(`${API_URL}/auth/status`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to check auth status');
  }

  const data: AuthStatusResponse = await response.json();
  
  const user = data.authenticated && data.user ? data.user : null;
  
  // Keep localStorage in sync for initialData
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
  
  return user;
}

// Logout function
async function logoutUser(): Promise<void> {
  const response = await fetch(`${API_URL}/auth/logout`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
}

// Get initial data from localStorage for instant rendering
// This provides synchronous access while React Query Persist loads asynchronously
function getInitialUser(): User | null {
  try {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Query for auth status
  const { 
    data: user = null, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['auth', 'status'],
    queryFn: fetchAuthStatus,
    initialData: getInitialUser, // Synchronous load for instant rendering
    staleTime: STALE_TIME,
    gcTime: GARBAGE_COLLECTION_TIME,
  });

  // Mutation for logout
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear localStorage and query cache
      localStorage.removeItem('user');
      queryClient.setQueryData(['auth', 'status'], null);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (err) => {
      console.error('Logout error:', err);
      // Even if logout fails, clear local state
      localStorage.removeItem('user');
      queryClient.setQueryData(['auth', 'status'], null);
    },
  });

  const login = () => {
    window.location.href = `${API_URL}/auth/steam`;
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    loading,
    isLoggingOut: logoutMutation.isPending,
    error: queryError?.message || logoutMutation.error?.message || null,
    login,
    logout,
    refetch,
  };
}

