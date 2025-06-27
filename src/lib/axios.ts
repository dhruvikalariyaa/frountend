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
      code: error.code
    });
    
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
        const { token } = await authService.refreshToken();
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        processQueue(null, token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        authService.logout();
        // If you have a toast system, show a message here:
        // toast({ title: 'Session expired', description: 'Please login again.', variant: 'destructive' });
        // Do NOT reload the page
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 