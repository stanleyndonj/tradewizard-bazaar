// Type Definitions
export interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  role?: string;
  robots_delivered?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Robot {
  id: string;
  name: string;
  description: string;
  type: 'MT5' | 'Binary' | string;
  price: number;
  features: string[];
  image_url?: string;
  imageUrl?: string;
  currency: string;
  category: 'free' | 'paid';
  created_at: string;
  updated_at?: string;
  download_url?: string;
}

export interface RobotRequest {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  request_title?: string;
  description?: string;
  requirements?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'in_progress' | 'delivered';
  budget?: number;
  currency?: string;
  created_at: string;
  updated_at?: string;
  
  // Fields from backend Python schema
  robot_type?: string;
  trading_pairs?: string;
  timeframe?: string;
  risk_level?: number;
  bot_name?: string;
  market?: string;
  stake_amount?: number;
  contract_type?: string;
  duration?: string;
  prediction?: string;
  trading_strategy?: string;
  account_credentials?: string;
  volume?: number;
  order_type?: string;
  stop_loss?: number;
  take_profit?: number;
  entry_rules?: string;
  exit_rules?: string;
  risk_management?: string;
  additional_parameters?: string;
  
  // UI fields
  is_delivered?: boolean;
  delivery_date?: string;
  download_url?: string;
  notes?: string;
  progress?: number;
}

export interface RobotRequestParams {
  title?: string;
  description?: string;
  requirements?: string[];
  budget?: number;
  currency?: string;
  
  // New fields for robot configuration
  robotType?: string;
  tradingPairs?: string;
  timeframe?: string;
  riskLevel?: number;
  botName?: string;
  market?: string;
  stake_amount?: number;
  stakeAmount?: number;
  contract_type?: string;
  contractType?: string;
  duration?: string;
  prediction?: string;
  trading_strategy?: string;
  tradingStrategy?: string;
  account_credentials?: string;
  accountCredentials?: string;
  volume?: number;
  order_type?: string;
  orderType?: string;
  stop_loss?: number;
  stopLoss?: number;
  take_profit?: number;
  takeProfit?: number;
  entry_rules?: string;
  entryRules?: string;
  exit_rules?: string;
  exitRules?: string;
  risk_management?: string;
  riskManagement?: string;
  additional_parameters?: string;
  additionalParameters?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  robot_id: string;
  robot_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  market: string;
  direction: 'BUY' | 'SELL';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  timeframe: string;
  confidence: number;
  strength: 'Strong' | 'Moderate' | 'Weak';
  timestamp: string;
}

export interface MarketAnalysis {
  symbol: string;
  direction: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number;
  analysis_summary: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  market_sentiment: string;
  technical_indicators: {
    rsi: number;
    macd: string;
    moving_averages: {
      sma_50: number;
      sma_200: number;
    }
  };
  timestamp: string;
}

// Mock API functions
export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  console.log('Registering user:', { name, email });
  // Simulate API call
  return {
    id: `user_${Date.now()}`,
    name,
    email,
    is_admin: false,
    robots_delivered: false,
    created_at: new Date().toISOString()
  };
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  console.log('Logging in user:', email);
  // Simulate API call
  // For testing, you can make an admin user with specific email
  const isAdmin = email.includes('admin');
  return {
    id: `user_${Date.now()}`,
    name: email.split('@')[0],
    email,
    is_admin: isAdmin,
    robots_delivered: false,
    created_at: new Date().toISOString()
  };
};

export const logoutUser = async (): Promise<void> => {
  console.log('Logging out user');
  // Simulate API call
  return;
};

export const getCurrentUser = async (): Promise<User> => {
  console.log('Getting current user');
  // Simulate API call
  return {
    id: `user_${Date.now()}`,
    name: 'Current User',
    email: 'user@example.com',
    is_admin: false,
    robots_delivered: false,
    created_at: new Date().toISOString()
  };
};

export const getRobots = async (): Promise<Robot[]> => {
  console.log('Getting robots');
  // Simulate API call
  return [
    {
      id: 'robot1',
      name: 'MT5 Scalper Pro',
      description: 'Advanced scalping robot for MT5',
      type: 'MT5',
      price: 199.99,
      features: ['Automated scalping', '24/7 trading', 'Advanced risk management'],
      currency: 'USD',
      category: 'paid',
      created_at: new Date().toISOString()
    },
    {
      id: 'robot2',
      name: 'Binary Options Helper',
      description: 'AI-powered binary options trading assistant',
      type: 'Binary',
      price: 99.99,
      features: ['Signal alerts', 'Market analysis', 'Win rate tracker'],
      currency: 'USD',
      category: 'paid',
      created_at: new Date().toISOString()
    },
    {
      id: 'robot3',
      name: 'Forex Trend Finder',
      description: 'Free trend identification tool for forex markets',
      type: 'MT5',
      price: 0,
      features: ['Trend detection', 'Basic alerts'],
      currency: 'USD',
      category: 'free',
      created_at: new Date().toISOString()
    }
  ];
};

export const getRobotById = async (id: string): Promise<Robot> => {
  console.log('Getting robot by ID:', id);
  const robots = await getRobots();
  const robot = robots.find(r => r.id === id);
  if (!robot) {
    throw new Error(`Robot with ID ${id} not found`);
  }
  return robot;
};

export const addRobot = async (robotData: Omit<Robot, 'id' | 'created_at'>): Promise<Robot> => {
  console.log('Adding robot:', robotData);
  // Simulate API call
  return {
    ...robotData,
    id: `robot_${Date.now()}`,
    created_at: new Date().toISOString()
  };
};

export const updateRobot = async (robot: Robot): Promise<Robot> => {
  console.log('Updating robot:', robot);
  // Simulate API call
  return {
    ...robot,
    updated_at: new Date().toISOString()
  };
};

export const deleteRobot = async (id: string): Promise<void> => {
  console.log('Deleting robot with ID:', id);
  // Simulate API call
  return;
};

export const getRobotRequests = async (userId: string): Promise<RobotRequest[]> => {
  console.log('Getting robot requests for user:', userId);
  // Simulate API call
  return [
    {
      id: 'request1',
      user_id: userId,
      user_name: 'John Doe',
      user_email: 'john@example.com',
      request_title: 'Custom MT5 EA for Gold',
      description: 'Looking for a custom EA that trades gold during New York session',
      requirements: ['Must use ATR for stop loss', 'Target 1:2 risk-reward ratio'],
      status: 'pending',
      budget: 300,
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

export const getAllRobotRequests = async (): Promise<RobotRequest[]> => {
  console.log('Getting all robot requests');
  // Simulate API call
  return [
    {
      id: 'request1',
      user_id: 'user1',
      user_name: 'John Doe',
      user_email: 'john@example.com',
      request_title: 'Custom MT5 EA for Gold',
      description: 'Looking for a custom EA that trades gold during New York session',
      requirements: ['Must use ATR for stop loss', 'Target 1:2 risk-reward ratio'],
      status: 'pending',
      budget: 300,
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'request2',
      user_id: 'user2',
      user_name: 'Jane Smith',
      user_email: 'jane@example.com',
      request_title: 'Binary Options Signal Tool',
      description: 'Need a tool that can generate signals for binary options',
      requirements: ['At least 70% accuracy', 'Visual alerts', 'Email notifications'],
      status: 'approved',
      budget: 150,
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
};

export const submitRobotRequest = async (params: RobotRequestParams): Promise<RobotRequest> => {
  console.log('Submitting robot request:', params);
  // Simulate API call
  return {
    id: `request_${Date.now()}`,
    user_id: 'current_user_id',
    user_name: 'Current User',
    user_email: 'user@example.com',
    request_title: params.title,
    description: params.description,
    requirements: params.requirements,
    status: 'pending',
    budget: params.budget,
    currency: params.currency,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const updateRobotRequest = async (requestId: string, updates: any): Promise<RobotRequest> => {
  console.log('Updating robot request:', requestId, updates);
  // Simulate API call
  return {
    id: requestId,
    user_id: 'user1',
    user_name: 'John Doe',
    user_email: 'john@example.com',
    request_title: 'Custom MT5 EA for Gold',
    description: 'Looking for a custom EA that trades gold during New York session',
    requirements: ['Must use ATR for stop loss', 'Target 1:2 risk-reward ratio'],
    ...updates,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString() // This would normally not change
  };
};

export const updateRobotRequestStatus = async (requestId: string, updates: any): Promise<RobotRequest> => {
  console.log('Updating robot request status:', requestId, updates);
  // Simulate API call
  return {
    id: requestId,
    user_id: 'user1',
    user_name: 'John Doe',
    user_email: 'john@example.com',
    request_title: 'Custom MT5 EA for Gold',
    robot_type: 'MT5',
    trading_pairs: 'XAUUSD',
    timeframe: '1h',
    risk_level: 3,
    description: 'Looking for a custom EA that trades gold during New York session',
    requirements: ['Must use ATR for stop loss', 'Target 1:2 risk-reward ratio'],
    status: updates.status || 'pending',
    is_delivered: updates.is_delivered || false,
    notes: updates.notes || '',
    download_url: updates.download_url || '',
    progress: updates.progress || 0,
    budget: 300,
    currency: 'USD',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString() // This would normally not change
  };
};

export const getUserPurchases = async (userId: string): Promise<Purchase[]> => {
  console.log('Getting purchases for user:', userId);
  // Simulate API call
  return [
    {
      id: 'purchase1',
      user_id: userId,
      robot_id: 'robot1',
      robot_name: 'MT5 Scalper Pro',
      amount: 199.99,
      currency: 'USD',
      payment_method: 'credit_card',
      status: 'completed',
      created_at: new Date().toISOString()
    }
  ];
};

export const makePurchase = async (
  userId: string,
  robotId: string,
  amount: number,
  currency: string,
  paymentMethod: string
): Promise<Purchase> => {
  console.log('Making purchase:', { userId, robotId, amount, currency, paymentMethod });
  // Simulate API call
  return {
    id: `purchase_${Date.now()}`,
    user_id: userId,
    robot_id: robotId,
    robot_name: 'Some Robot', // In real implementation, would fetch robot name
    amount,
    currency,
    payment_method: paymentMethod,
    status: 'completed',
    created_at: new Date().toISOString()
  };
};

export const purchaseRobot = async (
  userId: string,
  robotId: string,
  amount: number,
  currency: string,
  paymentMethod: string
): Promise<Purchase> => {
  console.log('Purchasing robot:', { userId, robotId, amount, currency, paymentMethod });
  // Simulate API call - delegate to makePurchase
  return makePurchase(userId, robotId, amount, currency, paymentMethod);
};

export const initiateMpesaPayment = async (
  phone: string,
  amount: number,
  robotId: string
): Promise<any> => {
  console.log('Initiating M-Pesa payment:', { phone, amount, robotId });
  // Simulate API call
  return {
    checkoutRequestId: `mpesa_${Date.now()}`,
    responseCode: '0',
    responseDescription: 'Success. Request accepted for processing',
    customerMessage: 'Please enter your M-Pesa PIN to complete the transaction'
  };
};

export const verifyMpesaPayment = async (checkoutRequestId: string): Promise<boolean> => {
  console.log('Verifying M-Pesa payment:', checkoutRequestId);
  // Simulate API call - in real app would check backend
  return true; // Simulating successful payment
};

export const verifyPayment = async (paymentId: string): Promise<boolean> => {
  console.log('Verifying payment:', paymentId);
  // Simulate API call - in real app would check backend
  return true; // Simulating successful payment
};

export const getTradingSignals = async (
  market: string = 'forex',
  timeframe: string = '1h',
  count: number = 10
): Promise<TradingSignal[]> => {
  console.log('Getting trading signals:', { market, timeframe, count });
  // Simulate API call - in real app would fetch from AI service
  return [
    {
      id: 'signal1',
      symbol: 'EURUSD',
      market: 'forex',
      direction: 'BUY',
      entry_price: 1.0950,
      stop_loss: 1.0900,
      take_profit: 1.1050,
      timeframe: '1h',
      confidence: 85,
      strength: 'Strong',
      timestamp: new Date().toISOString()
    },
    {
      id: 'signal2',
      symbol: 'BTCUSD',
      market: 'crypto',
      direction: 'SELL',
      entry_price: 55000,
      stop_loss: 56000,
      take_profit: 53000,
      timeframe: '4h',
      confidence: 70,
      strength: 'Moderate',
      timestamp: new Date().toISOString()
    }
  ];
};

export const analyzeMarket = async (
  symbol: string,
  timeframe: string = '1h'
): Promise<MarketAnalysis> => {
  console.log('Analyzing market:', { symbol, timeframe });
  // Simulate API call - in real app would fetch from AI service
  return {
    symbol,
    direction: 'BUY',
    confidence: 75,
    analysis_summary: 'Bullish momentum with potential for continuation. RSI showing oversold conditions and price is above key moving averages.',
    entry_price: symbol.includes('BTC') ? 54000 : 1.0950,
    stop_loss: symbol.includes('BTC') ? 53000 : 1.0900,
    take_profit: symbol.includes('BTC') ? 56000 : 1.1050,
    market_sentiment: 'Bullish',
    technical_indicators: {
      rsi: 65,
      macd: 'Bullish Crossover',
      moving_averages: {
        sma_50: symbol.includes('BTC') ? 52000 : 1.0900,
        sma_200: symbol.includes('BTC') ? 48000 : 1.0800
      }
    },
    timestamp: new Date().toISOString()
  };
};

export const getSubscriptionPrices = async (): Promise<any> => {
  console.log('Getting subscription prices');
  // Simulate API call
  return {
    basic: { monthly: 9.99, yearly: 99.99 },
    premium: { monthly: 19.99, yearly: 199.99 },
    professional: { monthly: 49.99, yearly: 499.99 }
  };
};

export const updateSubscriptionPrice = async (tier: string, period: string, price: number): Promise<any> => {
  console.log('Updating subscription price:', { tier, period, price });
  // Simulate API call
  return { success: true, message: `Updated ${tier} ${period} price to ${price}` };
};

export const getUsers = async (): Promise<User[]> => {
  console.log('Getting users');
  // Simulate API call
  return [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      is_admin: false,
      role: 'customer',
      created_at: new Date().toISOString()
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      is_admin: false,
      role: 'customer',
      created_at: new Date().toISOString()
    },
    {
      id: 'admin1',
      name: 'Admin User',
      email: 'admin@example.com',
      is_admin: true,
      role: 'admin',
      created_at: new Date().toISOString()
    }
  ];
};
