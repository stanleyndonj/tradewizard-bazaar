
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  // Import all the API functions from the backend service
  registerUser as registerUserAPI,
  loginUser as loginUserAPI,
  logoutUser as logoutUserAPI,
  getCurrentUser as getCurrentUserAPI,
  getRobots as getRobotsAPI,
  getRobotById as getRobotByIdAPI,
  addRobot as addRobotAPI,
  updateRobot as updateRobotAPI,
  deleteRobot as deleteRobotAPI,
  getRobotRequests as getRobotRequestsAPI,
  getAllRobotRequests as getAllRobotRequestsAPI,
  submitRobotRequest as submitRobotRequestAPI,
  updateRobotRequest as updateRobotRequestAPI,
  getUserPurchases as getUserPurchasesAPI,
  makePurchase as makePurchaseAPI,
  initiateMpesaPayment as initiateMpesaPaymentAPI,
  verifyMpesaPayment as verifyMpesaPaymentAPI,
  getTradingSignals as getTradingSignalsAPI,
  analyzeMarket as analyzeMarketAPI,
  getUsers as getUsersAPI,
  getConversations as getConversationsAPI,
  getMessages as getMessagesAPI,
  sendChatMessage,
  markMessageRead,
  createNewConversation,
} from '@/lib/backend';
import {
  User,
  Robot,
  RobotRequest,
  Purchase,
  RobotRequestParams,
  TradingSignal,
  MarketAnalysis,
  ChatMessage,
  Conversation,
} from '@/lib/backend';
import { toast } from '@/hooks/use-toast';

// Define the type for our pricing plan structure
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
}

interface BackendContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean; // Alias for loading
  loginUser: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>; // Alias for loginUser
  registerUser: (name: string, email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>; // Alias for registerUser
  logoutUser: () => Promise<void>;
  submitRobotRequest: (params: RobotRequestParams) => Promise<RobotRequest>;
  submitRequest: (params: RobotRequestParams) => Promise<RobotRequest>; // Alias for submitRobotRequest
  getUserRobotRequests: () => Promise<RobotRequest[]>;
  fetchAllRobotRequests: () => Promise<RobotRequest[]>;
  updateRobotRequest: (requestId: string, updates: any) => Promise<RobotRequest>;
  updateRobotRequestStatus: (requestId: string, updates: any) => Promise<RobotRequest>; // Alias for updateRobotRequest
  getRobots: () => Promise<Robot[]>;
  robots: Robot[]; // Local state for robots
  getRobotById: (id: string) => Promise<Robot>;
  addRobot: (robotData: Omit<Robot, 'id' | 'created_at'>) => Promise<Robot>;
  updateRobot: (robot: Robot) => Promise<Robot>;
  deleteRobot: (id: string) => Promise<void>;
  makePurchase: (
    robotId: string,
    amount: number,
    currency: string,
    paymentMethod: string
  ) => Promise<Purchase>;
  purchaseRobot: (
    robotId: string,
    amount: number,
    currency: string,
    paymentMethod: string
  ) => Promise<Purchase>; // Alias for makePurchase
  getPurchases: () => Promise<Purchase[]>;
  initiateMpesaPayment: (
    phone: string,
    amount: number,
    robotId: string
  ) => Promise<any>;
  verifyMpesaPayment: (checkoutRequestId: string) => Promise<boolean>;
  verifyPayment: (checkoutRequestId: string) => Promise<boolean>; // Alias for verifyMpesaPayment
  
  // Chat-related functions
  conversations: Conversation[];
  chatMessages: Record<string, ChatMessage[]>;
  currentConversation: string | null;
  setCurrentConversation: (conversationId: string | null) => void; // Renamed for consistency
  setCurrentConversationId: (conversationId: string | null) => void;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => void;
  createConversation: (userId: string, userName: string, userEmail: string) => Promise<string>;
  
  // Pricing-related functions
  getSubscriptionPrices: () => Promise<PricingPlan[]>;
  updateSubscriptionPrice: (planId: string, price: number) => Promise<void>;
  
  // User management
  getUsers: () => Promise<User[]>;
  
  // AI Trading Signals
  getTradingSignals: (market?: string, timeframe?: string, count?: number) => Promise<TradingSignal[]>;
  analyzeMarket: (symbol: string, timeframe?: string) => Promise<MarketAnalysis>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const BackendProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        if (!storedToken) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        const currentUser = await getCurrentUserAPI();
        setUser(currentUser);
        console.log("Current user loaded:", currentUser);
      } catch (error) {
        console.error('Error loading current user:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Load robots on mount
  useEffect(() => {
    const loadRobots = async () => {
      try {
        const fetchedRobots = await getRobotsAPI();
        setRobots(fetchedRobots);
        console.log("Robots loaded:", fetchedRobots);
      } catch (error) {
        console.error('Error loading robots:', error);
      }
    };
    
    loadRobots();
  }, []);

  // Load conversations if the user is logged in
  useEffect(() => {
    const loadConversations = async () => {
      if (user) {
        try {
          const userConversations = await getConversationsAPI();
          setConversations(userConversations);
          console.log("Conversations loaded:", userConversations);
        } catch (error) {
          console.error('Error loading conversations:', error);
        }
      }
    };
    
    loadConversations();
  }, [user]);

  const register = async (name: string, email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      console.log("Registering user:", { name, email });
      const response = await registerUserAPI(name, email, password);
      
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('authToken', response.access_token);
        toast({
          title: "Registration successful",
          description: "You have successfully registered.",
        });
        navigate('/dashboard');
        return response.user;
      } else {
        throw new Error("Registration failed: User data not returned from backend");
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      console.log("Logging in user:", email);
      const response = await loginUserAPI(email, password);
      
      // Special admin check for the specific email addresses
      const isAdminEmail = email === 'ndonjstanley@gmail.com' || email === 'stanleyndonj@gmail.com';
      
      if (response.user) {
        // Ensure admin status for specific emails
        if (isAdminEmail && !response.user.is_admin) {
          console.log("Override: Setting admin status for authorized email");
          response.user.is_admin = true;
          response.user.role = "admin";
        }
        
        setUser(response.user);
        localStorage.setItem('authToken', response.access_token);
        
        toast({
          title: "Login successful",
          description: "You have successfully logged in.",
        });
        
        // Redirect to dashboard or stored redirect URL
        const redirectUrl = localStorage.getItem('redirectAfterAuth');
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterAuth');
          navigate(redirectUrl);
        } else {
          if (response.user.is_admin) {
            navigate('/admin-dashboard');
          } else {
            navigate('/dashboard');
          }
        }
        
        return response.user;
      } else {
        throw new Error("Login failed: User data not returned from backend");
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log("Logging out user");
      await logoutUserAPI();
      setUser(null);
      localStorage.removeItem('authToken');
      toast({
        title: "Logout successful",
        description: "You have successfully logged out.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitRobotRequest = async (params: RobotRequestParams): Promise<RobotRequest> => {
    try {
      setLoading(true);
      console.log("Submitting robot request:", params);
      const request = await submitRobotRequestAPI(params);
      toast({
        title: "Request submitted",
        description: "Your request has been submitted successfully.",
      });
      return request;
    } catch (error: any) {
      console.error('Request submission failed:', error);
      toast({
        title: "Request submission failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserRobotRequests = useCallback(async (): Promise<RobotRequest[]> => {
    try {
      if (!user) {
        console.warn('User not logged in, cannot fetch robot requests.');
        return [];
      }
      console.log("Fetching robot requests for user:", user.id);
      return await getRobotRequestsAPI(user.id);
    } catch (error) {
      console.error('Error fetching user robot requests:', error);
      toast({
        title: "Error fetching requests",
        description: "Failed to load your robot requests. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  }, [user]);

  const fetchAllRobotRequests = useCallback(async (): Promise<RobotRequest[]> => {
    try {
      console.log("Fetching all robot requests");
      return await getAllRobotRequestsAPI();
    } catch (error) {
      console.error('Error fetching all robot requests:', error);
      toast({
        title: "Error fetching requests",
        description: "Failed to load robot requests. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  }, []);

  const updateRobotRequest = async (
    requestId: string,
    updates: any
  ): Promise<RobotRequest> => {
    try {
      setLoading(true);
      console.log("Updating robot request:", requestId, updates);
      const updatedRequest = await updateRobotRequestAPI(requestId, updates);
      toast({
        title: "Request updated",
        description: "The robot request has been updated successfully.",
      });
      return updatedRequest;
    } catch (error: any) {
      console.error('Request update failed:', error);
      toast({
        title: "Request update failed",
        description: error.message || "Failed to update the request. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRobots = useCallback(async (): Promise<Robot[]> => {
    try {
      console.log("Fetching all robots");
      const fetchedRobots = await getRobotsAPI();
      setRobots(fetchedRobots);
      return fetchedRobots;
    } catch (error) {
      console.error('Error fetching robots:', error);
      toast({
        title: "Error fetching robots",
        description: "Failed to load robots. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  }, []);

  const getRobotById = useCallback(async (id: string): Promise<Robot> => {
    try {
      console.log("Fetching robot by ID:", id);
      return await getRobotByIdAPI(id);
    } catch (error: any) {
      console.error(`Error fetching robot with ID ${id}:`, error);
      toast({
        title: "Error fetching robot",
        description: error.message || "Failed to load robot. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const addRobot = async (robotData: Omit<Robot, 'id' | 'created_at'>): Promise<Robot> => {
    try {
      setLoading(true);
      console.log("Adding new robot:", robotData);
      const newRobot = await addRobotAPI(robotData);
      await getRobots(); // Refresh the robots list
      toast({
        title: "Robot added",
        description: "The robot has been added successfully.",
      });
      return newRobot;
    } catch (error: any) {
      console.error('Failed to add robot:', error);
      toast({
        title: "Failed to add robot",
        description: error.message || "Failed to add the robot. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRobot = async (robot: Robot): Promise<Robot> => {
    try {
      setLoading(true);
      console.log("Updating robot:", robot);
      const updatedRobot = await updateRobotAPI(robot);
      await getRobots(); // Refresh the robots list
      toast({
        title: "Robot updated",
        description: "The robot has been updated successfully.",
      });
      return updatedRobot;
    } catch (error: any) {
      console.error('Failed to update robot:', error);
      toast({
        title: "Failed to update robot",
        description: error.message || "Failed to update the robot. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRobot = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      console.log("Deleting robot:", id);
      await deleteRobotAPI(id);
      await getRobots(); // Refresh the robots list
      toast({
        title: "Robot deleted",
        description: "The robot has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Failed to delete robot:', error);
      toast({
        title: "Failed to delete robot",
        description: error.message || "Failed to delete the robot. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPurchases = useCallback(async (): Promise<Purchase[]> => {
    try {
      if (!user) {
        console.warn('User not logged in, cannot fetch purchases.');
        return [];
      }
      console.log("Fetching purchases for user:", user.id);
      return await getUserPurchasesAPI(user.id);
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      toast({
        title: "Error fetching purchases",
        description: "Failed to load your purchases. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  }, [user]);

  const makePurchase = async (
    robotId: string,
    amount: number,
    currency: string,
    paymentMethod: string
  ): Promise<Purchase> => {
    try {
      setLoading(true);
      if (!user) {
        throw new Error('User not logged in.');
      }
      console.log("Making purchase:", { robotId, amount, currency, paymentMethod });
      const purchase = await makePurchaseAPI(user.id, robotId, amount, currency, paymentMethod);
      // Update user's robots_delivered status after a successful purchase
      setUser(prevUser => {
        if (prevUser) {
          return { ...prevUser, robots_delivered: true };
        }
        return prevUser;
      });
      toast({
        title: "Purchase successful",
        description: "Thank you for your purchase!",
      });
      return purchase;
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase failed",
        description: error.message || "Failed to complete purchase. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const initiateMpesaPayment = async (
    phone: string,
    amount: number,
    robotId: string
  ): Promise<any> => {
    try {
      setLoading(true);
      console.log("Initiating M-Pesa payment:", { phone, amount, robotId });
      const response = await initiateMpesaPaymentAPI(phone, amount, robotId);
      toast({
        title: "Payment initiated",
        description: "Please check your phone to complete the payment.",
      });
      return response;
    } catch (error: any) {
      console.error('M-Pesa payment initiation failed:', error);
      toast({
        title: "Payment initiation failed",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyMpesaPayment = async (checkoutRequestId: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log("Verifying M-Pesa payment:", checkoutRequestId);
      const verified = await verifyMpesaPaymentAPI(checkoutRequestId);
      if (verified) {
        toast({
          title: "Payment verified",
          description: "Your payment has been confirmed. Thank you!",
        });
      } else {
        toast({
          title: "Payment not confirmed",
          description: "Your payment could not be verified. Please try again later.",
          variant: "destructive",
        });
      }
      return verified;
    } catch (error: any) {
      console.error('M-Pesa payment verification failed:', error);
      toast({
        title: "Payment verification failed",
        description: error.message || "Failed to verify payment. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async (): Promise<User[]> => {
    try {
      console.log("Fetching all users");
      return await getUsersAPI();
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };

  const getTradingSignals = async (
    market?: string,
    timeframe?: string,
    count?: number
  ): Promise<TradingSignal[]> => {
    try {
      console.log("Fetching trading signals:", { market, timeframe, count });
      return await getTradingSignalsAPI(market, timeframe, count);
    } catch (error) {
      console.error('Error fetching trading signals:', error);
      toast({
        title: "Error fetching signals",
        description: "Failed to load trading signals. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };

  const analyzeMarket = async (
    symbol: string,
    timeframe?: string
  ): Promise<MarketAnalysis> => {
    try {
      console.log("Analyzing market:", { symbol, timeframe });
      return await analyzeMarketAPI(symbol, timeframe);
    } catch (error: any) {
      console.error('Market analysis failed:', error);
      toast({
        title: "Market analysis failed",
        description: error.message || "Failed to analyze market. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Chat-related functions
  const sendMessage = async (conversationId: string, text: string): Promise<void> => {
    try {
      console.log("Sending message:", { conversationId, text });
      // Update UI optimistically
      const tempId = `temp_${Date.now()}`;
      const newMessage: ChatMessage = {
        id: tempId,
        conversationId,
        sender: user?.is_admin ? 'admin' : 'user',
        senderId: user?.id || '',
        text,
        timestamp: new Date().toISOString(),
        read: true
      };
      
      // Add to UI immediately
      setChatMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage]
      }));
      
      // Update conversation last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: text,
                lastMessageTime: new Date().toISOString()
              }
            : conv
        )
      );
      
      // Send to backend
      await sendChatMessage(conversationId, text);
      
      // For admin messages, automatically add a "read receipt" from the other side after a delay
      // This is just for demo purposes until we have real-time functionality
      if (user?.is_admin) {
        setTimeout(() => {
          const readMessage: ChatMessage = {
            id: `read_${Date.now()}`,
            conversationId,
            sender: 'system',
            senderId: 'system',
            text: 'Message delivered',
            timestamp: new Date().toISOString(),
            read: true
          };
          
          setChatMessages(prev => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), readMessage]
          }));
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: "Your message could not be sent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markMessageAsRead = (messageId: string): void => {
    try {
      console.log("Marking message as read:", messageId);
      // Update local state
      setChatMessages(prev => {
        const newMessages = { ...prev };
        
        // Find the message in all conversations
        Object.keys(newMessages).forEach(convId => {
          newMessages[convId] = newMessages[convId].map(msg => 
            msg.id === messageId ? { ...msg, read: true } : msg
          );
        });
        
        return newMessages;
      });
      
      // Update backend (async, don't wait)
      markMessageRead(messageId).catch(error => {
        console.error('Failed to mark message as read:', error);
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const createConversation = async (
    userId: string,
    userName: string,
    userEmail: string
  ): Promise<string> => {
    try {
      console.log("Creating new conversation:", { userId, userName, userEmail });
      const result = await createNewConversation(userId, userName, userEmail);
      
      if (result.success) {
        const newConversation: Conversation = {
          id: result.conversation_id,
          userId,
          userName,
          userEmail,
          lastMessage: "Conversation started",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        };
        
        setConversations(prev => [...prev, newConversation]);
        setCurrentConversation(result.conversation_id);
        
        return result.conversation_id;
      } else {
        throw new Error("Failed to create conversation");
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast({
        title: "Failed to start conversation",
        description: "Could not start a new conversation. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Mock function for pricing plans
  const getSubscriptionPrices = async (): Promise<PricingPlan[]> => {
    // This would be replaced with an actual API call in production
    return [
      {
        id: "price_monthly",
        name: "Monthly Plan",
        price: 29.99,
        currency: "USD",
        interval: "monthly",
        features: [
          "Access to all trading robots",
          "24/7 Customer support",
          "Trading signals"
        ]
      },
      {
        id: "price_yearly",
        name: "Yearly Plan",
        price: 299.99,
        currency: "USD",
        interval: "yearly",
        features: [
          "Access to all trading robots",
          "24/7 Customer support",
          "Trading signals",
          "Market analysis",
          "Priority updates"
        ]
      }
    ];
  };
  
  // Mock function for updating subscription pricing
  const updateSubscriptionPrice = async (planId: string, price: number): Promise<void> => {
    // This would be replaced with an actual API call in production
    console.log(`Updating price for plan ${planId} to ${price}`);
    toast({
      title: "Price updated",
      description: `Successfully updated pricing for plan ${planId}`,
    });
  };

  const setCurrentConversationId = useCallback((conversationId: string | null) => {
    setCurrentConversation(conversationId);
  }, []);

  // Context value
  const value: BackendContextType = {
    user,
    loading,
    isLoading: loading, // Alias for loading
    loginUser: login,
    login,
    registerUser: register,
    register,
    logoutUser,
    submitRobotRequest,
    submitRequest: submitRobotRequest, // Alias
    getUserRobotRequests,
    fetchAllRobotRequests,
    updateRobotRequest,
    updateRobotRequestStatus: updateRobotRequest, // Alias
    getRobots,
    robots,
    getRobotById,
    addRobot,
    updateRobot,
    deleteRobot,
    makePurchase,
    purchaseRobot: makePurchase, // Alias
    getPurchases,
    initiateMpesaPayment,
    verifyMpesaPayment,
    verifyPayment: verifyMpesaPayment, // Alias
    
    // Chat-related functions
    conversations,
    chatMessages,
    currentConversation,
    setCurrentConversation,
    setCurrentConversationId,
    sendMessage,
    markMessageAsRead,
    createConversation,
    
    // Pricing-related functions
    getSubscriptionPrices,
    updateSubscriptionPrice,
    
    // User management
    getUsers,
    
    // AI Trading Signals
    getTradingSignals,
    analyzeMarket,
  };

  return (
    <BackendContext.Provider value={value}>
      {children}
    </BackendContext.Provider>
  );
};

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error('useBackend must be used within a BackendProvider');
  }
  return context;
};
