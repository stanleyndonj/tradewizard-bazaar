// API endpoints configuration
const API_BASE_URL = 'http://0.0.0.0:8000';

// Helper to get Socket.IO URL (same as API but with WebSocket protocol)
export const getSocketIOUrl = () => {
  // Use the same host as API but switch protocol to ws
  return API_BASE_URL;
};

// API endpoint paths
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

  // AI trading signals
  AI_TRADING_SIGNALS: `${API_BASE_URL}/api/trading-signals`,
  AI_MARKET_ANALYSIS: `${API_BASE_URL}/api/market-analysis`,
  
  // Subscription endpoints
  SUBSCRIPTION_PLANS: `${API_BASE_URL}/api/subscription-plans`,
  SUBSCRIPTION_PLAN_BY_ID: (id: string) => `${API_BASE_URL}/api/subscription-plans/${id}`,
  CREATE_SUBSCRIPTION: `${API_BASE_URL}/api/subscriptions`,
  USER_SUBSCRIPTIONS: `${API_BASE_URL}/api/subscriptions/user`,
  USER_ACTIVE_SUBSCRIPTIONS: `${API_BASE_URL}/api/subscriptions/user/active`,
  CHECK_SUBSCRIPTION: (planId: string) => `${API_BASE_URL}/api/subscriptions/check/${planId}`,
  CANCEL_SUBSCRIPTION: (subscriptionId: string) => `${API_BASE_URL}/api/subscriptions/${subscriptionId}/cancel`,
  
  // Chat endpoints
  CHAT_CONVERSATIONS: `${API_BASE_URL}/api/chat/conversations`,
  CHAT_MESSAGES: (conversationId: string) => `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
  CHAT_MARK_READ: (messageId: string) => `${API_BASE_URL}/api/chat/messages/${messageId}/mark-read`,
  CHAT_UNREAD_COUNT: `${API_BASE_URL}/api/chat/messages/unread-count`,
  
  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  NOTIFICATION_MARK_READ: (notificationId: string) => `${API_BASE_URL}/api/notifications/${notificationId}/mark-read`,
  NOTIFICATIONS_MARK_ALL_READ: `${API_BASE_URL}/api/notifications/mark-all-read`,
  NOTIFICATIONS_UNREAD_COUNT: `${API_BASE_URL}/api/notifications/unread-count`
};

export default API_ENDPOINTS;

// Utility to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || response.statusText);
  }
  
  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } 
  
  return response.text();
};

// Helper function for adding authorization headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.warn('No auth token found in localStorage');
  }
  
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};
