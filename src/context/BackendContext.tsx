import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
} from '@/lib/backend';
import {
  User,
  Robot,
  RobotRequest,
  Purchase,
  RobotRequestParams,
  TradingSignal,
  MarketAnalysis,
} from '@/lib/backend';
import { toast } from '@/hooks/use-toast';

// Define the type for our chat-related state
export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: string; // 'user' or 'admin'
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

// PricingPlan interface for subscription pricing
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
      } catch (error) {
        console.error('Error loading robots:', error);
      }
    };
    
    loadRobots();
  }, []);

  const register = async (name: string, email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      const response = await registerUserAPI(name, email, password);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      toast({
        title: "Registration successful",
        description: "You have successfully registered.",
      });
      navigate('/dashboard');
      return response.user;
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
      const response = await loginUserAPI(email, password);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
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
        navigate('/dashboard');
      }
      
      return response.user;
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
        description: error.message || "Failed to complete the purchase. Please try again.",
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
      const paymentResponse = await initiateMpesaPaymentAPI(phone, amount, robotId);
      return paymentResponse;
    } catch (error: any) {
      console.error('Mpesa payment initiation failed:', error);
      toast({
        title: "Mpesa payment failed",
        description: error.message || "Failed to initiate Mpesa payment. Please try again.",
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
      const verificationResult = await verifyMpesaPaymentAPI(checkoutRequestId);
      return verificationResult;
    } catch (error: any) {
      console.error('Mpesa payment verification failed:', error);
      toast({
        title: "Mpesa payment verification failed",
        description: error.message || "Failed to verify Mpesa payment. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Set current conversation with proper naming
  const setCurrentConversationId = (conversationId: string | null) => {
    setCurrentConversation(conversationId);
  };

  // Chat-related functions
  const sendMessage = async (conversationId: string, text: string): Promise<void> => {
    // Check if this conversation exists
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Create a new message
    const newMessage: ChatMessage = {
      id: `msg_${Date.now().toString()}`,
      conversationId,
      sender: user?.is_admin ? 'admin' : 'user',
      senderId: user?.id || '',
      text,
      timestamp: new Date().toISOString(),
      read: true,
    };

    // Add message to state
    setChatMessages(prevMessages => {
      const conversationMessages = [...(prevMessages[conversationId] || []), newMessage];
      return {
        ...prevMessages,
        [conversationId]: conversationMessages,
      };
    });

    // Update conversation last message and time
    setConversations(prevConversations => 
      prevConversations.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    // In a real app, we would send this to the server
    // For this mock, simulate a response after a delay
    if (!user?.is_admin) {
      setTimeout(() => {
        const adminResponse: ChatMessage = {
          id: `msg_${Date.now().toString()}`,
          conversationId,
          sender: 'admin',
          senderId: 'admin_user_id',
          text: 'Thank you for your message. An advisor will get back to you soon.',
          timestamp: new Date().toISOString(),
          read: false,
        };

        // Add admin response to state
        setChatMessages(prevMessages => {
          const conversationMessages = [...(prevMessages[conversationId] || []), adminResponse];
          return {
            ...prevMessages,
            [conversationId]: conversationMessages,
          };
        });

        // Update conversation with new message
        setConversations(prevConversations =>
          prevConversations.map(c => {
            if (c.id === conversationId) {
              return {
                ...c,
                lastMessage: adminResponse.text,
                lastMessageTime: adminResponse.timestamp,
                unreadCount: c.unreadCount + 1
              };
            }
            return c;
          })
        );
      }, 1000);
    }
  };

  const markMessageAsRead = (messageId: string): void => {
    setChatMessages(prevMessages => {
      const updatedMessages = { ...prevMessages };

      // Find the message in all conversations
      for (const conversationId in updatedMessages) {
        const messages = updatedMessages[conversationId];
        const messageIndex = messages.findIndex(msg => msg.id === messageId);

        if (messageIndex !== -1) {
          // Update the message
          const updatedMessage = { ...messages[messageIndex], read: true };
          updatedMessages[conversationId] = [
            ...messages.slice(0, messageIndex),
            updatedMessage,
            ...messages.slice(messageIndex + 1)
          ];

          // Update unread count in the conversation
          if (messages[messageIndex].sender === 'admin') {
            setConversations(prevConversations =>
              prevConversations.map(c => {
                if (c.id === conversationId && c.unreadCount > 0) {
                  return { ...c, unreadCount: c.unreadCount - 1 };
                }
                return c;
              })
            );
          }

          break;
        }
      }

      return updatedMessages;
    });
  };

  const createConversation = async (
    userId: string,
    userName: string,
    userEmail: string
  ): Promise<string> => {
    // In a real app, this would make an API call to create a conversation
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      userId,
      userName,
      userEmail,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    };

    setConversations(prev => [...prev, newConversation]);
    setCurrentConversation(newConversation.id);

    // In a real app, we would return the ID from the server
    return newConversation.id;
  };

  // Mock implementation for getSubscriptionPrices
  const getSubscriptionPrices = async (): Promise<PricingPlan[]> => {
    // In a real app, this would be an API call
    // For now, return mock data
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
        ]
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
        ]
      }
    ];
  };

  // Mock implementation for updateSubscriptionPrice
  const updateSubscriptionPrice = async (planId: string, price: number): Promise<void> => {
    // In a real app, this would be an API call to update the price
    console.log(`Updating subscription price for plan ${planId} to ${price}`);
    // Mock successful update
    toast({
      title: "Price updated",
      description: `The price for plan ${planId} has been updated to ${price}`,
    });
  };

  // Mock implementation for getUsers
  const getUsers = async (): Promise<User[]> => {
    // In a real app, this would be an API call to get all users
    // For now, return mock data
    return [
      {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        is_admin: false,
        robots_delivered: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        is_admin: false,
        robots_delivered: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@example.com',
        is_admin: true,
        created_at: new Date().toISOString()
      }
    ];
  };

  // Implementation for getTradingSignals
  const getTradingSignals = async (
    market: string = 'forex',
    timeframe: string = '1h',
    count: number = 10
  ): Promise<TradingSignal[]> => {
    try {
      return await getTradingSignalsAPI(market, timeframe, count);
    } catch (error) {
      console.error('Error fetching trading signals:', error);
      toast({
        title: "Error fetching signals",
        description: "Failed to load trading signals. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Implementation for analyzeMarket
  const analyzeMarket = async (
    symbol: string,
    timeframe: string = '1h'
  ): Promise<MarketAnalysis> => {
    try {
      return await analyzeMarketAPI(symbol, timeframe);
    } catch (error) {
      console.error('Error analyzing market:', error);
      toast({
        title: "Error analyzing market",
        description: "Failed to analyze market. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const contextValue: BackendContextType = {
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
    conversations,
    chatMessages,
    currentConversation,
    setCurrentConversation,
    setCurrentConversationId,
    sendMessage,
    markMessageAsRead,
    createConversation,
    getSubscriptionPrices,
    updateSubscriptionPrice,
    getUsers,
    getTradingSignals,
    analyzeMarket
  };

  return (
    <BackendContext.Provider value={contextValue}>
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
