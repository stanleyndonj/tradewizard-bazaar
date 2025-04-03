
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  Robot, 
  RobotRequest, 
  Purchase,
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  getRobots,
  getRobotById,
  getRobotRequests,
  getAllRobotRequests,
  submitRobotRequest,
  updateRobotRequest,
  getUserPurchases,
  makePurchase,
  initiateMpesaPayment,
  verifyMpesaPayment,
  RobotRequestParams
} from '@/lib/backend';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { FullPageLoader } from '@/components/ui/loader';

// Define the chat interfaces (we'll store these locally for now)
export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'admin';
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

interface Message {
  id: string;
  userId: string;
  title: string;
  content: string;
  read: boolean;
  timestamp: string;
}

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
  isLoading: boolean;
  robots: Robot[];
  robotRequests: RobotRequest[];
  purchases: Purchase[];
  messages: Message[];
  conversations: Conversation[];
  chatMessages: Record<string, ChatMessage[]>;
  currentConversation: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchRobots: () => Promise<void>;
  fetchRobotRequests: () => Promise<void>;
  fetchAllRobotRequests: () => Promise<RobotRequest[]>;
  fetchPurchases: () => Promise<void>;
  submitRequest: (params: RobotRequestParams) => Promise<RobotRequest>;
  updateRobotRequestStatus: (requestId: string, updates: {status?: string; is_delivered?: boolean; download_url?: string; notes?: string; progress?: number;}) => Promise<void>;
  purchaseRobot: (robotId: string, amount: number, currency: string, paymentMethod: string) => Promise<void>;
  initiateMpesaPayment: (phone: string, amount: number, robotId: string) => Promise<string>;
  verifyPayment: (checkoutRequestId: string) => Promise<boolean>;
  refetchData: () => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => void;
  setCurrentConversation: (conversationId: string | null) => void;
  getUsers: () => Promise<User[]>;
  getRobotById: (id: string) => Robot | undefined;
  addRobot: (robot: Omit<Robot, 'id' | 'created_at'>) => Promise<void>;
  updateRobot: (id: string, updates: Partial<Robot>) => Promise<void>;
  deleteRobot: (id: string) => Promise<void>;
  createConversation: (userId: string, userName: string, userEmail: string) => void;
  getSubscriptionPrices: () => Promise<PricingPlan[]>;
  updateSubscriptionPrice: (planId: string, newPrice: number) => Promise<void>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

// Local storage for chat data (in a real app, this would be in the database)
const localStorageKey = 'tradewizard_chat_data';

const getInitialChatData = () => {
  const storedData = localStorage.getItem(localStorageKey);
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (e) {
      console.error('Error parsing chat data from localStorage:', e);
    }
  }
  
  return {
    conversations: [],
    messages: {}
  };
};

// Implement default conversations and messages for demo purposes
const getDefaultConversationsForAdmin = (userId: string) => {
  const adminConversationId = `conv-admin-${Date.now()}`;
  const customerConversationId = `conv-customer-${Date.now()}`;
  
  const adminConversation = {
    id: adminConversationId,
    userId: 'admin-demo',
    userName: 'Admin Demo',
    userEmail: 'admin@tradewizard.com',
    lastMessage: "Can you help with the AI trading platform?",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 2
  };
  
  const customerConversation = {
    id: customerConversationId,
    userId: 'customer-demo',
    userName: 'Customer Demo',
    userEmail: 'customer@example.com',
    lastMessage: "Is there a discount for annual subscriptions?",
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 1
  };
  
  const adminMessages: ChatMessage[] = [
    {
      id: `msg-${Date.now()}-1`,
      conversationId: adminConversationId,
      sender: 'user',
      senderId: 'admin-demo',
      text: "Hello, I need help setting up the AI trading platform.",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true
    },
    {
      id: `msg-${Date.now()}-2`,
      conversationId: adminConversationId,
      sender: 'admin',
      senderId: userId,
      text: "Hi there! I'd be happy to help. What specific aspects are you struggling with?",
      timestamp: new Date(Date.now() - 7100000).toISOString(),
      read: true
    },
    {
      id: `msg-${Date.now()}-3`,
      conversationId: adminConversationId,
      sender: 'user',
      senderId: 'admin-demo',
      text: "Can you help with the AI trading platform?",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: false
    }
  ];
  
  const customerMessages: ChatMessage[] = [
    {
      id: `msg-${Date.now()}-4`,
      conversationId: customerConversationId,
      sender: 'user',
      senderId: 'customer-demo',
      text: "Hello, I'm interested in your AI trading signals service.",
      timestamp: new Date(Date.now() - 4800000).toISOString(),
      read: true
    },
    {
      id: `msg-${Date.now()}-5`,
      conversationId: customerConversationId,
      sender: 'admin',
      senderId: userId,
      text: "Great to hear that! Our AI trading signals provide real-time market insights and trade recommendations.",
      timestamp: new Date(Date.now() - 4700000).toISOString(),
      read: true
    },
    {
      id: `msg-${Date.now()}-6`,
      conversationId: customerConversationId,
      sender: 'user',
      senderId: 'customer-demo',
      text: "Is there a discount for annual subscriptions?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
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

// Create a default conversation for a regular user
const getDefaultConversationForUser = (userId: string, userName: string) => {
  const conversationId = `conv-support-${Date.now()}`;
  
  const supportConversation = {
    id: conversationId,
    userId: 'support',
    userName: 'Support Team',
    userEmail: 'support@tradewizard.com',
    lastMessage: "How can I help you today?",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0
  };
  
  const messages: ChatMessage[] = [
    {
      id: `msg-${Date.now()}-1`,
      conversationId: conversationId,
      sender: 'admin',
      senderId: 'support',
      text: "Welcome to TradeWizard! How can I help you today?",
      timestamp: new Date().toISOString(),
      read: false
    }
  ];
  
  return {
    conversations: [supportConversation],
    messages: {
      [conversationId]: messages
    } as Record<string, ChatMessage[]>
  };
};

const saveChatData = (conversations: Conversation[], messages: Record<string, ChatMessage[]>) => {
  localStorage.setItem(localStorageKey, JSON.stringify({ conversations, messages }));
};

export const BackendProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Chat state
  const [chatData] = useState(getInitialChatData());
  const [conversations, setConversations] = useState<Conversation[]>(chatData.conversations || []);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(chatData.messages || {});
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  
  // Add this state for subscription plans
  const [subscriptionPlans, setSubscriptionPlans] = useState<PricingPlan[]>([
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
  ]);
  
  // Initialize the context by loading the user
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // If we have a user, load their data
          await Promise.all([
            fetchRobots(),
            fetchRobotRequests(),
            fetchPurchases()
          ]);
        } else {
          // No user logged in
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);
  
  // Save chat data to localStorage whenever it changes
  useEffect(() => {
    saveChatData(conversations, chatMessages);
  }, [conversations, chatMessages]);

  // Provide default chat data for demo purposes
  useEffect(() => {
    // Only populate demo data if user exists and there are no conversations yet
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
  
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Attempt to login with real backend
      const loggedInUser = await loginUser(email, password);
      setUser(loggedInUser);
      
      // Load user data after login
      await Promise.all([
        fetchRobots(),
        fetchRobotRequests(),
        fetchPurchases()
      ]);
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      
      // Check if there's a redirect saved
      const redirectPath = localStorage.getItem('redirectAfterAuth');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterAuth');
        navigate(redirectPath);
      } else {
        // Redirect based on user role
        if (loggedInUser.is_admin) {
          navigate('/admin-dashboard');
        } else {
          navigate('/customer-dashboard');
        }
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error; // Re-throw so the UI can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Try to register with the backend
      const newUser = await registerUser(name, email, password);
      setUser(newUser);
      
      // Initialize empty data for the new user
      setRobots([]);
      setRobotRequests([]);
      setPurchases([]);
      
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      
      // Redirect based on user role
      if (newUser.is_admin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error; // Re-throw so the component can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setRobotRequests([]);
      setPurchases([]);
      setMessages([]);
      setCurrentConversation(null);
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const fetchRobots = async () => {
    try {
      const fetchedRobots = await getRobots();
      setRobots(fetchedRobots);
    } catch (error) {
      console.error('Error fetching robots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch robots",
        variant: "destructive",
      });
    }
  };

  const fetchRobotRequests = async () => {
    try {
      if (user) {
        console.log("Fetching robot requests for user:", user.id);
        const fetchedRequests = await getRobotRequests(user.id);
        console.log("Fetched requests:", fetchedRequests);
        setRobotRequests(fetchedRequests);
      }
    } catch (error) {
      console.error('Error fetching robot requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch robot requests",
        variant: "destructive",
      });
    }
  };
  
  const fetchAllRobotRequests = async () => {
    try {
      if (user && user.is_admin) {
        console.log("Admin fetching all robot requests");
        const fetchedRequests = await getAllRobotRequests();
        console.log("Admin fetched requests:", fetchedRequests);
        setRobotRequests(fetchedRequests);
        return fetchedRequests; // Return the fetched requests
      }
      return []; // Return empty array if no requests were fetched
    } catch (error) {
      console.error('Error fetching all robot requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch robot requests",
        variant: "destructive",
      });
      return []; // Return empty array on error
    }
  };

  const fetchPurchases = async () => {
    try {
      if (user) {
        const fetchedPurchases = await getUserPurchases(user.id);
        setPurchases(fetchedPurchases);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch purchases",
        variant: "destructive",
      });
    }
  };

  const submitRequest = async (params: RobotRequestParams): Promise<RobotRequest> => {
    try {
      if (!user) {
        throw new Error('You must be logged in to submit a request');
      }
      
      console.log("Submitting robot request with params:", params);
      
      // Submit the robot request with all fields
      const newRequest = await submitRobotRequest(params);
      
      console.log("New request created:", newRequest);
      
      setRobotRequests(prev => [...prev, newRequest]);
      
      toast({
        title: "Success",
        description: "Your robot request has been submitted successfully",
      });
      
      return newRequest;
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit request",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const updateRobotRequestStatus = async (
    requestId: string,
    updates: {
      status?: string;
      is_delivered?: boolean;
      download_url?: string;
      notes?: string;
      progress?: number;
    }
  ) => {
    try {
      if (!user || !user.is_admin) {
        throw new Error('Admin access required');
      }
      
      console.log("Updating robot request:", requestId, updates);
      const updatedRequest = await updateRobotRequest(requestId, updates);
      console.log("Updated request:", updatedRequest);
      
      // Update the request in the state
      setRobotRequests(prev => 
        prev.map(req => req.id === requestId ? updatedRequest : req)
      );
      
      toast({
        title: "Success",
        description: "Robot request updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update request",
        variant: "destructive",
      });
    }
  };

  const purchaseRobot = async (
    robotId: string,
    amount: number,
    currency: string,
    paymentMethod: string
  ) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to make a purchase');
      }
      
      const newPurchase = await makePurchase(user.id, robotId, amount, currency, paymentMethod);
      setPurchases(prev => [...prev, newPurchase]);
      
      toast({
        title: "Success",
        description: "Your purchase was completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete purchase",
        variant: "destructive",
      });
    }
  };

  // M-Pesa integration
  const handleMpesaPayment = async (
    phone: string,
    amount: number,
    robotId: string
  ) => {
    try {
      const response = await initiateMpesaPayment(phone, amount, robotId);
      
      toast({
        title: "Payment Initiated",
        description: "Check your phone for the M-Pesa prompt",
      });
      
      return response.checkoutRequestID;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initiate M-Pesa payment";
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const checkPaymentStatus = async (checkoutRequestId: string) => {
    try {
      return await verifyMpesaPayment(checkoutRequestId);
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  };

  const refetchData = async () => {
    await Promise.all([
      fetchRobots(),
      user?.is_admin ? fetchAllRobotRequests() : fetchRobotRequests(),
      fetchPurchases()
    ]);
  };
  
  // Chat functionality (stored locally for now)
  const sendMessage = async (conversationId: string, text: string) => {
    if (!user) {
      throw new Error('You must be logged in to send messages');
    }
    
    // Find the conversation
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Create a new message
    const newMessage: ChatMessage = {
      id: `cm${Date.now()}`,
      conversationId,
      sender: user.is_admin ? 'admin' : 'user',
      senderId: user.id,
      text,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Add the message to the conversation
    setChatMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));
    
    // Update the conversation's last message
    setConversations(prev => 
      prev.map(c => 
        c.id === conversationId 
          ? { 
              ...c, 
              lastMessage: text, 
              lastMessageTime: newMessage.timestamp,
              // If admin is sending to user or user is sending to admin, increment unread count
              unreadCount: user.is_admin ? c.unreadCount : c.unreadCount + 1
            } 
          : c
      )
    );

    // For demo purposes, simulate an automatic response after a short delay
    if (!user.is_admin) {
      setTimeout(() => {
        const responseOptions = [
          "Thanks for your message! Our team will review this and get back to you shortly.",
          "I've received your inquiry and will look into this for you. Is there anything else you need?",
          "Thank you for contacting support. We typically respond within 24 hours for standard queries.",
          "Your question has been received. Our trading experts will provide a detailed response soon."
        ];
        
        const responseText = responseOptions[Math.floor(Math.random() * responseOptions.length)];
        
        const adminResponse: ChatMessage = {
          id: `cm${Date.now() + 1}`,
          conversationId,
          sender: 'admin',
          senderId: 'support',
          text: responseText,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        // Add the admin response
        setChatMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), adminResponse]
        }));
        
        // Update conversation
        setConversations(prev => 
          prev.map(c => 
            c.id === conversationId 
              ? { 
                  ...c, 
                  lastMessage: responseText, 
                  lastMessageTime: adminResponse.timestamp,
                  unreadCount: c.unreadCount + 1
                } 
              : c
          )
        );
      }, 3000);
    }
  };
  
  const markMessageAsRead = (messageId: string) => {
    // Update the message as read
    let foundConversationId = null;
    
    setChatMessages(prev => {
      const updated = { ...prev };
      
      // Find the conversation containing this message
      for (const [convId, messages] of Object.entries(updated)) {
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex >= 0) {
          foundConversationId = convId;
          updated[convId] = messages.map(msg => 
            msg.id === messageId ? { ...msg, read: true } : msg
          );
          break;
        }
      }
      
      return updated;
    });
    
    // Update the conversation's unread count if needed
    if (foundConversationId) {
      setConversations(prev => 
        prev.map(c => {
          if (c.id === foundConversationId) {
            // Count remaining unread messages
            const unreadMessages = chatMessages[c.id]?.filter(
              msg => !msg.read && 
              ((user?.is_admin && msg.sender === 'user') || 
              (!user?.is_admin && msg.sender === 'admin'))
            ) || [];
            return { ...c, unreadCount: unreadMessages.length };
          }
          return c;
        })
      );
    }
  };
  
  // Create a new conversation
  const createConversation = (userId: string, userName: string, userEmail: string) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(c => c.userId === userId);
    if (existingConversation) {
      setCurrentConversation(existingConversation.id);
      return;
    }
    
    // Create a new conversation
    const newConversation: Conversation = {
      id: `conv${Date.now()}`,
      userId,
      userName,
      userEmail,
      lastMessage: "New conversation started",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    };
    
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversation(newConversation.id);
    
    // Initialize empty message array for the conversation
    setChatMessages(prev => ({
      ...prev,
      [newConversation.id]: []
    }));
    
    // For a new conversation, add a welcome message
    if (userId === 'support') {
      const welcomeMessage: ChatMessage = {
        id: `cm${Date.now()}`,
        conversationId: newConversation.id,
        sender: 'admin',
        senderId: 'support',
        text: "Welcome to TradeWizard! How can I help you today?",
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setChatMessages(prev => ({
        ...prev,
        [newConversation.id]: [welcomeMessage]
      }));
      
      setConversations(prev => 
        prev.map(c => 
          c.id === newConversation.id 
            ? { 
                ...c, 
                lastMessage: welcomeMessage.text, 
                lastMessageTime: welcomeMessage.timestamp,
                unreadCount: 1
              } 
            : c
        )
      );
    }
  };

  const getUsers = async (): Promise<User[]> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real implementation, we would fetch from the backend
      // Mock some users for now
      return [
        {
          id: 'usr1',
          name: 'John Doe',
          email: 'john@example.com',
          is_admin: false,
          robots_delivered: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'usr2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          is_admin: false,
          robots_delivered: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'usr3',
          name: 'Admin User',
          email: 'admin@example.com',
          is_admin: true,
          created_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };
  
  const getRobotById = (id: string) => {
    return robots.find(robot => robot.id === id);
  };
  
  const addRobot = async (robot: Omit<Robot, 'id' | 'created_at'>) => {
    if (!user?.is_admin) {
      throw new Error('Only admins can add robots');
    }
    
    // Create a new robot with generated ID
    const newRobot: Robot = {
      ...robot,
      id: `r${Date.now()}`,
      created_at: new Date().toISOString()
    };
    
    // Add to robots list - in a real app, we would call an API
    setRobots(prev => [...prev, newRobot]);
    
    toast({
      title: "Success",
      description: `Robot "${newRobot.name}" has been added`,
    });
  };
  
  const updateRobot = async (id: string, updates: Partial<Robot>) => {
    if (!user?.is_admin) {
      throw new Error('Only admins can update robots');
    }
    
    // Update the robot - in a real app, we would call an API
    setRobots(prev => 
      prev.map(robot => 
        robot.id === id ? { ...robot, ...updates } : robot
      )
    );
    
    toast({
      title: "Success",
      description: "Robot has been updated",
    });
  };
  
  const deleteRobot = async (id: string) => {
    if (!user?.is_admin) {
      throw new Error('Only admins can delete robots');
    }
    
    // Remove the robot - in a real app, we would call an API
    setRobots(prev => prev.filter(robot => robot.id !== id));
    
    toast({
      title: "Success",
      description: "Robot has been deleted",
    });
  };
  
  // Implement the subscription price functions
  const getSubscriptionPrices = async (): Promise<PricingPlan[]> => {
    // In a real implementation, we would fetch this from the backend
    // For now, we'll just return the local state
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return subscriptionPlans;
    } catch (error) {
      console.error('Error fetching subscription prices:', error);
      return [];
    }
  };
  
  const updateSubscriptionPrice = async (planId: string, newPrice: number): Promise<void> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update subscription plan price in local state
      setSubscriptionPlans(prev => 
        prev.map(plan => 
          plan.id === planId ? { ...plan, price: newPrice } : plan
        )
      );
      
      // In a real implementation, we would make an API call here
      console.log(`Updated price for plan ${planId} to ${newPrice}`);
    } catch (error) {
      console.error('Error updating subscription price:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    robots,
    robotRequests,
    purchases,
    messages,
    conversations,
    chatMessages,
    currentConversation,
    login,
    register,
    logout,
    fetchRobots,
    fetchRobotRequests,
    fetchAllRobotRequests,
    fetchPurchases,
    submitRequest,
    updateRobotRequestStatus,
    purchaseRobot,
    initiateMpesaPayment: handleMpesaPayment,
    verifyPayment: checkPaymentStatus,
    refetchData,
    sendMessage,
    markMessageAsRead,
    setCurrentConversation,
    getUsers,
    getRobotById,
    addRobot,
    updateRobot,
    deleteRobot,
    createConversation,
    getSubscriptionPrices,
    updateSubscriptionPrice
  };

  if (isLoading) {
    return <FullPageLoader text="Loading application..." />;
  }

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
