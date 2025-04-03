
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  Robot, 
  RobotRequest, 
  Purchase, 
  TradingSignal,
  MarketAnalysis,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getRobots,
  getRobotById,
  getRobotRequests,
  getAllRobotRequests,
  submitRobotRequest,
  updateRobotRequest,
  getUserPurchases,
  makePurchase,
  getTradingSignals,
  analyzeMarket
} from '@/lib/backend';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

// Types for chat functionality
export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  title: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

// Context type
interface BackendContextType {
  // Auth
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  
  // Robots
  robots: Robot[];
  fetchRobots: () => Promise<void>;
  fetchRobotById: (id: string) => Promise<Robot | null>;
  addRobot: (robot: Omit<Robot, 'id' | 'created_at'>) => Promise<Robot>;
  updateRobot: (robot: Robot) => Promise<Robot>;
  deleteRobot: (id: string) => Promise<void>;
  
  // Robot Requests
  robotRequests: RobotRequest[];
  fetchRobotRequests: () => Promise<RobotRequest[]>;
  fetchAllRobotRequests: () => Promise<RobotRequest[]>;
  submitRequest: (requestData: any) => Promise<void>;
  updateRequest: (requestId: string, updates: any) => Promise<void>;
  
  // Purchases
  purchases: Purchase[];
  fetchPurchases: () => Promise<Purchase[]>;
  purchaseRobot: (robotId: string, amount: number, currency: string, paymentMethod: string) => Promise<void>;
  
  // Trading Signals
  tradingSignals: TradingSignal[];
  fetchTradingSignals: (market?: string, timeframe?: string, count?: number) => Promise<TradingSignal[]>;
  analyzeMarket: (symbol: string, timeframe?: string) => Promise<MarketAnalysis | null>;
  
  // Chat
  conversations: Conversation[];
  chatMessages: Record<string, ChatMessage[]>;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setChatMessages: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
  sendMessage: (conversationId: string, text: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  getUnreadCount: () => number;
}

// Create context
const BackendContext = createContext<BackendContextType | undefined>(undefined);

// Hook to use the context
export const useBackend = () => {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error('useBackend must be used within a BackendProvider');
  }
  return context;
};

// Demo data generators for chat
const getDefaultConversationsForAdmin = (adminId: string) => {
  const adminConversationId = `admin-support-${Date.now()}-1`;
  const customerConversationId = `customer-support-${Date.now()}-2`;
  
  const adminConversation = {
    id: adminConversationId,
    participants: [adminId, 'system'],
    title: "System Notifications",
    lastMessage: "Welcome to the admin panel!",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0
  };
  
  const customerConversation = {
    id: customerConversationId,
    participants: [adminId, 'customer-123'],
    title: "John Doe",
    lastMessage: "I'd like some help with my robot configuration",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1
  };
  
  const adminMessages: ChatMessage[] = [
    {
      id: `msg-${Date.now()}-1`,
      conversationId: adminConversationId,
      sender: 'system',
      senderId: 'system',
      text: "Welcome to the admin panel! You'll receive system notifications here.",
      timestamp: new Date().toISOString(),
      read: true
    },
    {
      id: `msg-${Date.now()}-2`,
      conversationId: adminConversationId,
      sender: 'system',
      senderId: 'system',
      text: "You have 2 new robot requests waiting for approval.",
      timestamp: new Date().toISOString(),
      read: true
    },
    {
      id: `msg-${Date.now()}-3`,
      conversationId: adminConversationId,
      sender: 'system',
      senderId: 'system',
      text: "New user registered: sarah@example.com",
      timestamp: new Date().toISOString(),
      read: true
    }
  ];
  
  const customerMessages: ChatMessage[] = [
    {
      id: `msg-${Date.now()}-4`,
      conversationId: customerConversationId,
      sender: 'customer',
      senderId: 'customer-123',
      text: "Hello, I have a question about my trading robot.",
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      read: true
    },
    {
      id: `msg-${Date.now()}-5`,
      conversationId: customerConversationId,
      sender: 'admin',
      senderId: adminId,
      text: "Hi there! How can I help you with your trading robot?",
      timestamp: new Date(Date.now() - 3300000).toISOString(), // 55 minutes ago
      read: true
    },
    {
      id: `msg-${Date.now()}-6`,
      conversationId: customerConversationId,
      sender: 'customer',
      senderId: 'customer-123',
      text: "I'd like some help with my robot configuration. It's not working as expected.",
      timestamp: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      read: false
    }
  ];
  
  return {
    conversations: [adminConversation, customerConversation],
    messages: {
      [adminConversationId]: adminMessages,
      [customerConversationId]: customerMessages
    } as Record<string, ChatMessage[]>
  };
};

const getDefaultConversationForUser = (userId: string, userName: string) => {
  const conversationId = `support-${Date.now()}`;
  
  const supportConversation = {
    id: conversationId,
    participants: [userId, 'admin'],
    title: "Support Chat",
    lastMessage: "Hello! How can we help you today?",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0
  };
  
  const messages: ChatMessage[] = [
    {
      id: `msg-${Date.now()}-1`,
      conversationId: conversationId,
      sender: 'admin',
      senderId: 'admin',
      text: `Hello ${userName}! How can we help you today?`,
      timestamp: new Date().toISOString(),
      read: true
    }
  ];
  
  return {
    conversations: [supportConversation],
    messages: {
      [conversationId]: messages
    } as Record<string, ChatMessage[]>
  };
};

// Provider component
export const BackendProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const navigate = useNavigate();
  
  // State
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  
  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  
  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Load initial data
          await Promise.all([
            fetchRobots(),
            fetchRobotRequests(),
            fetchPurchases()
          ]);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Initialize chat data when user is available
  useEffect(() => {
    if (user && conversations.length === 0) {
      if (user.is_admin) {
        // Provide demo conversations for admin
        const demoData = getDefaultConversationsForAdmin(user.id);
        setConversations(demoData.conversations);
        setChatMessages(prevMessages => ({
          ...prevMessages,
          ...demoData.messages
        }));
      } else {
        // Create a default support conversation for regular users
        const userData = getDefaultConversationForUser(user.id, user.name);
        setConversations(userData.conversations);
        setChatMessages(prevMessages => ({
          ...prevMessages,
          ...userData.messages
        }));
      }
    }
  }, [user, conversations.length]);
  
  // Auth methods
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      
      // Load initial data
      await Promise.all([
        fetchRobots(),
        fetchRobotRequests(),
        fetchPurchases()
      ]);
      
      // Redirect based on role
      if (userData.is_admin) {
        navigate('/admin-dashboard');
      } else {
        // Check if there's a saved redirect
        const redirectPath = localStorage.getItem('redirectAfterAuth');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterAuth');
          navigate(redirectPath);
        } else {
          navigate('/customer-dashboard');
        }
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await registerUser(name, email, password);
      setUser(userData);
      
      // Redirect to dashboard
      navigate('/customer-dashboard');
      
      toast({
        title: "Registration successful",
        description: `Welcome to TradeWizard, ${name}!`,
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setRobots([]);
      setRobotRequests([]);
      setPurchases([]);
      setTradingSignals([]);
      setConversations([]);
      setChatMessages({});
      
      navigate('/');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Robot methods
  const fetchRobots = async () => {
    try {
      const robotsData = await getRobots();
      setRobots(robotsData);
      return robotsData;
    } catch (error) {
      console.error('Error fetching robots:', error);
      return [];
    }
  };
  
  const fetchRobotById = async (id: string) => {
    try {
      const robot = await getRobotById(id);
      return robot;
    } catch (error) {
      console.error(`Error fetching robot ${id}:`, error);
      return null;
    }
  };
  
  // New function to add a robot
  const addRobot = async (robot: Omit<Robot, 'id' | 'created_at'>) => {
    try {
      // This would be a real API call in production
      const newRobot: Robot = {
        id: `robot-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...robot
      };
      
      setRobots(prevRobots => [...prevRobots, newRobot]);
      return newRobot;
    } catch (error) {
      console.error('Error adding robot:', error);
      throw error;
    }
  };
  
  // New function to update a robot
  const updateRobot = async (robot: Robot) => {
    try {
      // This would be a real API call in production
      setRobots(prevRobots => 
        prevRobots.map(r => r.id === robot.id ? {...robot} : r)
      );
      return robot;
    } catch (error) {
      console.error('Error updating robot:', error);
      throw error;
    }
  };
  
  // New function to delete a robot
  const deleteRobot = async (id: string) => {
    try {
      // This would be a real API call in production
      setRobots(prevRobots => prevRobots.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting robot:', error);
      throw error;
    }
  };
  
  // Robot request methods
  const fetchRobotRequests = async () => {
    if (!user) return [];
    
    try {
      const requests = await getRobotRequests(user.id);
      setRobotRequests(requests);
      return requests;
    } catch (error) {
      console.error('Error fetching robot requests:', error);
      return [];
    }
  };
  
  const fetchAllRobotRequests = async () => {
    if (!user || !user.is_admin) return [];
    
    try {
      const requests = await getAllRobotRequests();
      return requests;
    } catch (error) {
      console.error('Error fetching all robot requests:', error);
      return [];
    }
  };
  
  const submitRequest = async (requestData: any) => {
    try {
      await submitRobotRequest(requestData);
      
      toast({
        title: "Request submitted",
        description: "Your robot request has been submitted successfully. We'll notify you once it's processed.",
      });
      
      await fetchRobotRequests();
    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "An error occurred while submitting your request.",
        variant: "destructive",
      });
    }
  };
  
  const updateRequest = async (requestId: string, updates: any) => {
    try {
      await updateRobotRequest(requestId, updates);
      
      // Refresh the requests list
      if (user?.is_admin) {
        await fetchAllRobotRequests();
      } else {
        await fetchRobotRequests();
      }
      
      toast({
        title: "Request updated",
        description: "The robot request has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred while updating the request.",
        variant: "destructive",
      });
    }
  };
  
  // Purchase methods
  const fetchPurchases = async () => {
    if (!user) return [];
    
    try {
      const purchases = await getUserPurchases(user.id);
      setPurchases(purchases);
      return purchases;
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return [];
    }
  };
  
  const purchaseRobot = async (robotId: string, amount: number, currency: string, paymentMethod: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to purchase robots.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    try {
      await makePurchase(user.id, robotId, amount, currency, paymentMethod);
      
      // Refresh purchases
      await fetchPurchases();
      
      toast({
        title: "Purchase successful",
        description: "Your robot has been purchased successfully. You can download it from your dashboard.",
      });
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "An error occurred during the purchase.",
        variant: "destructive",
      });
    }
  };
  
  // Trading signals methods
  const fetchTradingSignals = async (market: string = 'forex', timeframe: string = '1h', count: number = 10) => {
    try {
      // If user is admin, bypass subscription check
      if (user && user.is_admin) {
        const signals = await getTradingSignals(market, timeframe, count);
        setTradingSignals(signals);
        return signals;
      } else {
        // For regular users, check subscription
        if (!user || !user.robots_delivered) {
          // For demo purposes, still return some signals but fewer
          // In a real app, you'd throw an error or return empty array
          const demoSignals = await getTradingSignals(market, timeframe, 3);
          setTradingSignals(demoSignals);
          return demoSignals;
        }
        
        const signals = await getTradingSignals(market, timeframe, count);
        setTradingSignals(signals);
        return signals;
      }
    } catch (error) {
      console.error('Error fetching trading signals:', error);
      if (error instanceof Error && error.message.includes('Subscription required')) {
        // This is expected for non-subscribed users
        return [];
      }
      
      toast({
        title: "Error loading signals",
        description: "Failed to load trading signals. Please try again later.",
        variant: "destructive",
      });
      return [];
    }
  };
  
  const analyzeMarket = async (symbol: string, timeframe: string = '1h') => {
    try {
      // If user is admin, bypass subscription check
      if (user && user.is_admin) {
        const analysis = await analyzeMarket(symbol, timeframe);
        return analysis;
      } else {
        // For regular users, check subscription
        if (!user || !user.robots_delivered) {
          throw new Error('Subscription required to access AI market analysis');
        }
        
        const analysis = await analyzeMarket(symbol, timeframe);
        return analysis;
      }
    } catch (error) {
      console.error('Error analyzing market:', error);
      if (error instanceof Error && error.message.includes('Subscription required')) {
        // This is expected for non-subscribed users
        toast({
          title: "Subscription required",
          description: "You need to purchase a robot to access the full AI market analysis.",
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Analysis failed",
        description: "Failed to analyze the market. Please try again later.",
        variant: "destructive",
      });
      return null;
    }
  };
  
  // Chat methods
  const sendMessage = (conversationId: string, text: string) => {
    if (!user) return;
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      conversationId,
      sender: user.is_admin ? 'admin' : 'customer',
      senderId: user.id,
      text,
      timestamp: new Date().toISOString(),
      read: true
    };
    
    // Add to messages
    setChatMessages(prev => {
      const conversationMessages = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: [...conversationMessages, newMessage]
      };
    });
    
    // Update conversation
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: text,
            lastMessageTime: newMessage.timestamp
          };
        }
        return conv;
      })
    );
    
    // In a real app, send to backend/API
    // For demo, simulate admin response after delay
    if (!user.is_admin) {
      setTimeout(() => {
        const adminReply: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          conversationId,
          sender: 'admin',
          senderId: 'admin',
          text: "Thanks for your message! An admin will respond to you shortly.",
          timestamp: new Date().toISOString(),
          read: false
        };
        
        setChatMessages(prev => {
          const conversationMessages = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: [...conversationMessages, adminReply]
          };
        });
        
        setConversations(prev => 
          prev.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: adminReply.text,
                lastMessageTime: adminReply.timestamp,
                unreadCount: conv.unreadCount + 1
              };
            }
            return conv;
          })
        );
      }, 1000);
    }
  };
  
  const markConversationAsRead = (conversationId: string) => {
    // Mark all messages as read
    setChatMessages(prev => {
      const conversationMessages = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: conversationMessages.map(msg => ({
          ...msg,
          read: true
        }))
      };
    });
    
    // Reset unread count
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0
          };
        }
        return conv;
      })
    );
  };
  
  const getUnreadCount = () => {
    return conversations.reduce((count, conv) => count + conv.unreadCount, 0);
  };
  
  // Context value
  const value: BackendContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    robots,
    fetchRobots,
    fetchRobotById,
    addRobot,
    updateRobot,
    deleteRobot,
    robotRequests,
    fetchRobotRequests,
    fetchAllRobotRequests,
    submitRequest,
    updateRequest,
    purchases,
    fetchPurchases,
    purchaseRobot,
    tradingSignals,
    fetchTradingSignals,
    analyzeMarket,
    conversations,
    chatMessages,
    setConversations,
    setChatMessages,
    sendMessage,
    markConversationAsRead,
    getUnreadCount
  };
  
  return (
    <BackendContext.Provider value={value}>
      {children}
    </BackendContext.Provider>
  );
};
