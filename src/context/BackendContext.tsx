
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import API_ENDPOINTS, { getAuthHeaders } from '../lib/apiConfig';
import { User, Robot, Purchase, TradingSignal, MarketAnalysis, SubscriptionPlan, ChatMessage, Conversation } from '../lib/backend';

// Context interface
interface BackendContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  robots: Robot[];
  purchases: Purchase[];
  tradingSignals: TradingSignal[];
  marketAnalyses: MarketAnalysis[];
  subscriptionPlans: SubscriptionPlan[];
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadRobots: () => Promise<void>;
  getRobotById: (id: string) => Robot | undefined;
  loadPurchases: () => Promise<void>;
  loadTradingSignals: (market?: string, timeframe?: string, count?: number) => Promise<void>;
  loadMarketAnalyses: () => Promise<void>;
  loadSubscriptionPlans: () => Promise<void>;
  updateSubscriptionPlanPrice: (planId: string, price: number) => Promise<boolean>;
  createSubscription: (planId: string, amount: number, currency: string, paymentMethod: string) => Promise<any>;
  getUserSubscriptions: () => Promise<any[]>;
  getUserActiveSubscriptions: () => Promise<any[]>;
  checkSubscription: (planId: string) => Promise<boolean>;
  cancelSubscription: (subscriptionId: string) => Promise<boolean>;
  
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
  createNewConversation: (userId: string, userName: string, userEmail: string) => Promise<void>;
  createConversation: (userId: string, userName: string, userEmail: string) => Promise<void>;
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
    }
  };

  const signUpWithEmailPassword = async (name: string, email: string, password: string) => {
    try {
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
    }
  };

  const signOut = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      // Clear local storage and state regardless of response
      localStorage.removeItem('auth_token');
      setUser(null);
      
      return response.ok;
    } catch (error) {
      console.error('Error signing out:', error);
      // Clear local storage and state even if API call fails
      localStorage.removeItem('auth_token');
      setUser(null);
      return false;
    }
  };

  // Robot functions
  const loadRobots = async () => {
    try {
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
    }
  };

  const getRobotById = (id: string) => {
    return robots.find(robot => robot.id === id);
  };

  // Purchase functions
  const loadPurchases = async () => {
    if (!user) return;

    try {
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
    }
  };

  // Trading signals functions
  const loadTradingSignals = async (market?: string, timeframe?: string, count?: number) => {
    try {
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
    }
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

  // Subscription plans functions
  const loadSubscriptionPlans = async () => {
    try {
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
    }
  };

  const updateSubscriptionPlanPrice = async (planId: string, price: number) => {
    try {
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
    }
  };

  const createSubscription = async (planId: string, amount: number, currency: string, paymentMethod: string) => {
    try {
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
    }
  };

  const getUserSubscriptions = async () => {
    try {
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
    }
  };

  const getUserActiveSubscriptions = async () => {
    try {
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
    }
  };

  const checkSubscription = async (planId: string) => {
    try {
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
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
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
      return conversationList;
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

      const messages = await response.json();
      const formattedMessages = messages.map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        sender: msg.sender,
        senderId: msg.sender_id,
        text: msg.text,
        timestamp: msg.timestamp,
        read: msg.read
      }));

      setChatMessages(prevState => ({
        ...prevState,
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
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sender: isAdmin ? 'admin' : 'user',
          sender_id: user?.id || 'unknown'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Reload messages after sending
      await getMessages(conversationId);
      return true;
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

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  };

  const createNewConversation = async (userId: string, userName: string, userEmail: string) => {
    try {
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

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const newConversation = await response.json();
      return newConversation;
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
        return 0;
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  };

  return (
    <BackendContext.Provider
      value={{
        user,
        isLoggedIn,
        isAdmin,
        robots,
        purchases,
        tradingSignals,
        marketAnalyses,
        subscriptionPlans,
        signInWithEmailPassword,
        signUpWithEmailPassword,
        signOut,
        loadRobots,
        getRobotById,
        loadPurchases,
        loadTradingSignals,
        loadMarketAnalyses,
        loadSubscriptionPlans,
        updateSubscriptionPlanPrice,
        createSubscription,
        getUserSubscriptions,
        getUserActiveSubscriptions,
        checkSubscription,
        cancelSubscription,
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
