export interface AssetData {
  name: string;
  iconUrl?: string;
  currentPrice?: number;
}

export interface AssetProvider {
  /**
   * Provider name for logging and identification
   */
  readonly name: string;

  /**
   * Fetch all available assets from the provider
   */
  getAllAssets(): Promise<AssetData[]>;

  /**
   * Fetch assets in batches with callback processing
   * @param batchSize - Number of assets per batch
   * @param onBatch - Callback function for each batch
   * @param startOffset - Starting offset for resuming sync (optional)
   */
  fetchAssetsInBatches(
    batchSize: number,
    onBatch: (
      assets: AssetData[],
      batchNumber: number,
      totalBatches: number,
    ) => Promise<void>,
    startOffset?: number,
  ): Promise<void>;

  /**
   * Get current prices for all assets
   */
  getCurrentPrices(): Promise<Array<{ name: string; price: number }>>;

  /**
   * Search for specific assets by query (optional)
   * @param query - Search term
   * @param limit - Maximum results to return
   */
  searchAssets?(query: string, limit?: number): Promise<AssetData[]>;

  /**
   * Fetch assets by category (optional)
   * @param categoryId - Category identifier
   * @param batchSize - Number of assets per batch
   * @param onBatch - Callback function for each batch
   */
  fetchAssetsByCategory?(
    categoryId: string,
    batchSize: number,
    onBatch: (
      assets: AssetData[],
      batchNumber: number,
      totalBatches: number,
    ) => Promise<void>,
  ): Promise<void>;

  /**
   * Fetch assets by priority (optional)
   * @param batchSize - Number of assets per batch
   * @param onBatch - Callback function for each batch
   * @param categories - Optional list of category IDs to sync
   * @param startOffset - Starting offset for resuming sync (optional)
   */
  fetchAssetsByPriority?(
    batchSize: number,
    onBatch: (
      assets: AssetData[],
      batchNumber: number,
      totalBatches: number,
      category: string,
    ) => Promise<void>,
    categories?: string[],
    startOffset?: number,
  ): Promise<void>;
}

