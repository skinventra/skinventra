import { Injectable, Logger } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetProviderStrategy } from './asset-provider.strategy';
import { SyncLogService } from './sync-log.service';
import { SyncDataLoggerService } from './sync-data-logger.service';
import { SyncResult } from './types/sync.types';
import { AssetData } from './providers/asset-provider.interface';

@Injectable()
export class AssetSyncScheduler {
  private readonly logger = new Logger(AssetSyncScheduler.name);
  private isRunning = false;
  private lastSyncAt: Date | null = null;
  private lastSyncCount = 0;

  constructor(
    private providerStrategy: AssetProviderStrategy,
    private assetService: AssetService,
    private syncLogService: SyncLogService,
    private syncDataLogger: SyncDataLoggerService,
  ) {
    this.logger.log('AssetSyncScheduler initialized (auto-sync disabled)');
  }

  async syncAssets(categories?: string[], startOffset?: number) {
    if (this.isRunning) {
      this.logger.warn('Sync already running, skipping...');
      return { success: false, message: 'Sync already running' };
    }

    this.isRunning = true;
    this.logger.log('isRunning flag set to TRUE');
    const startTime = Date.now();

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    let syncStatus: 'completed' | 'failed' | 'stopped' = 'completed';
    let errorMessage: string | undefined;
    let lastProcessedOffset = startOffset || 0;
    const syncMode = categories ? `priority (${categories.join(', ')})` : 'all';

    try {
      const provider = this.providerStrategy.getProvider();
      this.logger.log(`Starting asset sync using provider: ${provider.name}`);

      const syncId = this.syncLogService.startSync(provider.name);
      this.syncDataLogger.startSync(provider.name);
      this.logger.log(`Sync ID: ${syncId}`);

      if (startOffset !== undefined && startOffset > 0) {
        this.logger.log(`Resuming sync from offset: ${startOffset}`);
      }

      const BATCH_SIZE = 500;
      let totalPages = 0;
      let totalItemsFetched = 0;
      let uniqueItemsCount = 0;

      this.logger.log(
        `Starting incremental fetch from ${provider.name} (mode: ${syncMode})`,
      );

      if (
        categories &&
        categories.length > 0 &&
        provider.fetchAssetsByPriority
      ) {
        await provider.fetchAssetsByPriority(
          BATCH_SIZE,
          async (
            batchAssets: AssetData[],
            batchNumber: number,
            totalBatches: number,
            categoryName: string,
          ) => {
            if (batchAssets.length === 0) {
              this.logger.warn('Empty batch received, skipping...');
              return;
            }

            totalPages++;
            totalItemsFetched += batchAssets.length;
            lastProcessedOffset = batchNumber * BATCH_SIZE;

            this.logger.log(
              `[${categoryName}] Saving batch ${batchNumber}/${totalBatches} (${batchAssets.length} assets) to database...`,
            );
            this.logger.debug(`Current offset: ${lastProcessedOffset}`);

            // Use fast sync for better performance (upsert instead of find+create/update)
            const result: SyncResult =
              await this.assetService.syncAssetsFast(batchAssets);

            totalCreated += result.createdCount;
            totalUpdated += result.updatedCount;
            totalErrors += result.errorCount;
            uniqueItemsCount = totalCreated + totalUpdated;

            this.lastSyncCount = uniqueItemsCount;

            this.syncLogService.logProgress(
              totalPages,
              totalItemsFetched,
              uniqueItemsCount,
              batchAssets.slice(0, 3),
            );

            this.logger.log(
              `[${categoryName}] Batch ${batchNumber}/${totalBatches} saved | Total: ${totalCreated} created, ${totalUpdated} updated, ${totalErrors} errors`,
            );
          },
          categories,
          startOffset,
        );
      } else {
        await provider.fetchAssetsInBatches(
          BATCH_SIZE,
          async (
            batchAssets: AssetData[],
            batchNumber: number,
            totalBatches: number,
          ) => {
            if (batchAssets.length === 0) {
              this.logger.warn('Empty batch received, skipping...');
              return;
            }

            totalPages++;
            totalItemsFetched += batchAssets.length;
            lastProcessedOffset = batchNumber * BATCH_SIZE;

            this.logger.log(
              `Saving batch ${batchNumber}/${totalBatches} (${batchAssets.length} assets) to database...`,
            );
            this.logger.debug(`Current offset: ${lastProcessedOffset}`);

            // Use fast sync for better performance (upsert instead of find+create/update)
            const result: SyncResult =
              await this.assetService.syncAssetsFast(batchAssets);

            totalCreated += result.createdCount;
            totalUpdated += result.updatedCount;
            totalErrors += result.errorCount;
            uniqueItemsCount = totalCreated + totalUpdated;

            this.lastSyncCount = uniqueItemsCount;

            this.syncLogService.logProgress(
              totalPages,
              totalItemsFetched,
              uniqueItemsCount,
              batchAssets.slice(0, 3),
            );

            this.logger.log(
              `Batch ${batchNumber}/${totalBatches} saved | Total: ${totalCreated} created, ${totalUpdated} updated, ${totalErrors} errors`,
            );
          },
          startOffset,
        );
      }

      this.lastSyncAt = new Date();
      syncStatus = 'completed';

      this.syncLogService.endSync(
        provider.name,
        totalCreated,
        totalUpdated,
        totalErrors,
        uniqueItemsCount,
      );

      this.syncDataLogger.endSync(
        totalCreated + totalUpdated,
        totalCreated,
        totalUpdated,
        totalErrors,
        syncStatus,
      );

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(
        `Asset sync completed in ${duration}s using ${provider.name}: ${totalCreated} created, ${totalUpdated} updated, ${totalErrors} errors`,
      );
      this.logger.log(`Final offset: ${lastProcessedOffset}`);
      return {
        success: true,
        totalCreated,
        totalUpdated,
        totalErrors,
        lastProcessedOffset,
      };
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      syncStatus = 'failed';
      errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Asset sync failed after ${duration}s at offset ${lastProcessedOffset}`,
      );
      this.logger.error(
        `To resume, use: POST /assets/sync?offset=${lastProcessedOffset}`,
      );
      this.logger.error(
        `Error: ${error instanceof Error ? error.message : error}`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }

      try {
        const provider = this.providerStrategy.getProvider();
        this.syncLogService.logError(provider.name, errorMessage);
        this.syncDataLogger.endSync(
          totalCreated + totalUpdated,
          totalCreated,
          totalUpdated,
          totalErrors,
          syncStatus,
          errorMessage,
        );
      } catch {
        // Provider might not be available
      }

      throw error;
    } finally {
      this.isRunning = false;
      this.logger.log('isRunning flag set to FALSE');
      this.logger.log('Sync process finished');
    }
  }

  getSyncStatus() {
    return {
      isRunning: this.isRunning,
      lastSyncAt: this.lastSyncAt,
      lastSyncCount: this.lastSyncCount,
    };
  }
}
