import axiosInstance from '../lib/axios';
import { Role, User } from '../types/models';
import { UserPermissions } from './permission.service';

interface RoleListData {
  data: Role[];
  total: number;
  page: number;
  pageSize: number;
}

interface RoleListResponse {
  statusCode: number;
  message: string;
  data: RoleListData;
}

interface UserListResponse {
  statusCode: number;
  message: string;
  data: {
    data: User[];
    total: number;
    page: number;
    pageSize: number;
  };
}

interface DeleteRoleResponse {
  success: boolean;
  message: string;
  deletedRole?: any;
}

export const roleService = {
  // Create a new role
  createRole: async (roleData: Partial<Role>) => {
    // Debug: Log the token and request body
    const token = localStorage.getItem('accessToken');
    console.log('Creating role with token:', token);
    console.log('Role data:', roleData);
    const response = await axiosInstance.post<Role>('/roles', roleData);
    return response.data;
  },

  // Get all roles with pagination
  getRoles: async (params?: { page?: number; pageSize?: number; search?: string }) => {
    const response = await axiosInstance.get<RoleListResponse>('/roles', { params });
    return response.data;
  },

  // Get a role by ID
  getRoleById: async (id: string) => {
    const response = await axiosInstance.get<Role>(`/roles/${id}`);
    return response.data;
  },

  // Update a role
  updateRole: async (id: string, roleData: Partial<Role>) => {
    const response = await axiosInstance.patch<Role>(`/roles/${id}`, roleData);
    return response.data;
  },

  // Delete a role with improved error handling
  deleteRole: async (id: string): Promise<DeleteRoleResponse> => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Deleting role with token:', token);
      console.log('Role ID to delete:', id);
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      if (!id) {
        throw new Error('Role ID is required for deletion.');
      }
      
      const response = await axiosInstance.delete<DeleteRoleResponse>(`/roles/${id}`);
      console.log('Delete role response:', response.data);
      
      // Ensure the response has the expected structure
      if (response.data && typeof response.data.success === 'boolean') {
        return response.data;
      } else {
        // If the backend doesn't return the expected structure, create one
        return {
          success: true,
          message: 'Role deleted successfully',
          deletedRole: response.data as any
        };
      }
    } catch (error: any) {
      console.error('Error deleting role:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error('Role not found');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to delete this role');
      } else if (error.response?.status === 409) {
        throw new Error('Cannot delete role that is assigned to users');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to delete role. Please try again.');
      }
    }
  },

  // Get all users (for admin)
  getAllUsers: async (params?: { page?: number; pageSize?: number; search?: string }) => {
    const response = await axiosInstance.get<UserListResponse>('/users', { params });
    return response.data;
  },

  // Get permissions for a specific role
  getRolePermissions: async (roleId: string): Promise<UserPermissions> => {
    const response = await axiosInstance.get<UserPermissions>(`/permissions/role/${roleId}`);
    return response.data;
  },

  // Update role permissions
  updateRolePermissions: async (roleId: string, permissions: UserPermissions): Promise<Role> => {
    const response = await axiosInstance.patch<Role>(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  }
};