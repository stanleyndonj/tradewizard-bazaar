// Backend context for Trading Robot app
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  User, 
  Robot, 
  RobotRequest, 
  Purchase, 
  TradingSignal, 
  MarketAnalysis,
  ChatMessage,
  Conversation,
  // API functions
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  getRobots,
  getRobotById,
  addRobot,
  updateRobot,
  deleteRobot,
  getAllRobotRequests,
  getRobotRequests,
  submitRobotRequest,
  updateRobotRequest,
  getUserPurchases,
  makePurchase,
  initiateMpesaPayment,
  verifyMpesaPayment,
  getTradingSignals,
  analyzeMarket,
  getConversations,
  getMessages,
  sendChatMessage,
  markMessageRead,
  createNewConversation,
  getUnreadMessageCount
} from '../lib/backend';
import { toast } from '@/hooks/use-toast';
import API_ENDPOINTS from '../lib/apiConfig';

// Define the backend context type
interface BackendContextType {
  user: User | null;
  robots: Robot[];
  robotRequests: RobotRequest[];
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  isLoading: boolean;
  
  // User authentication
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutUser: () => Promise<void>;
  
  // Robot management
  addNewRobot: (robot: Omit<Robot, 'id' | 'created_at'>) => Promise<void>;
  updateExistingRobot: (robot: Robot) => Promise<void>;
  removeRobot: (id: string) => Promise<void>;
  
  // Robot functions with different naming
  addRobot: (robot: Omit<Robot, 'id' | 'created_at'>) => Promise<void>;
  updateRobot: (robot: Robot) => Promise<void>;
  deleteRobot: (id: string) => Promise<void>;
  getUsers: () => Promise<User[]>;
  getRobots: () => Promise<Robot[]>;
  
  // Robot requests
  submitRequest: (requestData: any) => Promise<void>;
  updateRequest: (requestId: string, updates: any) => Promise<void>;
  submitRobotRequest: (requestData: any) => Promise<void>;
  updateRobotRequest: (requestId: string, updates: any) => Promise<void>;
  fetchAllRobotRequests: () => Promise<void>;
  getUserRobotRequests: (userId: string) => Promise<void>;
  
  // Purchases
  createPurchase: (robotId: string, amount: number, currency: string, paymentMethod: string) => Promise<void>;
  purchaseRobot: (robotId: string, amount: number, currency: string, paymentMethod: string) => Promise<void>;
  getPurchases: (userId: string) => Promise<Purchase[]>;
  
  // M-Pesa Payments
  initiatePayment: (phone: string, amount: number, robotId: string) => Promise<any>;
  verifyPayment: (checkoutRequestId: string) => Promise<boolean>;
  initiateMpesaPayment: (phone: string, amount: number, robotId: string) => Promise<any>;
  
  // Subscription management
  updateSubscriptionPrice: (planId: string, price: number) => Promise<void>;
  getSubscriptionPrices: () => Promise<any[]>;
  
  // AI Trading Signals
  getTradingSignals: (market?: string, timeframe?: string, count?: number) => Promise<TradingSignal[]>;
  analyzeMarket: (symbol: string, timeframe?: string) => Promise<MarketAnalysis>;
  
  // Chat functionality
  conversations: Conversation[];
  chatMessages: Record<string, ChatMessage[]>;
  currentConversation: string | null;
  setCurrentConversationId: (conversationId: string | null) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  createConversation: (userId: string, userName: string, userEmail: string) => Promise<void>;
  unreadMessageCount: number;
}

// Create the context
const BackendContext = createContext<BackendContextType | undefined>(undefined);

// Provider component
interface BackendProviderProps {
  children: ReactNode;
}

export const BackendProvider: React.FC<BackendProviderProps> = ({ children }) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chat state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  
  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const newSocket = io(API_ENDPOINTS.SOCKET_IO, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });
      
      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });
      
      newSocket.on('new_message', (message) => {
        console.log('New message received:', message);
        // Update messages in the current conversation
        setChatMessages(prev => {
          const conversationMessages = prev[message.conversationId] || [];
          // Check if message already exists to prevent duplicates
          if (!conversationMessages.some(m => m.id === message.id)) {
            return {
              ...prev,
              [message.conversationId]: [...conversationMessages, message]
            };
          }
          return prev;
        });
        
        // Update unread count for the affected conversation
        if (message.sender !== (user.is_admin ? 'admin' : 'user')) {
          setConversations(prev => {
            return prev.map(conv => {
              if (conv.id === message.conversationId) {
                return {
                  ...conv,
                  lastMessage: message.text,
                  lastMessageTime: message.timestamp,
                  unreadCount: conv.unreadCount + 1
                };
              }
              return conv;
            });
          });
          
          // Update total unread count
          setUnreadMessageCount(prev => prev + 1);
        }
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [user]);
  
  // Load current user on mount
  useEffect(() => {
    loadCurrentUser();
    loadRobots();
  }, []);
  
  // Load robot requests when user changes
  useEffect(() => {
    if (user) {
      if (user.is_admin) {
        loadAllRobotRequests();
      } else {
        loadUserRobotRequests(user.id);
      }
      loadUserPurchases(user.id);
      loadConversations();
      loadUnreadCount();
    }
  }, [user]);
  
  // Load current user
  const loadCurrentUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading current user:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };
  
  // Load robots
  const loadRobots = async () => {
    try {
      const robotsData = await getRobots();
      setRobots(robotsData);
    } catch (error) {
      console.error('Error loading robots:', error);
    }
  };
  
  // Load all robot requests (admin)
  const loadAllRobotRequests = async () => {
    try {
      const requests = await getAllRobotRequests();
      setRobotRequests(requests);
    } catch (error) {
      console.error('Error loading all robot requests:', error);
    }
  };
  
  // Load user's robot requests
  const loadUserRobotRequests = async (userId: string) => {
    try {
      const requests = await getRobotRequests(userId);
      setRobotRequests(requests);
    } catch (error) {
      console.error('Error loading user robot requests:', error);
    }
  };
  
  // Load user's purchases
  const loadUserPurchases = async (userId: string) => {
    try {
      const purchasesData = await getUserPurchases(userId);
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Error loading user purchases:', error);
    }
  };
  
  // Register user
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const result = await registerUser(name, email, password);
      localStorage.setItem('authToken', result.access_token);
      setUser(result.user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${result.user.name}!`,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      setError((error as Error).message);
      toast({
        title: "Registration failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      localStorage.setItem('authToken', result.access_token);
      setUser(result.user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${result.user.name}!`,
      });
    } catch (error) {
      console.error('Login failed:', error);
      setError((error as Error).message);
      toast({
        title: "Login failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      localStorage.removeItem('authToken');
      setUser(null);
      setRobotRequests([]);
      setPurchases([]);
      setConversations([]);
      setChatMessages({});
      setCurrentConversation(null);
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      setError((error as Error).message);
      toast({
        title: "Logout failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Add a new robot
  const addNewRobot = async (robot: Omit<Robot, 'id' | 'created_at'>) => {
    try {
      await addRobot(robot);
      loadRobots();
      toast({
        title: "Robot added",
        description: `The robot ${robot.name} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error adding robot:', error);
      setError((error as Error).message);
      toast({
        title: "Error adding robot",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };
  
  // Update an existing robot
  const updateExistingRobot = async (robot: Robot) => {
    try {
      await updateRobot(robot);
      loadRobots();
      toast({
        title: "Robot updated",
        description: `The robot ${robot.name} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating robot:', error);
      setError((error as Error).message);
      toast({
        title: "Error updating robot",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };
  
  // Remove a robot
  const removeRobot = async (id: string) => {
    try {
      await deleteRobot(id);
      loadRobots();
      toast({
        title: "Robot deleted",
        description: "The robot has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting robot:', error);
      setError((error as Error).message);
      toast({
        title: "Error deleting robot",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };
  
  // Submit a robot request
  const submitRequest = async (requestData: any) => {
    try {
      await submitRobotRequest(requestData);
      if (user) {
        if (user.is_admin) {
          loadAllRobotRequests();
        } else {
          loadUserRobotRequests(user.id);
        }
      }
      toast({
        title: "Request submitted",
        description: "Your robot request has been submitted successfully.",
      });
    } catch (error) {
      console.error('Error submitting robot request:', error);
      setError((error as Error).message);
      toast({
        title: "Error submitting request",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Update a robot request
  const updateRequest = async (requestId: string, updates: any) => {
    try {
      await updateRobotRequest(requestId, updates);
      if (user) {
        if (user.is_admin) {
          loadAllRobotRequests();
        } else {
          loadUserRobotRequests(user.id);
        }
      }
      toast({
        title: "Request updated",
        description: "The robot request has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating robot request:', error);
      setError((error as Error).message);
      toast({
        title: "Error updating request",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };
  
  // Create a purchase
  const createPurchase = async (robotId: string, amount: number, currency: string, paymentMethod: string) => {
    if (!user) {
      setError('User not authenticated');
      toast({
        title: "Authentication required",
        description: "Please login to make a purchase.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await makePurchase(user.id, robotId, amount, currency, paymentMethod);
      loadUserPurchases(user.id);
      toast({
        title: "Purchase successful",
        description: "Your purchase has been completed successfully.",
      });
    } catch (error) {
      console.error('Error making purchase:', error);
      setError((error as Error).message);
      toast({
        title: "Error making purchase",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Initiate M-Pesa payment
  const initiatePayment = async (phone: string, amount: number, robotId: string) => {
    try {
      const result = await initiateMpesaPayment(phone, amount, robotId);
      toast({
        title: "Payment initiated",
        description: "Check your phone to complete the payment.",
      });
      return result;
    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error);
      setError((error as Error).message);
      toast({
        title: "Error initiating payment",
        description: (error as Error).message,
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Verify M-Pesa payment
  const verifyPayment = async (checkoutRequestId: string) => {
    try {
      const result = await verifyMpesaPayment(checkoutRequestId);
      if (result) {
        toast({
          title: "Payment verified",
          description: "Your payment has been verified successfully.",
        });
      } else {
        toast({
          title: "Payment pending",
          description: "Your payment is still being processed. Please try again later.",
        });
      }
      return result;
    } catch (error) {
      console.error('Error verifying M-Pesa payment:', error);
      setError((error as Error).message);
      toast({
        title: "Error verifying payment",
        description: (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Chat functions
  
  // Load conversations
  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const conversationsData = await getConversations();
      
      // Format conversations and calculate unread count
      const formattedConversations = conversationsData.map(conv => {
        const messagesForConv = chatMessages[conv.id] || [];
        const unreadCount = messagesForConv.filter(
          msg => !msg.read && msg.sender !== (user.is_admin ? 'admin' : 'user')
        ).length;
        
        return {
          ...conv,
          unreadCount
        };
      });
      
      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };
  
  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    try {
      const messagesData = await getMessages(conversationId);
      setChatMessages(prev => ({
        ...prev,
        [conversationId]: messagesData
      }));
      
      // Mark messages as read
      messagesData.forEach(msg => {
        if (!msg.read && msg.sender !== (user?.is_admin ? 'admin' : 'user')) {
          markMessageAsRead(msg.id);
        }
      });
      
      // Update unread count for this conversation
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unreadCount: 0
            };
          }
          return conv;
        });
      });
      
      // Also update total unread count
      loadUnreadCount();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  
  // Send a message
  const sendMessage = async (conversationId: string, text: string) => {
    try {
      const result = await sendChatMessage(conversationId, text);
      
      // Add the message to the UI immediately
      const newMessage: ChatMessage = {
        id: result.id || `temp-${Date.now()}`,
        conversationId,
        sender: user?.is_admin ? 'admin' : 'user',
        senderId: user?.id || '',
        text,
        timestamp: new Date().toISOString(),
        read: true
      };
      
      setChatMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage]
      }));
      
      // Update the conversation's last message
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: text,
              lastMessageTime: new Date().toISOString()
            };
          }
          return conv;
        });
      });
      
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };
  
  // Mark a message as read
  const markMessageAsRead = async (messageId: string) => {
    try {
      await markMessageRead(messageId);
      
      // Update message in state
      setChatMessages(prev => {
        const newMessages = { ...prev };
        
        Object.keys(newMessages).forEach(convId => {
          newMessages[convId] = newMessages[convId].map(msg => {
            if (msg.id === messageId) {
              return { ...msg, read: true };
            }
            return msg;
          });
        });
        
        return newMessages;
      });
      
      // Update unread count
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };
  
  // Create a new conversation
  const createConversation = async (userId: string, userName: string, userEmail: string) => {
    try {
      const result = await createNewConversation(userId, userName, userEmail);
      
      // Add the new conversation to state
      const newConversation: Conversation = {
        id: result.id,
        userId,
        userName,
        userEmail,
        lastMessage: "Conversation started",
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation.id);
      
      // Load messages for the new conversation
      await loadMessages(newConversation.id);
      
      return result;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };
  
  // Set current conversation
  const setCurrentConversationId = (conversationId: string | null) => {
    setCurrentConversation(conversationId);
    
    // If a conversation is selected, load its messages
    if (conversationId) {
      loadMessages(conversationId);
    }
  };
  
  // Load unread message count
  const loadUnreadCount = async () => {
    try {
      const result = await getUnreadMessageCount();
      setUnreadMessageCount(result.unread_count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };
  
  // Add functions with different naming for compatibility
  const getUsers = async (): Promise<User[]> => {
    try {
      // Mock implementation - replace with actual API call
      return [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          is_admin: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Customer User',
          email: 'customer@example.com',
          is_admin: false,
          created_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };
  
  const getRobotsImpl = async (): Promise<Robot[]> => {
    try {
      // This should be the actual API call
      return robots;
    } catch (error) {
      console.error('Error fetching robots:', error);
      throw error;
    }
  };
  
  const addRobotImpl = async (robot: Omit<Robot, 'id' | 'created_at'>) => {
    await addNewRobot(robot);
  };
  
  const updateRobotImpl = async (robot: Robot) => {
    await updateExistingRobot(robot);
  };
  
  const deleteRobotImpl = async (id: string) => {
    await removeRobot(id);
  };
  
  const submitRobotRequestImpl = async (requestData: any) => {
    await submitRequest(requestData);
  };
  
  const updateRobotRequestImpl = async (requestId: string, updates: any) => {
    await updateRequest(requestId, updates);
  };
  
  const fetchAllRobotRequestsImpl = async () => {
    await loadAllRobotRequests();
  };
  
  const getUserRobotRequestsImpl = async (userId: string) => {
    await loadUserRobotRequests(userId);
  };
  
  const getPurchasesImpl = async (userId: string): Promise<Purchase[]> => {
    try {
      // Mockup implementation
      return purchases;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }
  };
  
  const purchaseRobotImpl = async (robotId: string, amount: number, currency: string, paymentMethod: string) => {
    await createPurchase(robotId, amount, currency, paymentMethod);
  };
  
  const initiateMpesaPaymentImpl = async (phone: string, amount: number, robotId: string) => {
    return await initiatePayment(phone, amount, robotId);
  };
  
  // Subscription management functions
  const updateSubscriptionPrice = async (planId: string, price: number) => {
    try {
      // Mock implementation
      console.log(`Updating subscription plan ${planId} to price ${price}`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Subscription updated",
        description: `Plan ${planId} price updated to ${price}`
      });
      return true;
    } catch (error) {
      console.error('Error updating subscription price:', error);
      throw error;
    }
  };
  
  const getSubscriptionPrices = async () => {
    try {
      // Mock implementation
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
    } catch (error) {
      console.error('Error fetching subscription prices:', error);
      throw error;
    }
  };
  
  const value: BackendContextType = {
    user,
    robots,
    robotRequests,
    purchases,
    loading,
    error,
    isLoading: loading,
    register,
    login,
    logout,
    logoutUser: logout,
    addNewRobot,
    updateExistingRobot,
    removeRobot,
    submitRequest,
    updateRequest,
    createPurchase,
    initiatePayment,
    verifyPayment,
    getTradingSignals,
    analyzeMarket,
    conversations,
    chatMessages,
    currentConversation,
    setCurrentConversationId,
    loadConversations,
    loadMessages,
    sendMessage,
    markMessageAsRead,
    createConversation,
    unreadMessageCount,
    
    // Additional functions with different naming
    getUsers,
    getRobots: getRobotsImpl,
    addRobot: addRobotImpl,
    updateRobot: updateRobotImpl,
    deleteRobot: deleteRobotImpl,
    submitRobotRequest: submitRobotRequestImpl,
    updateRobotRequest: updateRobotRequestImpl,
    fetchAllRobotRequests: fetchAllRobotRequestsImpl,
    getUserRobotRequests: getUserRobotRequestsImpl,
    getPurchases: getPurchasesImpl,
    purchaseRobot: purchaseRobotImpl,
    initiateMpesaPayment: initiateMpesaPaymentImpl,
    updateSubscriptionPrice,
    getSubscriptionPrices
  };

  return (
    <BackendContext.Provider value={value}>
      {children}
    </BackendContext.Provider>
  );
};

// Custom hook to use the backend context
export const useBackend = () => {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error('useBackend must be used within a BackendProvider');
  }
  return context;
};
