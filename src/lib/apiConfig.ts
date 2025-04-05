
// Get the API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API endpoints
const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  CURRENT_USER: `${API_BASE_URL}/api/auth/users/me`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/api/users`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,
  
  // Robot endpoints
  ROBOTS: `${API_BASE_URL}/api/robots`,
  ROBOT_BY_ID: (id: string) => `${API_BASE_URL}/api/robots/${id}`,
  
  // Robot request endpoints
  ROBOT_REQUESTS: `${API_BASE_URL}/api/robot-requests`,
  ROBOT_REQUEST_BY_ID: (id: string) => `${API_BASE_URL}/api/robot-requests/${id}`,
  USER_ROBOT_REQUESTS: (userId: string) => `${API_BASE_URL}/api/users/${userId}/robot-requests`,
  
  // Purchase endpoints
  PURCHASES: `${API_BASE_URL}/api/purchases`,
  USER_PURCHASES: (userId: string) => `${API_BASE_URL}/api/users/${userId}/purchases`,
  
  // M-Pesa endpoints
  MPESA_INITIATE: `${API_BASE_URL}/api/mpesa/initiate`,
  MPESA_VERIFY: `${API_BASE_URL}/api/mpesa/verify`,
  
  // AI Trading Signals endpoints
  AI_TRADING_SIGNALS: `${API_BASE_URL}/api/ai-trading-signals`,
  AI_MARKET_ANALYSIS: `${API_BASE_URL}/api/ai-trading-signals/analyze`,
  
  // Socket.io endpoint
  SOCKET_IO: API_BASE_URL
};

// Helper function to get authentication headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to get error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error ${response.status}`);
    } catch (e) {
      // If parsing fails, throw generic error
      throw new Error(`HTTP error ${response.status}`);
    }
  }
  
  return await response.json();
};

export default API_ENDPOINTS;
