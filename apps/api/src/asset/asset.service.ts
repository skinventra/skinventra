import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetProviderStrategy } from './asset-provider.strategy';
import { SyncAssetDetail, SyncResult } from './types/sync.types';

const SYNC_BATCH_SIZE = 50;
const FAST_SYNC_BATCH_SIZE = 500;

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    private prisma: PrismaService,
    private providerStrategy: AssetProviderStrategy,
  ) {}

  async searchAssets(query: string, limit = 20, offset = 0) {
    if (!query || query.length < 2) {
      return [];
    }

    this.logger.debug(`Searching in database for: "${query}"`);

    const assets = await this.prisma.asset.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        name: 'asc',
      },
    });

    return assets.map((asset) => ({
      ...asset,
      currentPrice: asset.currentPrice ? Number(asset.currentPrice) : undefined,
    }));
  }

  async getAssetById(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return {
      ...asset,
      currentPrice: asset.currentPrice ? Number(asset.currentPrice) : undefined,
    };
  }

  async getAssetByName(name: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { name },
    });

    if (!asset) {
      return null;
    }

    return {
      ...asset,
      currentPrice: asset.currentPrice ? Number(asset.currentPrice) : undefined,
    };
  }

  /**
   * Sync assets to database with optional detailed logging
   * @param assets - Assets to sync
   * @param withDetails - If true, returns detailed information about each asset operation
   */
  async syncAssets(
    assets: { name: string; iconUrl?: string; currentPrice?: number }[],
    withDetails = false,
  ): Promise<SyncResult> {
    const logLevel = withDetails ? 'log' : 'debug';
    this.logger[logLevel](`Starting sync of ${assets.length} assets...`);
    this.logger.log(`Database batch size: ${SYNC_BATCH_SIZE} items`);

    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errorsByType: { [key: string]: number } = {};
    const processedNames = new Set<string>(); // Track unique items
    let duplicateCount = 0;
    const details: SyncAssetDetail[] | undefined = withDetails ? [] : undefined;
    const startTime = Date.now();

    for (let i = 0; i < assets.length; i += SYNC_BATCH_SIZE) {
      const batch = assets.slice(i, i + SYNC_BATCH_SIZE);
      const batchNum = Math.floor(i / SYNC_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(assets.length / SYNC_BATCH_SIZE);
      const batchStartTime = Date.now();

      this.logger[logLevel](
        `Processing DB batch ${batchNum}/${totalBatches} (${batch.length} assets)`,
      );

      try {
        for (let j = 0; j < batch.length; j++) {
          const asset = batch[j];
          const assetNum = i + j + 1;

          try {
            if (!asset.name || asset.name.trim() === '') {
              this.logger.warn(
                `[${assetNum}/${assets.length}] Skipping asset with empty name`,
              );
              errorCount++;
              errorsByType['empty_name'] = (errorsByType['empty_name'] || 0) + 1;
              if (details) {
                details.push({
                  name: 'unnamed',
                  iconUrl: asset.iconUrl,
                  currentPrice: asset.currentPrice,
                  action: 'skipped',
                });
              }
              continue;
            }

            this.logger.verbose(
              `[${assetNum}/${assets.length}] Processing asset: "${asset.name}"`,
            );

            // Check if this is a duplicate
            if (processedNames.has(asset.name)) {
              duplicateCount++;
              this.logger.debug(
                `[${assetNum}/${assets.length}] Duplicate detected: "${asset.name}" (already processed)`,
              );
            } else {
              processedNames.add(asset.name);
            }

            const findStartTime = Date.now();
            const existingAsset = await this.prisma.asset.findUnique({
              where: { name: asset.name },
            });
            const findDuration = Date.now() - findStartTime;

            if (findDuration > 1000) {
              this.logger.warn(
                `Slow findUnique query: ${findDuration}ms for "${asset.name}"`,
              );
            }

            if (existingAsset) {
              this.logger.verbose(
                `[${assetNum}/${assets.length}] Updating existing asset: "${asset.name}"`,
              );
              const updateStartTime = Date.now();
              await this.prisma.asset.update({
                where: { name: asset.name },
                data: {
                  iconUrl: asset.iconUrl,
                  currentPrice: asset.currentPrice,
                },
              });
              const updateDuration = Date.now() - updateStartTime;

              if (updateDuration > 1000) {
                this.logger.warn(
                  `Slow update query: ${updateDuration}ms for "${asset.name}"`,
                );
              }

              updatedCount++;
              this.logger.debug(
                `[${assetNum}/${assets.length}] Updated "${asset.name}" (${updateDuration}ms)`,
              );

              if (details) {
                details.push({
                  name: asset.name,
                  iconUrl: asset.iconUrl,
                  currentPrice: asset.currentPrice,
                  action: 'updated',
                });
              }
            } else {
              this.logger.verbose(
                `[${assetNum}/${assets.length}] Creating new asset: "${asset.name}"`,
              );
              const createStartTime = Date.now();
              await this.prisma.asset.create({
                data: {
                  name: asset.name,
                  iconUrl: asset.iconUrl,
                  currentPrice: asset.currentPrice,
                },
              });
              const createDuration = Date.now() - createStartTime;

              if (createDuration > 1000) {
                this.logger.warn(
                  `Slow create query: ${createDuration}ms for "${asset.name}"`,
                );
              }

              createdCount++;
              this.logger.debug(
                `[${assetNum}/${assets.length}] Created "${asset.name}" (${createDuration}ms)`,
              );

              if (details) {
                details.push({
                  name: asset.name,
                  iconUrl: asset.iconUrl,
                  currentPrice: asset.currentPrice,
                  action: 'created',
                });
              }
            }
          } catch (itemError) {
            errorCount++;

            const errorType = this.categorizeDbError(itemError);
            errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

            if (details) {
              details.push({
                name: asset.name,
                iconUrl: asset.iconUrl,
                currentPrice: asset.currentPrice,
                action: 'skipped',
              });
            }

            this.logger.error(
              `[${assetNum}/${assets.length}] Failed to sync asset "${asset.name}"`,
            );
            this.logger.error(`Error type: ${errorType}`);
            this.logger.error(
              `Error message: ${itemError instanceof Error ? itemError.message : String(itemError)}`,
            );

            if (itemError instanceof Error) {
              this.logger.debug(`Error name: ${itemError.name}`);
              if (itemError.stack) {
                this.logger.debug(`Stack trace: ${itemError.stack}`);
              }
            }

            if (this.isPrismaError(itemError)) {
              this.logger.error(
                `Prisma error code: ${(itemError as any).code}`,
              );
              this.logger.error(
                `Prisma error meta: ${JSON.stringify((itemError as any).meta)}`,
              );
            }
          }
        }

        const batchDuration = Date.now() - batchStartTime;
        const itemsPerSecond = (batch.length / (batchDuration / 1000)).toFixed(
          1,
        );

        if (!withDetails) {
          const progress = (
            (Math.min(i + SYNC_BATCH_SIZE, assets.length) / assets.length) *
            100
          ).toFixed(1);
          const uniqueCount = processedNames.size;
          this.logger.log(
            `DB batch ${batchNum}/${totalBatches} completed in ${batchDuration}ms (${itemsPerSecond} items/s) | Progress: ${progress}% | Created: ${createdCount}, Updated: ${updatedCount}, Errors: ${errorCount} | Unique: ${uniqueCount}`,
          );
        }
      } catch (batchError) {
        this.logger.error(
          `CRITICAL: Error processing DB batch ${batchNum}:`,
          batchError instanceof Error ? batchError.message : String(batchError),
        );
        if (batchError instanceof Error && batchError.stack) {
          this.logger.error(`Batch error stack: ${batchError.stack}`);
        }
      }
    }

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    const avgSpeed = (assets.length / parseFloat(totalDuration)).toFixed(1);
    const uniqueItemsCount = processedNames.size;

    if (!withDetails) {
      this.logger.log(
        `Sync completed in ${totalDuration}s (avg: ${avgSpeed} items/s): ${createdCount} created, ${updatedCount} updated, ${errorCount} errors`,
      );
      this.logger.log(
        `Unique items processed: ${uniqueItemsCount} | Duplicates detected: ${duplicateCount}`,
      );

      if (duplicateCount > 0) {
        const duplicatePercentage = (
          (duplicateCount / assets.length) *
          100
        ).toFixed(1);
        this.logger.warn(
          `⚠️  Found ${duplicateCount} duplicates (${duplicatePercentage}% of total items)`,
        );
        this.logger.warn(
          `This may indicate unstable sorting in the data source.`,
        );
      }

      if (errorCount > 0) {
        this.logger.error(`Error breakdown by type:`);
        Object.entries(errorsByType).forEach(([type, count]) => {
          this.logger.error(`  - ${type}: ${count} errors`);
        });
      }

      const successRate = (
        ((createdCount + updatedCount) / assets.length) *
        100
      ).toFixed(1);
      this.logger.log(`Success rate: ${successRate}%`);

      if (errorCount > assets.length * 0.1) {
        this.logger.warn(
          `WARNING: High error rate detected (${errorCount}/${assets.length} = ${((errorCount / assets.length) * 100).toFixed(1)}%)`,
        );
      }
    }

    return { createdCount, updatedCount, errorCount, details };
  }

  private categorizeDbError(error: unknown): string {
    if (!error) return 'unknown';

    if (this.isPrismaError(error)) {
      const prismaError = error as any;
      const code = prismaError.code;

      switch (code) {
        case 'P2002':
          return 'unique_constraint_violation';
        case 'P2003':
          return 'foreign_key_constraint_violation';
        case 'P2025':
          return 'record_not_found';
        case 'P1001':
          return 'database_connection_error';
        case 'P1002':
          return 'database_timeout';
        case 'P1008':
          return 'operation_timeout';
        case 'P2024':
          return 'connection_pool_timeout';
        default:
          return `prisma_error_${code}`;
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('timeout')) return 'timeout';
      if (error.message.includes('connect')) return 'connection_error';
      if (error.message.includes('ECONNREFUSED')) return 'connection_refused';
      return 'generic_error';
    }

    return 'unknown';
  }

  private isPrismaError(error: unknown): boolean {
    return (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      typeof (error as any).code === 'string' &&
      (error as any).code.startsWith('P')
    );
  }

  /**
   * Sync assets with detailed logging (alias for syncAssets with withDetails=true)
   * Kept for backward compatibility
   */
  async syncAssetsWithDetails(
    assets: { name: string; iconUrl?: string; currentPrice?: number }[],
  ): Promise<SyncResult> {
    return this.syncAssets(assets, true);
  }

  /**
   * Fast sync assets using upsert operations (optimized for parallel fetching)
   * Uses upsert to minimize DB queries (1 query per asset instead of 2-3)
   * @param assets - Assets to sync
   */
  async syncAssetsFast(
    assets: { name: string; iconUrl?: string; currentPrice?: number }[],
  ): Promise<SyncResult> {
    const startTime = Date.now();
    this.logger.debug(`Starting fast sync of ${assets.length} assets...`);

    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const processedNames = new Set<string>();

    for (let i = 0; i < assets.length; i += FAST_SYNC_BATCH_SIZE) {
      const batch = assets.slice(i, i + FAST_SYNC_BATCH_SIZE);
      const batchNum = Math.floor(i / FAST_SYNC_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(assets.length / FAST_SYNC_BATCH_SIZE);
      const batchStartTime = Date.now();

      try {
        // Process each asset with upsert (1 DB operation per asset)
        for (const asset of batch) {
          // Skip empty names
          if (!asset.name || asset.name.trim() === '') {
            errorCount++;
            continue;
          }

          // Skip duplicates within batch
          if (processedNames.has(asset.name)) {
            continue;
          }
          processedNames.add(asset.name);

          try {
            // Single upsert operation instead of find + create/update (saves 1-2 queries!)
            // Prisma.upsert will handle both create and update efficiently
            const result = await this.prisma.asset.upsert({
              where: { name: asset.name },
              update: {
                iconUrl: asset.iconUrl,
                currentPrice: asset.currentPrice,
                updatedAt: new Date(),
              },
              create: {
                name: asset.name,
                iconUrl: asset.iconUrl,
                currentPrice: asset.currentPrice,
              },
            });

            // Check if it was just created by comparing createdAt and updatedAt
            if (
              result.updatedAt &&
              result.createdAt &&
              Math.abs(
                result.updatedAt.getTime() - result.createdAt.getTime(),
              ) < 100
            ) {
              createdCount++;
            } else {
              updatedCount++;
            }
          } catch (error) {
            this.logger.warn(
              `Error upserting asset "${asset.name}": ${error instanceof Error ? error.message : error}`,
            );
            errorCount++;
          }
        }

        const batchDuration = Date.now() - batchStartTime;
        this.logger.debug(
          `Fast sync batch ${batchNum}/${totalBatches} completed in ${batchDuration}ms (${batch.length} assets)`,
        );
      } catch (error) {
        this.logger.error(
          `Batch processing error: ${error instanceof Error ? error.message : error}`,
        );
        errorCount++;
      }
    }

    const totalDuration = Date.now() - startTime;
    this.logger.debug(
      `Fast sync completed: ${createdCount} created, ${updatedCount} updated, ${errorCount} errors in ${totalDuration}ms`,
    );

    return {
      createdCount,
      updatedCount,
      errorCount,
    };
  }

  async updateAssetPrice(name: string, price: number) {
    return this.prisma.asset.update({
      where: { name },
      data: { currentPrice: price },
    });
  }

  async getAllAssets(limit = 1000) {
    const assets = await this.prisma.asset.findMany({
      take: limit,
      orderBy: { name: 'asc' },
    });

    return assets.map((asset) => ({
      ...asset,
      currentPrice: asset.currentPrice ? Number(asset.currentPrice) : undefined,
    }));
  }

  async getAssetsCount() {
    return this.prisma.asset.count();
  }
}
