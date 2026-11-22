// mobile/services/api.ts
// Central API client connecting React Native to the Express backend
// Supports dynamic switching and fallback to realistic Campus Marketplace mock store

import type {
  Product,
  ProductCategory,
  ProductCondition,
  CreateProductPayload,
  UpdateProductPayload,
  UserProfile,
  Order,
  CreateOrderPayload,
  UpdateOrderPayload,
  Message,
  Conversation,
  SendMessagePayload,
  AppNotification,
  CampusMeetupLocation,
  CommunityReport,
  CreateReportPayload,
  PaymentTransaction,
  InitiatePaymentPayload,
  VerifyPaymentPayload,
  ReturnRequest,
  CreateReturnPayload,
  VerificationLog,
  AISuggestionResponse,
  AISuggestionRequest,
  User,
  ApiResponse,
  ApiSuccess,
} from '../../shared/types';

import { mockStore } from '../data/mock/mockStore';

export { mockStore };

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

export const isMockEnabled = (): boolean => {
  return (
    process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true' ||
    process.env.EXPO_PUBLIC_USE_MOCK === 'true'
  );
};

/**
 * Standard fetch helper handling JSON responses, errors, and authentication headers.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json: ApiResponse<T> = await response.json().catch(() => ({
      success: false,
      error: 'PARSE_ERROR',
      message: `Server returned HTTP ${response.status}`,
    }));

    if (!json.success) {
      throw new Error(json.message || json.error || 'API Request failed');
    }

    return (json as ApiSuccess<T>).data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after 4s connecting to ${API_BASE_URL}`);
    }
    throw err;
  }
}

// ── Auth APIs ──────────────────────────────────────────────

export async function syncUserWithBackend(
  token: string,
  payload: {
    fullName: string;
    email: string;
    university?: string;
    avatarUrl?: string;
  },
) {
  if (isMockEnabled()) {
    return mockStore.syncUser(payload);
  }
  return apiRequest<UserProfile>(
    '/auth/sync',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  );
}

export async function fetchMyProfile(token: string) {
  if (isMockEnabled()) {
    return mockStore.getUserProfile();
  }
  return apiRequest<UserProfile>('/auth/me', { method: 'GET' }, token);
}

// ── Product APIs ───────────────────────────────────────────

export interface FetchProductsParams {
  search?: string;
  category?: ProductCategory;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export async function fetchProducts(params: FetchProductsParams = {}) {
  if (isMockEnabled()) {
    return mockStore.getProducts(params);
  }
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.category) query.append('category', params.category);
  if (params.condition) query.append('condition', params.condition);
  if (params.minPrice !== undefined)
    query.append('minPrice', params.minPrice.toString());
  if (params.maxPrice !== undefined)
    query.append('maxPrice', params.maxPrice.toString());
  if (params.page !== undefined) query.append('page', params.page.toString());
  if (params.limit !== undefined) query.append('limit', params.limit.toString());

  const qs = query.toString();
  return apiRequest<Product[]>(`/products${qs ? `?${qs}` : ''}`);
}

export async function fetchProductById(id: string, token?: string | null) {
  if (isMockEnabled()) {
    return mockStore.getProductById(id);
  }
  return apiRequest<Product>(`/products/${id}`, { method: 'GET' }, token);
}

export async function fetchMyListings(token: string) {
  if (isMockEnabled()) {
    return mockStore.getMyListings();
  }
  return apiRequest<Product[]>('/products/seller/me', { method: 'GET' }, token);
}

export async function createProduct(
  token: string,
  payload: CreateProductPayload,
) {
  if (isMockEnabled()) {
    return mockStore.createProduct(payload);
  }
  return apiRequest<Product>(
    '/products',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  );
}

export async function updateProduct(
  token: string,
  id: string,
  payload: UpdateProductPayload,
) {
  if (isMockEnabled()) {
    return mockStore.updateProduct(id, payload);
  }
  return apiRequest<Product>(
    `/products/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    token,
  );
}

export async function deleteProduct(token: string, id: string) {
  if (isMockEnabled()) {
    return mockStore.deleteProduct(id);
  }
  return apiRequest<null>(
    `/products/${id}`,
    {
      method: 'DELETE',
    },
    token,
  );
}

// ── Image Upload API ───────────────────────────────────────

export async function uploadProductImages(
  token: string,
  imageUris: string[],
): Promise<string[]> {
  if (isMockEnabled()) {
    // Return realistic uploaded image URLs
    return imageUris.map((uri, idx) => {
      if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
      return `https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=75&auto=format&mock=img_${idx + 1}`;
    });
  }

  const formData = new FormData();

  imageUris.forEach((uri, index) => {
    const filename = uri.split('/').pop() || `photo_${index}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // React Native FormData file object format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData.append('images', {
      uri,
      name: filename,
      type,
    } as any);
  });

  const url = `${API_BASE_URL}/upload/images`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.message || json.error || 'Image upload failed');
  }

  return json.data.urls as string[];
}

// ── Admin Moderation APIs ──────────────────────────────────

export async function fetchPendingApprovals(token: string) {
  if (isMockEnabled()) {
    return mockStore.getPendingApprovals();
  }
  return apiRequest<Product[]>('/admin/pending', { method: 'GET' }, token);
}

export async function approveProduct(token: string, id: string) {
  if (isMockEnabled()) {
    return mockStore.approveProduct(id);
  }
  return apiRequest<Product>(
    `/admin/products/${id}/approve`,
    {
      method: 'POST',
    },
    token,
  );
}

export async function rejectProduct(
  token: string,
  id: string,
  reason: string,
) {
  if (isMockEnabled()) {
    return mockStore.rejectProduct(id, reason);
  }
  return apiRequest<Product>(
    `/admin/products/${id}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    },
    token,
  );
}

// ── Orders API ─────────────────────────────────────────────

export async function createOrder(token: string, payload: CreateOrderPayload) {
  if (isMockEnabled()) {
    return mockStore.createOrder(payload);
  }
  return apiRequest<Order>(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  );
}

export async function fetchMyBuyerOrders(token: string) {
  if (isMockEnabled()) {
    return mockStore.getBuyerOrders();
  }
  return apiRequest<Order[]>('/orders', { method: 'GET' }, token);
}

export async function fetchMySellerOrders(token: string) {
  if (isMockEnabled()) {
    return mockStore.getSellerOrders();
  }
  return apiRequest<Order[]>('/orders/seller', { method: 'GET' }, token);
}

export async function fetchOrderById(token: string, id: string) {
  if (isMockEnabled()) {
    return mockStore.getOrderById(id);
  }
  return apiRequest<Order>(`/orders/${id}`, { method: 'GET' }, token);
}

export async function updateOrderStatus(
  token: string,
  id: string,
  payload: UpdateOrderPayload,
) {
  if (isMockEnabled()) {
    return mockStore.updateOrderStatus(id, payload);
  }
  return apiRequest<Order>(
    `/orders/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    token,
  );
}

// ── Wishlist API ───────────────────────────────────────────

export async function fetchWishlist(token: string) {
  if (isMockEnabled()) {
    return mockStore.getWishlist();
  }
  return apiRequest<Product[]>('/wishlist', { method: 'GET' }, token);
}

export async function addToWishlist(token: string, productId: string) {
  if (isMockEnabled()) {
    return mockStore.addToWishlist(productId);
  }
  return apiRequest<{ inWishlist: boolean; productId: string }>(
    `/wishlist/${productId}`,
    { method: 'POST' },
    token,
  );
}

export async function removeFromWishlist(token: string, productId: string) {
  if (isMockEnabled()) {
    return mockStore.removeFromWishlist(productId);
  }
  return apiRequest<{ inWishlist: boolean; productId: string }>(
    `/wishlist/${productId}`,
    { method: 'DELETE' },
    token,
  );
}

export async function checkWishlist(token: string, productId: string) {
  if (isMockEnabled()) {
    return mockStore.checkWishlist(productId);
  }
  return apiRequest<{ inWishlist: boolean }>(
    `/wishlist/check/${productId}`,
    { method: 'GET' },
    token,
  );
}

// ── Messages API ───────────────────────────────────────────

export async function fetchConversations(token: string) {
  if (isMockEnabled()) {
    return mockStore.getConversations();
  }
  return apiRequest<Conversation[]>('/messages/conversations', { method: 'GET' }, token);
}

export async function fetchOrderMessages(token: string, orderId: string) {
  if (isMockEnabled()) {
    return mockStore.getOrderMessages(orderId);
  }
  return apiRequest<Message[]>(`/messages/order/${orderId}`, { method: 'GET' }, token);
}

export async function sendMessage(token: string, payload: SendMessagePayload) {
  if (isMockEnabled()) {
    return mockStore.sendMessage(payload);
  }
  return apiRequest<Message>(
    '/messages',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  );
}

// ── Notifications API ──────────────────────────────────────

export async function fetchNotifications(token: string) {
  if (isMockEnabled()) {
    return mockStore.getNotifications();
  }
  return apiRequest<AppNotification[]>('/notifications', { method: 'GET' }, token);
}

export async function markNotificationAsRead(token: string, id: string) {
  if (isMockEnabled()) {
    return mockStore.markNotificationAsRead(id);
  }
  return apiRequest<AppNotification>(`/notifications/${id}/read`, { method: 'PATCH' }, token);
}

export async function markAllNotificationsAsRead(token: string) {
  if (isMockEnabled()) {
    return mockStore.markAllNotificationsAsRead();
  }
  return apiRequest<{ success: boolean; message: string }>('/notifications/read-all', { method: 'PATCH' }, token);
}

// ── AI Listing Assistant API ────────────────────────────────

export async function getAISuggestions(token: string, payload: AISuggestionRequest) {
  if (isMockEnabled()) {
    return mockStore.getAISuggestions(payload);
  }
  return apiRequest<AISuggestionResponse>(
    '/ai/suggest',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

export async function evaluateListingQuality(token: string, payload: AISuggestionRequest) {
  if (isMockEnabled()) {
    return mockStore.evaluateListingQuality(payload);
  }
  return apiRequest<{ qualityScore: number; feedback: string[]; improvements: string[]; isQualityPass: boolean }>(
    '/ai/evaluate-listing',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

// ── Campus Meetup Locations API ─────────────────────────────

export async function fetchMeetupLocations() {
  if (isMockEnabled()) {
    return mockStore.getMeetupLocations();
  }
  return apiRequest<CampusMeetupLocation[]>('/meetup-locations', { method: 'GET' });
}

export async function fetchMeetupLocationById(id: string) {
  if (isMockEnabled()) {
    return mockStore.getMeetupLocationById(id);
  }
  return apiRequest<CampusMeetupLocation>(`/meetup-locations/${id}`, { method: 'GET' });
}

// ── Community Moderation & Reports API ──────────────────────

export async function submitReport(token: string, payload: CreateReportPayload) {
  if (isMockEnabled()) {
    return mockStore.submitReport(payload);
  }
  return apiRequest<CommunityReport>(
    '/reports',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

// ── Digital Payments API ────────────────────────────────────

export async function initiatePayment(token: string, payload: InitiatePaymentPayload) {
  if (isMockEnabled()) {
    return mockStore.initiatePayment(payload);
  }
  return apiRequest<{
    orderId: string;
    amount: number;
    method: string;
    upiVpa: string;
    transactionRef: string;
    isDemoPayment: boolean;
    note: string;
  }>(
    '/payments/initiate',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

export async function verifyPayment(token: string, payload: VerifyPaymentPayload) {
  if (isMockEnabled()) {
    return mockStore.verifyPayment(payload);
  }
  return apiRequest<PaymentTransaction>(
    '/payments/verify',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

// ── Returns & Refunds API ───────────────────────────────────

export async function submitReturnRequest(token: string, payload: CreateReturnPayload) {
  if (isMockEnabled()) {
    return mockStore.submitReturnRequest(payload);
  }
  return apiRequest<ReturnRequest>(
    '/returns',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

export async function fetchBuyerReturns(token: string) {
  if (isMockEnabled()) {
    return mockStore.getBuyerReturns();
  }
  return apiRequest<ReturnRequest[]>('/returns/buyer', { method: 'GET' }, token);
}

export async function fetchSellerReturns(token: string) {
  if (isMockEnabled()) {
    return mockStore.getSellerReturns();
  }
  return apiRequest<ReturnRequest[]>('/returns/seller', { method: 'GET' }, token);
}

export async function updateReturnStatus(
  token: string,
  id: string,
  payload: { status: 'approved' | 'rejected' | 'refunded'; sellerNotes?: string },
) {
  if (isMockEnabled()) {
    return mockStore.updateReturnStatus(id, payload);
  }
  return apiRequest<ReturnRequest>(
    `/returns/${id}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  );
}

// ── Extended Admin & Moderation API ─────────────────────────

export async function requestChangesOnProduct(
  token: string,
  id: string,
  changesRequested: string,
) {
  if (isMockEnabled()) {
    return mockStore.requestChanges(id, changesRequested);
  }
  return apiRequest<Product>(
    `/admin/products/${id}/request-changes`,
    { method: 'POST', body: JSON.stringify({ changesRequested }) },
    token,
  );
}

export async function fetchProductVerifications(token: string, productId: string) {
  if (isMockEnabled()) {
    return mockStore.getProductVerifications(productId);
  }
  return apiRequest<VerificationLog[]>(`/admin/verifications/${productId}`, { method: 'GET' }, token);
}

export async function fetchAdminReports(token: string) {
  if (isMockEnabled()) {
    return mockStore.getAdminReports();
  }
  return apiRequest<CommunityReport[]>('/admin/reports', { method: 'GET' }, token);
}

export async function resolveAdminReport(
  token: string,
  id: string,
  payload: { status: 'resolved' | 'dismissed'; resolutionNotes?: string },
) {
  if (isMockEnabled()) {
    return mockStore.resolveAdminReport(id, payload);
  }
  return apiRequest<CommunityReport>(
    `/admin/reports/${id}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  );
}

export async function removeProductByAdmin(token: string, id: string) {
  if (isMockEnabled()) {
    mockStore.deleteProduct(id);
    return { success: true, message: 'Product removed by administrator' };
  }
  return apiRequest<{ success: boolean; message: string }>(
    `/admin/products/${id}`,
    { method: 'DELETE' },
  );
}

export async function fetchAdminUsers(token: string, search?: string) {
  if (isMockEnabled()) {
    return mockStore.getAdminUsers(search);
  }
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiRequest<User[]>(`/admin/users${query}`, { method: 'GET' }, token);
}

export async function fetchAdminUserById(token: string, id: string) {
  if (isMockEnabled()) {
    return mockStore.getAdminUserById(id);
  }
  return apiRequest<User & { activeListings: number; reportsAgainstUser: number }>(
    `/admin/users/${id}`,
    { method: 'GET' },
    token,
  );
}

export async function updateUserStatus(token: string, id: string, status: 'active' | 'suspended') {
  if (isMockEnabled()) {
    return mockStore.updateUserStatus(id, status);
  }
  return apiRequest<User>(
    `/admin/users/${id}/status`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
    token,
  );
}
