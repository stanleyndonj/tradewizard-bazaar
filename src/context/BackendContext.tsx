import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import {
  registerUser as apiRegisterUser,
  loginUser as apiLoginUser,
  logoutUser as apiLogoutUser,
  getCurrentUser as apiGetCurrentUser,
  getRobots as apiGetRobots,
  getRobotById as apiGetRobotById,
  addRobot as apiAddRobot,
  updateRobot as apiUpdateRobot,
  deleteRobot as apiDeleteRobot,
  getRobotRequests as apiGetRobotRequests,
  getAllRobotRequests as apiGetAllRobotRequests,
  submitRobotRequest as apiSubmitRobotRequest,
  updateRobotRequest as apiUpdateRobotRequest,
  getUserPurchases as apiGetUserPurchases,
  makePurchase as apiMakePurchase,
  getUsers as apiGetUsers,
  getTradingSignals as apiGetTradingSignals,
  analyzeMarket as apiAnalyzeMarket,
  ChatMessage,
  Conversation,
  getConversations as apiGetConversations,
  getMessages as apiGetMessages,
  sendChatMessage as apiSendChatMessage,
  markMessageRead as apiMarkMessageRead,
  createNewConversation as apiCreateNewConversation,
  getUnreadMessageCount as apiGetUnreadMessageCount,
  User,
  Robot,
  RobotRequest,
  Purchase,
  RobotRequestParams,
  TradingSignal,
  MarketAnalysis,
  SubscriptionPlan,
} from '@/lib/backend';
import { useNavigate } from 'react-router-dom';
import {
  getSubscriptionPlans,
  createSubscription,
  getUserActiveSubscriptions,
  checkSubscription,
  cancelSubscription,
  initiateMpesaPayment,
  verifyMpesaPayment,
  processCardPayment,
  verifyCardPayment
} from '@/lib/backend';

interface BackendContextType {
  user: User | null;
  robots: Robot[];
  robotRequests: RobotRequest[];
  purchases: Purchase[];
  users: User[];
  tradingSignals: TradingSignal[];
  marketAnalysis: MarketAnalysis | null;
  conversations: Conversation[];
  unreadMessageCount: number;
  isLoading: boolean;
  error: string | null;
  registerUser: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>; // Alias for loginUser
  register: (name: string, email: string, password: string) => Promise<void>; // Alias for registerUser
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  getRobots: () => Promise<Robot[]>;
  getRobotById: (id: string) => Promise<Robot | null>;
  addRobot: (robotData: Omit<Robot, 'id' | 'created_at'>) => Promise<void>;
  updateRobot: (robotOrId: Robot | string, updates?: Partial<Robot>) => Promise<void>;
  deleteRobot: (id: string) => Promise<void>;
  getRobotRequests: (userId: string) => Promise<RobotRequest[]>;
  getUserRobotRequests: (userId: string) => Promise<RobotRequest[]>; // Alias for getRobotRequests
  getAllRobotRequests: () => Promise<RobotRequest[]>;
  fetchAllRobotRequests: () => Promise<RobotRequest[]>; // Alias for getAllRobotRequests
  submitRobotRequest: (params: RobotRequestParams) => Promise<void>;
  updateRobotRequest: (requestId: string, updates: any) => Promise<void>;
  getUserPurchases: (userId: string) => Promise<Purchase[]>;
  getPurchases: (userId: string) => Promise<Purchase[]>; // Alias for getUserPurchases
  purchaseRobot: (robotId: string, amount: number, currency: string, paymentMethod: string) => Promise<void>;
  getUsers: () => Promise<User[]>;
  getTradingSignals: (market?: string, timeframe?: string, count?: number) => Promise<TradingSignal[]>;
  analyzeMarket: (symbol: string, timeframe?: string) => Promise<MarketAnalysis>;
  getConversations: () => Promise<Conversation[]>;
  loadConversations: () => Promise<Conversation[]>; // Alias for getConversations
  getMessages: (conversationId: string) => Promise<ChatMessage[]>;
  sendChatMessage: (conversationId: string, text: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>; // Alias for sendChatMessage
  markMessageRead: (messageId: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>; // Alias for markMessageRead
  createNewConversation: (userId: string, userName: string, userEmail: string) => Promise<void>;
  createConversation: (userId: string, userName: string, userEmail: string) => Promise<void>; // Alias for createNewConversation
  getUnreadMessageCount: () => Promise<number>;
  subscriptionPlans: SubscriptionPlan[];
  activeSubscriptions: any[];
  hasActiveSubscription: boolean;
  getSubscriptionPlans: () => Promise<SubscriptionPlan[]>;
  getSubscriptionPrices: () => Promise<SubscriptionPlan[]>; // Alias for getSubscriptionPlans
  checkSubscription: (planId: string) => Promise<boolean>;
  subscribeToPlan: (planId: string, amount: number, currency: string, paymentMethod: string) => Promise<any>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  updateSubscriptionPrice: (planId: string, price: number) => Promise<void>;
  initiateMpesaPayment: (phone: string, amount: number, itemId: string, paymentType?: 'purchase' | 'subscription') => Promise<any>;
  verifyPayment: (transactionId: string) => Promise<boolean>;
  verifyMpesaPayment: (transactionId: string) => Promise<boolean>; // Alias for verifyPayment
  processCardPayment: (cardDetails: any, amount: number, currency: string, itemId: string, paymentType?: 'purchase' | 'subscription') => Promise<any>;
  verifyCardPayment: (paymentId: string) => Promise<any>;
  // Chat related properties
  chatMessages: Record<string, ChatMessage[]>;
  currentConversation: string | null;
  setCurrentConversationId: (id: string | null) => void;
}

const BackendContext = createContext<BackendContextType>({
  user: null,
  robots: [],
  robotRequests: [],
  purchases: [],
  users: [],
  tradingSignals: [],
  marketAnalysis: null,
  conversations: [],
  unreadMessageCount: 0,
  isLoading: false,
  error: null,
  registerUser: async () => {},
  login: async () => {},
  register: async () => {},
  loginUser: async () => {},
  logoutUser: async () => {},
  getRobots: async () => [],
  getRobotById: async () => null,
  addRobot: async () => {},
  updateRobot: async () => {},
  deleteRobot: async () => {},
  getRobotRequests: async () => [],
  getUserRobotRequests: async () => [],
  getAllRobotRequests: async () => [],
  fetchAllRobotRequests: async () => [],
  submitRobotRequest: async () => {},
  updateRobotRequest: async () => {},
  getUserPurchases: async () => [],
  getPurchases: async () => [],
  purchaseRobot: async () => {},
  getUsers: async () => [],
  getTradingSignals: async () => [],
  analyzeMarket: async () => ({} as MarketAnalysis),
  getConversations: async () => [],
  loadConversations: async () => [],
  getMessages: async () => [],
  sendChatMessage: async () => {},
  sendMessage: async () => {},
  markMessageRead: async () => {},
  markMessageAsRead: async () => {},
  createNewConversation: async () => {},
  createConversation: async () => {},
  getUnreadMessageCount: async () => 0,
  subscriptionPlans: [],
  activeSubscriptions: [],
  hasActiveSubscription: false,
  getSubscriptionPlans: async () => [],
  getSubscriptionPrices: async () => [],
  checkSubscription: async () => false,
  subscribeToPlan: async () => {},
  cancelSubscription: async () => {},
  updateSubscriptionPrice: async () => {},
  initiateMpesaPayment: async () => {},
  verifyPayment: async () => false,
  verifyMpesaPayment: async () => false,
  processCardPayment: async () => {},
  verifyCardPayment: async () => {},
  chatMessages: {},
  currentConversation: null,
  setCurrentConversationId: () => {},
});

export function BackendProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Chat related state
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const setCurrentConversationId = (id: string | null) => setCurrentConversation(id);

  // Add new state for subscriptions
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  
  const registerUser = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiRegisterUser(name, email, password);
      // Optionally, automatically log the user in after registration
      await loginUser(email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiLoginUser(email, password);
      if (data && data.access_token) {
        // Fetch the current user immediately after login
        await loadCurrentUser();
        
        // Redirect user after successful login
        const redirectPath = localStorage.getItem('redirectAfterAuth') || '/dashboard';
        localStorage.removeItem('redirectAfterAuth');
        navigate(redirectPath);
      } else {
        throw new Error('Login failed: access token not received');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiLogoutUser();
      setUser(null);
      setRobots([]);
      setRobotRequests([]);
      setPurchases([]);
      setUsers([]);
      setTradingSignals([]);
      setMarketAnalysis(null);
      setConversations([]);
      setUnreadMessageCount(0);
      setActiveSubscriptions([]);
      setHasActiveSubscription(false);
      navigate('/auth');
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentUser = await apiGetCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load current user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getRobots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const robotsData = await apiGetRobots();
      setRobots(robotsData || []);
      return robotsData || [];
    } catch (err: any) {
      setError(err.message || 'Failed to load robots');
      setRobots([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getRobotById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const robot = await apiGetRobotById(id);
      return robot;
    } catch (err: any) {
      setError(err.message || 'Failed to load robot');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addRobot = async (robotData: Omit<Robot, 'id' | 'created_at'>) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiAddRobot(robotData);
      await getRobots(); // Refresh robots after adding
    } catch (err: any) {
      setError(err.message || 'Failed to add robot');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRobot = async (robotOrId: Robot | string, updates?: Partial<Robot>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof robotOrId === 'string' && updates) {
        await apiUpdateRobot(robotOrId, updates);
      } else if (typeof robotOrId !== 'string') {
        await apiUpdateRobot(robotOrId);
      }
      await getRobots(); // Refresh robots after updating
    } catch (err: any) {
      setError(err.message || 'Failed to update robot');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRobot = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiDeleteRobot(id);
      await getRobots(); // Refresh robots after deleting
    } catch (err: any) {
      setError(err.message || 'Failed to delete robot');
    } finally {
      setIsLoading(false);
    }
  };

  const getRobotRequests = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const robotRequestsData = await apiGetRobotRequests(userId);
      setRobotRequests(robotRequestsData || []);
      return robotRequestsData || [];
    } catch (err: any) {
      setError(err.message || 'Failed to load robot requests');
      setRobotRequests([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for getRobotRequests
  const getUserRobotRequests = getRobotRequests;

  const getAllRobotRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const robotRequestsData = await apiGetAllRobotRequests();
      setRobotRequests(robotRequestsData || []);
      return robotRequestsData || [];
    } catch (err: any) {
      setError(err.message || 'Failed to load robot requests');
      setRobotRequests([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for getAllRobotRequests
  const fetchAllRobotRequests = getAllRobotRequests;

  const submitRobotRequest = async (params: RobotRequestParams) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiSubmitRobotRequest(params);
      // Optionally, refresh robot requests after submitting
      if (user) {
        await getRobotRequests(user.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit robot request');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRobotRequest = async (requestId: string, updates: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiUpdateRobotRequest(requestId, updates);
      // Optionally, refresh robot requests after updating
      if (user) {
        await getRobotRequests(user.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update robot request');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserPurchases = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const purchasesData = await apiGetUserPurchases(userId);
      setPurchases(purchasesData || []);
      return purchasesData || [];
    } catch (err: any) {
      setError(err.message || 'Failed to load purchases');
      setPurchases([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for getUserPurchases
  const getPurchases = getUserPurchases;

  const purchaseRobot = async (robotId: string, amount: number, currency: string, paymentMethod: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      await apiMakePurchase(user.id, robotId, amount, currency, paymentMethod);
      // Optionally, refresh purchases after making a purchase
      await getUserPurchases(user.id);
    } catch (err: any) {
      setError(err.message || 'Failed to make purchase');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const usersData = await apiGetUsers();
      setUsers(usersData || []);
      return usersData || [];
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      setUsers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getTradingSignals = async (market?: string, timeframe?: string, count?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const signalsData = await apiGetTradingSignals(market, timeframe, count);
      setTradingSignals(signalsData || []);
      return signalsData || [];
    } catch (err: any) {
      setError(err.message || 'Failed to load trading signals');
      setTradingSignals([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeMarket = async (symbol: string, timeframe?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const analysisData = await apiAnalyzeMarket(symbol, timeframe);
      setMarketAnalysis(analysisData);
      return analysisData;
    } catch (err: any) {
      setError(err.message || 'Failed to analyze market');
      setMarketAnalysis(null);
      return {} as MarketAnalysis;
    } finally {
      setIsLoading(false);
    }
  };

  const getConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const conversationsData = await apiGetConversations();
      setConversations(conversationsData || []);
      return conversationsData || [];
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
      setConversations([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for getConversations
  const loadConversations = getConversations;

  const getMessages = async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const messagesData = await apiGetMessages(conversationId);
      // Update chatMessages state
      setChatMessages(prev => ({
        ...prev,
        [conversationId]: messagesData || []
      }));
      return messagesData || [];
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async (conversationId: string, text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiSendChatMessage(conversationId, text);
      // Refresh messages after sending
      await getMessages(conversationId);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for sendChatMessage
  const sendMessage = sendChatMessage;

  const markMessageRead = async (messageId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiMarkMessageRead(messageId);
      // Refresh conversations after marking message as read
      await getConversations();
    } catch (err: any) {
      setError(err.message || 'Failed to mark message as read');
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for markMessageRead
  const markMessageAsRead = markMessageRead;

  const createNewConversation = async (userId: string, userName: string, userEmail: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiCreateNewConversation(userId, userName, userEmail);
      // Refresh conversations after creating a new one
      await getConversations();
    } catch (err: any) {
      setError(err.message || 'Failed to create new conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for createNewConversation
  const createConversation = createNewConversation;

  const getUnreadMessageCount = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const count = await apiGetUnreadMessageCount();
      setUnreadMessageCount(count || 0);
      return count || 0;
    } catch (err: any) {
      setError(err.message || 'Failed to get unread message count');
      setUnreadMessageCount(0);
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load subscription plans
  const loadSubscriptionPlans = async () => {
    try {
      const plans = await getSubscriptionPlans();
      setSubscriptionPlans(Array.isArray(plans) ? plans : []);
      return plans;
    } catch (error) {
      console.error('Error loading subscription prices:', error);
      return [];
    }
  };

  // Alias for loadSubscriptionPlans
  const getSubscriptionPrices = loadSubscriptionPlans;

  // Function to update subscription price
  const updateSubscriptionPrice = async (planId: string, price: number) => {
    try {
      // Implementation would go here in a real application
      console.log(`Updating price for plan ${planId} to ${price}`);
      // Refresh subscription plans after update
      await loadSubscriptionPlans();
    } catch (error) {
      console.error('Error updating subscription price:', error);
    }
  };

  // Function to load user's active subscriptions
  const loadUserSubscriptions = async () => {
    if (!user) return;
    
    try {
      const subscriptions = await getUserActiveSubscriptions();
      setActiveSubscriptions(subscriptions || []);
      setHasActiveSubscription(Array.isArray(subscriptions) && subscriptions.length > 0);
    } catch (error) {
      console.error('Error loading user subscriptions:', error);
    }
  };

  // Check if user has access to a specific plan
  const checkUserSubscription = async (planId: string) => {
    if (!user) return false;
    
    try {
      const hasAccess = await checkSubscription(planId);
      return hasAccess;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  };

  // Function to subscribe to a plan
  const subscribeToPlan = async (planId: string, amount: number, currency: string, paymentMethod: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const subscription = await createSubscription(planId, amount, currency, paymentMethod);
      await loadUserSubscriptions();
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };

  // Function to cancel a subscription
  const cancelUserSubscription = async (subscriptionId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await cancelSubscription(subscriptionId);
      await loadUserSubscriptions();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  };

  // Payment processing functions
  const initiateMpesaPaymentFunc = async (phone: string, amount: number, itemId: string, paymentType: 'purchase' | 'subscription' = 'purchase') => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await initiateMpesaPayment(phone, amount, itemId, paymentType);
      return response;
    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error);
      throw error;
    }
  };

  const verifyMpesaPaymentFunc = async (transactionId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      return await verifyMpesaPayment(transactionId);
    } catch (error) {
      console.error('Error verifying M-Pesa payment:', error);
      throw error;
    }
  };

  const processCardPaymentFunc = async (cardDetails: any, amount: number, currency: string, itemId: string, paymentType: 'purchase' | 'subscription' = 'purchase') => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await processCardPayment(cardDetails, amount, currency, itemId, paymentType);
      return response;
    } catch (error) {
      console.error('Error processing card payment:', error);
      throw error;
    }
  };

  const verifyCardPaymentFunc = async (paymentId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      return await verifyCardPayment(paymentId);
    } catch (error) {
      console.error('Error verifying card payment:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadCurrentUser();
    getRobots();
    if (user) {
      getRobotRequests(user.id);
      getUserPurchases(user.id);
    }
    getConversations();
    getUnreadMessageCount();
    
    // Load subscription plans
    loadSubscriptionPlans();
    
    // If user is logged in, load their subscriptions
    if (user) {
      loadUserSubscriptions();
    }
  }, [user]);

  const contextValue: BackendContextType = {
    user,
    robots,
    robotRequests,
    purchases,
    users,
    tradingSignals,
    marketAnalysis,
    conversations,
    unreadMessageCount,
    isLoading,
    error,
    registerUser,
    register: registerUser,
    loginUser,
    login: loginUser,
    logoutUser,
    getRobots,
    getRobotById,
    addRobot,
    updateRobot,
    deleteRobot,
    getRobotRequests,
    getUserRobotRequests,
    getAllRobotRequests,
    fetchAllRobotRequests,
    submitRobotRequest,
    updateRobotRequest,
    getUserPurchases,
    getPurchases,
    purchaseRobot,
    getUsers,
    getTradingSignals,
    analyzeMarket,
    getConversations,
    loadConversations,
    getMessages,
    sendChatMessage,
    sendMessage,
    markMessageRead,
    markMessageAsRead,
    createNewConversation,
    createConversation,
    getUnreadMessageCount,
    
    // Subscription-related properties
    subscriptionPlans,
    activeSubscriptions,
    hasActiveSubscription,
    getSubscriptionPlans: loadSubscriptionPlans,
    getSubscriptionPrices,
    checkSubscription: checkUserSubscription,
    subscribeToPlan,
    cancelSubscription: cancelUserSubscription,
    updateSubscriptionPrice,
    
    // Payment processing functions
    initiateMpesaPayment: initiateMpesaPaymentFunc,
    verifyPayment: verifyMpesaPaymentFunc,
    verifyMpesaPayment: verifyMpesaPaymentFunc,
    processCardPayment: processCardPaymentFunc,
    verifyCardPayment: verifyCardPaymentFunc,
    
    // Chat related properties
    chatMessages,
    currentConversation,
    setCurrentConversationId,
  };

  return <BackendContext.Provider value={contextValue}>{children}</BackendContext.Provider>;
}

export const useBackend = () => useContext(BackendContext);
