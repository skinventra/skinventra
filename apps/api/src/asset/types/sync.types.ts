/**
 * Shared types for asset synchronization
 */

export interface SyncAssetDetail {
  name: string;
  iconUrl?: string;
  currentPrice?: number;
  action: 'created' | 'updated' | 'skipped';
}

export interface SyncResult {
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  details?: SyncAssetDetail[];
}

export interface SyncSummary {
  syncId: string;
  provider: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalProcessed: number;
  created: number;
  updated: number;
  errors: number;
  status: 'completed' | 'failed' | 'stopped';
  errorMessage?: string;
}

