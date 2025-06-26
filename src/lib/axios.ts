import axios from 'axios';
import { authService } from '../services/auth.service';
// import { toast } from '../components/ui/use-toast';

// Try different backend URLs
const possibleBaseURLs = [
  'http://127.0.0.1:8000/api/v1',
  'http://localhost:8000/api/v1',
  'http://localhost:3001/api/v1',
  'http://127.0.0.1:3001/api/v1'
];

const baseURL = possibleBaseURLs[0]; // Default to first option

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request logging for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url, config.method?.toUpperCase());
    const token = localStorage.getItem('accessToken');
    console.log('Token status:', token ? 'Present' : 'Missing');
    if (token) {
      console.log('Token preview:', token.substring(0, 20) + '...');
    }
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      hasAuth: !!config.headers.Authorization
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      code: error.code,
      responseData: error.response?.data,
      requestData: error.config?.data,
      requestParams: error.config?.params
    });
    
    // Special handling for 400 errors
    if (error.response?.status === 400) {
      console.error('400 Bad Request Details:', {
        url: error.config?.url,
        method: error.config?.method,
        requestData: error.config?.data,
        requestParams: error.config?.params,
        responseMessage: error.response?.data?.message || error.response?.data,
        headers: error.config?.headers
      });
    }
    
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Attempting to refresh token...');
        const refreshResponse = await authService.refreshToken();
        console.log('Token refresh successful:', refreshResponse.token ? 'New token received' : 'No token in response');
        
        const newToken = refreshResponse.token || refreshResponse.accessToken;
        if (!newToken) {
          throw new Error('No access token received from refresh endpoint');
        }
        
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        
        // Clear all tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        
        // Call logout to clean up state
        authService.logout();
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 