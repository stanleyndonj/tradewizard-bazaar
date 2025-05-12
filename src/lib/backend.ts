export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
}

export interface Robot {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  robot_id: string;
  payment_method: string;
  created_at: string;
}

export interface TradingSignal {
  id: string;
  market: string;
  timeframe: string;
  signal_type: string;
  strength: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
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
  next_price_target: number;
  stop_loss_suggestion: number;
  summary: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  created_at: string;
}

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

export interface RobotRequestParams {
  robot_type: string;
  trading_strategy: string;
  account_credentials?: string;
  volume?: string;
  order_type?: string;
  stop_loss?: string;
  take_profit?: string;
  entry_rules?: string;
  exit_rules?: string;
  risk_management?: string;
  additional_parameters?: string;
  trading_pairs?: string;
  timeframe?: string;
  risk_level?: string;
  // Binary robot specific fields
  platform?: string;
  risk_per_trade?: string;
  instrument_type?: string;
  specific_instruments?: string;
  indicators?: string;
  exit_strategy?: string;
  trading_hours?: string;
  additional_requirements?: string;
}

export interface RobotRequest {
  id: string;
  user_id: string;
  robot_type: string;
  created_at: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  // Add other fields as necessary
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}
