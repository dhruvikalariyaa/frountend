import axiosInstance from '../lib/axios';
import { UserPermissions } from './permission.service';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

interface UserData {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      console.log('Attempting login with credentials:', { email: credentials.email });
      
      const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
      
      console.log('Login response received:', response.status);
      
      // Handle the response structure
      const responseData = response.data;
      
      // Check if we have the expected data
      if (responseData.accessToken && responseData.user) {
        console.log('Storing tokens in localStorage');
        localStorage.setItem('accessToken', responseData.accessToken);
        localStorage.setItem('refreshToken', responseData.refreshToken);
        return responseData;
      } else {
        console.error('Invalid response structure:', responseData);
        throw new Error('Invalid response structure from server');
      }
    } catch (error: any) {
      console.error('Auth service login error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken
    });
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('accessToken');
    return token ? true : false;
  },

  getUsers: async () => {
    try {
      const response = await axiosInstance.get('/users');
      return response;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }
}; 