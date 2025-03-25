
// Backend simulation layer
// This file simulates a backend by using localStorage and timeouts

// Types
export interface Robot {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'MT5' | 'Binary';
  category: 'free' | 'paid';
  features: string[];
  imageUrl: string;
}

export interface RobotRequest {
  id: string;
  userId: string;
  robotType: string;
  tradingPairs: string;
  timeframe: string;
  riskLevel: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Purchase {
  id: string;
  userId: string;
  robotId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  purchaseDate: string;
}

// Simulated API delay
const apiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// User related functions
export const getCurrentUser = async (): Promise<User | null> => {
  await apiDelay(300);
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Error parsing user data', error);
    return null;
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  await apiDelay(800);
  
  // In a real app, this would validate with a backend
  // For demo purposes, we'll accept any login with a valid format
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  // Generate a unique ID for the user
  const userId = `user_${Date.now()}`;
  
  // Create a new user object
  const user: User = {
    id: userId,
    name: email.split('@')[0], // Extract name from email
    email,
    role: 'customer'
  };
  
  // Store user in localStorage
  localStorage.setItem('user', JSON.stringify(user));
  
  return user;
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  await apiDelay(1000);
  
  // Validate inputs
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }
  
  // Generate a unique ID for the user
  const userId = `user_${Date.now()}`;
  
  // Create a new user object
  const user: User = {
    id: userId,
    name,
    email,
    role: 'customer'
  };
  
  // Store user in localStorage
  localStorage.setItem('user', JSON.stringify(user));
  
  return user;
};

export const logoutUser = async (): Promise<void> => {
  await apiDelay(300);
  localStorage.removeItem('user');
};

// Robot management
export const getRobots = async (): Promise<Robot[]> => {
  await apiDelay(800);
  
  // Try to get robots from localStorage first
  const storedRobots = localStorage.getItem('robots');
  if (storedRobots) {
    try {
      return JSON.parse(storedRobots) as Robot[];
    } catch (error) {
      console.error('Error parsing robots data', error);
    }
  }
  
  // If no robots in localStorage, use sample data
  const sampleRobots: Robot[] = [
    {
      id: '1',
      name: 'MT5 Pro Scalper',
      description: 'Advanced scalping robot for MT5 platform with smart entry and exit algorithms.',
      price: 199,
      currency: 'USD',
      type: 'MT5',
      category: 'paid',
      features: ['Multi-timeframe analysis', 'Smart risk management', 'Compatible with all major currency pairs'],
      imageUrl: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Binary Options Signal Bot',
      description: 'Get reliable signals for binary options trading with high win rate.',
      price: 149,
      currency: 'USD',
      type: 'Binary',
      category: 'paid',
      features: ['Real-time signals', '75%+ win rate', 'Works with multiple assets'],
      imageUrl: '/placeholder.svg'
    },
    {
      id: '3',
      name: 'Forex Trend Finder',
      description: 'Free MT5 robot that helps identify strong market trends.',
      price: 0,
      currency: 'USD',
      type: 'MT5',
      category: 'free',
      features: ['Trend detection indicators', 'Email alerts', 'Visual dashboard'],
      imageUrl: '/placeholder.svg'
    },
    {
      id: '4',
      name: 'Binary Options Starter Bot',
      description: 'Free binary options robot ideal for beginners.',
      price: 0,
      currency: 'USD',
      type: 'Binary',
      category: 'free',
      features: ['Basic signal generation', 'Entry point indicators', 'Risk management tips'],
      imageUrl: '/placeholder.svg'
    }
  ];
  
  // Store the sample robots in localStorage for future use
  localStorage.setItem('robots', JSON.stringify(sampleRobots));
  
  return sampleRobots;
};

export const getRobotById = async (id: string): Promise<Robot | null> => {
  await apiDelay(500);
  
  const robots = await getRobots();
  return robots.find(robot => robot.id === id) || null;
};

export const addRobot = async (robot: Omit<Robot, 'id'>): Promise<Robot> => {
  await apiDelay(1000);
  
  const robots = await getRobots();
  
  // Create a new robot with an ID
  const newRobot: Robot = {
    ...robot,
    id: `robot_${Date.now()}`
  };
  
  // Add to list and save
  const updatedRobots = [...robots, newRobot];
  localStorage.setItem('robots', JSON.stringify(updatedRobots));
  
  return newRobot;
};

export const updateRobot = async (id: string, updates: Partial<Robot>): Promise<Robot> => {
  await apiDelay(1000);
  
  const robots = await getRobots();
  const index = robots.findIndex(r => r.id === id);
  
  if (index === -1) {
    throw new Error(`Robot with ID ${id} not found`);
  }
  
  // Update the robot
  const updatedRobot = { ...robots[index], ...updates };
  robots[index] = updatedRobot;
  
  // Save updated list
  localStorage.setItem('robots', JSON.stringify(robots));
  
  return updatedRobot;
};

export const deleteRobot = async (id: string): Promise<void> => {
  await apiDelay(800);
  
  const robots = await getRobots();
  const filteredRobots = robots.filter(r => r.id !== id);
  
  // Save updated list
  localStorage.setItem('robots', JSON.stringify(filteredRobots));
};

// Robot request management
export const getRobotRequests = async (userId?: string): Promise<RobotRequest[]> => {
  await apiDelay(800);
  
  // Try to get requests from localStorage
  const storedRequests = localStorage.getItem('robotRequests');
  let requests: RobotRequest[] = [];
  
  if (storedRequests) {
    try {
      requests = JSON.parse(storedRequests) as RobotRequest[];
    } catch (error) {
      console.error('Error parsing robot requests data', error);
    }
  }
  
  // If userId is provided, filter by user
  if (userId) {
    return requests.filter(req => req.userId === userId);
  }
  
  return requests;
};

export const submitRobotRequest = async (
  userId: string,
  robotType: string,
  tradingPairs: string,
  timeframe: string,
  riskLevel: number
): Promise<RobotRequest> => {
  await apiDelay(1200);
  
  const requests = await getRobotRequests();
  
  // Create new request
  const newRequest: RobotRequest = {
    id: `req_${Date.now()}`,
    userId,
    robotType,
    tradingPairs,
    timeframe,
    riskLevel,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  // Add to list and save
  const updatedRequests = [...requests, newRequest];
  localStorage.setItem('robotRequests', JSON.stringify(updatedRequests));
  
  return newRequest;
};

export const updateRobotRequest = async (id: string, updates: Partial<RobotRequest>): Promise<RobotRequest> => {
  await apiDelay(1000);
  
  const requests = await getRobotRequests();
  const index = requests.findIndex(r => r.id === id);
  
  if (index === -1) {
    throw new Error(`Request with ID ${id} not found`);
  }
  
  // Update the request
  const updatedRequest = { ...requests[index], ...updates };
  requests[index] = updatedRequest;
  
  // Save updated list
  localStorage.setItem('robotRequests', JSON.stringify(requests));
  
  return updatedRequest;
};

// Purchase management
export const getUserPurchases = async (userId: string): Promise<Purchase[]> => {
  await apiDelay(800);
  
  // Try to get purchases from localStorage
  const storedPurchases = localStorage.getItem('purchases');
  let purchases: Purchase[] = [];
  
  if (storedPurchases) {
    try {
      purchases = JSON.parse(storedPurchases) as Purchase[];
    } catch (error) {
      console.error('Error parsing purchases data', error);
    }
  }
  
  return purchases.filter(p => p.userId === userId);
};

export const makePurchase = async (
  userId: string,
  robotId: string,
  amount: number,
  currency: string,
  paymentMethod: string
): Promise<Purchase> => {
  await apiDelay(1500);
  
  const purchases = await getAllPurchases();
  
  // Create new purchase
  const newPurchase: Purchase = {
    id: `purchase_${Date.now()}`,
    userId,
    robotId,
    amount,
    currency,
    paymentMethod,
    status: 'completed',
    purchaseDate: new Date().toISOString()
  };
  
  // Add to list and save
  const updatedPurchases = [...purchases, newPurchase];
  localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
  
  return newPurchase;
};

export const getAllPurchases = async (): Promise<Purchase[]> => {
  await apiDelay(800);
  
  // Try to get purchases from localStorage
  const storedPurchases = localStorage.getItem('purchases');
  
  if (storedPurchases) {
    try {
      return JSON.parse(storedPurchases) as Purchase[];
    } catch (error) {
      console.error('Error parsing purchases data', error);
      return [];
    }
  }
  
  return [];
};
