import { User, Robot, RobotRequest, Purchase } from './backend';

// Helper to create a mock user
export const createMockUser = (
  id: string, 
  name: string, 
  email: string, 
  isAdmin: boolean = false, 
  role: string = 'user'
): User => ({
  id,
  name,
  email,
  is_admin: isAdmin,
  role,
  created_at: new Date(Date.now() - Math.random() * 5000000000).toISOString(),
  updated_at: new Date().toISOString()
});

// Create a set of mock users
export const mockUsers: User[] = [
  createMockUser('u1', 'John Smith', 'john@example.com', false, 'customer'),
  createMockUser('u2', 'Jane Doe', 'jane@example.com', false, 'customer'),
  createMockUser('u3', 'Alice Johnson', 'alice@example.com', false, 'customer'),
  createMockUser('u4', 'Bob Williams', 'bob@example.com', false, 'customer'),
  createMockUser('u5', 'Admin User', 'admin@example.com', true, 'admin')
];

// Mock messages
export interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export const mockMessages: Message[] = [
  {
    id: 'm1',
    userId: 'u1',
    userName: 'John Smith',
    text: 'Hello, I need help configuring my MT5 trading robot.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true
  },
  {
    id: 'm2',
    userId: 'u2',
    userName: 'Jane Doe',
    text: 'When will my custom robot be ready?',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false
  },
  {
    id: 'm3',
    userId: 'u3',
    userName: 'Alice Johnson',
    text: 'Is there a free trial available for the premium robots?',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: false
  },
  {
    id: 'm4',
    userId: 'u1',
    userName: 'John Smith',
    text: 'Thanks for your help! The robot is working great now.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: true
  }
];

// Mock robots
export const mockRobots: Robot[] = [
  {
    id: 'r1',
    name: 'MT5 Trend Tracker',
    description: 'Advanced robot for identifying and following market trends',
    type: 'MT5',
    price: 199.99,
    features: ['Multi-timeframe analysis', 'Smart entry/exit', 'Risk management'],
    currency: 'USD',
    category: 'paid',
    image_url: '/images/robots/trend-tracker.jpg',
    created_at: new Date(Date.now() - 5000000000).toISOString()
  },
  {
    id: 'r2',
    name: 'Binary Options Pro',
    description: 'Professional binary options robot with high win rate',
    type: 'Binary',
    price: 149.99,
    features: ['Pattern recognition', '75%+ win rate', 'Signal alerts'],
    currency: 'USD',
    category: 'paid',
    image_url: '/images/robots/binary-pro.jpg',
    created_at: new Date(Date.now() - 4000000000).toISOString()
  },
  {
    id: 'r3',
    name: 'Forex Scalper',
    description: 'Free scalping robot for quick trades',
    type: 'MT5',
    price: 0,
    features: ['Quick execution', 'Small profit targets', 'High frequency'],
    currency: 'USD',
    category: 'free',
    image_url: '/images/robots/forex-scalper.jpg',
    created_at: new Date(Date.now() - 3000000000).toISOString()
  }
];

// Mock robot requests
export const mockRobotRequests: RobotRequest[] = [
  {
    id: 'rr1',
    user_id: 'u1',
    robot_type: 'MT5',
    trading_pairs: 'EURUSD, GBPUSD',
    timeframe: '1h',
    risk_level: 3,
    status: 'pending',
    is_delivered: false,
    created_at: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'rr2',
    user_id: 'u2',
    robot_type: 'Binary',
    trading_pairs: 'EURUSD',
    timeframe: '5m',
    risk_level: 5,
    status: 'approved',
    is_delivered: false,
    created_at: new Date(Date.now() - 432000000).toISOString()
  }
];

// Mock purchases
export const mockPurchases: Purchase[] = [
  {
    id: 'p1',
    user_id: 'u1',
    robot_id: 'r1',
    amount: 199.99,
    currency: 'USD',
    payment_method: 'Credit Card',
    status: 'completed',
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'p2',
    user_id: 'u3',
    robot_id: 'r2',
    amount: 149.99,
    currency: 'USD',
    payment_method: 'PayPal',
    status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'p3',
    user_id: 'u2',
    robot_id: 'r3',
    amount: 0,
    currency: 'USD',
    payment_method: 'Free Download',
    status: 'completed',
    created_at: new Date(Date.now() - 604800000).toISOString()
  }
];

// Chat conversations
export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'admin';
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const mockChatMessages: Record<string, ChatMessage[]> = {
  'c1': [
    {
      id: 'cm1',
      conversationId: 'c1',
      sender: 'user',
      senderId: 'u1',
      text: 'Hello, I need help with my trading robot configuration.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true
    },
    {
      id: 'cm2',
      conversationId: 'c1',
      sender: 'admin',
      senderId: 'u5',
      text: 'Hi John, I would be happy to help you with that. What specific issue are you facing?',
      timestamp: new Date(Date.now() - 85800000).toISOString(),
      read: true
    },
    {
      id: 'cm3',
      conversationId: 'c1',
      sender: 'user',
      senderId: 'u1',
      text: 'My robot keeps giving me error code 404 when I try to start it.',
      timestamp: new Date(Date.now() - 85200000).toISOString(),
      read: true
    },
    {
      id: 'cm4',
      conversationId: 'c1',
      sender: 'admin',
      senderId: 'u5',
      text: 'That error usually means there is a connection issue. Have you checked your internet connection and MT5 permissions?',
      timestamp: new Date(Date.now() - 84600000).toISOString(),
      read: true
    },
    {
      id: 'cm5',
      conversationId: 'c1',
      sender: 'user',
      senderId: 'u1',
      text: 'Let me check that now. I\'ll get back to you.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true
    }
  ],
  'c2': [
    {
      id: 'cm6',
      conversationId: 'c2',
      sender: 'user',
      senderId: 'u2',
      text: 'When will my custom robot be ready? I submitted the request 5 days ago.',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: true
    },
    {
      id: 'cm7',
      conversationId: 'c2',
      sender: 'admin',
      senderId: 'u5',
      text: 'Hi Jane, I apologize for the delay. Our development team is working on it and should be done within 2-3 days.',
      timestamp: new Date(Date.now() - 172200000).toISOString(),
      read: true
    },
    {
      id: 'cm8',
      conversationId: 'c2',
      sender: 'user',
      senderId: 'u2',
      text: 'Okay, thank you for the update!',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false
    }
  ]
};

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    userId: 'u1',
    userName: 'John Smith',
    lastMessage: 'Let me check that now. I\'ll get back to you.',
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0
  },
  {
    id: 'c2',
    userId: 'u2',
    userName: 'Jane Doe',
    lastMessage: 'Okay, thank you for the update!',
    lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
    unreadCount: 1
  },
  {
    id: 'c3',
    userId: 'u3',
    userName: 'Alice Johnson',
    lastMessage: 'Is there a free trial available for the premium robots?',
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 1
  }
];

export const getMockDataForCurrentUser = (userId: string) => {
  // Filter data relevant to the current user
  const userRobotRequests = mockRobotRequests.filter(req => req.user_id === userId);
  const userPurchases = mockPurchases.filter(purchase => purchase.user_id === userId);
  const userConversations = mockConversations.filter(conv => conv.userId === userId);

  return {
    robotRequests: userRobotRequests,
    purchases: userPurchases,
    conversations: userConversations
  };
};
