
// Backend API service
import { ENDPOINTS, fetchApi } from './apiConfig';

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

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MpesaPaymentRequest {
  phone: string;
  amount: number;
  robotId: string;
}

export interface MpesaPaymentResponse {
  checkoutRequestID: string;
  responseDescription: string;
  responseCode: string;
}

// User related functions
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Use auth token from localStorage if available
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    const user = await fetchApi<User>(ENDPOINTS.AUTH.CURRENT_USER);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const response = await fetchApi<AuthResponse>(ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: { email, password }
    });
    
    // Save auth token
    localStorage.setItem('authToken', response.token);
    
    return response.user;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    throw new Error(errorMessage);
  }
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  try {
    const response = await fetchApi<AuthResponse>(ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: { name, email, password }
    });
    
    // Save auth token
    localStorage.setItem('authToken', response.token);
    
    return response.user;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    throw new Error(errorMessage);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Call logout endpoint to invalidate token on server
    await fetchApi(ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always remove local token
    localStorage.removeItem('authToken');
  }
};

// Robot management
export const getRobots = async (): Promise<Robot[]> => {
  try {
    return await fetchApi<Robot[]>(ENDPOINTS.ROBOTS.ALL);
  } catch (error) {
    console.error('Error fetching robots:', error);
    return [];
  }
};

export const getRobotById = async (id: string): Promise<Robot | null> => {
  try {
    return await fetchApi<Robot>(ENDPOINTS.ROBOTS.DETAIL(id));
  } catch (error) {
    console.error(`Error fetching robot ${id}:`, error);
    return null;
  }
};

export const addRobot = async (robot: Omit<Robot, 'id'>): Promise<Robot> => {
  try {
    return await fetchApi<Robot>(ENDPOINTS.ROBOTS.CREATE, {
      method: 'POST',
      body: robot
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add robot';
    throw new Error(errorMessage);
  }
};

export const updateRobot = async (id: string, updates: Partial<Robot>): Promise<Robot> => {
  try {
    return await fetchApi<Robot>(ENDPOINTS.ROBOTS.UPDATE(id), {
      method: 'PUT',
      body: updates
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Failed to update robot ${id}`;
    throw new Error(errorMessage);
  }
};

export const deleteRobot = async (id: string): Promise<void> => {
  try {
    await fetchApi(ENDPOINTS.ROBOTS.DELETE(id), {
      method: 'DELETE'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Failed to delete robot ${id}`;
    throw new Error(errorMessage);
  }
};

// Robot request management
export const getRobotRequests = async (userId?: string): Promise<RobotRequest[]> => {
  try {
    const endpoint = userId ? ENDPOINTS.REQUESTS.USER(userId) : ENDPOINTS.REQUESTS.ALL;
    return await fetchApi<RobotRequest[]>(endpoint);
  } catch (error) {
    console.error('Error fetching robot requests:', error);
    return [];
  }
};

export const submitRobotRequest = async (
  userId: string,
  robotType: string,
  tradingPairs: string,
  timeframe: string,
  riskLevel: number
): Promise<RobotRequest> => {
  try {
    return await fetchApi<RobotRequest>(ENDPOINTS.REQUESTS.CREATE, {
      method: 'POST',
      body: {
        userId,
        robotType,
        tradingPairs,
        timeframe,
        riskLevel
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit request';
    throw new Error(errorMessage);
  }
};

export const updateRobotRequest = async (id: string, updates: Partial<RobotRequest>): Promise<RobotRequest> => {
  try {
    return await fetchApi<RobotRequest>(ENDPOINTS.REQUESTS.UPDATE(id), {
      method: 'PUT',
      body: updates
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Failed to update request ${id}`;
    throw new Error(errorMessage);
  }
};

// Purchase management
export const getUserPurchases = async (userId: string): Promise<Purchase[]> => {
  try {
    return await fetchApi<Purchase[]>(ENDPOINTS.PURCHASES.USER(userId));
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    return [];
  }
};

export const makePurchase = async (
  userId: string,
  robotId: string,
  amount: number,
  currency: string,
  paymentMethod: string
): Promise<Purchase> => {
  try {
    return await fetchApi<Purchase>(ENDPOINTS.PURCHASES.CREATE, {
      method: 'POST',
      body: {
        userId,
        robotId,
        amount,
        currency,
        paymentMethod
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete purchase';
    throw new Error(errorMessage);
  }
};

export const getAllPurchases = async (): Promise<Purchase[]> => {
  try {
    return await fetchApi<Purchase[]>(ENDPOINTS.PURCHASES.ALL);
  } catch (error) {
    console.error('Error fetching all purchases:', error);
    return [];
  }
};

// M-Pesa Payment integration
export const initiateMpesaPayment = async (
  phone: string,
  amount: number,
  robotId: string
): Promise<MpesaPaymentResponse> => {
  try {
    return await fetchApi<MpesaPaymentResponse>(ENDPOINTS.PAYMENT.MPESA, {
      method: 'POST',
      body: {
        phone,
        amount,
        robotId
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to initiate M-Pesa payment';
    throw new Error(errorMessage);
  }
};

export const verifyMpesaPayment = async (checkoutRequestID: string): Promise<boolean> => {
  try {
    const response = await fetchApi<{success: boolean}>(ENDPOINTS.PAYMENT.VERIFY, {
      method: 'POST',
      body: { checkoutRequestID }
    });
    return response.success;
  } catch (error) {
    console.error('Error verifying M-Pesa payment:', error);
    return false;
  }
};
