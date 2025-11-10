/**
 * React Query configuration constants
 * These values control caching, refetching, and retry behavior
 */

// Time durations in milliseconds
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * How long data is considered fresh before React Query will refetch
 * During this time, queries will return cached data without refetching
 */
export const STALE_TIME = 5 * MINUTE;

/**
 * How long unused/inactive data remains in cache before being garbage collected
 * This affects how long data persists after components unmount
 */
export const GARBAGE_COLLECTION_TIME = 24 * HOUR;

/**
 * Number of times to retry a failed request before giving up
 */
export const RETRY_COUNT = 1;

/**
 * Whether to refetch queries when the browser window regains focus
 * Useful for ensuring data is up-to-date when user returns to the tab
 */
export const REFETCH_ON_WINDOW_FOCUS = true;

/**
 * Whether to refetch queries when the network reconnects
 * Useful for syncing data after internet connection is restored
 */
export const REFETCH_ON_RECONNECT = true;

