import { Logger } from '@nestjs/common';
import { AssetData } from '../providers/asset-provider.interface';
import { shouldFilterAsset } from '../asset-filters.config';

export interface SteamMarketItem {
  name: string;
  asset_description?: {
    market_hash_name: string;
    icon_url?: string;
    name?: string;
  };
  sell_price?: number;
  sell_price_text?: string;
}

/**
 * Helper class for mapping and filtering Steam Market items to AssetData
 */
export class AssetMapper {
  private readonly logger = new Logger(AssetMapper.name);
  
  constructor(private readonly iconBaseUrl: string) {}

  /**
   * Map Steam Market items to AssetData with filtering
   */
  mapAndFilterItems(items: SteamMarketItem[]): AssetData[] {
    this.logger.verbose(
      `Starting mapping and filtering of ${items.length} items`,
    );

    const rawAssets = this.mapItems(items);
    this.logger.verbose(`Mapped ${rawAssets.length} items to AssetData format`);

    const filteredAssets = this.filterAssets(rawAssets);
    const filtered = rawAssets.length - filteredAssets.length;

    if (filtered > 0) {
      this.logger.debug(
        `Filtered ${filtered}/${rawAssets.length} items (${((filtered / rawAssets.length) * 100).toFixed(1)}%)`,
      );
    }

    return filteredAssets;
  }

  /**
   * Map raw Steam Market items to AssetData format
   */
  private mapItems(items: SteamMarketItem[]): AssetData[] {
    return items.map((item) => ({
      name:
        item.asset_description?.market_hash_name ||
        item.asset_description?.name ||
        item.name,
      iconUrl: item.asset_description?.icon_url
        ? `${this.iconBaseUrl}${item.asset_description.icon_url}`
        : undefined,
      currentPrice: this.parsePrice(item.sell_price_text),
    }));
  }

  /**
   * Filter assets based on configured rules
   */
  private filterAssets(assets: AssetData[]): AssetData[] {
    const filterStats: { [reason: string]: number } = {};
    let totalFiltered = 0;

    const filtered = assets.filter((asset) => {
      const { shouldFilter, rule } = shouldFilterAsset(asset.name);
      
      if (shouldFilter && rule) {
        totalFiltered++;
        filterStats[rule.reason] = (filterStats[rule.reason] || 0) + 1;
        this.logger.verbose(`Filtered: "${asset.name}" (${rule.reason})`);
        return false;
      }
      
      return true;
    });

    if (totalFiltered > 0) {
      this.logger.debug(`Filter statistics:`);
      Object.entries(filterStats).forEach(([reason, count]) => {
        this.logger.debug(`  - ${reason}: ${count} items`);
      });
    }

    return filtered;
  }

  /**
   * Parse price string to number
   */
  private parsePrice(priceText?: string): number | undefined {
    if (!priceText) return undefined;
    
    const cleanPrice = priceText.replace(/[^0-9.,]/g, '');
    const price = parseFloat(cleanPrice.replace(',', '.'));
    
    return isNaN(price) ? undefined : price;
  }
}

