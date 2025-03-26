
// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  CURRENT_USER: `${API_BASE_URL}/users/me`,
  
  // Robot endpoints
  ROBOTS: `${API_BASE_URL}/robots`,
  ROBOT_BY_ID: (id: string) => `${API_BASE_URL}/robots/${id}`,
  
  // Robot requests endpoints
  ROBOT_REQUESTS: `${API_BASE_URL}/robot-requests`,
  USER_ROBOT_REQUESTS: (userId: string) => `${API_BASE_URL}/users/${userId}/robot-requests`,
  
  // Purchases endpoints
  PURCHASES: `${API_BASE_URL}/purchases`,
  USER_PURCHASES: (userId: string) => `${API_BASE_URL}/users/${userId}/purchases`,
  
  // Mpesa endpoints
  MPESA_INITIATE: `${API_BASE_URL}/payments/mpesa/initiate`,
  MPESA_VERIFY: `${API_BASE_URL}/payments/mpesa/verify`,
};

// Helper to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || 'An error occurred';
    throw new Error(errorMessage);
  }
  return response.json();
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default API_ENDPOINTS;
