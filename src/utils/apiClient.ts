/**
 * Centralized API client configuration.
 * 
 * If you separate the backend in the future, update the NEXT_PUBLIC_API_URL variable
 * in the .env file to point to the new backend server URL.
 */

// Defaults to empty string for relative paths if NEXT_PUBLIC_API_URL is not set.
// This allows the app to work seamlessly as a monolith initially.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Helper function to construct full API URLs.
 * Automatically strips leading slashes to prevent double slashes.
 * 
 * @param endpoint The API endpoint (e.g., 'api/products' or '/api/products')
 * @returns The full URL string
 */
export function getApiUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
    return `${API_BASE_URL ? base : '/'}${cleanEndpoint}`;
}
