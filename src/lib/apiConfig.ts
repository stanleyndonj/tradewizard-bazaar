
// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Define API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    CURRENT_USER: `${API_BASE_URL}/auth/me`,
  },
  // Robot endpoints
  ROBOTS: {
    ALL: `${API_BASE_URL}/robots`,
    DETAIL: (id: string) => `${API_BASE_URL}/robots/${id}`,
    CREATE: `${API_BASE_URL}/robots`,
    UPDATE: (id: string) => `${API_BASE_URL}/robots/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/robots/${id}`,
  },
  // Robot request endpoints
  REQUESTS: {
    ALL: `${API_BASE_URL}/requests`,
    USER: (userId: string) => `${API_BASE_URL}/requests/user/${userId}`,
    DETAIL: (id: string) => `${API_BASE_URL}/requests/${id}`,
    CREATE: `${API_BASE_URL}/requests`,
    UPDATE: (id: string) => `${API_BASE_URL}/requests/${id}`,
  },
  // Purchase endpoints
  PURCHASES: {
    ALL: `${API_BASE_URL}/purchases`,
    USER: (userId: string) => `${API_BASE_URL}/purchases/user/${userId}`,
    CREATE: `${API_BASE_URL}/purchases`,
  },
  // Payment endpoints
  PAYMENT: {
    MPESA: `${API_BASE_URL}/payments/mpesa`,
    VERIFY: `${API_BASE_URL}/payments/verify`,
  }
};

// HTTP request helper
interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  withCredentials?: boolean;
}

export const fetchApi = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
  // Default options
  const defaultOptions: FetchOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies for authentication
  };

  const fetchOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Add authorization token if available
  const token = localStorage.getItem('authToken');
  if (token && fetchOptions.headers) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  // Process body
  if (options.body && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // Check if response is not ok (4xx or 5xx)
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }
      
      return data as T;
    } else {
      // Handle non-JSON response
      if (!response.ok) {
        throw new Error('An error occurred');
      }
      
      return {} as T;
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
