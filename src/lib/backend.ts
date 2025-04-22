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
  type?: string;
  robot_type: string; // Ensure this matches the backend model
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

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
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
  status?: string; // Add missing property
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
  next_price_target?: number; // Add missing property
  stop_loss_suggestion?: number; // Add missing property
  summary?: string; // Add missing property
}

// Add chat types
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
  userEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// Interface for subscription plan
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  created_at: string;
  updated_at?: string;
}

// Authentication APIs
export const registerUser = async (name: string, email: string, password: string) => {
  try {
    console.log(`Sending registration request to: ${API_ENDPOINTS.REGISTER}`);
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.detail || response.statusText;
      throw new Error(errorMessage);
    }

    return handleApiResponse(response);
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error; // Re-throw for handling in calling component
  }
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await handleApiResponse(response);

  // Store the token in localStorage for subsequent API calls
  if (data && data.access_token) {
    localStorage.setItem('auth_token', data.access_token);
  }

  return data;
};

export const logoutUser = async () => {
  // Remove token from localStorage
  localStorage.removeItem('auth_token');

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
export const initiateMpesaPayment = async (phone: string, amount: number, itemId: string, paymentType: 'purchase' | 'subscription' = 'purchase') => {
  const response = await fetch(API_ENDPOINTS.MPESA_INITIATE, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      phone_number: phone, 
      amount, 
      item_id: itemId,
      payment_type: paymentType
    }),
  });

  return handleApiResponse(response);
};

export const verifyMpesaPayment = async (transactionId: string) => {
  const response = await fetch(API_ENDPOINTS.MPESA_VERIFY.replace('{transaction_id}', transactionId), {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    }
  });

  const result = await handleApiResponse(response);
  return result.success;
};

// Card Payment APIs
export const processCardPayment = async (cardDetails: any, amount: number, currency: string, itemId: string, paymentType: 'purchase' | 'subscription' = 'purchase') => {
  const response = await fetch(API_ENDPOINTS.CARD_PAYMENT_PROCESS, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      card_details: cardDetails,
      amount,
      currency,
      item_id: itemId,
      payment_type: paymentType
    }),
  });

  return handleApiResponse(response);
};

export const verifyCardPayment = async (paymentId: string) => {
  const response = await fetch(API_ENDPOINTS.CARD_PAYMENT_VERIFY.replace('{payment_id}', paymentId), {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    }
  });

  return handleApiResponse(response);
};

// User Management APIs
export const getUsers = async () => {
  const response = await fetch(API_ENDPOINTS.USERS, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// AI Trading Signals APIs
export const getSubscriptionPlans = async () => {
  try {
    console.log('Fetching subscription plans from:', API_ENDPOINTS.SUBSCRIPTION_PLANS);
    const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_PLANS, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error('Error response from subscription plans API:', response.status, response.statusText);
      throw new Error(`Failed to fetch subscription plans: ${response.status} ${response.statusText}`);
    }

    const data = await handleApiResponse(response);
    console.log('Received subscription plans data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    // Return default plans as fallback
    return [
      {
        id: 'basic-monthly',
        name: 'Basic AI Trading Signals',
        price: 29.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Access to AI trading signals',
          'Basic market analysis',
          'Daily signal updates',
          'Email notifications'
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 'premium-monthly',
        name: 'Premium AI Trading Signals',
        price: 99.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'All Basic features',
          'Advanced market analysis',
          'Real-time signal updates',
          'Direct AI chat support',
          'Custom alerts and notifications'
        ],
        created_at: new Date().toISOString()
      }
    ];
  }
};

export const getSubscriptionPlanById = async (planId: string) => {
  const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_PLAN_BY_ID(planId), {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const createSubscriptionPlan = async (plan: Omit<SubscriptionPlan, 'id' | 'created_at'>) => {
  const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_PLANS, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
  });

  return handleApiResponse(response);
};

export const updateSubscriptionPrice = async (planId: string, price: number) => {
  console.log(`Updating plan ${planId} with price ${price}`);
  
  if (!planId) {
    console.error('Invalid plan ID provided');
    throw new Error('Invalid plan ID provided');
  }
  
  if (isNaN(price) || price <= 0) {
    console.error('Invalid price value:', price);
    throw new Error('Price must be a positive number');
  }
  
  try {
    // Format price to 2 decimal places for consistency
    const formattedPrice = parseFloat(price.toFixed(2));
    console.log(`Sending formatted price: ${formattedPrice}`);
    
    const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_PLAN_BY_ID(planId), {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ price: formattedPrice }),
    });

    // Log full request details for debugging
    console.log('Request details:', {
      url: API_ENDPOINTS.SUBSCRIPTION_PLAN_BY_ID(planId),
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ price: formattedPrice }),
    });

    if (!response.ok) {
      console.error('Error updating subscription price:', response.status, response.statusText);
      
      try {
        // Try to parse error response as JSON first
        const errorJson = await response.json();
        console.error('Error response JSON:', errorJson);
        throw new Error(errorJson.detail || `Failed to update subscription price: ${response.status} ${response.statusText}`);
      } catch (parseError) {
        // Fall back to text if not JSON
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error(`Failed to update subscription price: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Price update successful, response:', data);
    return true;
  } catch (error) {
    console.error('Error updating subscription price:', error);
    throw error;
  }
};

// Alias for consistency with context function naming
export const updateSubscriptionPlanPrice = updateSubscriptionPrice;

export const deleteSubscriptionPlan = async (planId: string) => {
  const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_PLAN_BY_ID(planId), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const createSubscription = async (planId: string, amount: number, currency: string, paymentMethod: string) => {
  const response = await fetch(API_ENDPOINTS.CREATE_SUBSCRIPTION, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: planId,
      amount,
      currency,
      payment_method: paymentMethod,
    }),
  });

  return handleApiResponse(response);
};

export const getUserSubscriptions = async () => {
  const response = await fetch(API_ENDPOINTS.USER_SUBSCRIPTIONS, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const getUserActiveSubscriptions = async () => {
  const response = await fetch(API_ENDPOINTS.USER_ACTIVE_SUBSCRIPTIONS, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const checkSubscription = async (planId: string) => {
  const response = await fetch(API_ENDPOINTS.CHECK_SUBSCRIPTION(planId), {
    headers: getAuthHeaders(),
  });

  const result = await handleApiResponse(response);
  return result.has_subscription;
};

export const cancelSubscription = async (subscriptionId: string) => {
  const response = await fetch(API_ENDPOINTS.CANCEL_SUBSCRIPTION(subscriptionId), {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

// Chat APIs
export const getConversations = async () => {
  const response = await fetch(API_ENDPOINTS.CHAT_CONVERSATIONS, {
    headers: getAuthHeaders(),
  });

  const conversations = await handleApiResponse(response);

  // Format the conversations to match the expected interface
  return conversations.map((conversation: any) => ({
    id: conversation.id,
    userId: conversation.user_id,
    userName: conversation.user_name,
    userEmail: conversation.user_email,
    lastMessage: conversation.last_message || '',
    lastMessageTime: conversation.last_message_time,
    unreadCount: 0 // This will be calculated in the frontend context
  }));
};

export const getMessages = async (conversationId: string) => {
  const response = await fetch(API_ENDPOINTS.CHAT_MESSAGES(conversationId), {
    headers: getAuthHeaders(),
  });

  const messages = await handleApiResponse(response);

  // Format the messages to match the expected interface
  return messages.map((message: any) => ({
    id: message.id,
    conversationId: message.conversation_id,
    sender: message.sender,
    senderId: message.sender_id,
    text: message.text,
    timestamp: message.timestamp,
    read: message.read
  }));
};

export const sendChatMessage = async (conversationId: string, text: string) => {
  const response = await fetch(API_ENDPOINTS.CHAT_MESSAGES(conversationId), {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  return handleApiResponse(response);
};

export const markMessageRead = async (messageId: string) => {
  const response = await fetch(API_ENDPOINTS.CHAT_MARK_READ(messageId), {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const createNewConversation = async (userId: string, userName: string, userEmail: string) => {
  const response = await fetch(API_ENDPOINTS.CHAT_CONVERSATIONS, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      user_name: userName,
      user_email: userEmail
    }),
  });

  return handleApiResponse(response);
};

export const getUnreadMessageCount = async () => {
  const response = await fetch(API_ENDPOINTS.CHAT_UNREAD_COUNT, {
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
};

export const getTradingSignals = async (market?: string, timeframe?: string, count?: number) => {
  let url = API_ENDPOINTS.AI_TRADING_SIGNALS;
  const params = new URLSearchParams();

  if (market) params.append('market', market);
  if (timeframe) params.append('timeframe', timeframe);
  if (count) params.append('count', count.toString());

  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;

  console.log('Fetching trading signals from:', url);

  try {
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error('Error response from trading signals API:', response.status, response.statusText);
      throw new Error(`Failed to fetch trading signals: ${response.status} ${response.statusText}`);
    }

    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching trading signals:', error);
    // Return mock signals as fallback
    return generateMockSignals(market || 'forex', timeframe || '1h', count || 10);
  }
};

// Add a helper function to generate mock signals as fallback
const generateMockSignals = (market: string, timeframe: string, count: number) => {
  const signals = [];
  const directions = ["buy", "sell"];
  const symbols = market === 'forex' 
    ? ["EUR/USD", "GBP/USD", "USD/JPY"] 
    : market === 'crypto' 
      ? ["BTC/USD", "ETH/USD", "XRP/USD"] 
      : ["AAPL", "MSFT", "AMZN"];

  for (let i = 0; i < count; i++) {
    const now = new Date();
    now.setHours(now.getHours() - i * 2);

    signals.push({
      id: `mock-${i}`,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      direction: directions[Math.floor(Math.random() * directions.length)],
      entry_price: Math.round(Math.random() * 1000 + 100),
      stop_loss: Math.round(Math.random() * 50 + 90),
      take_profit: Math.round(Math.random() * 50 + 110),
      timeframe: timeframe,
      market: market,
      confidence: Math.random() * 0.3 + 0.65,
      strength: Math.random() * 0.4 + 0.6,
      timestamp: now.toISOString(),
      created_at: now.toISOString(),
      status: ["active", "completed", "pending"][Math.floor(Math.random() * 3)]
    });
  }

  return signals;
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