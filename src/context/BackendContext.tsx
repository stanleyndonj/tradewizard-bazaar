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
} from '@/lib/backend';
import {
  User,
  Robot,
  RobotRequest,
  Purchase,
  RobotRequestParams,
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

interface BackendContextType {
  user: User | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<User>;
  registerUser: (name: string, email: string, password: string) => Promise<User>;
  logoutUser: () => Promise<void>;
  submitRobotRequest: (params: RobotRequestParams) => Promise<RobotRequest>;
  getUserRobotRequests: () => Promise<RobotRequest[]>;
  fetchAllRobotRequests: () => Promise<RobotRequest[]>;
  updateRobotRequest: (requestId: string, updates: any) => Promise<RobotRequest>;
  getRobots: () => Promise<Robot[]>;
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
  getPurchases: () => Promise<Purchase[]>;
  initiateMpesaPayment: (
    phone: string,
    amount: number,
    robotId: string
  ) => Promise<any>;
  verifyMpesaPayment: (checkoutRequestId: string) => Promise<boolean>;
  // Chat-related functions
  conversations: Conversation[];
  chatMessages: Record<string, ChatMessage[]>;
  currentConversation: string | null;
  setCurrentConversationId: (conversationId: string | null) => void;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => void;
  createConversation: (userId: string, userName: string, userEmail: string) => Promise<string>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const BackendProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  const register = async (name: string, email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      const user = await registerUserAPI(name, email, password);
      setUser(user);
      toast({
        title: "Registration successful",
        description: "You have successfully registered.",
      });
      navigate('/dashboard');
      return user;
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
      const user = await loginUserAPI(email, password);
      setUser(user);
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
      
      return user;
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

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await logoutUserAPI();
      setUser(null);
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
      return await getRobotsAPI();
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
          senderId: 'admin',
          text: 'Thank you for your message. Our team will get back to you soon.',
          timestamp: new Date().toISOString(),
          read: false,
        };

        setChatMessages(prevMessages => {
          const conversationMessages = [...(prevMessages[conversationId] || []), adminResponse];
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
                lastMessage: adminResponse.text,
                lastMessageTime: adminResponse.timestamp,
                unreadCount: c.unreadCount + 1,
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
      const newMessages = { ...prevMessages };
      
      // Find the conversation that contains this message
      for (const conversationId in newMessages) {
        const index = newMessages[conversationId].findIndex(m => m.id === messageId);
        if (index !== -1) {
          // Mark the message as read
          newMessages[conversationId] = [...newMessages[conversationId]];
          newMessages[conversationId][index] = {
            ...newMessages[conversationId][index],
            read: true,
          };
          
          // Update unread count for this conversation
          setConversations(prevConversations => 
            prevConversations.map(c => {
              if (c.id === conversationId && c.unreadCount > 0) {
                return {
                  ...c,
                  unreadCount: c.unreadCount - 1,
                };
              }
              return c;
            })
          );
          
          break;
        }
      }
      
      return newMessages;
    });
  };

  const createConversation = async (userId: string, userName: string, userEmail: string): Promise<string> => {
    const newConversationId = `conv_${Date.now().toString()}`;
    
    const newConversation: Conversation = {
      id: newConversationId,
      userId,
      userName,
      userEmail,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
    };
    
    setConversations(prev => [...prev, newConversation]);
    setChatMessages(prev => ({ ...prev, [newConversationId]: [] }));
    
    return newConversationId;
  };

  // For demo purposes, add some mock conversations for admin users
  useEffect(() => {
    if (user?.is_admin && conversations.length === 0) {
      // Add mock conversations
      const mockConversations: Conversation[] = [
        {
          id: 'conv_1',
          userId: 'user_1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          lastMessage: 'Hello, I need help with my trading bot.',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          unreadCount: 2,
        },
        {
          id: 'conv_2',
          userId: 'user_2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          lastMessage: 'When will my robot be delivered?',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          unreadCount: 0,
        },
      ];
      
      setConversations(mockConversations);
      
      // Add mock messages
      const mockMessages: Record<string, ChatMessage[]> = {
        'conv_1': [
          {
            id: 'msg_1',
            conversationId: 'conv_1',
            sender: 'user',
            senderId: 'user_1',
            text: 'Hello, I need help with my trading bot.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read: false,
          },
          {
            id: 'msg_2',
            conversationId: 'conv_1',
            sender: 'user',
            senderId: 'user_1',
            text: 'It\'s not connecting to my exchange account.',
            timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
            read: false,
          },
        ],
        'conv_2': [
          {
            id: 'msg_3',
            conversationId: 'conv_2',
            sender: 'user',
            senderId: 'user_2',
            text: 'Hi, I purchased a trading robot yesterday.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            read: true,
          },
          {
            id: 'msg_4',
            conversationId: 'conv_2',
            sender: 'admin',
            senderId: 'admin',
            text: 'Hello Jane, thank you for your purchase. We\'re preparing your robot now.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
            read: true,
          },
          {
            id: 'msg_5',
            conversationId: 'conv_2',
            sender: 'user',
            senderId: 'user_2',
            text: 'When will my robot be delivered?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            read: true,
          },
        ],
      };
      
      setChatMessages(mockMessages);
    }
  }, [user, conversations.length]);

  const value = {
    user,
    loading,
    loginUser: login,
    registerUser: register,
    logoutUser: logout,
    submitRobotRequest,
    getUserRobotRequests,
    fetchAllRobotRequests,
    updateRobotRequest,
    getRobots,
    getRobotById,
    addRobot,
    updateRobot,
    deleteRobot,
    makePurchase,
    getPurchases,
    initiateMpesaPayment,
    verifyMpesaPayment,
    conversations,
    chatMessages,
    currentConversation,
    setCurrentConversationId,
    sendMessage,
    markMessageAsRead,
    createConversation,
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
