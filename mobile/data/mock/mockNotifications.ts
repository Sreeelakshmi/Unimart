// mobile/data/mock/mockNotifications.ts
// Realistic Indian campus marketplace notifications

import type { AppNotification } from '../../../shared/types/notification';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    userId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    type: 'order_status_changed',
    title: 'Meetup Confirmed',
    message: 'Rohan Verma confirmed your meetup for "Sedra & Smith Circuits" at SAC Cafe today at 04:30 PM.',
    data: { orderId: 'ord-101', productId: 'prod-002' },
    read: false,
    createdAt: '2026-11-21T14:05:00.000Z',
  },
  {
    id: 'notif-002',
    userId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
    type: 'new_message',
    title: 'New message from Rohan',
    message: '"I am wearing a navy blue hoodie near the entrance table."',
    data: { orderId: 'ord-101', senderId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC' },
    read: false,
    createdAt: '2026-11-21T14:15:00.000Z',
  },
  {
    id: 'notif-003',
    userId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
    type: 'new_order',
    title: 'New Order Received! 🎉',
    message: 'Kavita Nair placed an order for your "Engineering Mechanics Statics & Dynamics" (₹450).',
    data: { orderId: 'ord-106', productId: 'prod-012' },
    read: false,
    createdAt: '2026-11-21T13:45:00.000Z',
  },
  {
    id: 'notif-004',
    userId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
    type: 'product_approved',
    title: 'Listing Approved! ✅',
    message: 'Your listing "Casio fx-991EX ClassWiz" has been verified by campus admins and is now live.',
    data: { productId: 'prod-001' },
    read: true,
    createdAt: '2026-11-20T10:30:00.000Z',
  },
  {
    id: 'notif-005',
    userId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
    type: 'order_status',
    title: 'Order Confirmed',
    message: 'Fatima Sheikh confirmed your order for Raspberry Pi 4 Model B (₹3,200).',
    data: { orderId: 'ord-103', productId: 'prod-007' },
    read: true,
    createdAt: '2026-11-20T16:20:00.000Z',
  },
  {
    id: 'notif-006',
    userId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
    type: 'order_status_changed',
    title: 'Transaction Completed 🤝',
    message: 'Your purchase of "Yonex Astrox 77 Badminton Racket" is completed. Thanks for buying locally!',
    data: { orderId: 'ord-102', productId: 'prod-010' },
    read: true,
    createdAt: '2026-11-18T17:35:00.000Z',
  },
  {
    id: 'notif-007',
    userId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
    type: 'system',
    title: 'Safe Campus Meetup Reminder 🛡️',
    message: 'Always use designated Safe Campus Zones (Library Lobby, SAC Cafe, Tech Park) and inspect goods before completing payment.',
    data: {},
    read: true,
    createdAt: '2026-11-15T09:00:00.000Z',
  },
  {
    id: 'notif-008',
    userId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
    type: 'refund_processed',
    title: 'Refund Approved',
    message: 'Your return request for ₹650 on order ord-105 has been approved by the seller.',
    data: { orderId: 'ord-105' },
    read: true,
    createdAt: '2026-11-16T15:00:00.000Z',
  },
  {
    id: 'notif-009',
    userId: 'user_3MS458uQn7A7ibbDcmFOW7EJsWX', // Aditya Rao (Admin)
    type: 'system',
    title: 'New Listings Pending Approval (3)',
    message: '3 student items are awaiting moderation in the admin dashboard.',
    data: { count: 3 },
    read: false,
    createdAt: '2026-11-21T15:00:00.000Z',
  },
  {
    id: 'notif-010',
    userId: 'user_3MS458uQn7A7ibbDcmFOW7EJsWX', // Aditya Rao (Admin)
    type: 'system',
    title: 'Community Report Filed 🚨',
    message: 'A student reported suspicious pricing on a high-value laptop listing.',
    data: { reportId: 'rep-001' },
    read: false,
    createdAt: '2026-11-21T11:20:00.000Z',
  },
  {
    id: 'notif-011',
    userId: 'user_3MS45gr89oJx2OhtdSuhySYXarM', // Vikram Joshi (Verifier)
    type: 'system',
    title: 'Verification Request Assigned',
    message: 'You have been assigned to verify 2 hardware lab equipment listings.',
    data: { count: 2 },
    read: true,
    createdAt: '2026-11-20T11:00:00.000Z',
  },
  {
    id: 'notif-012',
    userId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC', // Rohan Verma
    type: 'order_status_changed',
    title: 'Payment Received',
    message: 'Payment of ₹850 verified for Sedra & Smith Circuits via UPI.',
    data: { orderId: 'ord-101' },
    read: true,
    createdAt: '2026-11-21T10:15:00.000Z',
  },
];

