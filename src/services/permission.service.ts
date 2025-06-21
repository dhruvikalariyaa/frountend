import axiosInstance from '../lib/axios';

export interface GroupedPermissionsResponse {
  [module: string]: string[];
}

export const permissionService = {
  // Get all permissions grouped by module
  getAllPermissions: async (): Promise<GroupedPermissionsResponse> => {
    const response = await axiosInstance.get<GroupedPermissionsResponse>('/permissions');
    return response.data;
  },
}; 