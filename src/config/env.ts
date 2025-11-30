/**
 * Environment Configuration
 *
 * This module validates and exports all required environment variables.
 * VITE_API_URL MUST be set - without it, API calls will fail.
 */

// Check if VITE_API_URL is set
const rawApiUrl = import.meta.env.VITE_API_URL;

// Flag to track if env is properly configured
export const ENV_CONFIGURED = Boolean(rawApiUrl && rawApiUrl.trim() !== '');

// Log warning if not configured (will be visible in browser console)
if (!ENV_CONFIGURED) {
  console.error(`
╔════════════════════════════════════════════════════════════════════════╗
║  ⚠️  WARNING: VITE_API_URL is not set!                                  ║
║                                                                        ║
║  API calls will NOT work correctly.                                    ║
║                                                                        ║
║  For Render deployment:                                                ║
║    1. Go to Render Dashboard → Your Frontend Service → Environment     ║
║    2. Add: VITE_API_URL = https://your-backend.onrender.com            ║
║    3. Click "Manual Deploy" to rebuild with the new env var            ║
║                                                                        ║
║  Current value: ${rawApiUrl || '(empty)'}
╚════════════════════════════════════════════════════════════════════════╝
`);
}

// Normalize URL by removing trailing slashes and /api suffix
function normalizeApiUrl(url: string): string {
  if (!url) return '';
  return url.trim().replace(/\/+$/, '').replace(/\/api\/?$/, '');
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * Backend API base URL (without /api suffix)
 * Examples:
 *   - Local: http://localhost:5000
 *   - Production: https://rentdirect-backend.onrender.com
 */
export const API_BASE_URL = normalizeApiUrl(rawApiUrl || '');

/**
 * Full API URL with /api path
 * This is what axios uses as baseURL
 */
export const API_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';

/**
 * Socket.IO server URL (same as API base, without /api)
 * Falls back to window.location.origin if not configured
 */
export const SOCKET_URL = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

// ============================================================================
// OPTIONAL ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Razorpay Key ID for payment processing
 */
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID?.trim() || '';

// ============================================================================
// ENVIRONMENT FLAGS
// ============================================================================

export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;
export const MODE = import.meta.env.MODE;

// ============================================================================
// DEBUG: Always log configuration for troubleshooting
// ============================================================================

console.info('[env] Configuration:', {
  VITE_API_URL: rawApiUrl || '(not set)',
  API_BASE_URL: API_BASE_URL || '(not set)',
  API_URL,
  SOCKET_URL,
  ENV_CONFIGURED,
  MODE,
});

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).__ENV_CONFIG__ = {
    VITE_API_URL: rawApiUrl,
    API_BASE_URL,
    API_URL,
    SOCKET_URL,
    ENV_CONFIGURED,
    IS_DEV,
    IS_PROD,
    MODE,
  };
}

// Default export
export default {
  API_BASE_URL,
  API_URL,
  SOCKET_URL,
  RAZORPAY_KEY_ID,
  ENV_CONFIGURED,
  IS_DEV,
  IS_PROD,
  MODE,
};
