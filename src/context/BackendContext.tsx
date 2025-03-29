
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
  submitRobotRequest,
  getUserPurchases,
  makePurchase,
  initiateMpesaPayment,
  verifyMpesaPayment
} from '@/lib/backend';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  mockUsers, 
  mockRobots, 
  mockRobotRequests, 
  mockPurchases,
  mockMessages, 
  mockConversations, 
  mockChatMessages,
  Message,
  Conversation,
  ChatMessage,
  getMockDataForCurrentUser
} from '@/lib/mockData';
import { FullPageLoader } from '@/components/ui/loader';

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
  fetchPurchases: () => Promise<void>;
  submitRequest: (robotType: string, tradingPairs: string, timeframe: string, riskLevel: number) => Promise<void>;
  purchaseRobot: (robotId: string, amount: number, currency: string, paymentMethod: string) => Promise<void>;
  initiateMpesaPayment: (phone: string, amount: number, robotId: string) => Promise<string>;
  verifyPayment: (checkoutRequestId: string) => Promise<boolean>;
  refetchData: () => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markMessageAsRead: (messageId: string) => void;
  setCurrentConversation: (conversationId: string | null) => void;
  getUsers: () => User[];
  getRobotById: (id: string) => Robot | undefined;
  addRobot: (robot: Omit<Robot, 'id' | 'created_at'>) => Promise<void>;
  updateRobot: (id: string, updates: Partial<Robot>) => Promise<void>;
  deleteRobot: (id: string) => Promise<void>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const BackendProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);

  // Initialize the context by loading the user
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        // For demo purposes, if we can't get a real user, use a mock one
        if (currentUser) {
          setUser(currentUser);
          
          // If we have a user, load their data
          await Promise.all([
            fetchRobots(),
            fetchRobotRequests(),
            fetchPurchases()
          ]);
          
          // Load mock messages and conversations for UI demo
          setMessages(mockMessages);
          
          // Get user-specific conversations
          if (currentUser.is_admin) {
            // Admin sees all conversations
            setConversations(mockConversations);
            setChatMessages(mockChatMessages);
          } else {
            // Regular user sees only their conversations
            const userConversations = mockConversations.filter(
              conv => conv.userId === currentUser.id
            );
            setConversations(userConversations);
            
            // Filter chat messages for user's conversations
            const userChatMessages: Record<string, ChatMessage[]> = {};
            userConversations.forEach(conv => {
              if (mockChatMessages[conv.id]) {
                userChatMessages[conv.id] = mockChatMessages[conv.id];
              }
            });
            setChatMessages(userChatMessages);
          }
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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // For demonstration, check if there's a matching mock user
      const mockUser = mockUsers.find(u => u.email === email);
      
      if (mockUser && password === 'password') {
        // Simulate successful login with mock data
        setUser(mockUser);
        
        // Load mock data for this user
        setRobots(mockRobots);
        
        // Get user-specific data
        if (mockUser.is_admin) {
          // Admin sees all data
          setRobotRequests(mockRobotRequests);
          setPurchases(mockPurchases);
          setMessages(mockMessages);
          setConversations(mockConversations);
          setChatMessages(mockChatMessages);
        } else {
          // Regular user sees only their data
          const userData = getMockDataForCurrentUser(mockUser.id);
          setRobotRequests(userData.robotRequests);
          setPurchases(userData.purchases);
          setConversations(userData.conversations);
          
          // Filter chat messages for user's conversations
          const userChatMessages: Record<string, ChatMessage[]> = {};
          userData.conversations.forEach(conv => {
            if (mockChatMessages[conv.id]) {
              userChatMessages[conv.id] = mockChatMessages[conv.id];
            }
          });
          setChatMessages(userChatMessages);
        }
        
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
          if (mockUser.is_admin) {
            navigate('/admin-dashboard');
          } else {
            navigate('/customer-dashboard');
          }
        }
        
        return;
      }
      
      // Try real login if mock didn't work
      const loggedInUser = await loginUser(email, password);
      setUser(loggedInUser);
      
      // Load user data after login
      await Promise.all([
        fetchRobots(),
        fetchRobotRequests(),
        fetchPurchases()
      ]);
      
      // Set mock messages for UI demo
      setMessages(mockMessages);
      
      // Get user-specific conversations for UI demo
      if (loggedInUser.is_admin) {
        // Admin sees all conversations
        setConversations(mockConversations);
        setChatMessages(mockChatMessages);
      } else {
        // Regular user sees only their conversations
        const userConversations = mockConversations.filter(
          conv => conv.userId === loggedInUser.id
        );
        setConversations(userConversations);
        
        // Filter chat messages for user's conversations
        const userChatMessages: Record<string, ChatMessage[]> = {};
        userConversations.forEach(conv => {
          if (mockChatMessages[conv.id]) {
            userChatMessages[conv.id] = mockChatMessages[conv.id];
          }
        });
        setChatMessages(userChatMessages);
      }
      
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
      
      // For demonstration, check if there's a matching mock user email
      if (mockUsers.some(u => u.email === email)) {
        throw new Error("Email already registered");
      }
      
      // Try to register with the backend
      try {
        const newUser = await registerUser(name, email, password);
        setUser(newUser);
        
        // Load mock data for UI demo
        setRobots(mockRobots);
        setRobotRequests([]);
        setPurchases([]);
        setMessages([]);
        setConversations([]);
        setChatMessages({});
        
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
        
        return;
      } catch (error) {
        console.error("Backend registration failed, using mock:", error);
        
        // Create a new mock user for demonstration
        const newMockUser: User = {
          id: `u${mockUsers.length + 1}`,
          name,
          email,
          is_admin: false,
          role: 'customer',
          created_at: new Date().toISOString()
        };
        
        setUser(newMockUser);
        
        // Set mock data for new user
        setRobots(mockRobots);
        setRobotRequests([]);
        setPurchases([]);
        setMessages([]);
        setConversations([]);
        setChatMessages({});
        
        toast({
          title: "Success",
          description: "Account created successfully (Demo Mode)",
        });
        
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
      setConversations([]);
      setChatMessages({});
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
      // Try to fetch real robots first
      try {
        const fetchedRobots = await getRobots();
        if (fetchedRobots && fetchedRobots.length > 0) {
          setRobots(fetchedRobots);
          return;
        }
      } catch (error) {
        console.error('Error fetching robots from API, using mock data:', error);
      }
      
      // Fallback to mock robots for demonstration
      setRobots(mockRobots);
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
        // Try to fetch real robot requests first
        try {
          const fetchedRequests = await getRobotRequests(user.id);
          if (fetchedRequests && fetchedRequests.length > 0) {
            setRobotRequests(fetchedRequests);
            return;
          }
        } catch (error) {
          console.error('Error fetching robot requests from API, using mock data:', error);
        }
        
        // Fallback to mock robot requests for demonstration
        if (user.is_admin) {
          // Admin sees all requests
          setRobotRequests(mockRobotRequests);
        } else {
          // Regular user sees only their requests
          setRobotRequests(mockRobotRequests.filter(req => req.user_id === user.id));
        }
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

  const fetchPurchases = async () => {
    try {
      if (user) {
        // Try to fetch real purchases first
        try {
          const fetchedPurchases = await getUserPurchases(user.id);
          if (fetchedPurchases && fetchedPurchases.length > 0) {
            setPurchases(fetchedPurchases);
            return;
          }
        } catch (error) {
          console.error('Error fetching purchases from API, using mock data:', error);
        }
        
        // Fallback to mock purchases for demonstration
        if (user.is_admin) {
          // Admin sees all purchases
          setPurchases(mockPurchases);
        } else {
          // Regular user sees only their purchases
          setPurchases(mockPurchases.filter(purchase => purchase.user_id === user.id));
        }
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

  const submitRequest = async (
    robotType: string,
    tradingPairs: string,
    timeframe: string,
    riskLevel: number
  ) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to submit a request');
      }
      
      // Try to submit real request first
      try {
        const newRequest = await submitRobotRequest(user.id, robotType, tradingPairs, timeframe, riskLevel);
        setRobotRequests(prev => [...prev, newRequest]);
        
        toast({
          title: "Success",
          description: "Your robot request has been submitted successfully",
        });
        
        return;
      } catch (error) {
        console.error('Error submitting robot request to API, using mock data:', error);
      }
      
      // Create a mock request for demonstration
      const newMockRequest: RobotRequest = {
        id: `rr${Date.now()}`,
        user_id: user.id,
        robot_type: robotType,
        trading_pairs: tradingPairs,
        timeframe: timeframe,
        risk_level: riskLevel,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      setRobotRequests(prev => [...prev, newMockRequest]);
      
      toast({
        title: "Success",
        description: "Your robot request has been submitted successfully (Demo Mode)",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit request",
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
      
      // Try to make real purchase first
      try {
        const newPurchase = await makePurchase(user.id, robotId, amount, currency, paymentMethod);
        setPurchases(prev => [...prev, newPurchase]);
        
        toast({
          title: "Success",
          description: "Your purchase was completed successfully",
        });
        
        return;
      } catch (error) {
        console.error('Error making purchase with API, using mock data:', error);
      }
      
      // Create a mock purchase for demonstration
      const newMockPurchase: Purchase = {
        id: `p${Date.now()}`,
        user_id: user.id,
        robot_id: robotId,
        amount: amount,
        currency: currency,
        payment_method: paymentMethod,
        status: 'completed',
        created_at: new Date().toISOString()
      };
      
      setPurchases(prev => [...prev, newMockPurchase]);
      
      toast({
        title: "Success",
        description: "Your purchase was completed successfully (Demo Mode)",
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
      // Try real Mpesa payment first
      try {
        const response = await initiateMpesaPayment(phone, amount, robotId);
        return response.checkoutRequestID;
      } catch (error) {
        console.error('Error initiating M-Pesa payment with API, using mock data:', error);
      }
      
      // Return a mock checkout ID for demonstration
      const mockCheckoutId = `mock-checkout-${Date.now()}`;
      
      toast({
        title: "Payment Initiated",
        description: "Check your phone for the M-Pesa prompt (Demo Mode)",
      });
      
      return mockCheckoutId;
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
      // Try real payment verification first
      try {
        return await verifyMpesaPayment(checkoutRequestId);
      } catch (error) {
        console.error('Error verifying payment with API, using mock data:', error);
      }
      
      // For demonstration, assume success for mock checkout IDs
      if (checkoutRequestId.startsWith('mock-checkout-')) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  };

  const refetchData = async () => {
    await Promise.all([
      fetchRobots(),
      fetchRobotRequests(),
      fetchPurchases()
    ]);
  };
  
  // Messages and chat functionality
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
              unreadCount: user.is_admin ? c.unreadCount : c.unreadCount + 1
            } 
          : c
      )
    );
    
    // If admin is responding, simulate a response after a delay in demo mode
    if (user.is_admin && Math.random() < 0.5) {
      setTimeout(() => {
        const responses = [
          "Thank you for your message! I'll help you with that.",
          "I'm looking into this and will get back to you soon.",
          "Thanks for reaching out. Is there anything else you need help with?",
          "I understand your concern. Let me check this for you.",
          "Your issue has been noted. We'll resolve it as soon as possible."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const autoReply: ChatMessage = {
          id: `cm${Date.now()}`,
          conversationId,
          sender: 'user',
          senderId: conversation.userId,
          text: randomResponse,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        // Add the auto-reply to the conversation
        setChatMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), autoReply]
        }));
        
        // Update the conversation's last message
        setConversations(prev => 
          prev.map(c => 
            c.id === conversationId 
              ? { 
                  ...c, 
                  lastMessage: randomResponse, 
                  lastMessageTime: autoReply.timestamp,
                  unreadCount: c.unreadCount + 1
                } 
              : c
          )
        );
      }, 10000 + Math.random() * 20000); // Random delay between 10-30 seconds
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
            const unreadMessages = chatMessages[c.id]?.filter(msg => !msg.read && msg.id !== messageId) || [];
            return { ...c, unreadCount: unreadMessages.length };
          }
          return c;
        })
      );
    }
  };
  
  // Admin functionality
  const getUsers = () => {
    return user?.is_admin ? mockUsers : [];
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
    
    // Add to robots list
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
    
    // Update the robot
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
    
    // Remove the robot
    setRobots(prev => prev.filter(robot => robot.id !== id));
    
    toast({
      title: "Success",
      description: "Robot has been deleted",
    });
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
    fetchPurchases,
    submitRequest,
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
    deleteRobot
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
