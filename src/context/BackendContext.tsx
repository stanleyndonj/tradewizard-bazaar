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
  getUserActiveSubscriptions,
  checkSubscription,
  cancelSubscription,
  initiateMpesaPayment,
  verifyMpesaPayment,
  processCardPayment,
  verifyCardPayment
} from '@/lib/backend';
import { toast } from '@/hooks/use-toast';

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
  updateSubscriptionPrice: (planId: string, price: number) => Promise<boolean>;
  initiateMpesaPayment: (phone: string, amount: number, itemId: string, paymentType?: 'purchase' | 'subscription') => Promise<any>;
  verifyPayment: (transactionId: string) => Promise<boolean>;
  verifyMpesaPayment: (transactionId: string) => Promise<boolean>; // Alias for verifyPayment
  processCardPayment: (cardDetails: any, amount: number, currency: string, itemId: string, paymentType?: 'purchase' | 'subscription') => Promise<any>;
  verifyCardPayment: (paymentId: string) => Promise<any>;
  createSubscription: (subscriptionData: any) => Promise<any>;
  // Chat related properties
  chatMessages: Record<string, ChatMessage[]>;
  currentConversation: string | null;
  setCurrentConversationId: (id: string | null) => void;
  //Notification Properties
  notifications: NotificationType[];
  unreadNotificationCount: number;
  loadNotifications: () => Promise<NotificationType[]>;
  markNotificationAsRead: (notificationId: string) => Promise<any>;
  markAllNotificationsAsRead: () => Promise<any>;
}

// Add notification type
interface NotificationType {
  id: string;
  type: string;
  title: string;
  content: string;
  user_id: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
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
  updateSubscriptionPrice: async () => false,
  checkSubscription: async () => false,
  subscribeToPlan: async () => {},
  cancelSubscription: async () => {},
  initiateMpesaPayment: async () => {},
  verifyPayment: async () => false,
  verifyMpesaPayment: async () => false,
  processCardPayment: async () => {},
  verifyCardPayment: async () => {},
  createSubscription: async () => {},
  chatMessages: {}, // Default to an empty object
  currentConversation: null,
  setCurrentConversationId: () => {},
  notifications: [],
  unreadNotificationCount: 0,
  loadNotifications: async () => [],
  markNotificationAsRead: async () => ({}),
  markAllNotificationsAsRead: async () => ({})
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

  // Add notification state
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);


  // Function to get subscription prices
  const getSubscriptionPrices = async () => {
    try {
      console.log("Getting subscription plans...");
      const plans = await getSubscriptionPlans();
      setSubscriptionPlans(plans);
      return plans;
    } catch (error) {
      console.error("Error fetching subscription prices:", error);
      setError("Failed to load subscription plans");
      return [];
    }
  };

  // This function has been moved elsewhere in the file

  const registerUser = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRegisterUser(name, email, password);

      if (response && response.success) {
        // Automatically log the user in after successful registration
        await loginUser(email, password);
        return response;
      } else {
        throw new Error(response?.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      // Extract the error message from the response if available
      let errorMessage = 'Registration failed';

      if (err.response && err.response.data) {
        // Extract detailed error from API response
        errorMessage = err.response.data.detail || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (errorMessage.includes('Email already registered')) {
        errorMessage = 'This email is already registered. Please use a different email or login.';
      }

      setError(errorMessage);
      throw new Error(errorMessage);
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
        try {
          console.log("Login successful, storing token...");
          
          // Store the token properly in localStorage
          localStorage.setItem('auth_token', data.access_token);
          
          // Wait a moment for token to be saved
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log("Token stored, fetching user data...");
          // Fetch the current user immediately after login
          const currentUser = await loadCurrentUser();
          
          if (currentUser) {
            console.log("User data loaded:", currentUser);
            // Redirect user after successful login
            const redirectPath = localStorage.getItem('redirectAfterAuth') || '/dashboard';
            localStorage.removeItem('redirectAfterAuth');
            console.log("Redirecting to:", redirectPath);
            
            // Ensure user state is set before navigation
            setUser(currentUser);
            
            // Force the navigation to happen after state updates are complete with a longer delay
            setTimeout(() => {
              console.log("Executing delayed navigation to:", redirectPath);
              navigate(redirectPath, { replace: true });
            }, 500);
          } else {
            console.error("Failed to load user data after login");
            throw new Error("Failed to load user data after login");
          }
          return data;
        } catch (error) {
          console.error("Error during post-login process:", error);
          throw error;
        }
      } else {
        throw new Error(data?.message || 'Login failed: access token not received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Extract the error message from the response if available
      const errorMessage = err.message || 'Invalid email or password';
      setError(errorMessage);
      throw new Error(errorMessage);
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
      setNotifications([]);
      setUnreadNotificationCount(0);
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
        return currentUser; // Return the user data
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to load current user');
      setUser(null);
      return null;
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
        // Handle case where first argument is an ID string and second is updates
        await apiUpdateRobot({
          ...updates,
          id: robotOrId,
          // Include required fields that might not be in updates
          name: updates.name || "",
          description: updates.description || "",
          type: updates.type || "",
          price: updates.price || 0,
          currency: updates.currency || "USD",
          category: updates.category || "",
          features: updates.features || [],
          image_url: updates.image_url || "",
          imageUrl: updates.imageUrl || "",
          created_at: ""  // This will be ignored by the API but needed for type
        });
      } else if (typeof robotOrId !== 'string') {
        // Handle case where first argument is a full Robot object
        await apiUpdateRobot(robotOrId);
      } else {
        throw new Error('Invalid arguments for updateRobot');
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
    if (!user) {
      console.log('No user logged in, skipping conversation fetch');
      return [];
    }

    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found');
        return [];
      }

      const conversationsData = await apiGetConversations();
      setConversations(conversationsData || []);
      return conversationsData || [];
    } catch (err: any) {
      console.error('Error fetching conversations:', err.message);
      setError(err.message || 'Failed to load conversations');
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

    // Alias for sendChatMessage
    const sendMessage = async (conversationId: string, text: string, sender: string, senderId: string) => {
        setIsLoading(true);
        setError(null);
        try {
        await apiSendChatMessage(conversationId, text, sender, senderId);
      // Refresh messages after sending
      await getMessages(conversationId);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

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
      // Use default admin info if not available
      const adminId = user?.is_admin ? user.id : "admin1";
      const adminName = user?.is_admin ? user.name : "Admin";
      const adminEmail = user?.is_admin ? user.email : "admin@example.com";
      
      await apiCreateNewConversation(userId, userName, userEmail, adminId, adminName, adminEmail);
      // Refresh conversations after creating a new one
      await getConversations();
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      setError(err.message || 'Failed to create new conversation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for createNewConversation
  const createConversation = createNewConversation;

  const getUnreadMessageCount = async () => {
    // Don't set loading state for this lightweight operation
    // as it might trigger unnecessary re-renders
    try {
      // Try to get the count, if API fails, return 0
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return 0;
      }
      
      const count = await apiGetUnreadMessageCount();
      setUnreadMessageCount(count || 0);
      return count || 0;
    } catch (err: any) {
      console.error('Error fetching unread count:', err.message);
      // Set a default value of 0 on error
      setUnreadMessageCount(0);
      return 0;
    }
  };

  // Function to load subscription plans with better error handling
  const loadSubscriptionPlans = async () => {
    try {
      const plans = await getSubscriptionPlans();
      setSubscriptionPlans(Array.isArray(plans) ? plans : []);
      return plans;
    } catch (error: any) {
      console.error('Error loading subscription prices:', error);
      // Use the default plans from the backend.ts file instead of throwing
      return [];
    }
  };

  // Function to update subscription price
  const updateSubscriptionPrice = async (planId: string, price: number) => {
    try {
      setIsLoading(true);
      console.log(`Updating price for plan ${planId} to ${price}`);

      const success = await updateSubscriptionPlanPrice(planId, price); // Assuming updateSubscriptionPlanPrice exists
      if (!success) {
        throw new Error("Failed to update subscription price");
      }

      // Refresh plans after update
      await loadSubscriptionPlans();
      return true;
    } catch (error) {
      console.error('Error updating subscription price:', error);
      setError("Failed to update subscription price");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load user's active subscriptions with better error handling
  const loadUserSubscriptions = async () => {
    if (!user) return;

    try {
      const subscriptions = await getUserActiveSubscriptions();
      setActiveSubscriptions(subscriptions || []);
      setHasActiveSubscription(Array.isArray(subscriptions) && subscriptions.length > 0);
    } catch (error: any) {
      console.error('Error loading user subscriptions:', error);
      // Don't throw the error further, set default empty values
      setActiveSubscriptions([]);
      setHasActiveSubscription(false);
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
      const subscription = await createSubscription({planId, amount, currency, paymentMethod});
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

  const createSubscription = async (subscriptionData: any) => {
    try {
      const response = await fetch(API_ENDPOINTS.SUBSCRIBE, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create subscription: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  };


  const deleteRobotRequest = async (id: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ROBOT_REQUESTS}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete robot request: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting robot request:', error);
      throw error;
    }
  };

  //Notification functions
  const loadNotifications = async () => {
    try {
      // Since the notifications API is not implemented, use mock data
      const mockNotifications = [
        {
          id: '1',
          type: 'message',
          title: 'New Message',
          content: 'You have received a new message',
          user_id: user?.id || '',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'system',
          title: 'Welcome',
          content: 'Welcome to TradeWizard!',
          user_id: user?.id || '',
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      setNotifications(mockNotifications);
      setUnreadNotificationCount(mockNotifications.filter(n => !n.is_read).length);
      return mockNotifications;
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Return empty array instead of undefined
      setNotifications([]);
      setUnreadNotificationCount(0);
      return [];
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // Replace with your actual API call
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, is_read: true} : n));
      setUnreadNotificationCount(prev => Math.max(0, prev -1));
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      // Replace with your actual API call
      await fetch('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({...n, is_read: true})));
      setUnreadNotificationCount(0);
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      if (!mounted) return;

      try {
        await loadCurrentUser();
      } catch (err) {
        console.error("Error loading current user:", err);
      }

      if (!mounted) return;

      try {
        await getRobots();
      } catch (err) {
        console.error("Error loading robots:", err);
      }

      if (!mounted || !user) return;

      try{
        const userDataPromises = [
          getRobotRequests(user.id).catch(err => console.error("Error loading robot requests:", err)),
          getUserPurchases(user.id).catch(err => console.error("Error loading purchases:", err)),
          loadUserSubscriptions().catch(err => console.error("Error loading user subscriptions:", err)),
          loadNotifications().catch(err => console.error("Error loading notifications:", err))
        ];

        const generalDataPromises = [
          getConversations().catch(err => console.error("Error loading conversations:", err)),
          getUnreadMessageCount().catch(err => console.error("Error loading unread count:", err)),
          loadSubscriptionPlans().catch(err => console.error("Error loading subscription plans:", err))
        ];

        if (mounted) {
          await Promise.all([...userDataPromises, ...generalDataPromises]);
        }
      } finally {
        // Cleanup code can go here if needed
      }
    };

    loadInitialData();

    // No recurring interval or timers that might cause refreshes

    return () => {
      mounted = false;
    };
  }, [user?.id]); // Only run when user ID changes

  const logout = () => {
    // Clear user data from state
    setUser(null);

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Set loading to false
    setIsLoading(false);
  };

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
    logout,
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
    createSubscription,

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

    //Notification properties
    notifications,
    unreadNotificationCount,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,

    // Subscription price management
    getSubscriptionPrices,
    updateSubscriptionPrice,
  };

  return <BackendContext.Provider value={contextValue}>{children}</BackendContext.Provider>;
}

export const useBackend = () => useContext(BackendContext);