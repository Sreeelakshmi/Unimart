// mobile/data/mock/mockReturns.ts
// Realistic Indian campus return and refund requests

import type { ReturnRequest } from '../../../shared/types/return';

export const MOCK_RETURNS: ReturnRequest[] = [
  {
    id: 'ret-001',
    orderId: 'ord-105',
    productId: 'prod-008',
    productTitle: 'Logitech K380 Multi-Device Bluetooth Keyboard',
    buyerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    buyerName: 'Priya Patel',
    sellerId: 'user_3MS46NknrbV5ChMPLEzXg2kqPcn', // Fatima Sheikh
    sellerName: 'Fatima Sheikh',
    amount: 1400,
    reason: 'defective',
    details: 'The Spacebar and Backspace keys have sticky tactile response and miss keystrokes periodically.',
    status: 'approved',
    sellerNotes: 'Inspected together at SAC Cafe. Issue confirmed, accepted return and processed full UPI refund.',
    createdAt: '2026-11-19T14:00:00.000Z',
    updatedAt: '2026-11-20T11:00:00.000Z',
  },
  {
    id: 'ret-002',
    orderId: 'ord-107',
    productId: 'prod-013',
    productTitle: 'Fastrack Reflex Beat Fitness Smart Band',
    buyerId: 'user_3MS46sT0vWx9YzA1bCdEfGhIjKl', // Kavita Nair
    buyerName: 'Kavita Nair',
    sellerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    sellerName: 'Priya Patel',
    amount: 750,
    reason: 'wrong_item',
    details: 'Charging cable included was for a different revision band, cannot charge device.',
    status: 'requested',
    sellerNotes: 'Checking if I have the original USB dock in my hostel drawer.',
    createdAt: '2026-11-21T16:00:00.000Z',
    updatedAt: '2026-11-21T16:00:00.000Z',
  },
  {
    id: 'ret-003',
    orderId: 'ord-102',
    productId: 'prod-010',
    productTitle: 'Yonex Astrox 77 Badminton Racket (4U G4)',
    buyerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    buyerName: 'Priya Patel',
    sellerId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC', // Rohan Verma
    sellerName: 'Rohan Verma',
    amount: 1850,
    reason: 'not_as_described',
    details: 'Grip tape was worn more than shown in listing photos.',
    status: 'rejected',
    sellerNotes: 'Offered a free spare Yonex super grip wrap at next meetup instead of returning racket; buyer agreed.',
    createdAt: '2026-11-18T18:00:00.000Z',
    updatedAt: '2026-11-19T09:30:00.000Z',
  },
  {
    id: 'ret-004',
    orderId: 'ord-108',
    productId: 'prod-004',
    productTitle: 'Arduino Uno R3 Starter Kit with 30+ Sensors',
    buyerId: 'user_3MS46cdeFghIjKlMnO0pQrStUvW', // Manish Gupta
    buyerName: 'Manish Gupta',
    sellerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    sellerName: 'Priya Patel',
    amount: 950,
    reason: 'defective',
    details: 'Ultrasonic distance sensor HC-SR04 pin was bent and breadboard power supply was missing.',
    status: 'refunded',
    sellerNotes: 'Replaced missing breadboard power supply module and refunded ₹150 for the sensor.',
    createdAt: '2026-11-14T10:00:00.000Z',
    updatedAt: '2026-11-15T15:20:00.000Z',
  },
];

