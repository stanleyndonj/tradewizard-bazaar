
import API_ENDPOINTS, { handleApiResponse, getAuthHeaders } from './apiConfig';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  role?: string;
  has_requested_robot?: boolean;
  robots_delivered?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Robot {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  features: string[];
  image_url?: string;
  currency: string;
  category: string;
  imageUrl?: string;
  created_at: string;
}

export interface RobotRequest {
  id: string;
  user_id: string;
  robot_type: string;
  trading_pairs: string;
  timeframe: string;
  risk_level: number;
  status: string;
  is_delivered: boolean;
  delivery_date?: string;
  download_url?: string;
  notes?: string;
  progress?: number;
  created_at: string;
  updated_at?: string;
  
  // New fields for detailed configuration
  bot_name?: string;
  market?: string;
  stake_amount?: number;
  contract_type?: string;
  duration?: string;
  prediction?: string;
  currency?: string;
  trading_strategy?: string;
  
  // MT5 specific fields
  account_credentials?: string;
  volume?: number;
  order_type?: string;
  stop_loss?: number;
  take_profit?: number;
  entry_rules?: string;
  exit_rules?: string;
  risk_management?: string;
  additional_parameters?: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  robot_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  purchaseDate?: string;
}

// Auth functions
export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  try {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      // Try to get more specific error message from the server
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Registration failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.access_token) {
      localStorage.setItem('authToken', data.access_token);
    }
    
    return data.user || data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      // Try to get more specific error message from the server
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Login failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.access_token) {
      localStorage.setItem('authToken', data.access_token);
    }
    
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await fetch(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('authToken');
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    if (!getAuthHeaders().Authorization) {
      return null;
    }
    
    const response = await fetch(API_ENDPOINTS.CURRENT_USER, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      // Don't remove token on 401 - this could be a temporary server issue
      // Only handle server responses in the 500 range as temporary issues
      console.log(`Auth check failed with status ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    // Don't remove the token on network errors
    return null;
  }
};

// Robot functions
export const getRobots = async (): Promise<Robot[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.ROBOTS, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
    
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching robots:', error);
    return []; // Return empty array instead of throwing
  }
};

export const getRobotById = async (id: string): Promise<Robot> => {
  try {
    const response = await fetch(API_ENDPOINTS.ROBOT_BY_ID(id), {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
    
    return handleApiResponse(response);
  } catch (error) {
    console.error(`Error fetching robot with ID ${id}:`, error);
    throw error;
  }
};

// Robot requests functions
export const getRobotRequests = async (userId: string): Promise<RobotRequest[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.USER_ROBOT_REQUESTS(userId), {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
    
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching robot requests:', error);
    return []; // Return empty array instead of throwing
  }
};

export const getAllRobotRequests = async (): Promise<RobotRequest[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.ROBOT_REQUESTS, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
    
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error fetching all robot requests:', error);
    return []; // Return empty array instead of throwing
  }
};

export interface RobotRequestParams {
  robotType: string;
  tradingPairs: string;
  timeframe: string;
  riskLevel: number;
  botName?: string;
  market?: string;
  stakeAmount?: number;
  contractType?: string;
  duration?: string;
  prediction?: string;
  currency?: string;
  tradingStrategy?: string;
  accountCredentials?: string;
  volume?: number;
  orderType?: string;
  stopLoss?: number;
  takeProfit?: number;
  entryRules?: string;
  exitRules?: string;
  riskManagement?: string;
  additionalParameters?: string;
}

export const submitRobotRequest = async (params: RobotRequestParams): Promise<RobotRequest> => {
  try {
    const response = await fetch(API_ENDPOINTS.ROBOT_REQUESTS, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        robot_type: params.robotType,
        trading_pairs: params.tradingPairs,
        timeframe: params.timeframe,
        risk_level: params.riskLevel,
        
        // New fields
        bot_name: params.botName,
        market: params.market,
        stake_amount: params.stakeAmount,
        contract_type: params.contractType,
        duration: params.duration,
        prediction: params.prediction,
        currency: params.currency,
        trading_strategy: params.tradingStrategy,
        
        // MT5 specific fields
        account_credentials: params.accountCredentials,
        volume: params.volume,
        order_type: params.orderType,
        stop_loss: params.stopLoss,
        take_profit: params.takeProfit,
        entry_rules: params.entryRules,
        exit_rules: params.exitRules,
        risk_management: params.riskManagement,
        additional_parameters: params.additionalParameters
      }),
    });
    
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error submitting robot request:', error);
    throw error;
  }
};

export const updateRobotRequest = async (
  requestId: string,
  updates: {
    status?: string;
    is_delivered?: boolean;
    download_url?: string;
    notes?: string;
    progress?: number;
  }
): Promise<RobotRequest> => {
  try {
    const response = await fetch(API_ENDPOINTS.ROBOT_REQUEST_BY_ID(requestId), {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    return handleApiResponse(response);
  } catch (error) {
    console.error('Error updating robot request:', error);
    throw error;
  }
};

// Purchase functions
export const getUserPurchases = async (userId: string): Promise<Purchase[]> => {
  const response = await fetch(API_ENDPOINTS.USER_PURCHASES(userId), {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });
  
  return handleApiResponse(response);
};

export const makePurchase = async (
  userId: string,
  robotId: string,
  amount: number,
  currency: string,
  paymentMethod: string
): Promise<Purchase> => {
  const response = await fetch(API_ENDPOINTS.PURCHASES, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      robot_id: robotId,
      amount,
      currency,
      payment_method: paymentMethod,
    }),
  });
  
  return handleApiResponse(response);
};

// Mpesa functions
interface MpesaResponse {
  checkoutRequestID: string;
  message: string;
}

export const initiateMpesaPayment = async (
  phone: string,
  amount: number,
  robotId: string
): Promise<MpesaResponse> => {
  const response = await fetch(API_ENDPOINTS.MPESA_INITIATE, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone_number: phone,
      amount,
      robot_id: robotId,
    }),
  });
  
  return handleApiResponse(response);
};

export const verifyMpesaPayment = async (checkoutRequestId: string): Promise<boolean> => {
  const response = await fetch(API_ENDPOINTS.MPESA_VERIFY, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      checkout_request_id: checkoutRequestId,
    }),
  });
  
  const result = await handleApiResponse(response);
  return result.success;
};
