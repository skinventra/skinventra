import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Portfolio, CreatePortfolioDto, UpdatePortfolioDto } from '../types/portfolio';
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

export function usePortfolios(enabled: boolean = true) {
  const queryClient = useQueryClient();

  const {
    data: portfolios = [],
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['portfolios'],
    queryFn: fetchPortfolios,
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Mutation for creating a portfolio
  const createMutation = useMutation({
    mutationFn: createPortfolio,
    onError: (err) => {
      console.error('Create portfolio error:', err);
    },
  });

  // Mutation for updating a portfolio
  const updateMutation = useMutation({
    mutationFn: updatePortfolio,
    onError: (err) => {
      console.error('Update portfolio error:', err);
    },
  });

  // Mutation for deleting a portfolio
  const deleteMutation = useMutation({
    mutationFn: deletePortfolio,
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
    createPortfolio: async (data: CreatePortfolioDto) => {
      await createMutation.mutateAsync(data);
      await queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
    updatePortfolio: async (id: string, data: UpdatePortfolioDto) => {
      await updateMutation.mutateAsync({ id, data });
      await queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
    deletePortfolio: async (id: string) => {
      await deleteMutation.mutateAsync(id);
      await queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },

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

