
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, Robot, RobotRequest, Purchase,
  loginUser, registerUser, getCurrentUser, logoutCurrentUser,
  getRobots, getRobotById, addRobot as apiAddRobot, updateRobot as apiUpdateRobot, deleteRobot as apiDeleteRobot,
  getAllRobotRequests, getRobotRequestsByUser, updateRobotRequest as apiUpdateRobotRequest, 
  submitRobotRequest as apiSubmitRobotRequest,
  getPurchasesByUser, purchaseRobot as apiPurchaseRobot,
  getAllUsers, updateUser as apiUpdateUser, deleteUser as apiDeleteUser,
  initiateMpesaPayment as apiInitiateMpesaPayment,
  getSubscriptionPrices as apiGetSubscriptionPrices,
  updateSubscriptionPrice as apiUpdateSubscriptionPrice
} from '@/lib/backend';
import { toast } from '@/hooks/use-toast';

// Define the BackendContext type
export interface BackendContextType {
  user: User | null;
  robots: Robot[];
  robotRequests: RobotRequest[];
  purchases: Purchase[];
  isLoading: boolean;
  subscriptionPrices: Record<string, number>;
  
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
  purchaseRobot: (robotId: string, paymentMethod: string) => Promise<Purchase>;
  
  // User functions
  getUsers: () => Promise<User[]>;
  
  // Payment functions
  initiateMpesaPayment: (phoneNumber: string, amount: number, robotId: string) => Promise<any>;
  
  // Subscription functions
  getSubscriptionPrices: () => Promise<Record<string, number>>;
  updateSubscriptionPrice: (planId: string, price: number) => Promise<void>;
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
  const [subscriptionPrices, setSubscriptionPrices] = useState<Record<string, number>>({
    basic: 0,
    premium: 0,
    enterprise: 0
  });

  // Load user on mount
  useEffect(() => {
    loadUser();
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
      const purchasesData = await getPurchasesByUser(userId);
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
      const userData = await loginUser(email, password);
      setUser(userData);
      
      // Load relevant data after login
      if (userData) {
        await Promise.all([
          loadRobots(),
          loadPurchases(userData.id)
        ]);
      }
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${userData.name}`,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await registerUser(name, email, password);
      setUser(userData);
      
      toast({
        title: "Welcome!",
        description: "Your account has been created successfully",
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    try {
      await logoutCurrentUser();
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
      const requests = await getRobotRequestsByUser(userId);
      return requests;
    } catch (error) {
      console.error('Error fetching user robot requests:', error);
      return [];
    }
  };

  const updateRobotRequest = async (id: string, data: Partial<RobotRequest>) => {
    try {
      const updatedRequest = await apiUpdateRobotRequest(id, data);
      
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
      const newRequest = await apiSubmitRobotRequest(data);
      return newRequest;
    } catch (error) {
      console.error('Error submitting robot request:', error);
      throw error;
    }
  };

  const getPurchases = async (userId: string) => {
    try {
      const purchasesData = await getPurchasesByUser(userId);
      setPurchases(purchasesData);
      return purchasesData;
    } catch (error) {
      console.error('Error loading purchases:', error);
      return [];
    }
  };

  const purchaseRobot = async (robotId: string, paymentMethod: string) => {
    try {
      if (!user) throw new Error('User not logged in');
      
      const purchase = await apiPurchaseRobot(robotId, user.id, paymentMethod);
      
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
      const newRobot = await apiAddRobot(robotData);
      
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
      const updatedRobot = await apiUpdateRobot(id, robotData);
      
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

  const getUsers = async () => {
    try {
      return await getAllUsers();
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

  const getSubscriptionPrices = async () => {
    try {
      const prices = await apiGetSubscriptionPrices();
      setSubscriptionPrices(prices);
      return prices;
    } catch (error) {
      console.error('Error fetching subscription prices:', error);
      return subscriptionPrices;
    }
  };

  const updateSubscriptionPrice = async (planId: string, price: number) => {
    try {
      await apiUpdateSubscriptionPrice(planId, price);
      
      // Update local state
      setSubscriptionPrices(prev => ({
        ...prev,
        [planId]: price
      }));
      
      toast({
        title: "Price Updated",
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} plan price has been updated`,
      });
    } catch (error) {
      console.error('Error updating subscription price:', error);
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
    getUsers,
    
    // Payment functions
    initiateMpesaPayment,
    
    // Subscription functions
    getSubscriptionPrices,
    updateSubscriptionPrice
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
