/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Backend API base URL (REQUIRED)
   * Example: https://rentdirect-backend.onrender.com
   * NOTE: Do NOT include /api suffix - it will be added automatically
   */
  readonly VITE_API_URL: string;

  /**
   * Razorpay Key ID for payment processing (optional)
   */
  readonly VITE_RAZORPAY_KEY_ID?: string;

  // Vite built-in env variables
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
