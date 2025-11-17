import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AssetProvider, AssetData } from './asset-provider.interface';
import { STEAM_MARKET_CONFIG, ASSET_CATEGORIES } from './steam-market.config';
import { RateLimiter } from '../helpers/rate-limiter.helper';
import { AssetMapper, SteamMarketItem } from '../helpers/asset-mapper.helper';

interface SteamMarketResponse {
  success: boolean;
  start: number;
  pagesize: number;
  total_count: number;
  results: SteamMarketItem[];
}

@Injectable()
export class SteamMarketProvider implements AssetProvider {
  readonly name = 'Steam Market';
  private readonly logger = new Logger(SteamMarketProvider.name);
  private readonly rateLimiter: RateLimiter;
  private readonly assetMapper: AssetMapper;

  constructor() {
    this.rateLimiter = new RateLimiter({
      maxRequestsPerMinute:
        STEAM_MARKET_CONFIG.RATE_LIMITING.MAX_REQUESTS_PER_MINUTE,
      rateWindowMs: STEAM_MARKET_CONFIG.RATE_LIMITING.RATE_WINDOW_MS,
      minJitterMs: STEAM_MARKET_CONFIG.RATE_LIMITING.MIN_JITTER_MS,
      maxJitterMs: STEAM_MARKET_CONFIG.RATE_LIMITING.MAX_JITTER_MS,
    });
    this.assetMapper = new AssetMapper(STEAM_MARKET_CONFIG.ICON_BASE_URL);
  }

  async getAllAssets(): Promise<AssetData[]> {
    const allAssets: AssetData[] = [];
    let start = 0;
    let totalCount: number | null = null;
    let consecutiveErrors = 0;
    const startTime = Date.now();

    this.logger.log('Starting getAllAssets operation');

    while (true) {
      try {
        const url = this.buildUrl(start);
        this.logger.debug(
          `Fetching from Steam Market: offset=${start}, page_size=${STEAM_MARKET_CONFIG.PAGE_SIZE}`,
        );
        this.logger.verbose(`Request URL: ${url}`);

        const iterationStartTime = Date.now();
        const response = await this.fetchWithRetry(url);
        const fetchDuration = Date.now() - iterationStartTime;

        this.logger.verbose(
          `Fetch completed in ${fetchDuration}ms (offset=${start})`,
        );

        if (!response.success) {
          this.logger.error(
            `Steam API returned success=false at offset ${start}`,
          );
          this.logger.error(`Response data: ${JSON.stringify(response)}`);
          throw new Error('Failed to fetch from Steam Market');
        }

        if (totalCount === null) {
          totalCount = response.total_count;
          const estimatedPages = Math.ceil(
            totalCount / STEAM_MARKET_CONFIG.PAGE_SIZE,
          );
          this.logger.log(`Total items to fetch: ${totalCount}`);
          this.logger.log(
            `Estimated pages: ${estimatedPages} (page size: ${STEAM_MARKET_CONFIG.PAGE_SIZE} items/page)`,
          );
        }

        const items = response.results || [];
        this.logger.debug(
          `Received ${items.length} items from Steam API (offset=${start})`,
        );

        if (items.length === 0) {
          this.logger.warn(
            `No items returned at offset ${start}, stopping... (expected ${STEAM_MARKET_CONFIG.PAGE_SIZE} items)`,
          );
          break;
        }

        const beforeFilter = items.length;
        const assets = this.assetMapper.mapAndFilterItems(items);
        const afterFilter = assets.length;
        const filtered = beforeFilter - afterFilter;

        if (filtered > 0) {
          this.logger.debug(
            `Filtered out ${filtered} items (${((filtered / beforeFilter) * 100).toFixed(1)}%)`,
          );
        }

        allAssets.push(...assets);

        const progress = ((allAssets.length / totalCount) * 100).toFixed(1);
        const elapsedTimeSec = (Date.now() - startTime) / 1000;
        const estimatedTotal = (
          (elapsedTimeSec * totalCount) /
          allAssets.length /
          60
        ).toFixed(1);

        this.logger.log(
          `Progress: ${allAssets.length}/${totalCount} (${progress}%) | Elapsed: ${elapsedTimeSec.toFixed(1)}s | ETA: ~${estimatedTotal}min`,
        );

        consecutiveErrors = 0;

        if (allAssets.length >= totalCount) {
          this.logger.log(`Reached total count, stopping...`);
          break;
        }

        start += STEAM_MARKET_CONFIG.PAGE_SIZE;
        await this.rateLimiter.waitForRateLimit();
      } catch (error) {
        consecutiveErrors++;

        this.logger.error(
          `Error fetching assets at offset ${start} (consecutive errors: ${consecutiveErrors}/${STEAM_MARKET_CONFIG.RETRY.MAX_CONSECUTIVE_ERRORS}):`,
          error instanceof Error ? error.message : error,
        );

        if (error instanceof Error && error.stack) {
          this.logger.debug(`Error stack: ${error.stack}`);
        }

        if (
          consecutiveErrors >= STEAM_MARKET_CONFIG.RETRY.MAX_CONSECUTIVE_ERRORS
        ) {
          this.logger.error(
            `Stopping after ${STEAM_MARKET_CONFIG.RETRY.MAX_CONSECUTIVE_ERRORS} consecutive errors`,
          );
          this.logger.error(
            `Total fetched before stopping: ${allAssets.length}`,
          );
          break;
        }

        this.logger.warn(`Skipping to next offset after error...`);
        start += STEAM_MARKET_CONFIG.PAGE_SIZE;
        await this.rateLimiter.waitForRateLimit();
      }
    }

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    this.logger.log(
      `Fetched ${allAssets.length} assets from Steam Market in ${totalDuration}s`,
    );
    return allAssets;
  }

  async fetchAssetsInBatches(
    batchSize: number,
    onBatch: (
      assets: AssetData[],
      batchNumber: number,
      totalBatches: number,
    ) => Promise<void>,
    startOffset?: number,
  ): Promise<void> {
    await this.fetchAssetsBatchInternal({
      batchSize,
      onBatch: async (assets, batchNumber, totalBatches) => {
        await onBatch(assets, batchNumber, totalBatches);
      },
      startOffset,
    });
  }

  async fetchAssetsByCategory(
    categoryId: string,
    batchSize: number,
    onBatch: (
      assets: AssetData[],
      batchNumber: number,
      totalBatches: number,
    ) => Promise<void>,
    startOffset?: number,
  ): Promise<void> {
    const category = ASSET_CATEGORIES.find((cat) => cat.id === categoryId);
    if (!category) {
      this.logger.error(
        `Category "${categoryId}" not found in available categories`,
      );
      throw new Error(`Category "${categoryId}" not found`);
    }

    this.logger.log(
      `Starting category sync: ${category.name} (ID: ${categoryId}, priority: ${category.priority}, query: "${category.searchQuery}")`,
    );

    if (startOffset !== undefined && startOffset > 0) {
      this.logger.log(`Resuming category from offset: ${startOffset}`);
    }

    const startTime = Date.now();
    await this.fetchAssetsBatchInternal({
      batchSize,
      searchQuery: category.searchQuery,
      categoryName: category.name,
      startOffset,
      onBatch: async (assets, batchNumber, totalBatches) => {
        await onBatch(assets, batchNumber, totalBatches);
      },
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    this.logger.log(`[${category.name}] Finished in ${duration}s`);
  }

  async fetchAssetsByPriority(
    batchSize: number,
    onBatch: (
      assets: AssetData[],
      batchNumber: number,
      totalBatches: number,
      category: string,
    ) => Promise<void>,
    categories?: string[],
    startOffset?: number,
  ): Promise<void> {
    const sortedCategories = ASSET_CATEGORIES.filter((cat) =>
      categories ? categories.includes(cat.id) : true,
    ).sort((a, b) => a.priority - b.priority);

    const totalStartTime = Date.now();

    this.logger.log(
      `Starting priority sync for ${sortedCategories.length} categories`,
    );
    this.logger.log(
      `Categories: ${sortedCategories.map((c) => `${c.name} (priority ${c.priority})`).join(', ')}`,
    );

    if (startOffset !== undefined && startOffset > 0) {
      this.logger.log(`Resuming from offset: ${startOffset}`);
    }

    for (let i = 0; i < sortedCategories.length; i++) {
      const category = sortedCategories[i];
      const categoryStartTime = Date.now();

      this.logger.log(
        `[${i + 1}/${sortedCategories.length}] Syncing category: ${category.name} (priority ${category.priority}, ID: ${category.id})`,
      );

      await this.fetchAssetsByCategory(
        category.id,
        batchSize,
        async (assets, batchNumber, totalBatches) => {
          await onBatch(assets, batchNumber, totalBatches, category.name);
        },
        startOffset,
      );

      const categoryDuration = (
        (Date.now() - categoryStartTime) /
        1000
      ).toFixed(2);
      this.logger.log(
        `[${i + 1}/${sortedCategories.length}] Category "${category.name}" completed in ${categoryDuration}s`,
      );

      // Only use startOffset for first category
      startOffset = undefined;
    }

    const totalDuration = ((Date.now() - totalStartTime) / 1000 / 60).toFixed(
      2,
    );
    this.logger.log(
      `Priority sync completed for all categories in ${totalDuration} minutes`,
    );
  }

  async getCurrentPrices(): Promise<Array<{ name: string; price: number }>> {
    this.logger.log('Fetching current prices from Steam Market...');
    const assets = await this.getAllAssets();
    return assets
      .filter((asset) => asset.currentPrice !== undefined)
      .map((asset) => ({ name: asset.name, price: asset.currentPrice! }));
  }

  async searchAssets(query: string, limit = 20): Promise<AssetData[]> {
    if (!query || query.length < 2) return [];

    const startTime = Date.now();
    try {
      this.logger.debug(
        `Searching Steam Market for: "${query}" (limit: ${limit})`,
      );
      const params = new URLSearchParams({
        query: query,
        start: '0',
        count: Math.min(limit, 100).toString(),
        search_descriptions: '0',
        sort_column: 'popular',
        sort_dir: 'desc',
        appid: STEAM_MARKET_CONFIG.APP_ID.toString(),
        norender: '1',
      });

      const url = `${STEAM_MARKET_CONFIG.BASE_URL}?${params.toString()}`;
      this.logger.verbose(`Search URL: ${url}`);
      this.logger.verbose(
        `Search params: ${JSON.stringify(Object.fromEntries(params))}`,
      );

      const response = await this.fetchWithRetry(url, 2);
      const duration = Date.now() - startTime;

      if (!response.success || !response.results) {
        this.logger.warn(
          `Steam search returned no results for: "${query}" (${duration}ms)`,
        );
        return [];
      }

      const beforeFilter = response.results.length;
      const assets = this.assetMapper.mapAndFilterItems(response.results);
      const afterFilter = assets.length;

      this.logger.debug(
        `Search completed in ${duration}ms: found ${afterFilter}/${beforeFilter} results for: "${query}"`,
      );

      if (beforeFilter > afterFilter) {
        this.logger.verbose(
          `Filtered ${beforeFilter - afterFilter} items from search results`,
        );
      }

      return assets;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Error searching Steam Market for "${query}" after ${duration}ms:`,
        error instanceof Error ? error.message : error,
      );
      if (error instanceof Error && error.stack) {
        this.logger.debug(`Search error stack: ${error.stack}`);
      }
      return [];
    }
  }

  /**
   * Internal method for batch fetching with optional search query
   * Consolidates logic from fetchAssetsInBatches and fetchAssetsByCategory
   */
  private async fetchAssetsBatchInternal(options: {
    batchSize: number;
    searchQuery?: string;
    categoryName?: string;
    startOffset?: number;
    onBatch: (
      assets: AssetData[],
      batchNumber: number,
      totalBatches: number,
    ) => Promise<void>;
  }): Promise<void> {
    const {
      batchSize,
      searchQuery = '',
      categoryName,
      startOffset = 0,
      onBatch,
    } = options;

    let start = startOffset;
    let totalCount: number | null = null;
    let consecutiveErrors = 0;
    let currentBatch: AssetData[] = [];
    let processedCount = 0;
    let batchNumber = 0;
    const startTime = Date.now();

    const prefix = categoryName ? `[${categoryName}] ` : '';

    this.logger.log(`${prefix}Starting batch fetch (batch size: ${batchSize})`);
    if (searchQuery) {
      this.logger.log(`${prefix}Search query: "${searchQuery}"`);
    }
    if (startOffset > 0) {
      this.logger.log(`${prefix}Starting from offset: ${startOffset}`);
    }

    while (true) {
      try {
        const url = this.buildUrl(start, searchQuery);
        this.logger.verbose(
          `${prefix}Fetching offset ${start}, page_size=${STEAM_MARKET_CONFIG.PAGE_SIZE}...`,
        );

        const fetchStartTime = Date.now();
        const response = await this.fetchWithRetry(url);
        const fetchDuration = Date.now() - fetchStartTime;

        this.logger.verbose(
          `${prefix}Fetched in ${fetchDuration}ms (offset=${start})`,
        );

        if (!response.success) {
          this.logger.error(
            `${prefix}Steam API returned success=false at offset ${start}`,
          );
          this.logger.error(`${prefix}Response: ${JSON.stringify(response)}`);
          throw new Error('Failed to fetch from Steam Market');
        }

        if (totalCount === null) {
          totalCount = response.total_count;
          const estimatedBatches = Math.ceil(totalCount / batchSize);
          const estimatedPages = Math.ceil(
            totalCount / STEAM_MARKET_CONFIG.PAGE_SIZE,
          );
          this.logger.log(
            `${prefix}Total items: ${totalCount} (~${estimatedBatches} batches, ${estimatedPages} API pages)`,
          );
        }

        const items = response.results || [];
        if (items.length === 0) {
          this.logger.warn(
            `${prefix}No items returned at offset ${start}, ending fetch`,
          );
          break;
        }

        this.logger.debug(
          `${prefix}Received ${items.length} items from API (offset=${start})`,
        );

        const beforeFilter = items.length;
        const assets = this.assetMapper.mapAndFilterItems(items);
        const afterFilter = assets.length;
        const filtered = beforeFilter - afterFilter;

        if (filtered > 0) {
          this.logger.debug(
            `${prefix}Filtered ${filtered}/${beforeFilter} items (${((filtered / beforeFilter) * 100).toFixed(1)}%)`,
          );
        }

        currentBatch.push(...assets);
        processedCount += assets.length;

        if (currentBatch.length >= batchSize) {
          batchNumber++;
          const totalBatches = Math.ceil(totalCount / batchSize);
          const batchSaveStartTime = Date.now();

          this.logger.log(
            `${prefix}Processing batch ${batchNumber}/${totalBatches} (${currentBatch.length} assets)`,
          );

          await onBatch(currentBatch, batchNumber, totalBatches);

          const batchSaveDuration = Date.now() - batchSaveStartTime;
          this.logger.verbose(
            `${prefix}Batch ${batchNumber} saved in ${batchSaveDuration}ms`,
          );

          currentBatch = [];
        }

        const progress = ((processedCount / totalCount) * 100).toFixed(1);
        const elapsedTimeSec = (Date.now() - startTime) / 1000;
        const itemsPerSecond = processedCount / elapsedTimeSec;
        const estimatedTotal = (
          (totalCount - processedCount) /
          itemsPerSecond /
          60
        ).toFixed(1);

        this.logger.log(
          `${prefix}Progress: ${processedCount}/${totalCount} (${progress}%) | Speed: ${itemsPerSecond.toFixed(1)} items/s | ETA: ~${estimatedTotal}min`,
        );

        consecutiveErrors = 0;
        if (processedCount >= totalCount) {
          this.logger.log(`${prefix}Reached total count, ending fetch`);
          break;
        }

        start += STEAM_MARKET_CONFIG.PAGE_SIZE;
        await this.rateLimiter.waitForRateLimit();
      } catch (error) {
        consecutiveErrors++;

        this.logger.error(
          `${prefix}Error at offset ${start} (consecutive errors: ${consecutiveErrors}/${STEAM_MARKET_CONFIG.RETRY.MAX_CONSECUTIVE_ERRORS}):`,
          error instanceof Error ? error.message : error,
        );

        if (error instanceof Error && error.stack) {
          this.logger.debug(`${prefix}Error stack: ${error.stack}`);
        }

        if (
          consecutiveErrors >= STEAM_MARKET_CONFIG.RETRY.MAX_CONSECUTIVE_ERRORS
        ) {
          this.logger.error(
            `${prefix}Stopping after ${STEAM_MARKET_CONFIG.RETRY.MAX_CONSECUTIVE_ERRORS} consecutive errors`,
          );
          this.logger.error(
            `${prefix}Processed ${processedCount} items before stopping`,
          );
          break;
        }

        this.logger.warn(`${prefix}Skipping to next offset...`);
        start += STEAM_MARKET_CONFIG.PAGE_SIZE;
        await this.rateLimiter.waitForRateLimit();
      }
    }

    if (currentBatch.length > 0) {
      batchNumber++;
      const totalBatches = Math.ceil(
        (totalCount || processedCount) / batchSize,
      );
      this.logger.log(
        `${prefix}Processing final batch ${batchNumber}/${totalBatches} (${currentBatch.length} assets)`,
      );
      await onBatch(currentBatch, batchNumber, totalBatches);
    }

    const totalDurationSec = (Date.now() - startTime) / 1000;
    const avgSpeed = processedCount / totalDurationSec;
    this.logger.log(
      `${prefix}Finished batch processing: ${processedCount} total assets in ${totalDurationSec.toFixed(2)}s (avg: ${avgSpeed.toFixed(1)} items/s)`,
    );
  }

  private buildUrl(start: number, query = ''): string {
    const params = new URLSearchParams({
      query,
      start: start.toString(),
      count: STEAM_MARKET_CONFIG.PAGE_SIZE.toString(),
      search_descriptions: '0',
      sort_column: STEAM_MARKET_CONFIG.SORT.COLUMN,
      sort_dir: STEAM_MARKET_CONFIG.SORT.DIRECTION,
      appid: STEAM_MARKET_CONFIG.APP_ID.toString(),
      norender: '1',
    });
    const url = `${STEAM_MARKET_CONFIG.BASE_URL}?${params.toString()}`;
    this.logger.verbose(
      `Building URL with params: ${JSON.stringify(Object.fromEntries(params))}`,
    );
    return url;
  }

  private async fetchWithRetry(
    url: string,
    maxRetries: number = STEAM_MARKET_CONFIG.RETRY.MAX_RETRIES,
  ): Promise<SteamMarketResponse> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        this.logger.verbose(
          `Making HTTP request (attempt ${i + 1}/${maxRetries})`,
        );

        const requestStartTime = Date.now();
        const response = await axios.get<SteamMarketResponse>(url, {
          timeout: STEAM_MARKET_CONFIG.HTTP.TIMEOUT_MS,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            Cookie: process.env.STEAM_COOKIES || '',
            Referer: 'https://steamcommunity.com/market/',
            Origin: 'https://steamcommunity.com',
          },
        });
        const requestDuration = Date.now() - requestStartTime;

        if (!response.data) {
          this.logger.error('Empty response from Steam API');
          throw new Error('Empty response from Steam API');
        }

        this.rateLimiter.recordRequest();
        this.logger.verbose(
          `HTTP request successful in ${requestDuration}ms (status: ${response.status})`,
        );

        const hasResults =
          response.data.results && response.data.results.length > 0;
        this.logger.verbose(
          `Response: success=${response.data.success}, results=${response.data.results?.length || 0}, total_count=${response.data.total_count}`,
        );

        if (!hasResults && i === 0) {
          this.logger.debug('First attempt returned no results');
        }

        return response.data;
      } catch (error) {
        lastError = error as Error;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        if (axios.isAxiosError(error)) {
          const axiosError = error;
          this.logger.error(
            `Axios error (attempt ${i + 1}/${maxRetries}): ${axiosError.code || 'NO_CODE'} - ${errorMessage}`,
          );

          if (axiosError.response) {
            this.logger.error(
              `Response status: ${axiosError.response.status} ${axiosError.response.statusText || ''}`,
            );
            this.logger.verbose(
              `Response headers: ${JSON.stringify(axiosError.response.headers)}`,
            );

            if (axiosError.response.data) {
              const responseData =
                typeof axiosError.response.data === 'string'
                  ? axiosError.response.data.substring(0, 200)
                  : JSON.stringify(axiosError.response.data).substring(0, 200);
              this.logger.verbose(`Response data: ${responseData}...`);
            }

            if (
              STEAM_MARKET_CONFIG.HTTP.CRITICAL_STATUS_CODES.includes(
                axiosError.response.status,
              )
            ) {
              this.logger.error(
                `CRITICAL ERROR ${axiosError.response.status}: Stopping sync immediately`,
              );
              throw new Error(
                `Critical HTTP error ${axiosError.response.status}: ${errorMessage}. Sync stopped.`,
              );
            }
          } else if (axiosError.request) {
            this.logger.error(
              `No response received from server (timeout or network error)`,
            );
            this.logger.verbose(
              `Request config: ${JSON.stringify({
                url: axiosError.config?.url,
                timeout: axiosError.config?.timeout,
                method: axiosError.config?.method,
              })}`,
            );
          } else {
            this.logger.error(`Error setting up request: ${errorMessage}`);
          }
        } else {
          this.logger.error(
            `Request error (attempt ${i + 1}/${maxRetries}): ${errorMessage}`,
          );
        }

        if (i === maxRetries - 1) {
          this.logger.error(
            `Max retries (${maxRetries}) exceeded, throwing error`,
          );
          throw lastError;
        }

        const waitTime =
          STEAM_MARKET_CONFIG.RETRY.RETRY_BASE_DELAY_MS * (i + 1);
        this.logger.warn(
          `Waiting ${waitTime}ms before retry ${i + 2}/${maxRetries}...`,
        );
        await this.sleep(waitTime);
      }
    }
    throw lastError || new Error('Max retries exceeded');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
