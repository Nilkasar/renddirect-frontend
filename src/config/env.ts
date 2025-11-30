/**
 * Environment Configuration
 *
 * This module validates and exports all required environment variables.
 * The app will fail to start if required variables are missing.
 */

// Validate required environment variables at startup
function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];

  if (!value || value.trim() === '') {
    const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║  FATAL: Missing required environment variable: ${key}
║
║  Please ensure ${key} is set in your environment.
║
║  For local development:
║    Create a .env file with: ${key}=http://localhost:5000
║
║  For production (Render):
║    Set ${key} in your Render environment variables
║    Example: https://your-backend.onrender.com
╚════════════════════════════════════════════════════════════════╝
`;
    console.error(errorMessage);
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value.trim();
}

// Get optional environment variable with fallback
function getOptionalEnv(key: string, defaultValue: string = ''): string {
  const value = import.meta.env[key];
  return value?.trim() || defaultValue;
}

// Normalize URL by removing trailing slashes and /api suffix for base URL
function normalizeApiUrl(url: string): string {
  return url.replace(/\/+$/, '').replace(/\/api$/, '');
}

// ============================================================================
// REQUIRED ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Backend API base URL (without /api suffix)
 * Examples:
 *   - Local: http://localhost:5000
 *   - Production: https://rentdirect-backend.onrender.com
 */
const rawApiUrl = getRequiredEnv('VITE_API_URL');
export const API_BASE_URL = normalizeApiUrl(rawApiUrl);

/**
 * Full API URL with /api path
 * This is what you use for API calls
 */
export const API_URL = `${API_BASE_URL}/api`;

/**
 * Socket.IO server URL (same as API base, without /api)
 */
export const SOCKET_URL = API_BASE_URL;

// ============================================================================
// OPTIONAL ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Razorpay Key ID for payment processing
 */
export const RAZORPAY_KEY_ID = getOptionalEnv('VITE_RAZORPAY_KEY_ID', '');

// ============================================================================
// ENVIRONMENT FLAGS
// ============================================================================

export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
export const MODE = import.meta.env.MODE;

// ============================================================================
// DEBUG: Log configuration in development
// ============================================================================

if (IS_DEV) {
  console.info('[env] Environment configuration loaded:');
  console.info(`  API_BASE_URL: ${API_BASE_URL}`);
  console.info(`  API_URL: ${API_URL}`);
  console.info(`  SOCKET_URL: ${SOCKET_URL}`);
  console.info(`  MODE: ${MODE}`);
}

// Expose to window for debugging (development only)
if (typeof window !== 'undefined') {
  (window as any).__ENV_CONFIG__ = {
    API_BASE_URL,
    API_URL,
    SOCKET_URL,
    IS_DEV,
    IS_PROD,
    MODE,
  };
}

// Default export for convenience
export default {
  API_BASE_URL,
  API_URL,
  SOCKET_URL,
  RAZORPAY_KEY_ID,
  IS_DEV,
  IS_PROD,
  MODE,
};
