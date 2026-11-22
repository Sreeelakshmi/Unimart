// mobile/data/mock/mockProducts.ts
// Realistic Campus Marketplace items with Indian university context and INR pricing

import type { Product } from '../../../shared/types/product';

export const MOCK_PRODUCTS: Product[] = [
  // 1. Available Books
  {
    id: 'prod-001',
    sellerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    sellerName: 'Priya Patel',
    sellerEmail: 'priya.patel+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'Introduction to Algorithms (CLRS 4th Edition)',
    description: 'Required textbook for CS Core data structures & algorithms. Barely used, no page markings or highlights. Original print with MIT Press holographic seal.',
    price: 1250,
    category: 'books',
    condition: 'like_new',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=75&auto=format',
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Central Library — Main Entrance Lobby',
    createdAt: '2026-11-15T10:00:00.000Z',
    updatedAt: '2026-11-20T12:00:00.000Z',
  },
  {
    id: 'prod-002',
    sellerId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC', // Rohan Verma
    sellerName: 'Rohan Verma',
    sellerEmail: 'rohan.verma+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    title: 'Microelectronic Circuits by Sedra & Smith (8th Ed)',
    description: 'Indispensable guide for Analog & Digital Circuits. Includes formula sheet bookmarks and solved previous 5 years end-semester exam question papers tucked inside.',
    price: 850,
    category: 'books',
    condition: 'good',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Student Activity Center (SAC) Cafe',
    createdAt: '2026-11-16T14:30:00.000Z',
    updatedAt: '2026-11-19T09:15:00.000Z',
  },
  {
    id: 'prod-003',
    sellerId: 'user_3MS46BhmaLJBg71aJCb0ipD4pfM', // Ananya Iyer
    sellerName: 'Ananya Iyer',
    sellerEmail: 'ananya.iyer+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    title: 'Engineering Mechanics: Statics & Dynamics (Meriam & Kraige)',
    description: '1st year common course core book. Clear diagrams, spiral bound cover for extra durability. Minor pencil notes on free-body diagrams.',
    price: 650,
    category: 'books',
    condition: 'good',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=75&auto=format',
    ],
    aiVerified: false,
    campusLocation: 'Hostel Block C — Visitors Reception',
    createdAt: '2026-11-17T11:20:00.000Z',
    updatedAt: '2026-11-17T11:20:00.000Z',
  },

  // 2. Electronics
  {
    id: 'prod-004',
    sellerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    sellerName: 'Priya Patel',
    sellerEmail: 'priya.patel+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    description: 'High-resolution LCD display, 552 functions including matrix, vector calculations, and spreadsheet. Allowed in all university engineering examinations. Brand new battery.',
    price: 950,
    category: 'electronics',
    condition: 'like_new',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Central Library — Main Entrance Lobby',
    createdAt: '2026-11-18T09:00:00.000Z',
    updatedAt: '2026-11-20T16:00:00.000Z',
  },
  {
    id: 'prod-005',
    sellerId: 'user_3MS45YX9MnSkSHq5GAkOY5wyHr7', // Arjun Reddy
    sellerName: 'Arjun Reddy',
    sellerEmail: 'arjun.reddy+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    title: 'Logitech MX Master 2S Ergonomic Wireless Mouse',
    description: 'Great for CAD drafting and long coding sessions. Pairs with up to 3 laptops via Bluetooth. Micro-USB charging cable included, battery lasts 40+ days.',
    price: 2400,
    category: 'electronics',
    condition: 'good',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Student Activity Center (SAC) Cafe',
    createdAt: '2026-11-14T15:00:00.000Z',
    updatedAt: '2026-11-18T10:00:00.000Z',
  },
  {
    id: 'prod-006',
    sellerId: 'user_3MS45uyNtPlQDPWSkeAdbF3SJCR', // Sneha Kulkarni
    sellerName: 'Sneha Kulkarni',
    sellerEmail: 'sneha.kulkarni+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Boat Rockerz 450 On-Ear Bluetooth Headphones (Luscious Black)',
    description: 'Up to 15 hours playback, 40mm dynamic drivers, padded ear cushions for library study sessions. Includes AUX cable for zero latency.',
    price: 799,
    category: 'electronics',
    condition: 'like_new',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Hostel Block C — Visitors Reception',
    createdAt: '2026-11-19T13:00:00.000Z',
    updatedAt: '2026-11-20T11:00:00.000Z',
  },
  {
    id: 'prod-007',
    sellerId: 'user_3MS46NknrbV5ChMPLEzXg2kqPcn', // Fatima Sheikh
    sellerName: 'Fatima Sheikh',
    sellerEmail: 'fatima.sheikh+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    title: 'Raspberry Pi 4 Model B (4GB RAM) with Aluminum Case & Fan',
    description: 'Perfect for IoT, embedded systems, and robotics course projects. Comes with official 5.1V Type-C power adapter and 32GB SanDisk Extreme MicroSD card.',
    price: 3600,
    category: 'electronics',
    condition: 'good',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Faculty & Lecture Hall Complex Atrium',
    createdAt: '2026-11-13T16:45:00.000Z',
    updatedAt: '2026-11-18T14:20:00.000Z',
  },

  // 3. Stationery & Engineering Tools
  {
    id: 'prod-008',
    sellerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    sellerName: 'Priya Patel',
    sellerEmail: 'priya.patel+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'Omega Engineering Mini Drafter & Imperial Drawing Board',
    description: 'Essential for Engineering Graphics & CAD Drawing labs. Heavy-duty clamp, calibrated steel rods, protective shoulder bag, and set squares included.',
    price: 450,
    category: 'stationery',
    condition: 'good',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Central Library — Main Entrance Lobby',
    createdAt: '2026-11-12T09:30:00.000Z',
    updatedAt: '2026-11-16T18:00:00.000Z',
  },
  {
    id: 'prod-009',
    sellerId: 'user_3MS45kwkkzb3Nh2iPshuJ2GLoUH', // Isha Menon
    sellerName: 'Isha Menon',
    sellerEmail: 'isha.menon+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    title: 'Parker Vector Stainless Steel Fountain Pen & Ink Bottle',
    description: 'Classic Parker stainless steel trim pen. Smooth medium nib, includes piston converter and 90% full Quink black ink bottle.',
    price: 320,
    category: 'stationery',
    condition: 'like_new',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=75&auto=format',
    ],
    aiVerified: false,
    campusLocation: 'Student Activity Center (SAC) Cafe',
    createdAt: '2026-11-19T08:15:00.000Z',
    updatedAt: '2026-11-19T08:15:00.000Z',
  },

  // 4. Sports & Fitness
  {
    id: 'prod-010',
    sellerId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC', // Rohan Verma
    sellerName: 'Rohan Verma',
    sellerEmail: 'rohan.verma+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    title: 'Yonex Astrox 77 Badminton Racket (4U G4) with Full Cover',
    description: 'Rotational generator system, strung with BG65 at 24 lbs tension. Ideal for aggressive smashes and fast club matches. Brand new grip applied.',
    price: 1850,
    category: 'sports',
    condition: 'good',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Student Activity Center (SAC) Cafe',
    createdAt: '2026-11-10T17:00:00.000Z',
    updatedAt: '2026-11-15T12:00:00.000Z',
  },
  {
    id: 'prod-011',
    sellerId: 'user_3MS45YX9MnSkSHq5GAkOY5wyHr7', // Arjun Reddy
    sellerName: 'Arjun Reddy',
    sellerEmail: 'arjun.reddy+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    title: 'Nivia Storm Football (Size 5, All-Weather Rubber)',
    description: 'Official tournament rubber moulded ball with 32 panels. Good air retention, suitable for hostel turf and gravel campus grounds.',
    price: 420,
    category: 'sports',
    condition: 'good',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Campus Main Gate Security Kiosk',
    createdAt: '2026-11-11T19:00:00.000Z',
    updatedAt: '2026-11-14T11:00:00.000Z',
  },

  // 5. Furniture & Dorm Essentials
  {
    id: 'prod-012',
    sellerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    sellerName: 'Priya Patel',
    sellerEmail: 'priya.patel+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'Prestige 1.5L Stainless Steel Electric Kettle (1500W)',
    description: 'Hostel lifeline for midnight tea, coffee, and Maggi! Auto shut-off, 360-degree swivel base, boil-dry protection. Works perfectly.',
    price: 650,
    category: 'furniture',
    condition: 'like_new',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1594213114663-ddf4f24cf707?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Hostel Block C — Visitors Reception',
    createdAt: '2026-11-16T18:00:00.000Z',
    updatedAt: '2026-11-20T10:00:00.000Z',
  },
  {
    id: 'prod-013',
    sellerId: 'user_3MS45DvAE70rEZxZoLo1IeMWyfg', // Diya Nair
    sellerName: 'Diya Nair',
    sellerEmail: 'diya.nair+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150',
    title: 'Foldable Wooden Bed Table & Laptop Lap Desk with Cup Holder',
    description: 'Ergonomic study table for bed or floor studying. Includes tablet groove, cup holder, and non-slip metal legs.',
    price: 380,
    category: 'furniture',
    condition: 'good',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=75&auto=format',
    ],
    aiVerified: false,
    campusLocation: 'Central Library — Main Entrance Lobby',
    createdAt: '2026-11-18T16:30:00.000Z',
    updatedAt: '2026-11-18T16:30:00.000Z',
  },

  // 6. Other (Bicycle, Musical Instruments)
  {
    id: 'prod-014',
    sellerId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC', // Rohan Verma
    sellerName: 'Rohan Verma',
    sellerEmail: 'rohan.verma+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    title: 'Hero Sprint 26T Single Speed Mountain Bicycle with Number Lock',
    description: 'Daily campus commuter bike. Serviced last month with new brake pads, chain lubrication, front reflector, and sturdy steel cable lock included.',
    price: 3200,
    category: 'other',
    condition: 'good',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Campus Main Gate Security Kiosk',
    createdAt: '2026-11-08T12:00:00.000Z',
    updatedAt: '2026-11-16T15:00:00.000Z',
  },
  {
    id: 'prod-015',
    sellerId: 'user_3MS45uyNtPlQDPWSkeAdbF3SJCR', // Sneha Kulkarni
    sellerName: 'Sneha Kulkarni',
    sellerEmail: 'sneha.kulkarni+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Yamaha F310 Acoustic Guitar with Padded Gig Bag & Capo',
    description: 'Rich resonant tone, spruce top, rosewood fingerboard. Recently re-strung with D\'Addario phosphor bronze 11-52 strings. Clean and well maintained.',
    price: 4900,
    category: 'other',
    condition: 'good',
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Student Activity Center (SAC) Cafe',
    createdAt: '2026-11-05T14:00:00.000Z',
    updatedAt: '2026-11-12T19:00:00.000Z',
  },

  // 7. Pending Review Listings (For Admin approval testing!)
  {
    id: 'prod-016',
    sellerId: 'user_3MS46BhmaLJBg71aJCb0ipD4pfM', // Ananya Iyer
    sellerName: 'Ananya Iyer',
    sellerEmail: 'ananya.iyer+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    title: 'Rechargeable LED Desk Lamp with 3 Color Modes & USB Port',
    description: 'Pending review listing waiting for moderator check. 2000mAh battery, flexible gooseneck, touch brightness slider.',
    price: 450,
    category: 'furniture',
    condition: 'like_new',
    status: 'pending_review',
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=75&auto=format',
    ],
    aiVerified: false,
    campusLocation: 'Central Library — Main Entrance Lobby',
    createdAt: '2026-11-21T18:00:00.000Z',
    updatedAt: '2026-11-21T18:00:00.000Z',
  },
  {
    id: 'prod-017',
    sellerId: 'user_3MS45YX9MnSkSHq5GAkOY5wyHr7', // Arjun Reddy
    sellerName: 'Arjun Reddy',
    sellerEmail: 'arjun.reddy+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    title: 'University Technical Fest Official Hoodie (Size L)',
    description: 'Thick fleece hoodie from Rendezvous 2025. Worn twice, freshly washed.',
    price: 499,
    category: 'clothing',
    condition: 'like_new',
    status: 'pending_review',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=75&auto=format',
    ],
    aiVerified: false,
    campusLocation: 'Student Activity Center (SAC) Cafe',
    createdAt: '2026-11-21T20:30:00.000Z',
    updatedAt: '2026-11-21T20:30:00.000Z',
  },

  // 8. Sold & Historical Listings
  {
    id: 'prod-018',
    sellerId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx', // Priya Patel
    sellerName: 'Priya Patel',
    sellerEmail: 'priya.patel+clerk_test@campus.edu',
    sellerAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'Texas Instruments TI-84 Plus CE Graphing Calculator',
    description: 'Rechargeable color graphing calculator with Python support. Successfully sold on campus.',
    price: 4200,
    category: 'electronics',
    condition: 'like_new',
    status: 'sold',
    images: [
      'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400&q=75&auto=format',
    ],
    aiVerified: true,
    campusLocation: 'Central Library — Main Entrance Lobby',
    createdAt: '2026-10-15T11:00:00.000Z',
    updatedAt: '2026-11-02T14:30:00.000Z',
  },
];

