import axiosInstance from '../lib/axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface UserData {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}

interface LoginResponse {
  statusCode: number;
  message: string;
  data: LoginData;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    if (response.data.data.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data;
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
  }
}; 