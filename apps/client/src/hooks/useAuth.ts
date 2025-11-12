import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '../types/user';
import { API_ENDPOINTS } from '../config/api';

export type { User };

interface AuthStatusResponse {
  authenticated: boolean;
  user?: User;
}

async function fetchAuthStatus(): Promise<User | null> {
  const response = await fetch(API_ENDPOINTS.auth.status, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to check auth status');
  }

  const data: AuthStatusResponse = await response.json();
  return data.authenticated && data.user ? data.user : null;
}

// Logout function
async function logoutUser(): Promise<void> {
  const response = await fetch(API_ENDPOINTS.auth.logout, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { 
    data: user = null, 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['auth', 'status'],
    queryFn: fetchAuthStatus,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'status'], null);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
    onError: (err) => {
      console.error('Logout error:', err);
      queryClient.setQueryData(['auth', 'status'], null);
    },
  });

  const login = () => {
    window.location.href = API_ENDPOINTS.auth.steam;
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

