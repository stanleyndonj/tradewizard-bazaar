
import API_ENDPOINTS, { getAuthHeaders, handleApiResponse } from './apiConfig';

// Types for user management
export interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  role?: string;
  has_requested_robot?: boolean;
  robots_delivered?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Robot {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  features: string[];
  currency: string;
  category: string;
  image_url: string;
  imageUrl: string;
  download_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface RobotRequest {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  status: "pending" | "in_progress" | "approved" | "rejected" | "delivered";
  type: string;
  created_at: string;
  updated_at?: string;
  progress?: number;
  is_delivered?: boolean;
  delivery_date?: string;
  download_url?: string;
  notes?: string;
  
  // Fields for robot configuration
  trading_pairs: string;
  timeframe: string;
  risk_level: string;
  currency?: string;
  
  // Optional fields
  bot_name?: string;
  market?: string;
  stake_amount?: string;
  contract_type?: string;
  duration?: string;
  prediction?: string;
  trading_strategy?: string;
  
  // MT5 specific fields
  account_credentials?: string;
  volume?: string;
  order_type?: string;
  stop_loss?: string;
  take_profit?: string;
  entry_rules?: string;
  exit_rules?: string;
  risk_management?: string;
  additional_parameters?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  robot_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface RobotRequestParams {
  robot_type: string;
  trading_pairs: string;
  timeframe: string;
  risk_level: string;
  currency?: string;
  
  // Optional fields based on robot type
  bot_name?: string;
  market?: string;
  stake_amount?: string;
  contract_type?: string;
  duration?: string;
  prediction?: string;
  trading_strategy?: string;
  
  // MT5 specific fields
  account_credentials?: string;
  volume?: string;
  order_type?: string;
  stop_loss?: string;
  take_profit?: string;
  entry_rules?: string;
  exit_rules?: string;
  risk_management?: string;
  additional_parameters?: string;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  direction: "buy" | "sell";
  entry_price: number;
  stop_loss?: number;
  take_profit?: number;
  timeframe?: string;
  market?: string;
  timestamp?: string;
  strength?: number;
  confidence?: number;
  created_at: string;
}

export interface MarketAnalysis {
  symbol: string;
  timeframe: string;
  trend: string;
  strength: number;
  support_levels: number[];
  resistance_levels: number[];
  indicators: {
    rsi: number;
    macd: {
      value: number;
      signal: number;
      histogram: number;
    };
    moving_averages: {
      ma20: number;
      ma50: number;
      ma200: number;
    };
  };
  recommendation: string;
  next_potential_move: string;
  risk_reward_ratio: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// Authentication APIs
export const registerUser = async (name: string, email: string, password: string) => {
  const response = await fetch(API_ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  return handleApiResponse(response);
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return handleApiResponse(response);
};

export const logoutUser = async () => {
  const response = await fetch(API_ENDPOINTS.LOGOUT, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  return handleApiResponse(response);
};

export const getCurrentUser = async () => {
  const response = await fetch(API_ENDPOINTS.CURRENT_USER, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Robot APIs
export const getRobots = async () => {
  const response = await fetch(API_ENDPOINTS.ROBOTS, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const getRobotById = async (id: string) => {
  const response = await fetch(API_ENDPOINTS.ROBOT_BY_ID(id), {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const addRobot = async (robotData: Omit<Robot, 'id' | 'created_at'>) => {
  const response = await fetch(API_ENDPOINTS.ROBOTS, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(robotData),
  });

  return handleApiResponse(response);
};

export const updateRobot = async (robot: Robot) => {
  const response = await fetch(API_ENDPOINTS.ROBOT_BY_ID(robot.id), {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(robot),
  });

  return handleApiResponse(response);
};

export const deleteRobot = async (id: string) => {
  const response = await fetch(API_ENDPOINTS.ROBOT_BY_ID(id), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Robot Request APIs
export const getAllRobotRequests = async () => {
  const response = await fetch(API_ENDPOINTS.ROBOT_REQUESTS, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const getRobotRequests = async (userId: string) => {
  const response = await fetch(API_ENDPOINTS.USER_ROBOT_REQUESTS(userId), {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const submitRobotRequest = async (params: RobotRequestParams) => {
  const response = await fetch(API_ENDPOINTS.ROBOT_REQUESTS, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  return handleApiResponse(response);
};

export const updateRobotRequest = async (requestId: string, updates: any) => {
  const response = await fetch(API_ENDPOINTS.ROBOT_REQUEST_BY_ID(requestId), {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  return handleApiResponse(response);
};

// Purchase APIs
export const getUserPurchases = async (userId: string) => {
  const response = await fetch(API_ENDPOINTS.USER_PURCHASES(userId), {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const makePurchase = async (
  userId: string, 
  robotId: string, 
  amount: number, 
  currency: string, 
  paymentMethod: string
) => {
  const response = await fetch(API_ENDPOINTS.PURCHASES, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      robot_id: robotId,
      amount,
      currency,
      payment_method: paymentMethod,
    }),
  });

  return handleApiResponse(response);
};

// M-Pesa Payment APIs
export const initiateMpesaPayment = async (phone: string, amount: number, robotId: string) => {
  const response = await fetch(API_ENDPOINTS.MPESA_INITIATE, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, amount, robot_id: robotId }),
  });

  return handleApiResponse(response);
};

export const verifyMpesaPayment = async (checkoutRequestId: string) => {
  const response = await fetch(API_ENDPOINTS.MPESA_VERIFY, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ checkout_request_id: checkoutRequestId }),
  });

  const result = await handleApiResponse(response);
  return result.success;
};

// User Management APIs
export const getUsers = async () => {
  const response = await fetch(API_ENDPOINTS.USERS, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// AI Trading Signals APIs
export const getTradingSignals = async (market?: string, timeframe?: string, count?: number) => {
  let url = API_ENDPOINTS.AI_TRADING_SIGNALS;
  const params = new URLSearchParams();
  
  if (market) params.append('market', market);
  if (timeframe) params.append('timeframe', timeframe);
  if (count) params.append('count', count.toString());
  
  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const analyzeMarket = async (symbol: string, timeframe?: string) => {
  let url = API_ENDPOINTS.AI_MARKET_ANALYSIS;
  const params = new URLSearchParams();
  
  params.append('symbol', symbol);
  if (timeframe) params.append('timeframe', timeframe);
  
  const queryString = params.toString();
  url += `?${queryString}`;
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Chat APIs
export const getConversations = async () => {
  // Implement the actual API call to get conversations from the backend
  // For now, returning an empty array until the backend API is implemented
  return [];
};

export const getMessages = async (conversationId: string) => {
  // Implement the actual API call to get messages from the backend
  // For now, returning an empty array until the backend API is implemented
  return [];
};

export const sendChatMessage = async (conversationId: string, text: string) => {
  // Implement the actual API call to send a message to the backend
  // For now, returning a mock response until the backend API is implemented
  return {
    success: true,
    message: "Message sent successfully"
  };
};

export const markMessageRead = async (messageId: string) => {
  // Implement the actual API call to mark a message as read in the backend
  // For now, returning a mock response until the backend API is implemented
  return {
    success: true,
    message: "Message marked as read"
  };
};

export const createNewConversation = async (userId: string, userName: string, userEmail: string) => {
  // Implement the actual API call to create a new conversation in the backend
  // For now, returning a mock response until the backend API is implemented
  return {
    success: true,
    conversation_id: `conv_${Date.now()}`,
    message: "Conversation created successfully"
  };
};
