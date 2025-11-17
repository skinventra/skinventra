import { useQuery } from '@tanstack/react-query';
import type { PortfolioHolding, PortfolioSummary } from '../types/asset';
import { API_ENDPOINTS } from '../config/api';

async function fetchHoldings(portfolioId: string): Promise<PortfolioHolding[]> {
  const response = await fetch(API_ENDPOINTS.holdings.list(portfolioId), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch holdings');
  }

  return response.json();
}

async function fetchSummary(portfolioId: string): Promise<PortfolioSummary> {
  const response = await fetch(API_ENDPOINTS.holdings.summary(portfolioId), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch summary');
  }

  return response.json();
}

export function useHoldings(portfolioId: string) {
  return useQuery({
    queryKey: ['holdings', portfolioId],
    queryFn: () => fetchHoldings(portfolioId),
    enabled: !!portfolioId,
  });
}

export function usePortfolioSummary(portfolioId: string) {
  return useQuery({
    queryKey: ['holdings', portfolioId, 'summary'],
    queryFn: () => fetchSummary(portfolioId),
    enabled: !!portfolioId,
  });
}



