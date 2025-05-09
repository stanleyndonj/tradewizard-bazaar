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
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  CURRENT_USER: `${API_BASE_URL}/api/auth/users/me`,

  // User endpoints
  USERS: `${API_BASE_URL}/api/users`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,
  USER_ROBOT_REQUESTS: (userId: string) => `${API_BASE_URL}/api/users/${userId}/robot-requests`,
  USER_PURCHASES: (userId: string) => `${API_BASE_URL}/api/users/${userId}/purchases`,

  // Robot endpoints
  ROBOTS: `${API_BASE_URL}/api/robots`,
  ROBOT_BY_ID: (id: string) => `${API_BASE_URL}/api/robots/${id}`,

  // Robot request endpoints
  ROBOT_REQUESTS: `${API_BASE_URL}/api/robot-requests`,
  ROBOT_REQUEST_BY_ID: (id: string) => `${API_BASE_URL}/api/robot-requests/${id}`,

  // Purchase endpoints
  PURCHASES: `${API_BASE_URL}/api/purchases`,
  PURCHASE_BY_ID: (id: string) => `${API_BASE_URL}/api/purchases/${id}`,

  // Payment endpoints
  MPESA_INITIATE: `${API_BASE_URL}/api/payments/mpesa/initiate`,
  MPESA_VERIFY: `${API_BASE_URL}/api/payments/mpesa/verify/{transaction_id}`,
  CARD_PAYMENT_PROCESS: `${API_BASE_URL}/api/payments/card/process`,
  CARD_PAYMENT_VERIFY: `${API_BASE_URL}/api/payments/card/verify/{payment_id}`,

  // AI Trading endpoints - Fixed to match backend structure
  AI_TRADING_SIGNALS: `${API_BASE_URL}/api/ai-trading-signals`,
  AI_MARKET_ANALYSIS: `${API_BASE_URL}/api/ai-trading-signals/analyze`,

  // Chat endpoints
  CHAT_CONVERSATIONS: `${API_BASE_URL}/api/chat/conversations`,
  CHAT_MESSAGES: (conversationId: string) => `${API_BASE_URL}/api/chat/messages/${conversationId}`,
  MARK_MESSAGE_READ: (messageId: string) => `${API_BASE_URL}/api/chat/messages/${messageId}/read`,
  UNREAD_MESSAGE_COUNT: `${API_BASE_URL}/api/chat/unread-count`,

  // Subscription endpoints - Fixed to match backend structure
  SUBSCRIPTION_PLANS: `${API_BASE_URL}/api/subscription/plans`,
  SUBSCRIBE: `${API_BASE_URL}/api/subscription/subscribe`,
  UPDATE_SUBSCRIPTION_PRICE: `${API_BASE_URL}/api/subscription/plans`,
  USER_SUBSCRIPTIONS: `${API_BASE_URL}/api/subscription/user/subscriptions`,
  USER_ACTIVE_SUBSCRIPTIONS: `${API_BASE_URL}/api/subscription/user/active`,
  CHECK_SUBSCRIPTION: (planId: string) => `${API_BASE_URL}/api/subscription/check/${planId}`,
  CANCEL_SUBSCRIPTION: (subscriptionId: string) => `${API_BASE_URL}/api/subscription/cancel/${subscriptionId}`,
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
    let errorMessage;
    let errorText;

    try {
      // Try to parse as JSON first
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || `Error: ${response.status} ${response.statusText}`;
    } catch (e) {
      // If not JSON, get as text
      errorText = await response.text();
      errorMessage = errorText || `Error: ${response.status} ${response.statusText}`;

      try {
        // Try to parse as JSON for structured error messages
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.message || `HTTP error ${response.status}`;
      } catch (parseError) {
        // Already using errorText as the message, no need to do anything here
      }
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
  // In Replit environment, use the websocket URL that matches the backend server
  if (window.location.hostname.endsWith('.repl.co')) {
      // In Replit deployment, use the same hostname but with the correct backend path
      const host = window.location.hostname;
      // Remove the last part of the hostname before '.repl.co' to correctly format the repl url
      const formattedHost = host.substring(0, host.lastIndexOf('-')) + host.substring(host.lastIndexOf('.'));
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'; // Use 'wss:' for secure, 'ws:' for non-secure
      return `${protocol}//${formattedHost}/ws`; // Correct the path to /ws
  }

  // For development
  return 'http://0.0.0.0:8000/ws';
};