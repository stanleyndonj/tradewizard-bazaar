
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

// Types for robot management
export interface Robot {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'MT5' | 'Binary' | string;
  category: 'free' | 'paid';
  features: string[];
  imageUrl: string;
  image_url?: string;
  download_url?: string;
  created_at: string;
  updated_at?: string;
}

// Types for robot requests
export interface RobotRequest {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  type: 'MT5' | 'Binary';
  created_at: string;
  updated_at?: string;
  
  // Fields for request details
  robot_type?: string;
  trading_pairs?: string;
  timeframe?: string;
  risk_level?: string;
  bot_name?: string;
  market?: string;
  trading_strategy?: string;
  volume?: string;
  order_type?: string;
  stop_loss?: string;
  take_profit?: string;
  stake_amount?: string;
  contract_type?: string;
  duration?: string;
  prediction?: string;
  currency?: string;
  
  // Fields for delivery tracking
  is_delivered?: boolean;
  delivery_date?: string;
  download_url?: string;
  progress?: number;
  notes?: string;
}

// Types for purchases
export interface Purchase {
  id: string;
  user_id: string;
  robot_id: string;
  robot_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

// Types for request parameters
export interface RobotRequestParams {
  userId: string;
  type: 'MT5' | 'Binary';
  tradingPairs?: string;
  timeframe?: string;
  riskLevel?: string;
  botName?: string;
  market?: string;
  tradingStrategy?: string;
  volume?: string;
  orderType?: string;
  stopLoss?: string;
  takeProfit?: string;
  stakeAmount?: string;
  contractType?: string;
  duration?: string;
  prediction?: string;
  accountCredentials?: {
    username: string;
    password: string;
    server?: string;
  };
}

// Types for AI trading signals
export interface TradingSignal {
  id: string;
  symbol: string;
  direction: 'buy' | 'sell';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  timeframe: string;
  confidence: number;
  created_at: string;
  expires_at: string;
  status: 'active' | 'closed' | 'expired';
  result?: 'win' | 'loss' | null;
  pip_gain?: number;
  profit_loss?: number;
  market?: string;
  timestamp?: string;
  strength?: number;
}

// Market Analysis interface
export interface MarketAnalysis {
  symbol: string;
  timeframe: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  resistance_levels: number[];
  support_levels: number[];
  indicators: {
    rsi: number;
    macd: {
      histogram: number;
      signal: number;
      line: number;
    };
    moving_averages: {
      sma_20: number;
      ema_50: number;
      sma_200: number;
    };
  };
  recommendation: string;
  summary: string;
  next_price_target?: number;
  stop_loss_suggestion?: number;
}

// Mock API functions for backend operations
export function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  // Implementation would call the backend API
  return Promise.resolve({
    user: {
      id: '1',
      name: 'Admin User',
      email: email,
      is_admin: true,
      created_at: new Date().toISOString(),
    },
    token: 'mock-jwt-token',
  });
}

export function registerUser(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  // Implementation would call the backend API
  return Promise.resolve({
    user: {
      id: '1',
      name: name,
      email: email,
      is_admin: false,
      created_at: new Date().toISOString(),
    },
    token: 'mock-jwt-token',
  });
}

export function getCurrentUser(): Promise<User> {
  // Implementation would call the backend API
  return Promise.resolve({
    id: '1',
    name: 'Current User',
    email: 'user@example.com',
    is_admin: true,
    created_at: new Date().toISOString(),
  });
}

export function logoutUser(): Promise<void> {
  // Implementation would call the backend API
  return Promise.resolve();
}

export function getUsers(): Promise<User[]> {
  // Implementation would call the backend API
  return Promise.resolve([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      is_admin: true,
      role: 'admin',
      has_requested_robot: false,
      robots_delivered: true,
      created_at: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Regular User',
      email: 'user@example.com',
      is_admin: false,
      role: 'user',
      has_requested_robot: true,
      robots_delivered: true,
      created_at: '2023-01-02T00:00:00.000Z',
    },
  ]);
}

export function submitRobotRequest(params: RobotRequestParams): Promise<RobotRequest> {
  // Implementation would call the backend API
  return Promise.resolve({
    id: '1',
    user_id: params.userId,
    status: 'pending',
    type: params.type,
    created_at: new Date().toISOString(),
    robot_type: params.type,
    trading_pairs: params.tradingPairs,
    timeframe: params.timeframe,
    risk_level: params.riskLevel,
    bot_name: params.botName,
    market: params.market,
    trading_strategy: params.tradingStrategy,
    volume: params.volume,
    order_type: params.orderType,
    stop_loss: params.stopLoss,
    take_profit: params.takeProfit,
    stake_amount: params.stakeAmount,
    contract_type: params.contractType,
    duration: params.duration,
    prediction: params.prediction,
  });
}

export function getRobotRequests(userId: string): Promise<RobotRequest[]> {
  // Implementation would call the backend API
  return Promise.resolve([
    {
      id: '1',
      user_id: userId,
      status: 'pending',
      type: 'MT5',
      created_at: '2023-03-01T00:00:00.000Z',
      robot_type: 'MT5',
      trading_pairs: 'EURUSD',
      timeframe: 'H1',
      risk_level: 'Medium',
      progress: 20,
    },
    {
      id: '2',
      user_id: userId,
      status: 'in_progress',
      type: 'Binary',
      created_at: '2023-03-05T00:00:00.000Z',
      robot_type: 'Binary',
      market: 'Forex',
      trading_strategy: 'Support/Resistance',
      progress: 60,
    },
  ]);
}

export function getAllRobotRequests(): Promise<RobotRequest[]> {
  // Implementation would call the backend API
  return Promise.resolve([
    {
      id: '1',
      user_id: '2',
      user_name: 'John Doe',
      user_email: 'john@example.com',
      status: 'pending',
      type: 'MT5',
      created_at: '2023-03-01T00:00:00.000Z',
      robot_type: 'MT5',
      trading_pairs: 'EURUSD',
      timeframe: 'H1',
      risk_level: 'Medium',
      progress: 20,
    },
    {
      id: '2',
      user_id: '3',
      user_name: 'Jane Smith',
      user_email: 'jane@example.com',
      status: 'in_progress',
      type: 'Binary',
      created_at: '2023-03-05T00:00:00.000Z',
      robot_type: 'Binary',
      market: 'Forex',
      trading_strategy: 'Support/Resistance',
      progress: 60,
    },
  ]);
}

export function updateRobotRequest(requestId: string, updateData: Partial<RobotRequest>): Promise<RobotRequest> {
  // Implementation would call the backend API
  return Promise.resolve({
    id: requestId,
    user_id: '2',
    status: updateData.status || 'in_progress',
    type: 'MT5',
    created_at: '2023-03-01T00:00:00.000Z',
    updated_at: new Date().toISOString(),
    robot_type: 'MT5',
    trading_pairs: 'EURUSD',
    timeframe: 'H1',
    risk_level: 'Medium',
    progress: updateData.progress || 50,
    notes: updateData.notes || '',
    is_delivered: updateData.is_delivered || false,
    download_url: updateData.download_url || '',
  });
}

export function getRobots(): Promise<Robot[]> {
  // Implementation would call the backend API
  return Promise.resolve([
    {
      id: '1',
      name: 'MT5 Pro Scalper',
      description: 'Advanced scalping robot for MT5 platform',
      price: 199,
      currency: 'USD',
      type: 'MT5',
      category: 'paid',
      features: ['Scalping strategy', 'Low drawdown', 'Works on all pairs'],
      imageUrl: '/placeholder.svg',
      created_at: '2023-01-10T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Binary Options Master',
      description: 'High-precision binary options robot',
      price: 149,
      currency: 'USD',
      type: 'Binary',
      category: 'paid',
      features: ['60-second trades', 'Signal filtering', 'Auto risk management'],
      imageUrl: '/placeholder.svg',
      created_at: '2023-01-15T00:00:00.000Z',
    },
    {
      id: '3',
      name: 'MT5 Trend Follower',
      description: 'Free trend following robot for MT5',
      price: 0,
      currency: 'USD',
      type: 'MT5',
      category: 'free',
      features: ['Trend detection', 'Simple interface', 'Email alerts'],
      imageUrl: '/placeholder.svg',
      created_at: '2023-01-20T00:00:00.000Z',
    },
  ]);
}

export function getRobotById(id: string): Promise<Robot> {
  // Implementation would call the backend API
  return Promise.resolve({
    id,
    name: 'MT5 Pro Scalper',
    description: 'Advanced scalping robot for MT5 platform',
    price: 199,
    currency: 'USD',
    type: 'MT5',
    category: 'paid',
    features: ['Scalping strategy', 'Low drawdown', 'Works on all pairs'],
    imageUrl: '/placeholder.svg',
    created_at: '2023-01-10T00:00:00.000Z',
  });
}

export function addRobot(robot: Omit<Robot, 'id' | 'created_at'>): Promise<Robot> {
  // Implementation would call the backend API
  return Promise.resolve({
    ...robot,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
  });
}

export function updateRobot(robot: Robot): Promise<Robot> {
  // Implementation would call the backend API
  return Promise.resolve({
    ...robot,
    updated_at: new Date().toISOString(),
  });
}

export function deleteRobot(robotId: string): Promise<{ success: boolean }> {
  // Implementation would call the backend API
  return Promise.resolve({ success: true });
}

export function makePurchase(userId: string, robotId: string, amount: number, currency: string, paymentMethod: string): Promise<Purchase> {
  // Implementation would call the backend API
  return Promise.resolve({
    id: Math.random().toString(36).substr(2, 9),
    user_id: userId,
    robot_id: robotId,
    robot_name: 'MT5 Pro Scalper',
    amount: amount,
    currency: currency,
    payment_method: paymentMethod,
    status: 'completed',
    created_at: new Date().toISOString(),
  });
}

export function getUserPurchases(userId: string): Promise<Purchase[]> {
  // Implementation would call the backend API
  return Promise.resolve([
    {
      id: '1',
      user_id: userId,
      robot_id: '1',
      robot_name: 'MT5 Pro Scalper',
      amount: 199,
      currency: 'USD',
      payment_method: 'card',
      status: 'completed',
      created_at: '2023-02-15T00:00:00.000Z',
    },
    {
      id: '2',
      user_id: userId,
      robot_id: '2',
      robot_name: 'Binary Options Master',
      amount: 149,
      currency: 'USD',
      payment_method: 'paypal',
      status: 'completed',
      created_at: '2023-02-20T00:00:00.000Z',
    },
  ]);
}

export function initiateMpesaPayment(phone: string, amount: number, robotId: string): Promise<any> {
  // Implementation would call the backend API
  return Promise.resolve({
    checkoutRequestId: 'ws_CO_123456789',
    responseCode: '0',
    responseDescription: 'Success. Request accepted for processing',
    customerMessage: 'Success. Request accepted for processing'
  });
}

export function verifyMpesaPayment(checkoutRequestId: string): Promise<boolean> {
  // Implementation would call the backend API
  return Promise.resolve(true);
}

export function getTradingSignals(market?: string, timeframe?: string, count?: number): Promise<TradingSignal[]> {
  // Implementation would call the backend API
  return Promise.resolve([
    {
      id: '1',
      symbol: 'EURUSD',
      direction: 'buy',
      entry_price: 1.0850,
      stop_loss: 1.0800,
      take_profit: 1.0950,
      timeframe: 'H4',
      confidence: 85,
      created_at: '2023-04-01T00:00:00.000Z',
      expires_at: '2023-04-02T00:00:00.000Z',
      status: 'active',
      market: 'forex',
      timestamp: '2023-04-01T00:00:00.000Z',
      strength: 8
    },
    {
      id: '2',
      symbol: 'GBPJPY',
      direction: 'sell',
      entry_price: 155.50,
      stop_loss: 156.20,
      take_profit: 154.00,
      timeframe: 'H1',
      confidence: 75,
      created_at: '2023-04-01T06:00:00.000Z',
      expires_at: '2023-04-02T06:00:00.000Z',
      status: 'active',
      market: 'forex',
      timestamp: '2023-04-01T06:00:00.000Z',
      strength: 7
    },
    {
      id: '3',
      symbol: 'XAUUSD',
      direction: 'buy',
      entry_price: 1910.25,
      stop_loss: 1900.00,
      take_profit: 1940.50,
      timeframe: 'D1',
      confidence: 90,
      created_at: '2023-03-30T00:00:00.000Z',
      expires_at: '2023-04-06T00:00:00.000Z',
      status: 'closed',
      result: 'win',
      pip_gain: 303,
      profit_loss: 1515,
      market: 'commodities',
      timestamp: '2023-03-30T00:00:00.000Z',
      strength: 9
    },
  ]);
}

export function analyzeMarket(symbol: string, timeframe?: string): Promise<MarketAnalysis> {
  // Implementation would call the backend API
  return Promise.resolve({
    symbol: symbol,
    timeframe: timeframe || 'H1',
    trend: 'bullish',
    strength: 7,
    resistance_levels: [1.1050, 1.1100, 1.1150],
    support_levels: [1.0950, 1.0900, 1.0850],
    indicators: {
      rsi: 58,
      macd: {
        histogram: 0.0012,
        signal: 0.0008,
        line: 0.0020
      },
      moving_averages: {
        sma_20: 1.0980,
        ema_50: 1.0950,
        sma_200: 1.0900
      }
    },
    recommendation: 'Buy',
    summary: 'The market shows bullish momentum with strong support at 1.0950.',
    next_price_target: 1.1050,
    stop_loss_suggestion: 1.0920
  });
}

export function getAIResponse(message: string): Promise<string> {
  // Implementation would call the backend API
  return Promise.resolve("I'm the AI trading assistant. Based on your query about trading strategies, I recommend considering multiple timeframe analysis for better confirmation of trends. Would you like me to explain more about this approach?");
}
