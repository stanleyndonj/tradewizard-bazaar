
const API_URL = 'http://localhost:8000';

const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_URL}/api/auth/register`,
  LOGIN: `${API_URL}/api/auth/login`,
  LOGOUT: `${API_URL}/api/auth/logout`,
  CURRENT_USER: `${API_URL}/api/auth/users/me`,
  
  // User endpoints
  USERS: `${API_URL}/users`,
  USER_BY_ID: (id: string) => `${API_URL}/users/${id}`,
  USER_ROBOT_REQUESTS: (userId: string) => `${API_URL}/users/${userId}/robot-requests`,
  USER_PURCHASES: (userId: string) => `${API_URL}/users/${userId}/purchases`,
  
  // Robot endpoints
  ROBOTS: `${API_URL}/robots`,
  ROBOT_BY_ID: (id: string) => `${API_URL}/robots/${id}`,
  
  // Robot request endpoints
  ROBOT_REQUESTS: `${API_URL}/robot-requests`,
  ROBOT_REQUEST_BY_ID: (id: string) => `${API_URL}/robot-requests/${id}`,
  
  // Purchase endpoints
  PURCHASES: `${API_URL}/purchases`,
  PURCHASE_BY_ID: (id: string) => `${API_URL}/purchases/${id}`,
  
  // Payment endpoints
  MPESA_INITIATE: `${API_URL}/payments/mpesa/initiate`,
  MPESA_VERIFY: `${API_URL}/payments/mpesa/verify`,
  
  // AI Trading endpoints
  AI_TRADING_SIGNALS: `${API_URL}/ai/trading-signals`,
  AI_MARKET_ANALYSIS: `${API_URL}/ai/market-analysis`,
  
  // Chat endpoints
  CHAT_CONVERSATIONS: `${API_URL}/chat/conversations`,
  CHAT_MESSAGES: (conversationId: string) => `${API_URL}/chat/conversations/${conversationId}/messages`,
  CHAT_MARK_READ: (messageId: string) => `${API_URL}/chat/messages/${messageId}/read`,
  CHAT_UNREAD_COUNT: `${API_URL}/chat/unread-count`,
};

export default API_ENDPOINTS;

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    
    try {
      // Try to parse as JSON for structured error messages
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.detail || errorJson.message || `HTTP error ${response.status}`;
    } catch (e) {
      // Fallback to plain text error
      errorMessage = errorText || `HTTP error ${response.status}`;
    }
    
    throw new Error(errorMessage);
  }
  
  // Check if response is empty
  const text = await response.text();
  if (!text) {
    return null;
  }
  
  // Parse JSON response
  return JSON.parse(text);
};
