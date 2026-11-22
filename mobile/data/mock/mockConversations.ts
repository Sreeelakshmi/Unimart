// mobile/data/mock/mockConversations.ts
// Realistic buyer-seller campus chat threads and messages

import type { Conversation, Message } from '../../../shared/types/message';

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    orderId: 'ord-101',
    productId: 'prod-002',
    productTitle: 'Microelectronic Circuits (8th Ed)',
    otherUserId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC', // Rohan Verma
    otherUserName: 'Rohan Verma',
    otherUserAvatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    lastMessage: 'Awesome, meeting confirmed at SAC Cafe at 4:30 PM!',
    lastMessageAt: '2026-11-21T14:00:00.000Z',
    unreadCount: 1,
  },
  {
    orderId: 'ord-104',
    productId: 'prod-004',
    productTitle: 'Casio fx-991EX Scientific Calculator',
    otherUserId: 'user_3MS46BhmaLJBg71aJCb0ipD4pfM', // Ananya Iyer
    otherUserName: 'Ananya Iyer',
    otherUserAvatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    lastMessage: 'I have paid via UPI. Will meet you at Central Library at 5 PM.',
    lastMessageAt: '2026-11-21T18:00:00.000Z',
    unreadCount: 0,
  },
  {
    orderId: 'ord-106',
    productId: 'prod-012',
    productTitle: 'Prestige 1.5L Electric Kettle',
    otherUserId: 'user_3MS45uyNtPlQDPWSkeAdbF3SJCR', // Sneha Kulkarni
    otherUserName: 'Sneha Kulkarni',
    otherUserAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    lastMessage: 'Hi Priya! Is 7 PM at Block C reception still fine for you?',
    lastMessageAt: '2026-11-22T10:45:00.000Z',
    unreadCount: 1,
  },
  {
    orderId: 'ord-102',
    productId: 'prod-010',
    productTitle: 'Yonex Astrox 77 Badminton Racket',
    otherUserId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC', // Rohan Verma
    otherUserName: 'Rohan Verma',
    otherUserAvatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    lastMessage: 'Received the racket, thanks a lot for the smooth exchange!',
    lastMessageAt: '2026-11-18T17:30:00.000Z',
    unreadCount: 0,
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  // Messages for Order ord-101 (Priya Patel buying from Rohan Verma)
  'ord-101': [
    {
      id: 'msg-101-1',
      orderId: 'ord-101',
      senderId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
      senderName: 'Priya Patel',
      receiverId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC',
      content: 'Hi Rohan! Is the Sedra & Smith Microelectronics textbook still available?',
      read: true,
      createdAt: '2026-11-21T09:35:00.000Z',
    },
    {
      id: 'msg-101-2',
      orderId: 'ord-101',
      senderId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC',
      senderName: 'Rohan Verma',
      receiverId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
      content: 'Hey Priya, yes it is! It also has the previous years solved exam questions inside.',
      read: true,
      createdAt: '2026-11-21T09:42:00.000Z',
    },
    {
      id: 'msg-101-3',
      orderId: 'ord-101',
      senderId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
      senderName: 'Priya Patel',
      receiverId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC',
      content: 'That sounds perfect. Can we meet today at Student Activity Center (SAC) Cafe around 4:30 PM?',
      read: true,
      createdAt: '2026-11-21T10:15:00.000Z',
    },
    {
      id: 'msg-101-4',
      orderId: 'ord-101',
      senderId: 'user_3MS46EcCIhMT83lMnfOtKrfJ3xC',
      senderName: 'Rohan Verma',
      receiverId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
      content: 'Awesome, meeting confirmed at SAC Cafe at 4:30 PM!',
      read: false,
      createdAt: '2026-11-21T14:00:00.000Z',
    },
  ],

  // Messages for Order ord-104 (Ananya Iyer buying from Priya Patel)
  'ord-104': [
    {
      id: 'msg-104-1',
      orderId: 'ord-104',
      senderId: 'user_3MS46BhmaLJBg71aJCb0ipD4pfM',
      senderName: 'Ananya Iyer',
      receiverId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
      content: 'Hey Priya, does the Casio ClassWiz calculator come with the original slide-on hard case?',
      read: true,
      createdAt: '2026-11-21T16:25:00.000Z',
    },
    {
      id: 'msg-104-2',
      orderId: 'ord-104',
      senderId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
      senderName: 'Priya Patel',
      receiverId: 'user_3MS46BhmaLJBg71aJCb0ipD4pfM',
      content: 'Yes! The original hard case and quick reference card are included.',
      read: true,
      createdAt: '2026-11-21T16:40:00.000Z',
    },
    {
      id: 'msg-104-3',
      orderId: 'ord-104',
      senderId: 'user_3MS46BhmaLJBg71aJCb0ipD4pfM',
      senderName: 'Ananya Iyer',
      receiverId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
      content: 'I have paid via UPI. Will meet you at Central Library at 5 PM.',
      read: true,
      createdAt: '2026-11-21T18:00:00.000Z',
    },
  ],

  // Messages for Order ord-106 (Sneha Kulkarni buying from Priya Patel)
  'ord-106': [
    {
      id: 'msg-106-1',
      orderId: 'ord-106',
      senderId: 'user_3MS45uyNtPlQDPWSkeAdbF3SJCR',
      senderName: 'Sneha Kulkarni',
      receiverId: 'user_3MS45Nk2JrB2cRRz1jWH1Sa4IBx',
      content: 'Hi Priya! Is 7 PM at Block C reception still fine for you?',
      read: false,
      createdAt: '2026-11-22T10:45:00.000Z',
    },
  ],
};

