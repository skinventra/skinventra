import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface SyncLogEntry {
  timestamp: string;
  syncId: string;
  provider: string;
  status: 'started' | 'in_progress' | 'completed' | 'failed';
  pages: number;
  totalItems: number;
  uniqueItems: number;
  created?: number;
  updated?: number;
  errors?: number;
  duration?: number;
  error?: string;
  sampleData?: any[];
}

@Injectable()
export class SyncLogService {
  private readonly logger = new Logger(SyncLogService.name);
  private readonly logsDir = path.join(process.cwd(), 'logs', 'syncs');
  private currentSyncId: string | null = null;
  private currentLogFile: string | null = null;
  private syncStartTime: number = 0;

  constructor() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  startSync(provider: string): string {
    this.syncStartTime = Date.now();
    this.currentSyncId = `sync-${Date.now()}`;
    this.currentLogFile = path.join(this.logsDir, `${this.currentSyncId}.json`);

    const entry: SyncLogEntry = {
      timestamp: new Date().toISOString(),
      syncId: this.currentSyncId,
      provider,
      status: 'started',
      pages: 0,
      totalItems: 0,
      uniqueItems: 0,
    };

    this.writeLog(entry);
    this.logger.log(`Sync log started: ${this.currentLogFile}`);

    return this.currentSyncId;
  }

  logProgress(
    pages: number,
    totalItems: number,
    uniqueItems: number,
    sampleData?: any[],
  ) {
    if (!this.currentSyncId || !this.currentLogFile) return;

    const entry: SyncLogEntry = {
      timestamp: new Date().toISOString(),
      syncId: this.currentSyncId,
      provider: 'current',
      status: 'in_progress',
      pages,
      totalItems,
      uniqueItems,
      duration: Date.now() - this.syncStartTime,
      sampleData: sampleData?.slice(0, 5),
    };

    this.writeLog(entry);
  }

  endSync(
    provider: string,
    created: number,
    updated: number,
    errors: number,
    uniqueItems: number,
  ) {
    if (!this.currentSyncId || !this.currentLogFile) return;

    const entry: SyncLogEntry = {
      timestamp: new Date().toISOString(),
      syncId: this.currentSyncId,
      provider,
      status: 'completed',
      pages: 0,
      totalItems: created + updated,
      uniqueItems,
      created,
      updated,
      errors,
      duration: Date.now() - this.syncStartTime,
    };

    this.writeLog(entry);
    this.logger.log(
      `Sync log completed: ${this.currentLogFile} (${(entry.duration! / 1000).toFixed(2)}s)`,
    );

    this.currentSyncId = null;
    this.currentLogFile = null;
  }

  logError(provider: string, error: string) {
    if (!this.currentSyncId || !this.currentLogFile) return;

    const entry: SyncLogEntry = {
      timestamp: new Date().toISOString(),
      syncId: this.currentSyncId,
      provider,
      status: 'failed',
      pages: 0,
      totalItems: 0,
      uniqueItems: 0,
      duration: Date.now() - this.syncStartTime,
      error,
    };

    this.writeLog(entry);
    this.logger.error(`Sync log failed: ${this.currentLogFile}`);

    this.currentSyncId = null;
    this.currentLogFile = null;
  }

  private writeLog(entry: SyncLogEntry) {
    if (!this.currentLogFile) return;

    try {
      let logs: SyncLogEntry[] = [];

      if (fs.existsSync(this.currentLogFile)) {
        const content = fs.readFileSync(this.currentLogFile, 'utf-8');
        logs = JSON.parse(content) as SyncLogEntry[];
      }

      logs.push(entry);

      fs.writeFileSync(
        this.currentLogFile,
        JSON.stringify(logs, null, 2),
        'utf-8',
      );
    } catch (error) {
      this.logger.error(
        `Failed to write sync log: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  getRecentSyncs(limit = 10): SyncLogEntry[] {
    try {
      const files = fs
        .readdirSync(this.logsDir)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, limit);

      const logs: SyncLogEntry[] = [];

      for (const file of files) {
        const filePath = path.join(this.logsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const entries = JSON.parse(content) as SyncLogEntry[];
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          logs.push(lastEntry);
        }
      }

      return logs;
    } catch (error) {
      this.logger.error(`Failed to read sync logs: ${error}`);
      return [];
    }
  }
}
