import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, Robot, RobotRequest, Purchase, TradingSignal, MarketAnalysis, ChatMessage, Conversation,
  loginUser, registerUser, getCurrentUser, logoutUser as apiLogoutUser,
  getRobots, getRobotById, addRobot as apiAddRobot, updateRobot as apiUpdateRobot, deleteRobot as apiDeleteRobot,
  getAllRobotRequests, getRobotRequests, updateRobotRequest as apiUpdateRobotRequest, 
  submitRobotRequest as apiSubmitRobotRequest,
  getUserPurchases, makePurchase,
  getUsers, getTradingSignals, analyzeMarket,
  initiateMpesaPayment as apiInitiateMpesaPayment, verifyMpesaPayment,
  getConversations, getMessages, sendChatMessage, markMessageRead, createNewConversation, getUnreadMessageCount
} from '@/lib/backend';
import { toast } from '@/hooks/use-toast';
import API_ENDPOINTS, { getAuthHeaders, handleApiResponse } from '@/lib/apiConfig';

// Define the BackendContext type
export interface BackendContextType {
  user: User | null;
  robots: Robot[];
  robotRequests: RobotRequest[];
  purchases: Purchase[];
  isLoading: boolean;
  subscriptionPrices: any[];
  
  // Chat related properties
  conversations: Conversation[];
  chatMessages: Record<string, ChatMessage[]>;
  currentConversation: string | null;
  
  // Auth functions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  
  // Robot functions
  getRobots: () => Promise<Robot[]>;
  addRobot: (robotData: Partial<Robot>) => Promise<Robot>;
  updateRobot: (id: string, robotData: Partial<Robot>) => Promise<Robot>;
  deleteRobot: (id: string) => Promise<boolean>;
  
  // Robot Request functions
  fetchAllRobotRequests: () => Promise<RobotRequest[]>;
  getUserRobotRequests: (userId: string) => Promise<RobotRequest[]>;
  updateRobotRequest: (id: string, data: Partial<RobotRequest>) => Promise<RobotRequest>;
  submitRobotRequest: (data: Partial<RobotRequest>) => Promise<RobotRequest>;
  
  // Purchase functions
  getPurchases: (userId: string) => Promise<Purchase[]>;
  purchaseRobot: (robotId: string, amount: number, currency: string, paymentMethod: string) => Promise<Purchase>;
  
  // User functions
  getUsers: () => Promise<User[]>;
  
  // AI Trading functions
  getTradingSignals: (market?: string, timeframe?: string, count?: number) => Promise<TradingSignal[]>;
  analyzeMarket: (symbol: string, timeframe?: string) => Promise<MarketAnalysis>;
  
  // Payment functions
  initiateMpesaPayment: (phoneNumber: string, amount: number, robotId: string) => Promise<any>;
  verifyPayment: (checkoutRequestId: string) => Promise<boolean>;
  
  // Make sure these subscription methods are properly defined
  getSubscriptionPrices: () => Promise<any[]>;
  updateSubscriptionPrice: (planId: string, price: number) => Promise<void>;
  
  // Chat functions
  loadConversations: () => Promise<Conversation[]>;
  sendMessage: (conversationId: string, text: string) => Promise<ChatMessage>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  setCurrentConversationId: (id: string | null) => void;
  createConversation: (userId: string, userName: string, userEmail: string) => Promise<Conversation>;
}

// Create the context with a default value
const BackendContext = createContext<BackendContextType | undefined>(undefined);

// Provider component
export const BackendProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionPrices, setSubscriptionPrices] = useState<any[]>([]);
  
  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    loadUser();
    // Load subscription prices regardless of user authentication
    loadSubscriptionPrices();
  }, []);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      
      // If there's a user, load their data
      if (userData) {
        await Promise.all([
          loadRobots(),
          loadPurchases(userData.id)
        ]);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRobots = async () => {
    try {
      const robotsData = await getRobots();
      setRobots(robotsData);
      return robotsData;
    } catch (error) {
      console.error('Error loading robots:', error);
      return [];
    }
  };

  const loadPurchases = async (userId: string) => {
    try {
      const purchasesData = await getUserPurchases(userId);
      setPurchases(purchasesData);
      return purchasesData;
    } catch (error) {
      console.error('Error loading purchases:', error);
      return [];
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);
      
      // Check if response has the expected structure
      if (response && response.user) {
        setUser(response.user);
        
        // Load relevant data after login
        if (response.user) {
          await Promise.all([
            loadRobots(),
            loadPurchases(response.user.id),
            loadSubscriptionPrices()
          ]);
        }
        
        toast({
          title: "Welcome back!",
          description: `Logged in as ${response.user.name || 'User'}`,
        });
      } else {
        console.error('Login response missing user data:', response);
        toast({
          title: "Login Error",
          description: "Invalid response from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await registerUser(name, email, password);
      
      // Check if userData has the expected structure
      if (userData && userData.id) {
        setUser(userData);
        
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully",
        });
      } else {
        console.error('Registration response missing user data:', userData);
        toast({
          title: "Registration Error",
          description: "Invalid response from server",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please check your information",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    try {
      await apiLogoutUser();
      setUser(null);
      setRobots([]);
      setRobotRequests([]);
      setPurchases([]);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllRobotRequests = async () => {
    try {
      const requests = await getAllRobotRequests();
      setRobotRequests(requests);
      return requests;
    } catch (error) {
      console.error('Error fetching robot requests:', error);
      toast({
        title: "Error",
        description: "Failed to load robot requests",
        variant: "destructive",
      });
      return [];
    }
  };

  const getUserRobotRequests = async (userId: string) => {
    try {
      const requests = await getRobotRequests(userId);
      return requests;
    } catch (error) {
      console.error('Error fetching user robot requests:', error);
      return [];
    }
  };

  const updateRobotRequest = async (id: string, data: Partial<RobotRequest>) => {
    try {
      // Ensure robot_type is included for API compatibility if updating status
      const updatedData = { ...data };
      const updatedRequest = await apiUpdateRobotRequest(id, updatedData);
      
      // Update the state with the new data
      setRobotRequests(prev => prev.map(req => 
        req.id === id ? { ...req, ...updatedRequest } : req
      ));
      
      return updatedRequest;
    } catch (error) {
      console.error('Error updating robot request:', error);
      throw error;
    }
  };

  const submitRobotRequest = async (data: Partial<RobotRequest>) => {
    try {
      // Ensure required fields for RobotRequestParams
      if (!data.robot_type || !data.trading_pairs || !data.timeframe || !data.risk_level) {
        throw new Error('Missing required fields for robot request');
      }
      
      const requestData = {
        robot_type: data.robot_type,
        trading_pairs: data.trading_pairs,
        timeframe: data.timeframe,
        risk_level: data.risk_level,
        // Include optional fields if present
        currency: data.currency,
        bot_name: data.bot_name,
        market: data.market,
        stake_amount: data.stake_amount,
        contract_type: data.contract_type,
        duration: data.duration,
        prediction: data.prediction,
        trading_strategy: data.trading_strategy,
        account_credentials: data.account_credentials,
        volume: data.volume,
        order_type: data.order_type,
        stop_loss: data.stop_loss,
        take_profit: data.take_profit,
        entry_rules: data.entry_rules,
        exit_rules: data.exit_rules,
        risk_management: data.risk_management,
        additional_parameters: data.additional_parameters
      };
      
      const newRequest = await apiSubmitRobotRequest(requestData);
      return newRequest;
    } catch (error) {
      console.error('Error submitting robot request:', error);
      throw error;
    }
  };

  const getPurchases = async (userId: string) => {
    try {
      const purchasesData = await getUserPurchases(userId);
      setPurchases(purchasesData);
      return purchasesData;
    } catch (error) {
      console.error('Error loading purchases:', error);
      return [];
    }
  };

  const purchaseRobot = async (robotId: string, amount: number, currency: string, paymentMethod: string) => {
    try {
      if (!user) throw new Error('User not logged in');
      
      const purchase = await makePurchase(user.id, robotId, amount, currency, paymentMethod);
      
      // Update purchases state
      setPurchases(prev => [...prev, purchase]);
      
      toast({
        title: "Purchase Successful",
        description: "You now have access to this robot",
      });
      
      return purchase;
    } catch (error) {
      console.error('Error purchasing robot:', error);
      throw error;
    }
  };

  const addRobot = async (robotData: Partial<Robot>) => {
    try {
      // Ensure required fields
      if (!robotData.name || !robotData.description || !robotData.type || robotData.price === undefined) {
        throw new Error('Missing required fields for robot');
      }
      
      const robot = {
        name: robotData.name,
        description: robotData.description,
        type: robotData.type,
        price: robotData.price,
        features: robotData.features || [],
        currency: robotData.currency || 'USD',
        category: robotData.category || 'paid',
        image_url: robotData.image_url || '',
        imageUrl: robotData.imageUrl || '',
        download_url: robotData.download_url
      };
      
      const newRobot = await apiAddRobot(robot);
      
      // Update robots state
      setRobots(prev => [...prev, newRobot]);
      
      toast({
        title: "Robot Added",
        description: "New robot has been added to the marketplace",
      });
      
      return newRobot;
    } catch (error) {
      console.error('Error adding robot:', error);
      throw error;
    }
  };

const updateRobot = async (id: string, robotData: Partial<Robot>) => {
  try {
    // Create a complete robot object with the id and partial data
    // This addresses the type mismatch by ensuring we're passing valid data to the API
    const robotToUpdate = {
      id,
      ...robotData
    };
    
    const updatedRobot = await apiUpdateRobot(robotToUpdate as Robot);
    
    // Update robots state
    setRobots(prev => prev.map(robot => 
      robot.id === id ? { ...robot, ...updatedRobot } : robot
    ));
    
    toast({
      title: "Robot Updated",
      description: "Robot details have been updated",
    });
    
    return updatedRobot;
  } catch (error) {
    console.error('Error updating robot:', error);
    throw error;
  }
};

  const deleteRobot = async (id: string) => {
    try {
      await apiDeleteRobot(id);
      
      // Update robots state
      setRobots(prev => prev.filter(robot => robot.id !== id));
      
      toast({
        title: "Robot Deleted",
        description: "Robot has been removed from the marketplace",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting robot:', error);
      throw error;
    }
  };

  const getUsersList = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        headers: getAuthHeaders(),
      });
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  const initiateMpesaPayment = async (phoneNumber: string, amount: number, robotId: string) => {
    try {
      return await apiInitiateMpesaPayment(phoneNumber, amount, robotId);
    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error);
      throw error;
    }
  };
  
  const verifyPayment = async (checkoutRequestId: string) => {
    try {
      return await verifyMpesaPayment(checkoutRequestId);
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  };

  const loadSubscriptionPrices = async () => {
    try {
      // Default plans as fallback
      const defaultPlans = [
        {
          id: 'basic-monthly',
          name: 'Basic AI Trading Signals',
          price: 29.99,
          currency: 'USD',
          interval: 'monthly' as const,
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
          interval: 'monthly' as const,
          features: [
            'All Basic features',
            'Advanced market analysis',
            'Real-time signal updates',
            'Direct AI chat support',
            'Custom alerts and notifications'
          ]
        }
      ];
      
      try {
        // Try to get prices from API
        const response = await fetch(API_ENDPOINTS.SUBSCRIPTION_PRICES, {
          headers: getAuthHeaders(),
        });
        const data = await handleApiResponse(response);
        
        if (data && Array.isArray(data) && data.length > 0) {
          setSubscriptionPrices(data);
          return data;
        } else {
          setSubscriptionPrices(defaultPlans);
          return defaultPlans;
        }
      } catch (error) {
        console.error('Error loading subscription prices:', error);
        setSubscriptionPrices(defaultPlans);
        return defaultPlans;
      }
    } catch (error) {
      console.error('Error in loadSubscriptionPrices:', error);
      return [];
    }
  };

  const getSubscriptionPrices = async () => {
    // If we already have prices loaded, return them
    if (subscriptionPrices.length > 0) {
      return subscriptionPrices;
    }
    
    // Otherwise load them
    return loadSubscriptionPrices();
  };

  const updateSubscriptionPrice = async (planId: string, price: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_SUBSCRIPTION_PRICE(planId), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price }),
      });
      
      await handleApiResponse(response);
      
      // Update prices in state
      setSubscriptionPrices(prev => prev.map(plan => 
        plan.id === planId ? { ...plan, price } : plan
      ));
      
      toast({
        title: "Price Updated",
        description: `The subscription price has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating subscription price:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update subscription price. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Chat functions
  const loadConversations = async () => {
    try {
      const conversationsData = await getConversations();
      setConversations(conversationsData);
      
      // Load messages for each conversation
      for (const conversation of conversationsData) {
        loadMessages(conversation.id);
      }
      
      return conversationsData;
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  };
  
  const loadMessages = async (conversationId: string) => {
    try {
      const messagesData = await getMessages(conversationId);
      setChatMessages(prev => ({
        ...prev,
        [conversationId]: messagesData
      }));
      return messagesData;
    } catch (error) {
      console.error(`Error loading messages for conversation ${conversationId}:`, error);
      return [];
    }
  };
  
  const sendMessage = async (conversationId: string, text: string) => {
    try {
      const message = await sendChatMessage(conversationId, text);
      
      // Update messages in state
      setChatMessages(prev => {
        const conversationMessages = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: [...conversationMessages, message]
        };
      });
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };
  
  const markMessageAsRead = async (messageId: string) => {
    try {
      await markMessageRead(messageId);
      
      // Update message status in state
      setChatMessages(prev => {
        const updatedMessages = { ...prev };
        
        for (const convId in updatedMessages) {
          updatedMessages[convId] = updatedMessages[convId].map(msg => 
            msg.id === messageId ? { ...msg, read: true } : msg
          );
        }
        
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };
  
  const setCurrentConversationId = (id: string | null) => {
    setCurrentConversation(id);
  };
  
  const createConversation = async (userId: string, userName: string, userEmail: string) => {
    try {
      const newConversation = await createNewConversation(userId, userName, userEmail);
      
      // Update conversations in state
      setConversations(prev => [...prev, newConversation]);
      setCurrentConversation(newConversation.id);
      
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const value: BackendContextType = {
    user,
    robots,
    robotRequests,
    purchases,
    isLoading,
    subscriptionPrices,
    conversations,
    chatMessages,
    currentConversation,
    
    // Auth functions
    login,
    register,
    logoutUser,
    
    // Robot functions
    getRobots: loadRobots,
    addRobot,
    updateRobot,
    deleteRobot,
    
    // Robot Request functions
    fetchAllRobotRequests,
    getUserRobotRequests,
    updateRobotRequest,
    submitRobotRequest,
    
    // Purchase functions
    getPurchases,
    purchaseRobot,
    
    // User functions
    getUsers: getUsersList,
    
    // AI Trading functions
    getTradingSignals,
    analyzeMarket,
    
    // Payment functions
    initiateMpesaPayment,
    verifyPayment,
    
    // Subscription functions
    getSubscriptionPrices,
    updateSubscriptionPrice,
    
    // Chat functions
    loadConversations,
    sendMessage,
    markMessageAsRead,
    setCurrentConversationId,
    createConversation
  };

  return (
    <BackendContext.Provider value={value}>
      {children}
    </BackendContext.Provider>
  );
};

// Custom hook to use the context
export const useBackend = () => {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error('useBackend must be used within a BackendProvider');
  }
  return context;
};
