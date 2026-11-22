// mobile/data/mock/mockOrders.ts
// Realistic Campus Marketplace orders across all lifecycle states

import type { Order } from '../../../shared/types/order';

export const MOCK_ORDERS: Order[] = [
  // 1. Priya Patel as BUYER
  {
    id: 'ord-101',
    productId: 'prod-002',
    productTitle: 'Microelectronic Circuits by Sedra & Smith (8th Ed)',
    productImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=75&auto=format',
    buyerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    buyerName: 'Priya Patel',
    sellerId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC', // Rohan Verma
    sellerName: 'Rohan Verma',
    status: 'meetup_arranged',
    amount: 850,
    paymentRef: 'UPI-TXN-8837194012',
    meetupLocation: 'Student Activity Center (SAC) Cafe',
    meetupTime: 'Today at 04:30 PM',
    createdAt: '2026-11-21T09:30:00.000Z',
    updatedAt: '2026-11-21T14:00:00.000Z',
  },
  {
    id: 'ord-102',
    productId: 'prod-010',
    productTitle: 'Yonex Astrox 77 Badminton Racket (4U G4)',
    productImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&q=75&auto=format',
    buyerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    buyerName: 'Priya Patel',
    sellerId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC', // Rohan Verma
    sellerName: 'Rohan Verma',
    status: 'completed',
    amount: 1850,
    paymentRef: 'UPI-TXN-7749102941',
    meetupLocation: 'Central Library — Main Entrance Lobby',
    meetupTime: '18 Nov 2026 at 05:00 PM',
    createdAt: '2026-11-17T11:00:00.000Z',
    updatedAt: '2026-11-18T17:30:00.000Z',
  },
  {
    id: 'ord-103',
    productId: 'prod-007',
    productTitle: 'Raspberry Pi 4 Model B (4GB RAM) with Case',
    productImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&q=75&auto=format',
    buyerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    buyerName: 'Priya Patel',
    sellerId: 'user_3MS46NknrbV5ChMPLEzXg2kqPcn', // Fatima Sheikh
    sellerName: 'Fatima Sheikh',
    status: 'placed',
    amount: 3600,
    paymentRef: 'UPI-TXN-9948201723',
    meetupLocation: 'Faculty & Lecture Hall Complex Atrium',
    meetupTime: 'Tomorrow at 02:00 PM',
    createdAt: '2026-11-22T08:15:00.000Z',
    updatedAt: '2026-11-22T08:15:00.000Z',
  },

  // 2. Priya Patel as SELLER
  {
    id: 'ord-104',
    productId: 'prod-004',
    productTitle: 'Casio fx-991EX ClassWiz Scientific Calculator',
    productImage: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400&q=75&auto=format',
    buyerId: 'user_3MS46BhmaLJBg71aJCb0ipD4pfM', // Ananya Iyer
    buyerName: 'Ananya Iyer',
    sellerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    sellerName: 'Priya Patel',
    status: 'confirmed',
    amount: 950,
    paymentRef: 'UPI-TXN-6629104812',
    meetupLocation: 'Central Library — Main Entrance Lobby',
    meetupTime: 'Today at 05:00 PM',
    createdAt: '2026-11-21T16:20:00.000Z',
    updatedAt: '2026-11-21T18:00:00.000Z',
  },
  {
    id: 'ord-105',
    productId: 'prod-008',
    productTitle: 'Omega Engineering Mini Drafter & Board',
    productImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=75&auto=format',
    buyerId: 'user_3MS45YX9MnSkSHq5GAkOY5wyHr7', // Arjun Reddy
    buyerName: 'Arjun Reddy',
    sellerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    sellerName: 'Priya Patel',
    status: 'completed',
    amount: 450,
    paymentRef: 'UPI-TXN-5541920194',
    meetupLocation: 'Central Library — Main Entrance Lobby',
    meetupTime: '15 Nov 2026 at 03:30 PM',
    createdAt: '2026-11-14T10:00:00.000Z',
    updatedAt: '2026-11-15T16:00:00.000Z',
  },
  {
    id: 'ord-106',
    productId: 'prod-012',
    productTitle: 'Prestige 1.5L Stainless Steel Electric Kettle',
    productImage: 'https://images.unsplash.com/photo-1594213114663-ddf4f24cf707?w=400&q=75&auto=format',
    buyerId: 'user_3MS45uyNtPlQDPWSkeAdbF3SJCR', // Sneha Kulkarni
    buyerName: 'Sneha Kulkarni',
    sellerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    sellerName: 'Priya Patel',
    status: 'placed',
    amount: 650,
    paymentRef: 'UPI-TXN-4491028471',
    meetupLocation: 'Hostel Block C — Visitors Reception',
    meetupTime: 'Today at 07:00 PM',
    createdAt: '2026-11-22T10:45:00.000Z',
    updatedAt: '2026-11-22T10:45:00.000Z',
  },

  // 3. Other Campus Orders (for Admin and general overview)
  {
    id: 'ord-107',
    productId: 'prod-014',
    productTitle: 'Hero Sprint 26T Single Speed Mountain Bicycle',
    productImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=75&auto=format',
    buyerId: 'user_3MS45kwkkzb3Nh2iPshuJ2GLoUH', // Isha Menon
    buyerName: 'Isha Menon',
    sellerId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC', // Rohan Verma
    sellerName: 'Rohan Verma',
    status: 'completed',
    amount: 3200,
    paymentRef: 'UPI-TXN-3382910471',
    meetupLocation: 'Campus Main Gate Security Kiosk',
    meetupTime: '12 Nov 2026 at 06:00 PM',
    createdAt: '2026-11-11T12:00:00.000Z',
    updatedAt: '2026-11-12T18:30:00.000Z',
  },
  {
    id: 'ord-108',
    productId: 'prod-011',
    productTitle: 'Nivia Storm Football (Size 5)',
    productImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=75&auto=format',
    buyerId: 'user_3MS45DvAE70rEZxZoLo1IeMWyfg', // Diya Nair
    buyerName: 'Diya Nair',
    sellerId: 'user_3MS45YX9MnSkSHq5GAkOY5wyHr7', // Arjun Reddy
    sellerName: 'Arjun Reddy',
    status: 'cancelled',
    amount: 420,
    paymentRef: 'UPI-TXN-2284910283',
    createdAt: '2026-11-15T14:00:00.000Z',
    updatedAt: '2026-11-16T09:00:00.000Z',
  },
];

