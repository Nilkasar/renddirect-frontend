import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';

// Read and normalize Vite API env var. Trim trailing slash to avoid double slashes.
const rawApiBase = import.meta.env.VITE_API_URL;
const API_BASE_URL = rawApiBase ? String(rawApiBase).replace(/\/+$/, '') : '/api';

// Expose and log at runtime for debugging in browser console
if (typeof window !== 'undefined') {
  try {
    (window as any).__APP_API_BASE__ = API_BASE_URL;
    // eslint-disable-next-line no-console
    console.info('[api] API base URL:', API_BASE_URL);
  } catch (e) {
    // ignore
  }
}

// Token storage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: { field: string; message: string }[];

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'UNKNOWN_ERROR',
    details?: { field: string; message: string }[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static fromAxiosError(error: AxiosError<any>): ApiError {
    if (error.response) {
      const { data, status } = error.response;
      const errorData = data?.error || data;

      return new ApiError(
        errorData?.message || error.message || 'An error occurred',
        status,
        errorData?.code || 'API_ERROR',
        errorData?.details
      );
    }

    if (error.request) {
      return new ApiError(
        'Unable to connect to server. Please check your internet connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    return new ApiError(error.message, 500, 'REQUEST_ERROR');
  }
}

// Create axios instance with timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(ApiError.fromAxiosError(error))
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.error?.code;

      // Only redirect if token is invalid/expired, not for wrong credentials
      if (errorCode === 'TOKEN_INVALID' || errorCode === 'TOKEN_EXPIRED') {
        clearAuthData();
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login?session=expired';
        }
      }
    }

    // Transform to our custom error
    return Promise.reject(ApiError.fromAxiosError(error));
  }
);

/**
 * Clear authentication data from storage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Set authentication data in storage
 */
export const setAuthData = (token: string, user: any): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get stored authentication data
 */
export const getAuthData = (): { token: string | null; user: any } => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  return {
    token,
    user: userStr ? JSON.parse(userStr) : null,
  };
};

/**
 * Helper to extract data from API response
 */
export const extractData = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (!response.data.success) {
    throw new ApiError(
      response.data.error || 'Request failed',
      response.status,
      'API_ERROR'
    );
  }
  return response.data.data as T;
};

/**
 * Helper to safely make API calls with error handling
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<{ data: T | null; error: ApiError | null }> => {
  try {
    const response = await apiCall();
    return { data: extractData(response), error: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return { data: null, error };
    }
    return { data: null, error: new ApiError('An unexpected error occurred') };
  }
};

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'OWNER' | 'TENANT';
  }) => api.post<ApiResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse>('/auth/login', data),

  getProfile: () => api.get<ApiResponse>('/auth/me'),

  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImage?: string;
  }) => api.put<ApiResponse>('/auth/profile', data),

  // Password reset
  forgotPassword: (email: string) =>
    api.post<ApiResponse>('/auth/forgot-password', { email }),

  verifyOTP: (email: string, otp: string) =>
    api.post<ApiResponse>('/auth/verify-otp', { email, otp }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post<ApiResponse>('/auth/reset-password', { email, otp, newPassword }),
};

// Properties API
export const propertiesAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    city?: string;
    locality?: string;
    minRent?: number;
    maxRent?: number;
    propertyType?: string;
    roomConfig?: string;
    furnishing?: string;
    tenantPreference?: string;
  }) => api.get<ApiResponse>('/properties', { params }),

  getById: (id: string) => api.get<ApiResponse>(`/properties/${id}`),

  create: (data: any) => api.post<ApiResponse>('/properties', data),

  update: (id: string, data: any) => api.put<ApiResponse>(`/properties/${id}`, data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse>(`/properties/${id}/status`, { status }),

  delete: (id: string) => api.delete<ApiResponse>(`/properties/${id}`),

  getMyProperties: () => api.get<ApiResponse>('/properties/owner/me'),

  getOwnerStats: () => api.get<ApiResponse>('/properties/owner/stats'),

  bookmark: (id: string) => api.post<ApiResponse>(`/properties/${id}/bookmark`),

  removeBookmark: (id: string) => api.delete<ApiResponse>(`/properties/${id}/bookmark`),

  getBookmarks: () => api.get<ApiResponse>('/properties/bookmarks'),
};

// Chat API
export const chatAPI = {
  startConversation: (propertyId: string) =>
    api.post<ApiResponse>('/conversations', { propertyId }),

  getConversations: () => api.get<ApiResponse>('/conversations'),

  getConversation: (id: string) => api.get<ApiResponse>(`/conversations/${id}`),

  getMessages: (id: string, page = 1) =>
    api.get<ApiResponse>(`/conversations/${id}/messages`, { params: { page } }),

  sendMessage: (id: string, content: string) =>
    api.post<ApiResponse>(`/conversations/${id}/messages`, { content }),

  markAsRead: (id: string) => api.post<ApiResponse>(`/conversations/${id}/read`),

  revealPhone: (id: string) => api.post<ApiResponse>(`/conversations/${id}/reveal-phone`),

  flagConversation: (id: string, reason: string) =>
    api.post<ApiResponse>(`/conversations/${id}/flag`, { reason }),

  getUnreadCount: () => api.get<ApiResponse>('/conversations/unread-count'),
};

// Deals API
export const dealsAPI = {
  getAll: () => api.get<ApiResponse>('/deals'),

  getByConversation: (conversationId: string) =>
    api.get<ApiResponse>(`/deals/conversation/${conversationId}`),

  ownerConfirm: (conversationId: string, agreedRent?: number) =>
    api.post<ApiResponse>(`/deals/${conversationId}/owner-confirm`, { agreedRent }),

  tenantConfirm: (conversationId: string) =>
    api.post<ApiResponse>(`/deals/${conversationId}/tenant-confirm`),

  cancel: (id: string) => api.post<ApiResponse>(`/deals/${id}/cancel`),
};

// Reports API
export const reportsAPI = {
  create: (data: {
    type: string;
    description: string;
    reportedUserId?: string;
    propertyId?: string;
    conversationId?: string;
  }) => api.post<ApiResponse>('/reports', data),

  getMyReports: () => api.get<ApiResponse>('/reports/my'),
};

// Admin API
export const adminAPI = {
  getOverview: () => api.get<ApiResponse>('/admin/overview'),

  getUsers: (params?: { page?: number; limit?: number; role?: string; status?: string }) =>
    api.get<ApiResponse>('/admin/users', { params }),

  updateUserStatus: (id: string, status: string) =>
    api.patch<ApiResponse>(`/admin/users/${id}/status`, { status }),

  getProperties: (params?: { page?: number; limit?: number; status?: string; city?: string }) =>
    api.get<ApiResponse>('/admin/properties', { params }),

  updatePropertyStatus: (id: string, status: string) =>
    api.patch<ApiResponse>(`/admin/properties/${id}/status`, { status }),

  getDeals: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse>('/admin/deals', { params }),

  getReports: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse>('/admin/reports', { params }),

  updateReportStatus: (id: string, status: string, adminNotes?: string) =>
    api.patch<ApiResponse>(`/admin/reports/${id}/status`, { status, adminNotes }),

  getFlaggedConversations: () => api.get<ApiResponse>('/admin/flagged-conversations'),

  getCities: () => api.get<ApiResponse>('/admin/cities'),

  addCity: (name: string, state: string) =>
    api.post<ApiResponse>('/admin/cities', { name, state }),
};

// Payments API
export const paymentsAPI = {
  createOrder: (data: { dealId: string; amount: number; phone: string }) =>
    api.post<ApiResponse>('/payments/create-order', data),

  verifyPayment: (data: {
    dealId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.post<ApiResponse>('/payments/verify', data),

  getPaymentDetails: (dealId: string) =>
    api.get<ApiResponse>(`/payments/${dealId}`),
};

export default api;

