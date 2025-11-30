// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  role: 'SUPER_ADMIN' | 'OWNER' | 'TENANT';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  kycVerified?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Property types
export interface Property {
  id: string;
  ownerId: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    phone?: string;
  };
  title: string;
  description: string;
  city: string;
  locality: string;
  address: string;
  pincode?: string;
  propertyType: 'FLAT' | 'PG' | 'INDEPENDENT_HOUSE' | 'SHARED_ROOM';
  roomConfig: 'SINGLE_ROOM' | 'ONE_RK' | 'ONE_BHK' | 'TWO_BHK' | 'THREE_BHK' | 'THREE_PLUS_BHK' | 'SHARED';
  furnishing: 'FULLY_FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  rentAmount: number;
  depositAmount: number;
  maintenanceAmount?: number;
  tenantPreference: string[];
  amenities: string[];
  images: string[];
  squareFeet?: number;
  bathrooms?: number;
  balconies?: number;
  floorNumber?: number;
  totalFloors?: number;
  status: 'DRAFT' | 'ACTIVE' | 'RENTED' | 'SUSPENDED';
  viewCount: number;
  createdAt: string;
  _count?: {
    conversations: number;
    deals: number;
  };
}

// Chat types
export interface Conversation {
  id: string;
  ownerId: string;
  tenantId: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    images: string[];
    rentAmount?: number;
  };
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    phone?: string | null;
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  phoneRevealed: boolean;
  isFlagged: boolean;
  lastMessageAt?: string;
  messages?: Message[];
  deal?: Deal;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  readAt?: string;
}

// Deal types
export interface Deal {
  id: string;
  propertyId: string;
  ownerId: string;
  tenantId: string;
  conversationId: string;
  agreedRent: number;
  ownerConfirmed: boolean;
  ownerConfirmedAt?: string;
  tenantConfirmed: boolean;
  tenantConfirmedAt?: string;
  status: 'PENDING_BOTH' | 'PENDING_OWNER' | 'PENDING_TENANT' | 'COMPLETED' | 'CANCELLED';
  successFeeAmount?: number;
  paymentStatus: string;
  completedAt?: string;
  createdAt: string;
  property?: Property;
  owner?: User;
  tenant?: User;
}

// Report types
export interface Report {
  id: string;
  submittedById: string;
  submittedBy: User;
  type: 'SPAM' | 'SCAM' | 'INAPPROPRIATE' | 'FAKE_LISTING' | 'ABUSIVE_BEHAVIOR' | 'OTHER';
  description: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: { field: string; message: string }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface PropertyFilters {
  city?: string;
  locality?: string;
  minRent?: number;
  maxRent?: number;
  propertyType?: string;
  roomConfig?: string;
  furnishing?: string;
  tenantPreference?: string;
}

// Payment types
export interface Payment {
  id: string;
  dealId: string;
  payerId: string;
  amount: number;
  description: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: 'PENDING' | 'INITIATED' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  method?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'UPI' | 'WALLET' | 'EMI';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  receipt: string;
  customerId?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

