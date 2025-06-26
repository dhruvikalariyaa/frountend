import axiosInstance from '../lib/axios';

export interface Permission {
  module: string;
  action: string;
  value: boolean;
}

export interface ModulePermissions {
  [action: string]: boolean;
}

export interface UserPermissions {
  employee_management: {
    employees: ModulePermissions;
    department: ModulePermissions;
  };
  hiring: {
    candidate: ModulePermissions;
    job: ModulePermissions;
  };
  settings: {
    user: ModulePermissions;
    role: ModulePermissions;
  };
  system: {
    system: ModulePermissions;
  };
}

export interface PermissionResponse {
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      permissions: UserPermissions;
    };
  };
}

export interface GroupedPermissionsResponse {
  [module: string]: string[];
}

interface PermissionsResponse {
  success?: boolean;
  permissions: UserPermissions;
  roles?: string[];
}

export const permissionService = {
  // Get all permissions grouped by module
  getAllPermissions: async (): Promise<GroupedPermissionsResponse> => {
    const response = await axiosInstance.get<GroupedPermissionsResponse>('/permissions');
    return response.data;
  },

  // Get permissions for a specific role
  getRolePermissions: async (roleId: string): Promise<UserPermissions> => {
    const response = await axiosInstance.get<UserPermissions>(`/permissions/role/${roleId}`);
    return response.data;
  },

  // Fetch user permissions from the separate API endpoint
  getUserPermissions: async (): Promise<{ permissions: UserPermissions; roles: string[] }> => {
    try {
      console.log('Fetching user permissions from /api/v1/users/permissions');
      
      const response = await axiosInstance.get<PermissionsResponse>('/users/permissions');
      
      console.log('Permissions response received:', response.status);
      console.log('Raw permissions data:', response.data);
      
      // The backend should now return permissions in the correct format
      const permissions = response.data.permissions || {
        employee_management: {
          employees: { view: false, create: false, edit: false, delete: false },
          department: { manage: false }
        },
        hiring: {
          candidate: { view: false, create: false, edit: false, delete: false },
          job: { view: false, edit: false, delete: false, post: false }
        },
        settings: {
          user: { view: false, create: false, edit: false, delete: false },
          role: { manage: false }
        },
        system: {
          system: { admin: false }
        }
      };
      
      console.log('Processed permissions:', permissions);
      
      return {
        permissions: permissions,
        roles: response.data.roles || []
      };
    } catch (error: any) {
      console.error('Permissions service error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Refresh user permissions (useful when permissions change)
  refreshPermissions: async (): Promise<{ permissions: UserPermissions; roles: string[] }> => {
    return permissionService.getUserPermissions();
  },

  // Check if user has a specific permission
  hasPermission: (permissions: UserPermissions, permission: string): boolean => {
    if (!permissions) return false;
    
    const [module, subModule, action] = permission.toLowerCase().split('.');
    
    if (module && subModule && action) {
      return Boolean((permissions as any)?.[module]?.[subModule]?.[action]);
    } else if (module && action) {
      return Boolean((permissions as any)?.[module]?.[action]);
    }
    
    return false;
  },

  // Check if user has module permission
  hasModulePermission: (permissions: UserPermissions, module: string, action: string): boolean => {
    if (!permissions) return false;
    
    const modulePermissions = (permissions as any)?.[module];
    if (!modulePermissions) {
      return false;
    }

    // Check if any submodule has the required action permission
    return Object.values(modulePermissions).some((submodule: any) => {
      return submodule[action] === true;
    });
  },

  // Convert API permissions to flat permission array
  convertPermissionsToArray: (permissions: UserPermissions): string[] => {
    const permissionArray: string[] = [];
    
    // Employee management permissions
    if (permissions.employee_management) {
      Object.entries(permissions.employee_management).forEach(([module, actions]) => {
        Object.entries(actions).forEach(([action, value]) => {
          if (value) {
            permissionArray.push(`${module.toUpperCase()}_${action.toUpperCase()}`);
          }
        });
      });
    }
    
    // Hiring permissions
    if (permissions.hiring) {
      Object.entries(permissions.hiring).forEach(([module, actions]) => {
        Object.entries(actions).forEach(([action, value]) => {
          if (value) {
            permissionArray.push(`${module.toUpperCase()}_${action.toUpperCase()}`);
          }
        });
      });
    }
    
    // Settings permissions
    if (permissions.settings) {
      Object.entries(permissions.settings).forEach(([module, actions]) => {
        Object.entries(actions).forEach(([action, value]) => {
          if (value) {
            permissionArray.push(`${module.toUpperCase()}_${action.toUpperCase()}`);
          }
        });
      });
    }
    
    // System permissions
    if (permissions.system) {
      Object.entries(permissions.system).forEach(([module, actions]) => {
        Object.entries(actions).forEach(([action, value]) => {
          if (value) {
            permissionArray.push(`${module.toUpperCase()}_${action.toUpperCase()}`);
          }
        });
      });
    }
    
    return permissionArray;
  },

  // Convert flat permission array to API format
  convertArrayToPermissions: (permissions: string[]): UserPermissions => {
    const apiPermissions: UserPermissions = {
      employee_management: {
        employees: { view: false, create: false, edit: false, delete: false },
        department: { manage: false }
      },
      hiring: {
        candidate: { view: false, create: false, edit: false, delete: false },
        job: { view: false, edit: false, delete: false, post: false }
      },
      settings: {
        user: { view: false, create: false, edit: false, delete: false },
        role: { manage: false }
      },
      system: {
        system: { admin: false }
      }
    };

    permissions.forEach(permission => {
      const [module, action] = permission.toLowerCase().split('_');
      
      if (module && action) {
        if (apiPermissions.employee_management[module as keyof typeof apiPermissions.employee_management]) {
          (apiPermissions.employee_management[module as keyof typeof apiPermissions.employee_management] as any)[action] = true;
        } else if (apiPermissions.hiring[module as keyof typeof apiPermissions.hiring]) {
          (apiPermissions.hiring[module as keyof typeof apiPermissions.hiring] as any)[action] = true;
        } else if (apiPermissions.settings[module as keyof typeof apiPermissions.settings]) {
          (apiPermissions.settings[module as keyof typeof apiPermissions.settings] as any)[action] = true;
        } else if (apiPermissions.system[module as keyof typeof apiPermissions.system]) {
          (apiPermissions.system[module as keyof typeof apiPermissions.system] as any)[action] = true;
        }
      }
    });

    return apiPermissions;
  }
}; 