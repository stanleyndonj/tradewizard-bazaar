
// Get correct backend URL based on environment
const isReplit = window.location.hostname.includes('replit.dev') || window.location.hostname.includes('repl.co');

// For Replit: use the repl hostname with port 8000
// For local: use explicit http://0.0.0.0:8000
const API_URL = isReplit 
  ? `${window.location.protocol}//${window.location.hostname.replace('-0000-', '-8000-')}`
  : `http://0.0.0.0:8000`;

// Log API URL for debugging
console.log('API_URL configured as:', API_URL);

// Export for direct use in other modules
export const API_BASE_URL = API_URL;

const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_URL}/api/auth/register`,
  LOGIN: `${API_URL}/api/auth/login`,
  LOGOUT: `${API_URL}/api/auth/logout`,
  CURRENT_USER: `${API_URL}/api/auth/users/me`,

  // User endpoints
  USERS: `${API_URL}/api/users`,
  USER_BY_ID: (id: string) => `${API_URL}/api/users/${id}`,
  USER_ROBOT_REQUESTS: (userId: string) => `${API_URL}/api/users/${userId}/robot-requests`,
  USER_PURCHASES: (userId: string) => `${API_URL}/api/users/${userId}/purchases`,

  // Robot endpoints
  ROBOTS: `${API_URL}/api/robots`,
  ROBOT_BY_ID: (id: string) => `${API_URL}/api/robots/${id}`,

  // Robot request endpoints
  ROBOT_REQUESTS: `${API_URL}/api/robot-requests`,
  ROBOT_REQUEST_BY_ID: (id: string) => `${API_URL}/api/robot-requests/${id}`,

  // Purchase endpoints
  PURCHASES: `${API_URL}/api/purchases`,
  PURCHASE_BY_ID: (id: string) => `${API_URL}/api/purchases/${id}`,

  // Payment endpoints
  MPESA_INITIATE: `${API_URL}/api/payments/mpesa/initiate`,
  MPESA_VERIFY: `${API_URL}/api/payments/mpesa/verify/{transaction_id}`,
  CARD_PAYMENT_PROCESS: `${API_URL}/api/payments/card/process`,
  CARD_PAYMENT_VERIFY: `${API_URL}/api/payments/card/verify/{payment_id}`,

  // AI Trading endpoints - Fixed to match backend structure
  AI_TRADING_SIGNALS: `${API_URL}/api/ai-trading-signals`,
  AI_MARKET_ANALYSIS: `${API_URL}/api/ai-trading-signals/analyze`,

  // Chat endpoints
  CHAT_CONVERSATIONS: `${API_URL}/api/chat/conversations`,
  CHAT_MESSAGES: (conversationId: string) => `${API_URL}/api/chat/conversations/${conversationId}/messages`,
  CHAT_MARK_READ: (messageId: string) => `${API_URL}/api/chat/messages/${messageId}/read`,
  CHAT_UNREAD_COUNT: `${API_URL}/api/chat/unread-count`,

  // Subscription endpoints - Fixed to match backend structure
  SUBSCRIPTION_PLANS: `${API_URL}/api/subscription/plans`,
  SUBSCRIPTION_PLAN_BY_ID: (planId: string) => `${API_URL}/api/subscription/plans/${planId}`,
  CREATE_SUBSCRIPTION: `${API_URL}/api/subscription/subscribe`,
  USER_SUBSCRIPTIONS: `${API_URL}/api/subscription/user/subscriptions`,
  USER_ACTIVE_SUBSCRIPTIONS: `${API_URL}/api/subscription/user/active`,
  CHECK_SUBSCRIPTION: (planId: string) => `${API_URL}/api/subscription/check/${planId}`,
  CANCEL_SUBSCRIPTION: (subscriptionId: string) => `${API_URL}/api/subscription/cancel/${subscriptionId}`,
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

// Get the socket.io URL based on environment
export const getSocketIOUrl = () => {
  if (window.location.hostname.includes('replit.dev') || window.location.hostname.includes('repl.co')) {
    return window.location.protocol + '//' + window.location.hostname.replace('-0000-', '-8000-');
  }
  // Make sure we're using same origin for WebSocket in development
  return window.location.protocol === 'https:' ? 'https://0.0.0.0:8000' : 'http://0.0.0.0:8000';
};

// Function to get auth headers with the JWT token
export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token 
    ? { 'Authorization': `Bearer ${token}` }
    : {};
};
