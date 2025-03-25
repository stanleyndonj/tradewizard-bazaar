
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

interface BackendContextType {
  user: User | null;
  isLoading: boolean;
  robots: Robot[];
  robotRequests: RobotRequest[];
  purchases: Purchase[];
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
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const BackendProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [robotRequests, setRobotRequests] = useState<RobotRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // Initialize the context by loading the user
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          // If we have a user, load their data
          await Promise.all([
            fetchRobots(),
            fetchRobotRequests(),
            fetchPurchases()
          ]);
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
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const newUser = await registerUser(name, email, password);
      setUser(newUser);
      
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
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
        const fetchedRequests = await getRobotRequests(user.id);
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
      
      await submitRobotRequest(user.id, robotType, tradingPairs, timeframe, riskLevel);
      await fetchRobotRequests();
      
      toast({
        title: "Success",
        description: "Your robot request has been submitted successfully",
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
      
      await makePurchase(user.id, robotId, amount, currency, paymentMethod);
      await fetchPurchases();
      
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
      fetchRobotRequests(),
      fetchPurchases()
    ]);
  };

  const value = {
    user,
    isLoading,
    robots,
    robotRequests,
    purchases,
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
    refetchData
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
