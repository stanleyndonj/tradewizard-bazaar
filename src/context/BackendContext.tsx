
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import API_ENDPOINTS, { getAuthHeaders, handleApiResponse } from '../lib/apiConfig';
import { User, Robot, Purchase, TradingSignal, MarketAnalysis, SubscriptionPlan, ChatMessage, Conversation, RobotRequest, RobotRequestParams } from '../lib/backend';

// Context interface
interface BackendContextType {
  // User state
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  
  // Core data
  robots: Robot[];
  purchases: Purchase[];
  tradingSignals: TradingSignal[];
  marketAnalyses: MarketAnalysis[];
  subscriptionPlans: SubscriptionPlan[];
  robotRequests: RobotRequest[];
  notifications: any[];
  unreadNotificationCount: number;
  
  // Authentication
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>; // Alias for signInWithEmailPassword
  register: (name: string, email: string, password: string) => Promise<void>; // Alias for signUpWithEmailPassword
  logoutUser: () => Promise<void>; // Alias for signOut
  
  // Robot functions
  loadRobots: () => Promise<void>;
  getRobots: () => Promise<Robot[]>;
  getRobotById: (id: string) => Robot | undefined;
  addRobot: (robot: Omit<Robot, 'id' | 'created_at'>) => Promise<Robot>;
  updateRobot: (id: string, robot: Partial<Robot>) => Promise<Robot>;
  deleteRobot: (id: string) => Promise<boolean>;
  purchaseRobot: (robotId: string, paymentMethod: string) => Promise<any>;
  
  // Purchase functions
  loadPurchases: () => Promise<void>;
  getPurchases: () => Promise<Purchase[]>;
  
  // Robot requests
  submitRobotRequest: (requestData: RobotRequestParams) => Promise<any>;
  getUserRobotRequests: () => Promise<RobotRequest[]>;
  fetchAllRobotRequests: () => Promise<RobotRequest[]>;
  updateRobotRequest: (requestId: string, updateData: Partial<RobotRequest>) => Promise<RobotRequest>;
  
  // Trading signals functions
  loadTradingSignals: (market?: string, timeframe?: string, count?: number) => Promise<void>;
  getTradingSignals: (market?: string, timeframe?: string, count?: number) => Promise<TradingSignal[]>;
  
  // Market analyses functions
  loadMarketAnalyses: () => Promise<void>;
  analyzeMarket: (symbol: string, timeframe: string) => Promise<MarketAnalysis>;
  
  // Subscription plans functions
  loadSubscriptionPlans: () => Promise<void>;
  getSubscriptionPlans: () => Promise<SubscriptionPlan[]>;
  getSubscriptionPrices: () => Promise<any[]>;
  updateSubscriptionPrice: (planId: string, price: number) => Promise<boolean>;
  updateSubscriptionPlanPrice: (planId: string, price: number) => Promise<boolean>;
  createSubscription: (planId: string, amount: number, currency: string, paymentMethod: string) => Promise<any>;
  subscribeToPlan: (planId: string, paymentMethod: string) => Promise<any>;
  getUserSubscriptions: () => Promise<any[]>;
  getUserActiveSubscriptions: () => Promise<any[]>;
  checkSubscription: (planId: string) => Promise<boolean>;
  cancelSubscription: (subscriptionId: string) => Promise<boolean>;
  
  // Payment processing
  processCardPayment: (paymentDetails: any) => Promise<any>;
  verifyCardPayment: (paymentId: string) => Promise<any>;
  initiateMpesaPayment: (paymentDetails: any) => Promise<any>;
  verifyPayment: (transactionId: string) => Promise<any>;
  
  // Users management
  getUsers: () => Promise<User[]>;
  
  // Notifications
  loadNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  
  // Chat-related state and functions
  conversations: Conversation[];
  chatMessages: Record<string, ChatMessage[]>;
  currentConversation: Conversation | null;
  setCurrentConversationId: (id: string) => void;
  loadConversations: () => Promise<void>;
  getConversations: () => Promise<void>;
  getMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  createNewConversation: (userId: string, userName: string, userEmail: string) => Promise<Conversation>;
  createConversation: (userId: string, userName: string, userEmail: string) => Promise<Conversation>;
  getUnreadMessageCount: () => Promise<number>;
}

const BackendContext = createContext<BackendContextType>({} as BackendContextType);

export const useBackend = () => useContext(BackendContext);

export const BackendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  const [marketAnalyses, setMarketAnalyses] = useState<MarketAnalysis[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const isLoggedIn = !!user;
  const isAdmin = isLoggedIn && (user?.is_admin || false);
  
  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CURRENT_USER, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('auth_token');
          setUser(null);
          return;
        }
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  // Authentication functions
  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to sign in');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      
      // Fetch user data after successful login
      await fetchCurrentUser();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for signInWithEmailPassword
  const login = signInWithEmailPassword;

  const signUpWithEmailPassword = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create account');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      
      // Fetch user data after successful registration
      await fetchCurrentUser();
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for signUpWithEmailPassword
  const register = signUpWithEmailPassword;

  const signOut = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      // Clear local storage and state regardless of response
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Clear local storage and state even if API call fails
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  // Alias for signOut
  const logoutUser = signOut;

  // Robot functions
  const loadRobots = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.ROBOTS, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch robots');
      }

      const data = await response.json();
      setRobots(data);
    } catch (error) {
      console.error('Error loading robots:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getRobots = async () => {
    if (robots.length === 0) {
      await loadRobots();
    }
    return robots;
  };

  const getRobotById = (id: string) => {
    return robots.find(robot => robot.id === id);
  };

  const addRobot = async (robotData: Omit<Robot, 'id' | 'created_at'>) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.ROBOTS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(robotData),
      });

      if (!response.ok) {
        throw new Error('Failed to add robot');
      }

      const newRobot = await response.json();
      setRobots(prevRobots => [...prevRobots, newRobot]);
      return newRobot;
    } catch (error) {
      console.error('Error adding robot:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRobot = async (id: string, robotData: Partial<Robot>) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.ROBOT_BY_ID(id), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(robotData),
      });

      if (!response.ok) {
        throw new Error('Failed to update robot');
      }

      const updatedRobot = await response.json();
      setRobots(prevRobots => 
        prevRobots.map(robot => robot.id === id ? updatedRobot : robot)
      );
      return updatedRobot;
    } catch (error) {
      console.error('Error updating robot:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRobot = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.ROBOT_BY_ID(id), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete robot');
      }

      setRobots(prevRobots => prevRobots.filter(robot => robot.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting robot:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Purchase functions
  const loadPurchases = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.USER_PURCHASES(user.id), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }

      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      console.error('Error loading purchases:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getPurchases = async () => {
    if (purchases.length === 0) {
      await loadPurchases();
    }
    return purchases;
  };

  const purchaseRobot = async (robotId: string, paymentMethod: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.PURCHASES, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ robot_id: robotId, payment_method: paymentMethod }),
      });

      if (!response.ok) {
        throw new Error('Failed to purchase robot');
      }

      const purchaseData = await response.json();
      await loadPurchases(); // Reload purchases
      return purchaseData;
    } catch (error) {
      console.error('Error purchasing robot:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Robot request functions
  const submitRobotRequest = async (requestData: RobotRequestParams) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.ROBOT_REQUESTS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit robot request');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting robot request:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserRobotRequests = async () => {
    if (!user) return [];

    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.USER_ROBOT_REQUESTS(user.id), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user robot requests');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading user robot requests:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllRobotRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.ROBOT_REQUESTS, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch robot requests');
      }

      const data = await response.json();
      setRobotRequests(data);
      return data;
    } catch (error) {
      console.error('Error loading robot requests:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateRobotRequest = async (requestId: string, updateData: Partial<RobotRequest>) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.ROBOT_REQUEST_BY_ID(requestId), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update robot request');
      }

      const updatedRequest = await response.json();
      
      // Update local state
      setRobotRequests(prevRequests => 
        prevRequests.map(req => req.id === requestId ? updatedRequest : req)
      );
      
      return updatedRequest;
    } catch (error) {
      console.error('Error updating robot request:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Trading signals functions
  const loadTradingSignals = async (market?: string, timeframe?: string, count?: number) => {
    try {
      setIsLoading(true);
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

      if (!response.ok) {
        throw new Error('Failed to fetch trading signals');
      }

      const data = await response.json();
      setTradingSignals(data);
    } catch (error) {
      console.error('Error loading trading signals:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTradingSignals = async (market?: string, timeframe?: string, count?: number) => {
    await loadTradingSignals(market, timeframe, count);
    return tradingSignals;
  };

  // Market analyses functions
  const loadMarketAnalyses = async () => {
    // This is a placeholder since the API endpoint isn't defined yet
    try {
      setMarketAnalyses([
        {
          symbol: "EUR/USD",
          timeframe: "1h",
          trend: "bullish",
          strength: 7,
          support_levels: [1.12450, 1.12300],
          resistance_levels: [1.12800, 1.13000],
          indicators: {
            rsi: 62,
            macd: {
              value: 0.00124,
              signal: 0.00050,
              histogram: 0.00074
            },
            moving_averages: {
              ma20: 1.12500,
              ma50: 1.12350,
              ma200: 1.11980
            }
          },
          recommendation: "Buy",
          next_potential_move: "Likely to test 1.12800 resistance",
          risk_reward_ratio: 2.5,
          created_at: new Date().toISOString(),
          next_price_target: 1.12800,
          stop_loss_suggestion: 1.12300,
          summary: "Strong uptrend with momentum"
        }
      ]);
    } catch (error) {
      console.error('Error loading market analyses:', error);
      throw error;
    }
  };

  const analyzeMarket = async (symbol: string, timeframe: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_ENDPOINTS.AI_TRADING_SIGNALS}?symbol=${symbol}&timeframe=${timeframe}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze market');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing market:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Users management
  const getUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.USERS, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Subscription plans functions
  const loadSubscriptionPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_PLANS, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }

      const data = await response.json();
      setSubscriptionPlans(data);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      // Set default plans if API fails
      setSubscriptionPlans([
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
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscriptionPlans = async () => {
    if (subscriptionPlans.length === 0) {
      await loadSubscriptionPlans();
    }
    return subscriptionPlans;
  };

  const getSubscriptionPrices = async () => {
    // This would typically fetch prices from the backend
    // For now just return the subscription plans
    await getSubscriptionPlans();
    return subscriptionPlans;
  };

  const updateSubscriptionPrice = async (planId: string, price: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_PLAN_BY_ID(planId), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription price');
      }

      // Reload subscription plans to get updated data
      await loadSubscriptionPlans();
      return true;
    } catch (error) {
      console.error('Error updating subscription plan price:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for updateSubscriptionPrice
  const updateSubscriptionPlanPrice = updateSubscriptionPrice;

  const createSubscription = async (planId: string, amount: number, currency: string, paymentMethod: string) => {
    try {
      setIsLoading(true);
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

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Alias to subscribeToPlan that will use default values for some params
  const subscribeToPlan = async (planId: string, paymentMethod: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }
    
    return createSubscription(planId, plan.price, plan.currency, paymentMethod);
  };

  const getUserSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.USER_SUBSCRIPTIONS, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user subscriptions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getUserActiveSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.USER_ACTIVE_SUBSCRIPTIONS, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active subscriptions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching active subscriptions:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscription = async (planId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.CHECK_SUBSCRIPTION(planId), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.has_subscription || false;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.CANCEL_SUBSCRIPTION(subscriptionId), {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Payment processing
  const processCardPayment = async (paymentDetails: any) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.CARD_PAYMENT_PROCESS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to process card payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing card payment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCardPayment = async (paymentId: string) => {
    try {
      setIsLoading(true);
      const url = API_ENDPOINTS.CARD_PAYMENT_VERIFY.replace('{payment_id}', paymentId);
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to verify card payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying card payment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const initiateMpesaPayment = async (paymentDetails: any) => {
    try {
      setIsLoading(true);
      const response = await fetch(API_ENDPOINTS.MPESA_INITIATE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate M-PESA payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error initiating M-PESA payment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (transactionId: string) => {
    try {
      setIsLoading(true);
      const url = API_ENDPOINTS.MPESA_VERIFY.replace('{transaction_id}', transactionId);
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Notifications
  const loadNotifications = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
      
      // Also update unread count
      const unreadResponse = await fetch(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT, {
        headers: getAuthHeaders(),
      });
      
      if (unreadResponse.ok) {
        const unreadData = await unreadResponse.json();
        setUnreadNotificationCount(unreadData.count || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.NOTIFICATION_MARK_READ(notificationId), {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      // Update unread count
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, read: true }))
      );
      
      // Update unread count
      setUnreadNotificationCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Chat functions
  const loadConversations = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CHAT_CONVERSATIONS, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      const conversationList = data.map((conv: any) => ({
        id: conv.id,
        userId: conv.user_id,
        userName: conv.user_name,
        userEmail: conv.user_email,
        lastMessage: conv.last_message || '',
        lastMessageTime: conv.last_message_time,
        unreadCount: conv.unread_count || 0
      }));

      setConversations(conversationList);
    } catch (error) {
      console.error('Error loading conversations:', error);
      throw error;
    }
  };
  
  // Alias for loadConversations for naming consistency
  const getConversations = loadConversations;

  const setCurrentConversationId = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const getMessages = async (conversationId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.CHAT_MESSAGES(conversationId), {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      const formattedMessages = data.map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        sender: msg.sender,
        senderId: msg.sender_id,
        text: msg.text,
        timestamp: msg.timestamp,
        read: msg.read
      }));

      setChatMessages(prev => ({
        ...prev,
        [conversationId]: formattedMessages
      }));
      
      return formattedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };

  const sendMessage = async (conversationId: string, text: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.CHAT_MESSAGES(conversationId), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      
      // Update local state
      setChatMessages(prev => {
        const conversationMessages = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: [...conversationMessages, {
            id: newMessage.id,
            conversationId: newMessage.conversation_id,
            sender: newMessage.sender,
            senderId: newMessage.sender_id,
            text: newMessage.text,
            timestamp: newMessage.timestamp,
            read: newMessage.read
          }]
        };
      });
      
      // Refresh the conversation list to update last message
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.CHAT_MARK_READ(messageId), {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }

      // Update local state
      setChatMessages(prev => {
        const updatedMessages: Record<string, ChatMessage[]> = {};
        
        Object.entries(prev).forEach(([convId, messages]) => {
          updatedMessages[convId] = messages.map(msg => 
            msg.id === messageId ? { ...msg, read: true } : msg
          );
        });
        
        return updatedMessages;
      });
      
      // Update conversation unread count
      if (currentConversation) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === currentConversation.id 
              ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - 1) } 
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  };

  const createNewConversation = async (userId: string, userName: string, userEmail: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.CHAT_CONVERSATIONS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: userId,
          user_name: userName,
          user_email: userEmail
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const newConversation = await response.json();
      
      // Format the conversation to match our interface
      const formattedConversation: Conversation = {
        id: newConversation.id,
        userId: newConversation.user_id,
        userName: newConversation.user_name,
        userEmail: newConversation.user_email,
        lastMessage: newConversation.last_message || '',
        lastMessageTime: newConversation.last_message_time,
        unreadCount: 0
      };
      
      // Update local state
      setConversations(prev => [...prev, formattedConversation]);
      
      return formattedConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };
  
  // Alias for createNewConversation for naming consistency
  const createConversation = createNewConversation;

  const getUnreadMessageCount = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CHAT_UNREAD_COUNT, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread message count');
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      return 0;
    }
  };

  return (
    <BackendContext.Provider
      value={{
        user,
        isLoggedIn,
        isAdmin,
        isLoading,
        robots,
        purchases,
        tradingSignals,
        marketAnalyses,
        subscriptionPlans,
        robotRequests,
        notifications,
        unreadNotificationCount,
        signInWithEmailPassword,
        signUpWithEmailPassword,
        signOut,
        login,
        register,
        logoutUser,
        loadRobots,
        getRobots,
        getRobotById,
        addRobot,
        updateRobot,
        deleteRobot,
        purchaseRobot,
        loadPurchases,
        getPurchases,
        submitRobotRequest,
        getUserRobotRequests,
        fetchAllRobotRequests,
        updateRobotRequest,
        loadTradingSignals,
        getTradingSignals,
        loadMarketAnalyses,
        analyzeMarket,
        loadSubscriptionPlans,
        getSubscriptionPlans,
        getSubscriptionPrices,
        updateSubscriptionPrice,
        updateSubscriptionPlanPrice,
        createSubscription,
        subscribeToPlan,
        getUserSubscriptions,
        getUserActiveSubscriptions,
        checkSubscription,
        cancelSubscription,
        processCardPayment,
        verifyCardPayment,
        initiateMpesaPayment,
        verifyPayment,
        getUsers,
        loadNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        conversations,
        chatMessages,
        currentConversation,
        setCurrentConversationId,
        loadConversations,
        getConversations,
        getMessages,
        sendMessage,
        markMessageAsRead,
        createNewConversation,
        createConversation,
        getUnreadMessageCount
      }}
    >
      {children}
    </BackendContext.Provider>
  );
};
