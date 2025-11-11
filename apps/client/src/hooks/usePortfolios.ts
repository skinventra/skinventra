import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Portfolio, CreatePortfolioDto, UpdatePortfolioDto } from '../types/portfolio';
import { STALE_TIME, GARBAGE_COLLECTION_TIME } from '../config/reactQuery';
import { API_ENDPOINTS } from '../config/api';

// Re-export types for convenience
export type { Portfolio, CreatePortfolioDto, UpdatePortfolioDto };

// Fetch all portfolios for current user
async function fetchPortfolios(): Promise<Portfolio[]> {
  const response = await fetch(API_ENDPOINTS.portfolios.list, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch portfolios');
  }

  return response.json();
}

// Create a new portfolio
async function createPortfolio(data: CreatePortfolioDto): Promise<Portfolio> {
  const response = await fetch(API_ENDPOINTS.portfolios.create, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create portfolio' }));
    throw new Error(error.message || 'Failed to create portfolio');
  }

  return response.json();
}

// Update a portfolio
async function updatePortfolio({ id, data }: { id: string; data: UpdatePortfolioDto }): Promise<Portfolio> {
  const response = await fetch(API_ENDPOINTS.portfolios.update(id), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update portfolio' }));
    throw new Error(error.message || 'Failed to update portfolio');
  }

  return response.json();
}

// Delete a portfolio
async function deletePortfolio(id: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.portfolios.delete(id), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete portfolio' }));
    throw new Error(error.message || 'Failed to delete portfolio');
  }
}

export function usePortfolios() {
  const queryClient = useQueryClient();
  
  // Track if we've completed the first fetch
  const [hasCompletedFirstFetch, setHasCompletedFirstFetch] = useState(false);

  // Query for fetching all portfolios
  const {
    data: portfolios = [],
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['portfolios'],
    queryFn: fetchPortfolios,
    staleTime: STALE_TIME,
    gcTime: GARBAGE_COLLECTION_TIME,
  });

  // Mark first fetch as complete when fetching stops for the first time
  useEffect(() => {
    if (!isFetching) {
      setHasCompletedFirstFetch(true);
    }
  }, [isFetching]);

  // Show loading if we haven't completed first fetch yet
  const loading = !hasCompletedFirstFetch;

  // Mutation for creating a portfolio
  const createMutation = useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => {
      // Invalidate and refetch portfolios list
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
    onError: (err) => {
      console.error('Create portfolio error:', err);
    },
  });

  // Mutation for updating a portfolio
  const updateMutation = useMutation({
    mutationFn: updatePortfolio,
    onSuccess: () => {
      // Invalidate and refetch portfolios list
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
    onError: (err) => {
      console.error('Update portfolio error:', err);
    },
  });

  // Mutation for deleting a portfolio
  const deleteMutation = useMutation({
    mutationFn: deletePortfolio,
    onSuccess: () => {
      // Invalidate and refetch portfolios list
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
    onError: (err) => {
      console.error('Delete portfolio error:', err);
    },
  });

  return {
    // Data
    portfolios,
    loading,
    isFetching,
    error: queryError?.message || null,

    // Actions
    refetch,
    createPortfolio: (data: CreatePortfolioDto) => createMutation.mutateAsync(data),
    updatePortfolio: (id: string, data: UpdatePortfolioDto) => updateMutation.mutateAsync({ id, data }),
    deletePortfolio: (id: string) => deleteMutation.mutateAsync(id),

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mutation errors
    createError: createMutation.error?.message || null,
    updateError: updateMutation.error?.message || null,
    deleteError: deleteMutation.error?.message || null,
  };
}

