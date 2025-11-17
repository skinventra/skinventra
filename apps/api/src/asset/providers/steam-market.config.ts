/**
 * Steam Market API Configuration
 */

/**
 * Available sort columns for Steam Market API
 *
 * - name: Alphabetical (A-Z) - STABLE, no duplicates
 * - price: By price (ascending/descending) - May have duplicates due to price changes
 * - quantity: By quantity/volume - Dynamic, may have duplicates
 * - popular: By popularity - VERY DYNAMIC, causes many duplicates
 */
export type SteamSortColumn = 'name' | 'price' | 'quantity' | 'popular';

export type SteamSortDirection = 'asc' | 'desc';

export const STEAM_MARKET_CONFIG = {
  BASE_URL: 'https://steamcommunity.com/market/search/render/',
  APP_ID: 730,
  PAGE_SIZE: 10,

  // Sorting configuration
  SORT: {
    COLUMN: 'name' as SteamSortColumn, // 'name' is the most stable for pagination
    DIRECTION: 'asc' as SteamSortDirection,
  },

  RATE_LIMITING: {
    MAX_REQUESTS_PER_MINUTE: 120,
    RATE_WINDOW_MS: 60000,
    RATE_LIMIT_DELAY_MS: 300000,
    MIN_JITTER_MS: 0,
    MAX_JITTER_MS: 500,
  },

  RETRY: {
    MAX_RETRIES: 3,
    MAX_CONSECUTIVE_ERRORS: 3,
    RETRY_BASE_DELAY_MS: 2000,
  },

  HTTP: {
    TIMEOUT_MS: 15000,
    CRITICAL_STATUS_CODES: [403, 429, 500, 502, 503, 504] as number[],
  },

  ICON_BASE_URL: 'https://community.cloudflare.steamstatic.com/economy/image/',
} as const;

export interface CategoryConfig {
  id: string;
  name: string;
  searchQuery: string;
  priority: number;
}

export const ASSET_CATEGORIES: CategoryConfig[] = [
  {
    id: 'stickers',
    name: 'Stickers',
    searchQuery: 'Sticker |',
    priority: 1,
  },
  {
    id: 'cases',
    name: 'Cases',
    searchQuery: 'Case',
    priority: 2,
  },
  {
    id: 'charms',
    name: 'Charms',
    searchQuery: 'Charm |',
    priority: 3,
  },
  {
    id: 'graffiti',
    name: 'Graffiti',
    searchQuery: 'Graffiti |',
    priority: 4,
  },
  {
    id: 'patches',
    name: 'Patches',
    searchQuery: 'Patch |',
    priority: 5,
  },
];
