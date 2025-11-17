import { useQuery } from '@tanstack/react-query';
import type { Asset } from '../types/asset';
import { API_ENDPOINTS } from '../config/api';

async function searchAssets(query: string, limit = 20): Promise<Asset[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const url = `${API_ENDPOINTS.assets.search}?q=${encodeURIComponent(query)}&limit=${limit}`;
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to search assets');
  }

  return response.json();
}

export function useAssetSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['assets', 'search', query],
    queryFn: () => searchAssets(query),
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

async function getAssetById(id: string): Promise<Asset> {
  const response = await fetch(API_ENDPOINTS.assets.detail(id), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch asset');
  }

  return response.json();
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: () => getAssetById(id),
    enabled: !!id,
  });
}



