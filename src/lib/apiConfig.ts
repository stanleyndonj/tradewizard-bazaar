
// Get the API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// API endpoints
const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  CURRENT_USER: `${API_BASE_URL}/users/me`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/users`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
  
  // Robot endpoints
  ROBOTS: `${API_BASE_URL}/robots`,
  ROBOT_BY_ID: (id: string) => `${API_BASE_URL}/robots/${id}`,
  
  // Robot request endpoints
  ROBOT_REQUESTS: `${API_BASE_URL}/robot-requests`,
  ROBOT_REQUEST_BY_ID: (id: string) => `${API_BASE_URL}/robot-requests/${id}`,
  USER_ROBOT_REQUESTS: (userId: string) => `${API_BASE_URL}/robot-requests/users/${userId}`,
  
  // Purchase endpoints
  PURCHASES: `${API_BASE_URL}/purchases`,
  USER_PURCHASES: (userId: string) => `${API_BASE_URL}/purchases/user/${userId}`,
  
  // M-Pesa endpoints
  MPESA_INITIATE: `${API_BASE_URL}/mpesa/initiate`,
  MPESA_VERIFY: `${API_BASE_URL}/mpesa/verify`
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
