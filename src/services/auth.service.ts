import axiosInstance from '../lib/axios';
import { UserPermissions } from './permission.service';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RefreshTokenResponse {
  token?: string;
  refreshToken?: string;
  accessToken?: string; // Alternative format that some backends use
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
    console.log('Attempting token refresh with token:', refreshToken ? 'Present' : 'Missing');
    
    if (!refreshToken) {
      console.error('No refresh token found in localStorage');
      throw new Error('No refresh token available');
    }

    try {
      console.log('Making refresh token request...');
    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken
    });
      
      console.log('Refresh token response:', response.status, response.data);
      
      // Handle different possible response structures
      const responseData = response.data;
      let newAccessToken = '';
      let newRefreshToken = '';
      
      // Check for different response formats
      if (responseData.token) {
        newAccessToken = responseData.token;
        newRefreshToken = responseData.refreshToken || refreshToken; // Use new refresh token or keep old one
      } else if (responseData.accessToken) {
        newAccessToken = responseData.accessToken;
        newRefreshToken = responseData.refreshToken || refreshToken;
      } else {
        console.error('Invalid refresh token response structure:', responseData);
        throw new Error('Invalid response structure from refresh endpoint');
      }
      
      console.log('Storing new tokens...');
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      return {
        token: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error: any) {
      console.error('Refresh token failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('accessToken');
    return token ? true : false;
  },

  // Check if token is expired
  isTokenExpired: (token?: string): boolean => {
    const accessToken = token || localStorage.getItem('accessToken');
    if (!accessToken) return true;
    
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  },

  // Get token expiration time
  getTokenExpiration: (token?: string): number | null => {
    const accessToken = token || localStorage.getItem('accessToken');
    if (!accessToken) return null;
    
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  },

  // Validate current session
  validateSession: async (): Promise<boolean> => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!accessToken || !refreshToken) {
      console.log('No tokens found, session invalid');
      return false;
    }
    
    // Check if access token is expired
    if (authService.isTokenExpired(accessToken)) {
      console.log('Access token expired, attempting refresh...');
      try {
        await authService.refreshToken();
        console.log('Token refresh successful');
        return true;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
      }
    }
    
    return true;
  }
}; 