import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { SyncAssetDetail, SyncSummary } from './types/sync.types';

@Injectable()
export class SyncDataLoggerService {
  private readonly logger = new Logger(SyncDataLoggerService.name);
  private readonly logsDir = path.join(process.cwd(), 'logs', 'sync-data');
  private currentSyncId: string | null = null;
  private currentProvider: string | null = null;
  private currentDataFile: string | null = null;
  private currentSummaryFile: string | null = null;
  private syncStartTime: number = 0;
  private dataEntries: SyncAssetDetail[] = [];

  constructor() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  startSync(provider: string): string {
    this.syncStartTime = Date.now();
    this.currentSyncId = `sync-${Date.now()}`;
    this.currentProvider = provider;
    this.dataEntries = [];
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentDataFile = path.join(
      this.logsDir,
      `${this.currentSyncId}-data-${timestamp}.json`,
    );
    this.currentSummaryFile = path.join(
      this.logsDir,
      `${this.currentSyncId}-summary-${timestamp}.json`,
    );

    this.logger.log(`Starting data logging for sync: ${this.currentSyncId}`);
    this.logger.log(`Data file: ${path.basename(this.currentDataFile)}`);
    this.logger.log(`Summary file: ${path.basename(this.currentSummaryFile)}`);

    return this.currentSyncId;
  }

  logAsset(asset: SyncAssetDetail) {
    if (!this.currentSyncId) return;
    this.dataEntries.push(asset);
  }

  logAssetsBatch(assets: SyncAssetDetail[]) {
    if (!this.currentSyncId) return;
    this.dataEntries.push(...assets);
    
    if (this.dataEntries.length % 100 === 0) {
      this.logger.debug(`Buffered ${this.dataEntries.length} entries`);
    }
  }

  endSync(
    totalProcessed: number,
    created: number,
    updated: number,
    errors: number,
    status: 'completed' | 'failed' | 'stopped',
    errorMessage?: string,
  ) {
    if (!this.currentSyncId || !this.currentDataFile || !this.currentSummaryFile) {
      return;
    }

    const duration = Date.now() - this.syncStartTime;
    const summary: SyncSummary = {
      syncId: this.currentSyncId,
      provider: this.currentProvider || 'Unknown',
      startTime: new Date(this.syncStartTime).toISOString(),
      endTime: new Date().toISOString(),
      duration,
      totalProcessed,
      created,
      updated,
      errors,
      status,
      errorMessage,
    };

    try {
      this.logger.log(`Writing ${this.dataEntries.length} data entries to file...`);
      fs.writeFileSync(
        this.currentDataFile,
        JSON.stringify(this.dataEntries, null, 2),
        'utf-8',
      );
      this.logger.log(`Data file saved: ${path.basename(this.currentDataFile)}`);

      this.logger.log(`Writing sync summary...`);
      fs.writeFileSync(
        this.currentSummaryFile,
        JSON.stringify(summary, null, 2),
        'utf-8',
      );
      this.logger.log(`Summary file saved: ${path.basename(this.currentSummaryFile)}`);

      this.logger.log(`
SYNC SUMMARY
  Sync ID:          ${summary.syncId}
  Provider:         ${summary.provider}
  Status:           ${summary.status.toUpperCase()}
  Duration:         ${(summary.duration / 1000).toFixed(2)}s
  
  Total Processed:  ${summary.totalProcessed}
  Created:          ${summary.created}
  Updated:          ${summary.updated}
  Errors:           ${summary.errors}
  ${summary.errorMessage ? `Error Message:    ${summary.errorMessage}` : ''}
  
  Data File:        ${path.basename(this.currentDataFile)}
  Summary File:     ${path.basename(this.currentSummaryFile)}
      `);
    } catch (error) {
      this.logger.error(
        `Failed to write sync logs: ${error instanceof Error ? error.message : error}`,
      );
    } finally {
      this.currentSyncId = null;
      this.currentProvider = null;
      this.currentDataFile = null;
      this.currentSummaryFile = null;
      this.dataEntries = [];
    }
  }

  getSyncStatus() {
    return {
      syncId: this.currentSyncId,
      dataFile: this.currentDataFile,
      summaryFile: this.currentSummaryFile,
      bufferedEntries: this.dataEntries.length,
    };
  }
}

