import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AssetTransaction,
  CreateTransactionDto,
  UpdateTransactionDto,
} from '../types/asset';
import { API_ENDPOINTS } from '../config/api';

async function fetchTransactions(portfolioId: string): Promise<AssetTransaction[]> {
  const response = await fetch(API_ENDPOINTS.transactions.list(portfolioId), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return response.json();
}

async function createTransaction(
  portfolioId: string,
  data: CreateTransactionDto,
): Promise<AssetTransaction> {
  const response = await fetch(API_ENDPOINTS.transactions.create(portfolioId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create transaction');
  }

  return response.json();
}

async function updateTransaction(
  portfolioId: string,
  transactionId: string,
  data: UpdateTransactionDto,
): Promise<AssetTransaction> {
  const response = await fetch(
    API_ENDPOINTS.transactions.update(portfolioId, transactionId),
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to update transaction');
  }

  return response.json();
}

async function deleteTransaction(
  portfolioId: string,
  transactionId: string,
): Promise<void> {
  const response = await fetch(
    API_ENDPOINTS.transactions.delete(portfolioId, transactionId),
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to delete transaction');
  }
}

export function useTransactions(portfolioId: string) {
  return useQuery({
    queryKey: ['transactions', portfolioId],
    queryFn: () => fetchTransactions(portfolioId),
    enabled: !!portfolioId,
  });
}

export function useCreateTransaction(portfolioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionDto) =>
      createTransaction(portfolioId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['holdings', portfolioId] });
    },
  });
}

export function useUpdateTransaction(portfolioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: UpdateTransactionDto;
    }) => updateTransaction(portfolioId, transactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['holdings', portfolioId] });
    },
  });
}

export function useDeleteTransaction(portfolioId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) =>
      deleteTransaction(portfolioId, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['holdings', portfolioId] });
    },
  });
}



