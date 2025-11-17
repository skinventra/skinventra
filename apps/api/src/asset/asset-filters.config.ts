/**
 * Asset filtering configuration
 * Define rules to exclude certain items from synchronization
 */

export interface AssetFilterRule {
  id: string;
  description: string;
  pattern: string | RegExp;
  reason: string;
}

export const ASSET_FILTER_RULES: AssetFilterRule[] = [
  {
    id: 'sticker-slab-charms',
    description: 'Exclude Sticker Slab items (they are charms, not stickers)',
    pattern: /^Sticker Slab \|/i,
    reason: 'Sticker Slab items are charms that duplicate sticker names',
  },
  // Add more rules here as needed
  // Example:
  // {
  //   id: 'test-items',
  //   description: 'Exclude test items',
  //   pattern: /test/i,
  //   reason: 'Test items should not be in production database',
  // },
];

/**
 * Check if an asset should be filtered out
 * @param assetName - The name of the asset to check
 * @returns true if asset should be excluded, false otherwise
 */
export function shouldFilterAsset(assetName: string): {
  shouldFilter: boolean;
  rule?: AssetFilterRule;
} {
  for (const rule of ASSET_FILTER_RULES) {
    const pattern =
      typeof rule.pattern === 'string'
        ? new RegExp(rule.pattern, 'i')
        : rule.pattern;

    if (pattern.test(assetName)) {
      return { shouldFilter: true, rule };
    }
  }

  return { shouldFilter: false };
}

/**
 * Get statistics about filtered assets
 */
export function getFilterStatistics(
  allAssets: Array<{ name: string }>,
): {
  total: number;
  filtered: number;
  passed: number;
  filterBreakdown: Record<string, number>;
} {
  const stats = {
    total: allAssets.length,
    filtered: 0,
    passed: 0,
    filterBreakdown: {} as Record<string, number>,
  };

  for (const asset of allAssets) {
    const { shouldFilter, rule } = shouldFilterAsset(asset.name);

    if (shouldFilter && rule) {
      stats.filtered++;
      stats.filterBreakdown[rule.id] =
        (stats.filterBreakdown[rule.id] || 0) + 1;
    } else {
      stats.passed++;
    }
  }

  return stats;
}

