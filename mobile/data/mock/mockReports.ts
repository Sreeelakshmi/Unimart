// mobile/data/mock/mockReports.ts
// Realistic Indian campus community moderation reports

import type { CommunityReport } from '../../../shared/types/report';

export const MOCK_REPORTS: CommunityReport[] = [
  {
    id: 'rep-001',
    reporterId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    reporterName: 'Priya Patel',
    targetType: 'product',
    targetId: 'prod-017',
    targetTitle: 'Boat Rockerz 450 Bluetooth On-Ear Headphones',
    reason: 'counterfeit',
    details: 'Seller mentions original brand warranty but images show a knock-off replica packaging without hologram.',
    status: 'pending',
    createdAt: '2026-11-21T11:15:00.000Z',
    updatedAt: '2026-11-21T11:15:00.000Z',
  },
  {
    id: 'rep-002',
    reporterId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC', // Rohan Verma
    reporterName: 'Rohan Verma',
    targetType: 'product',
    targetId: 'prod-007',
    targetTitle: 'Raspberry Pi 4 Model B (4GB RAM)',
    reason: 'spam',
    details: 'Duplicate listing posted 4 times across different categories within 10 minutes.',
    status: 'pending',
    createdAt: '2026-11-20T14:30:00.000Z',
    updatedAt: '2026-11-20T14:30:00.000Z',
  },
  {
    id: 'rep-003',
    reporterId: 'user_3MS46gBvdXm76e6a1N0s8Dknr4f', // Deepa Balakrishnan
    reporterName: 'Deepa Balakrishnan',
    targetType: 'user',
    targetId: 'user_3MS47JzQ7WkLmNoP1QrStUvWx98', // Rahul Deshmukh
    targetTitle: 'User Profile: Rahul Deshmukh',
    reason: 'inappropriate',
    details: 'User repeatedly failed to show up at the designated Safe Campus Meetup location without cancellation.',
    status: 'resolved',
    resolutionNotes: 'Issued formal community strike and warning to student. Required to confirm next 2 meetups 1 hour in advance.',
    resolvedBy: 'Aditya Rao (Campus Admin)',
    createdAt: '2026-11-18T16:00:00.000Z',
    updatedAt: '2026-11-19T10:00:00.000Z',
  },
  {
    id: 'rep-004',
    reporterId: 'user_3MS46NknrbV5ChMPLEzXg2kqPcn', // Fatima Sheikh
    reporterName: 'Fatima Sheikh',
    targetType: 'product',
    targetId: 'prod-015',
    targetTitle: 'Decathlon Quechua 20L Backpack',
    reason: 'other',
    details: 'Price was listed at ₹50 in title to attract clicks, but seller is asking for ₹900 in chat.',
    status: 'resolved',
    resolutionNotes: 'Updated listing price to true agreed amount and warned seller against deceptive pricing.',
    resolvedBy: 'Vikram Joshi (Moderator)',
    createdAt: '2026-11-17T09:45:00.000Z',
    updatedAt: '2026-11-17T14:30:00.000Z',
  },
  {
    id: 'rep-005',
    reporterId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    reporterName: 'Priya Patel',
    targetType: 'user',
    targetId: 'user_3MS47VbNzL9K1pQrStUvWx82yZa', // Amit Saxena
    targetTitle: 'User Profile: Amit Saxena',
    reason: 'harassment',
    details: 'Sent aggressive messages repeatedly after I declined a 70% lowball price offer.',
    status: 'dismissed',
    resolutionNotes: 'Reviewed chat logs. Messages were overly persistent negotiations but did not breach safety thresholds. Reminded user of campus marketplace etiquette.',
    resolvedBy: 'Aditya Rao (Campus Admin)',
    createdAt: '2026-11-15T12:00:00.000Z',
    updatedAt: '2026-11-16T11:00:00.000Z',
  },
];

