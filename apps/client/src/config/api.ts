// Base API URL - can be empty for same-origin requests or a domain for cross-origin
// Example: '' (same origin) or 'https://api.domain.com' (cross-origin)
const BASE_URL = import.meta.env.VITE_API_URL || '';

// API base path with /api prefix
export const API_URL = `${BASE_URL}/api`;

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    status: `${API_URL}/auth/status`,
    logout: `${API_URL}/auth/logout`,
    steam: `${API_URL}/auth/steam`,
  },
  portfolios: {
    list: `${API_URL}/portfolios`,
    create: `${API_URL}/portfolios`,
    detail: (id: string) => `${API_URL}/portfolios/${id}`,
    update: (id: string) => `${API_URL}/portfolios/${id}`,
    delete: (id: string) => `${API_URL}/portfolios/${id}`,
  }
} as const;

