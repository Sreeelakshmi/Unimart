// mobile/data/mock/mockStore.ts
// In-memory reactive mock data store with state management and local mutations

import type {
  Product,
  ProductCategory,
  ProductCondition,
  CreateProductPayload,
  UpdateProductPayload,
  UserProfile,
  User,
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
} from '../../../shared/types';

import { MOCK_USERS } from './mockUsers';
import { MOCK_PRODUCTS } from './mockProducts';
import { MOCK_ORDERS } from './mockOrders';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from './mockConversations';
import { MOCK_NOTIFICATIONS } from './mockNotifications';
import { MOCK_MEETUP_LOCATIONS } from './mockMeetups';
import { MOCK_REPORTS } from './mockReports';
import { MOCK_RETURNS } from './mockReturns';

export class MockDataStore {
  private users: User[] = [];
  private products: Product[] = [];
  private orders: Order[] = [];
  private conversations: Conversation[] = [];
  private messages: Record<string, Message[]> = {};
  private notifications: AppNotification[] = [];
  private meetupLocations: CampusMeetupLocation[] = [];
  private reports: CommunityReport[] = [];
  private returns: ReturnRequest[] = [];
  private wishlistProductIds: Set<string> = new Set();
  private verifications: Record<string, VerificationLog[]> = {};
  private currentUserId: string = 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx'; // Priya Patel

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults(): void {
    this.users = JSON.parse(JSON.stringify(MOCK_USERS));
    this.products = JSON.parse(JSON.stringify(MOCK_PRODUCTS));
    this.orders = JSON.parse(JSON.stringify(MOCK_ORDERS));
    this.conversations = JSON.parse(JSON.stringify(MOCK_CONVERSATIONS));
    this.messages = JSON.parse(JSON.stringify(MOCK_MESSAGES));
    this.notifications = JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS));
    this.meetupLocations = JSON.parse(JSON.stringify(MOCK_MEETUP_LOCATIONS));
    this.reports = JSON.parse(JSON.stringify(MOCK_REPORTS));
    this.returns = JSON.parse(JSON.stringify(MOCK_RETURNS));
    this.wishlistProductIds = new Set(['prod-002', 'prod-005', 'prod-010', 'prod-018']);
    this.verifications = {
      'prod-001': [
        {
          id: 'ver-001',
          productId: 'prod-001',
          reviewerId: 'user_3MS458uQn7A7ibbDcmFOW7EJsWX',
          reviewerName: 'Aditya Rao',
          action: 'approved',
          notes: 'Textbook authentic with MIT Press seal, ISBN matches curriculum.',
          createdAt: '2026-11-20T10:30:00.000Z',
        },
      ],
      'prod-002': [
        {
          id: 'ver-002',
          productId: 'prod-002',
          reviewerId: 'user_3MS45gr89oJx2OhtdSuhySYXarM',
          reviewerName: 'Vikram Joshi',
          action: 'approved',
          notes: 'Circuits reference book in good physical condition with exam papers.',
          createdAt: '2026-11-19T09:15:00.000Z',
        },
      ],
    };
    this.currentUserId = 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx';
  }

  // ── User / Auth ──────────────────────────────────────────

  public getCurrentUserId(): string {
    return this.currentUserId;
  }

  public setCurrentUserId(userId: string): void {
    const found = this.users.find((u) => u.id === userId || u.clerkId === userId);
    if (found) {
      this.currentUserId = found.id;
    }
  }

  public syncUser(payload: {
    fullName: string;
    email: string;
    university?: string;
    avatarUrl?: string;
  }): UserProfile {
    let user = this.users.find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (user) {
      user.fullName = payload.fullName || user.fullName;
      if (payload.university) user.university = payload.university;
      if (payload.avatarUrl) user.avatarUrl = payload.avatarUrl;
      user.updatedAt = new Date().toISOString();
      this.currentUserId = user.id;
    } else {
      const newId = `user_${Date.now().toString(36)}`;
      user = {
        id: newId,
        clerkId: newId,
        fullName: payload.fullName || 'Campus Student',
        email: payload.email,
        university: payload.university || 'IIT Delhi',
        avatarUrl:
          payload.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        role: 'student',
        status: 'active',
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.users.push(user);
      this.currentUserId = user.id;
    }

    return this.getUserProfile(user.id);
  }

  public getUserProfile(userId?: string): UserProfile {
    const id = userId || this.currentUserId;
    const user = this.users.find((u) => u.id === id || u.clerkId === id) || this.users[0];
    const activeListings = this.products.filter(
      (p) => p.sellerId === user.id && p.status === 'available',
    ).length;
    const totalSold = this.products.filter(
      (p) => p.sellerId === user.id && p.status === 'sold',
    ).length;

    return {
      ...user,
      activeListings,
      totalSold,
    };
  }

  public getAdminUsers(search?: string): User[] {
    if (!search) return [...this.users];
    const q = search.toLowerCase();
    return this.users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.university && u.university.toLowerCase().includes(q)),
    );
  }

  public getAdminUserById(id: string): User & { activeListings: number; reportsAgainstUser: number } {
    const profile = this.getUserProfile(id);
    const reportsAgainstUser = this.reports.filter(
      (r) => r.targetType === 'user' && r.targetId === id,
    ).length;
    return {
      ...profile,
      reportsAgainstUser,
    };
  }

  public updateUserStatus(id: string, status: 'active' | 'suspended'): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    user.status = status;
    user.updatedAt = new Date().toISOString();
    return { ...user };
  }

  // ── Products ─────────────────────────────────────────────

  public getProducts(params: {
    search?: string;
    category?: ProductCategory;
    condition?: ProductCondition;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  } = {}): Product[] {
    let filtered = this.products.filter((p) => p.status === 'available');

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description ? p.description.toLowerCase().includes(q) : false) ||
          (p.campusLocation ? p.campusLocation.toLowerCase().includes(q) : false),
      );
    }

    if (params.category) {
      filtered = filtered.filter((p) => p.category === params.category);
    }

    if (params.condition) {
      filtered = filtered.filter((p) => p.condition === params.condition);
    }

    if (params.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= params.maxPrice!);
    }

    // Default newest first
    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (params.page !== undefined && params.limit !== undefined) {
      const offset = (params.page - 1) * params.limit;
      return filtered.slice(offset, offset + params.limit);
    }

    return filtered;
  }

  public getProductById(id: string): Product {
    const found = this.products.find((p) => p.id === id);
    if (!found) {
      throw new Error(`Product not found: ${id}`);
    }
    return { ...found };
  }

  public getMyListings(userId?: string): Product[] {
    const id = userId || this.currentUserId;
    return this.products
      .filter((p) => p.sellerId === id)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  public createProduct(payload: CreateProductPayload): Product {
    const currentUser = this.users.find((u) => u.id === this.currentUserId) || this.users[0];
    const newId = `prod-${(this.products.length + 1).toString().padStart(3, '0')}`;
    const newProduct: Product = {
      id: newId,
      sellerId: currentUser.id,
      sellerName: currentUser.fullName,
      sellerEmail: currentUser.email,
      sellerAvatarUrl: currentUser.avatarUrl,
      title: payload.title,
      description: payload.description,
      price: payload.price,
      category: payload.category,
      condition: payload.condition,
      status: 'available',
      images: payload.images?.length
        ? payload.images
        : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&q=75&auto=format'],
      aiVerified: true,
      campusLocation: payload.campusLocation || 'Student Activity Center (SAC) Cafe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.unshift(newProduct);

    // Create notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      type: 'product_approved',
      title: 'Listing Published! 🚀',
      message: `Your item "${newProduct.title}" (₹${newProduct.price}) is live on the campus marketplace.`,
      data: { productId: newId },
      read: false,
      createdAt: new Date().toISOString(),
    });

    return { ...newProduct };
  }

  public updateProduct(id: string, payload: UpdateProductPayload): Product {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    const updated: Product = {
      ...this.products[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    this.products[idx] = updated;
    return { ...updated };
  }

  public deleteProduct(id: string): null {
    this.products = this.products.filter((p) => p.id !== id);
    this.wishlistProductIds.delete(id);
    return null;
  }

  // ── Admin Moderation ─────────────────────────────────────

  public getPendingApprovals(): Product[] {
    return this.products.filter((p) => p.status === 'pending_review');
  }

  public approveProduct(id: string, reviewerId?: string): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');

    product.status = 'available';
    product.aiVerified = true;
    product.updatedAt = new Date().toISOString();

    const reviewer = this.users.find((u) => u.id === reviewerId) || this.users[1]; // Aditya Rao
    const log: VerificationLog = {
      id: `ver-${Date.now()}`,
      productId: id,
      reviewerId: reviewer.id,
      reviewerName: reviewer.fullName,
      action: 'approved',
      notes: 'Manually inspected and verified compliant with campus safety guidelines.',
      createdAt: new Date().toISOString(),
    };

    if (!this.verifications[id]) this.verifications[id] = [];
    this.verifications[id].unshift(log);

    // Notify seller
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: product.sellerId,
      type: 'product_approved',
      title: 'Listing Approved! ✅',
      message: `Your listing "${product.title}" has been approved by ${reviewer.fullName}.`,
      data: { productId: id },
      read: false,
      createdAt: new Date().toISOString(),
    });

    return { ...product };
  }

  public rejectProduct(id: string, reason: string, reviewerId?: string): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');

    product.status = 'rejected';
    product.updatedAt = new Date().toISOString();

    const reviewer = this.users.find((u) => u.id === reviewerId) || this.users[1];
    const log: VerificationLog = {
      id: `ver-${Date.now()}`,
      productId: id,
      reviewerId: reviewer.id,
      reviewerName: reviewer.fullName,
      action: 'rejected',
      notes: reason,
      createdAt: new Date().toISOString(),
    };

    if (!this.verifications[id]) this.verifications[id] = [];
    this.verifications[id].unshift(log);

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: product.sellerId,
      type: 'product_rejected',
      title: 'Listing Not Approved ❌',
      message: `Your listing "${product.title}" was rejected. Reason: ${reason}`,
      data: { productId: id, reason },
      read: false,
      createdAt: new Date().toISOString(),
    });

    return { ...product };
  }

  public requestChanges(id: string, changesRequested: string, reviewerId?: string): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new Error('Product not found');

    product.status = 'changes_requested';
    product.updatedAt = new Date().toISOString();

    const reviewer = this.users.find((u) => u.id === reviewerId) || this.users[1];
    const log: VerificationLog = {
      id: `ver-${Date.now()}`,
      productId: id,
      reviewerId: reviewer.id,
      reviewerName: reviewer.fullName,
      action: 'changes_requested',
      notes: changesRequested,
      createdAt: new Date().toISOString(),
    };

    if (!this.verifications[id]) this.verifications[id] = [];
    this.verifications[id].unshift(log);

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: product.sellerId,
      type: 'system',
      title: 'Changes Requested on Listing 📝',
      message: `Admin requested changes for "${product.title}": ${changesRequested}`,
      data: { productId: id, changesRequested },
      read: false,
      createdAt: new Date().toISOString(),
    });

    return { ...product };
  }

  public getProductVerifications(productId: string): VerificationLog[] {
    return this.verifications[productId] || [];
  }

  public getAdminReports(): CommunityReport[] {
    return [...this.reports];
  }

  public resolveAdminReport(
    id: string,
    payload: { status: 'resolved' | 'dismissed'; resolutionNotes?: string },
    adminId?: string,
  ): CommunityReport {
    const report = this.reports.find((r) => r.id === id);
    if (!report) throw new Error('Report not found');

    const admin = this.users.find((u) => u.id === adminId) || this.users[1];
    report.status = payload.status;
    report.resolutionNotes = payload.resolutionNotes || 'Actioned by campus administrator.';
    report.resolvedBy = admin.fullName;
    report.updatedAt = new Date().toISOString();

    return { ...report };
  }

  public submitReport(payload: CreateReportPayload): CommunityReport {
    const reporter = this.users.find((u) => u.id === this.currentUserId) || this.users[0];
    let targetTitle: string | undefined;

    if (payload.targetType === 'product') {
      const prod = this.products.find((p) => p.id === payload.targetId);
      targetTitle = prod ? prod.title : 'Product';
    } else {
      const u = this.users.find((usr) => usr.id === payload.targetId);
      targetTitle = u ? `User: ${u.fullName}` : 'User Profile';
    }

    const report: CommunityReport = {
      id: `rep-${(this.reports.length + 1).toString().padStart(3, '0')}`,
      reporterId: reporter.id,
      reporterName: reporter.fullName,
      targetType: payload.targetType,
      targetId: payload.targetId,
      targetTitle,
      reason: payload.reason,
      details: payload.details,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.reports.unshift(report);
    return { ...report };
  }

  // ── Orders ───────────────────────────────────────────────

  public createOrder(payload: CreateOrderPayload): Order {
    const product = this.getProductById(payload.productId);
    const buyer = this.users.find((u) => u.id === this.currentUserId) || this.users[0];
    const seller = this.users.find((u) => u.id === product.sellerId) || this.users[1];

    const newOrderId = `ord-${(this.orders.length + 101).toString()}`;
    const newOrder: Order = {
      id: newOrderId,
      productId: product.id,
      productTitle: product.title,
      productImage: product.images[0],
      buyerId: buyer.id,
      buyerName: buyer.fullName,
      sellerId: seller.id,
      sellerName: seller.fullName,
      status: 'placed',
      amount: payload.amount || product.price,
      meetupLocation: payload.meetupLocation || product.campusLocation || 'Central Library — Main Entrance Lobby',
      meetupTime: payload.meetupTime || 'Tomorrow at 04:00 PM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);

    // Update product status
    product.status = 'sold';
    product.updatedAt = new Date().toISOString();

    // Create chat conversation and initial system message
    const conversation: Conversation = {
      orderId: newOrderId,
      productId: product.id,
      productTitle: product.title,
      otherUserId: seller.id,
      otherUserName: seller.fullName,
      otherUserAvatarUrl: seller.avatarUrl,
      lastMessage: `Hi ${seller.fullName}, I placed an order for ${product.title}!`,
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };
    this.conversations.unshift(conversation);

    this.messages[newOrderId] = [
      {
        id: `msg-${Date.now()}-1`,
        orderId: newOrderId,
        senderId: 'system',
        senderName: 'Unimart Campus Bot',
        receiverId: buyer.id,
        content: `Order #${newOrderId} placed successfully for ₹${newOrder.amount}. Please verify meetup details and inspect goods in person before releasing payment.`,
        read: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: `msg-${Date.now()}-2`,
        orderId: newOrderId,
        senderId: buyer.id,
        senderName: buyer.fullName,
        receiverId: seller.id,
        content: `Hi ${seller.fullName}, I have placed the order! Can we meet at ${newOrder.meetupLocation} around ${newOrder.meetupTime}?`,
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    // Notification for seller
    this.notifications.unshift({
      id: `notif-${Date.now()}-seller`,
      userId: seller.id,
      type: 'new_order',
      title: 'New Order Received! 🛍️',
      message: `${buyer.fullName} ordered "${product.title}" for ₹${product.price}.`,
      data: { orderId: newOrderId, productId: product.id },
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Notification for buyer
    this.notifications.unshift({
      id: `notif-${Date.now()}-buyer`,
      userId: buyer.id,
      type: 'order_placed',
      title: 'Order Placed Successfully! 🎉',
      message: `Your order for "${product.title}" has been sent to ${seller.fullName}.`,
      data: { orderId: newOrderId, productId: product.id },
      read: false,
      createdAt: new Date().toISOString(),
    });

    return { ...newOrder };
  }

  public getBuyerOrders(userId?: string): Order[] {
    const id = userId || this.currentUserId;
    return this.orders
      .filter((o) => o.buyerId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getSellerOrders(userId?: string): Order[] {
    const id = userId || this.currentUserId;
    return this.orders
      .filter((o) => o.sellerId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order {
    const found = this.orders.find((o) => o.id === id);
    if (!found) throw new Error(`Order not found: ${id}`);
    return { ...found };
  }

  public updateOrderStatus(id: string, payload: UpdateOrderPayload): Order {
    const order = this.orders.find((o) => o.id === id);
    if (!order) throw new Error('Order not found');

    if (payload.status) order.status = payload.status;
    if (payload.meetupLocation) order.meetupLocation = payload.meetupLocation;
    if (payload.meetupTime) order.meetupTime = payload.meetupTime;
    if (payload.paymentRef) order.paymentRef = payload.paymentRef;
    order.updatedAt = new Date().toISOString();

    // Notify other party
    const isBuyer = order.buyerId === this.currentUserId;
    const recipientId = isBuyer ? order.sellerId : order.buyerId;

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: recipientId,
      type: 'order_status_changed',
      title: `Order #${order.id} Updated`,
      message: `Status updated to ${order.status.replace('_', ' ').toUpperCase()}${order.meetupLocation ? ` at ${order.meetupLocation}` : ''}.`,
      data: { orderId: order.id, status: order.status },
      read: false,
      createdAt: new Date().toISOString(),
    });

    return { ...order };
  }

  // ── Wishlist ─────────────────────────────────────────────

  public getWishlist(): Product[] {
    return this.products.filter((p) => this.wishlistProductIds.has(p.id));
  }

  public addToWishlist(productId: string): { inWishlist: boolean; productId: string } {
    this.wishlistProductIds.add(productId);
    return { inWishlist: true, productId };
  }

  public removeFromWishlist(productId: string): { inWishlist: boolean; productId: string } {
    this.wishlistProductIds.delete(productId);
    return { inWishlist: false, productId };
  }

  public checkWishlist(productId: string): { inWishlist: boolean } {
    return { inWishlist: this.wishlistProductIds.has(productId) };
  }

  // ── Messages ─────────────────────────────────────────────

  public getConversations(userId?: string): Conversation[] {
    const id = userId || this.currentUserId;
    return this.conversations
      .filter((c) => {
        const order = this.orders.find((o) => o.id === c.orderId);
        return order ? order.buyerId === id || order.sellerId === id : true;
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  public getOrderMessages(orderId: string): Message[] {
    return this.messages[orderId] || [];
  }

  public sendMessage(payload: SendMessagePayload): Message {
    const currentUser = this.users.find((u) => u.id === this.currentUserId) || this.users[0];
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      orderId: payload.orderId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      receiverId: payload.receiverId,
      content: payload.content,
      read: false,
      createdAt: new Date().toISOString(),
    };

    if (!this.messages[payload.orderId]) {
      this.messages[payload.orderId] = [];
    }
    this.messages[payload.orderId].push(newMsg);

    // Update conversation summary
    const conv = this.conversations.find((c) => c.orderId === payload.orderId);
    if (conv) {
      conv.lastMessage = payload.content;
      conv.lastMessageAt = newMsg.createdAt;
    }

    return { ...newMsg };
  }

  // ── Notifications ────────────────────────────────────────

  public getNotifications(userId?: string): AppNotification[] {
    const id = userId || this.currentUserId;
    return this.notifications
      .filter((n) => n.userId === id || n.type === 'system')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markNotificationAsRead(id: string): AppNotification {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) throw new Error('Notification not found');
    notif.read = true;
    return { ...notif };
  }

  public markAllNotificationsAsRead(userId?: string): { success: boolean; message: string } {
    const id = userId || this.currentUserId;
    this.notifications.forEach((n) => {
      if (n.userId === id || n.type === 'system') {
        n.read = true;
      }
    });
    return { success: true, message: 'All notifications marked as read' };
  }

  // ── Meetup Locations ─────────────────────────────────────

  public getMeetupLocations(): CampusMeetupLocation[] {
    return [...this.meetupLocations];
  }

  public getMeetupLocationById(id: string): CampusMeetupLocation {
    const loc = this.meetupLocations.find((l) => l.id === id);
    if (!loc) throw new Error('Meetup location not found');
    return { ...loc };
  }

  // ── Returns & Refunds ────────────────────────────────────

  public getBuyerReturns(userId?: string): ReturnRequest[] {
    const id = userId || this.currentUserId;
    return this.returns.filter((r) => r.buyerId === id);
  }

  public getSellerReturns(userId?: string): ReturnRequest[] {
    const id = userId || this.currentUserId;
    return this.returns.filter((r) => r.sellerId === id);
  }

  public submitReturnRequest(payload: CreateReturnPayload): ReturnRequest {
    const order = this.getOrderById(payload.orderId);
    const buyer = this.users.find((u) => u.id === order.buyerId) || this.users[0];
    const seller = this.users.find((u) => u.id === order.sellerId) || this.users[1];

    const ret: ReturnRequest = {
      id: `ret-${(this.returns.length + 1).toString().padStart(3, '0')}`,
      orderId: order.id,
      productId: order.productId,
      productTitle: order.productTitle,
      buyerId: buyer.id,
      buyerName: buyer.fullName,
      sellerId: seller.id,
      sellerName: seller.fullName,
      amount: order.amount,
      reason: payload.reason,
      details: payload.details,
      status: 'requested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.returns.unshift(ret);

    // Notify seller
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: seller.id,
      type: 'return_requested',
      title: 'Return Requested',
      message: `${buyer.fullName} requested a return for "${order.productTitle}" (₹${order.amount}).`,
      data: { returnId: ret.id, orderId: order.id },
      read: false,
      createdAt: new Date().toISOString(),
    });

    return { ...ret };
  }

  public updateReturnStatus(
    id: string,
    payload: { status: 'approved' | 'rejected' | 'refunded'; sellerNotes?: string },
  ): ReturnRequest {
    const ret = this.returns.find((r) => r.id === id);
    if (!ret) throw new Error('Return request not found');

    ret.status = payload.status;
    if (payload.sellerNotes) ret.sellerNotes = payload.sellerNotes;
    ret.updatedAt = new Date().toISOString();

    // Notify buyer
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: ret.buyerId,
      type: payload.status === 'refunded' ? 'refund_processed' : 'system',
      title: `Return Request ${payload.status.toUpperCase()}`,
      message: `Your return request for "${ret.productTitle}" was ${payload.status}.${payload.sellerNotes ? ` Note: ${payload.sellerNotes}` : ''}`,
      data: { returnId: ret.id },
      read: false,
      createdAt: new Date().toISOString(),
    });

    return { ...ret };
  }

  // ── AI Listing Assistant ─────────────────────────────────

  public getAISuggestions(payload: AISuggestionRequest): AISuggestionResponse {
    const title = payload.draftTitle || '';
    const desc = payload.draftDescription || '';

    let suggestedCat: ProductCategory = 'other';
    const lower = `${title} ${desc}`.toLowerCase();
    if (lower.includes('book') || lower.includes('edition') || lower.includes('author') || lower.includes('clrs') || lower.includes('circuits')) {
      suggestedCat = 'books';
    } else if (lower.includes('calculator') || lower.includes('mouse') || lower.includes('cable') || lower.includes('pi') || lower.includes('laptop') || lower.includes('electronics')) {
      suggestedCat = 'electronics';
    } else if (lower.includes('pen') || lower.includes('notebook') || lower.includes('drafter') || lower.includes('ruler')) {
      suggestedCat = 'stationery';
    } else if (lower.includes('hoodie') || lower.includes('jacket') || lower.includes('shirt')) {
      suggestedCat = 'clothing';
    } else if (lower.includes('badminton') || lower.includes('racket') || lower.includes('ball') || lower.includes('cricket')) {
      suggestedCat = 'sports';
    }

    return {
      title: title ? `${title} (Verified Campus Edition)` : 'Engineering Course Item',
      description: desc
        ? `${desc}\n\n• Verified authentic campus listing\n• Inspected condition\n• Safe on-campus pickup available`
        : 'Carefully maintained item by university student. Available for inspection at library or SAC.',
      suggestedCategory: suggestedCat,
      qualityScore: title && desc.length > 30 ? 94 : 65,
      feedback: [
        'Good technical specificity and condition disclosure.',
        'Clear on-campus meetup readiness.',
      ],
      tips: [
        'Mention if original purchase bill or box is available.',
        'Highlight semester or course relevance (e.g., CS Core, 2nd Year).',
      ],
    };
  }

  public evaluateListingQuality(payload: AISuggestionRequest): {
    qualityScore: number;
    feedback: string[];
    improvements: string[];
    isQualityPass: boolean;
  } {
    const len = (payload.draftTitle?.length || 0) + (payload.draftDescription?.length || 0);
    const score = Math.min(95, Math.max(50, 50 + Math.floor(len / 3)));
    return {
      qualityScore: score,
      feedback: [
        'Title is descriptive and accurately names the model/edition.',
        'Safe meetup preference specified.',
      ],
      improvements: [
        'Add 2 or more close-up photos of ports/page corners.',
        'State whether price is firm or negotiable for campus juniors.',
      ],
      isQualityPass: score >= 60,
    };
  }

  // ── Digital Payments ─────────────────────────────────────

  public initiatePayment(payload: InitiatePaymentPayload) {
    const order = this.getOrderById(payload.orderId);
    const ref = `UPI-TXN-${Date.now().toString().slice(-8)}`;

    return {
      orderId: order.id,
      amount: order.amount,
      method: payload.method,
      upiVpa: 'unimart.campus@okaxis',
      transactionRef: ref,
      isDemoPayment: true,
      note: `Campus escrow payment for ${order.productTitle}`,
    };
  }

  public verifyPayment(payload: VerifyPaymentPayload): PaymentTransaction {
    const order = this.getOrderById(payload.orderId);
    order.paymentRef = payload.transactionRef;
    order.status = 'confirmed';
    order.updatedAt = new Date().toISOString();

    return {
      id: `pay-${Date.now()}`,
      orderId: order.id,
      payerId: order.buyerId,
      payeeId: order.sellerId,
      amount: order.amount,
      method: payload.paymentMethod,
      status: 'completed',
      transactionRef: payload.transactionRef,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

// Global singleton instance for mobile client
export const mockStore = new MockDataStore();
