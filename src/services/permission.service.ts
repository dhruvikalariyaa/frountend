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
  dashboard: {
    dashboard: ModulePermissions;
  };
  hiring: {
    candidate: ModulePermissions;
    interview: ModulePermissions;
    job: ModulePermissions;
    onboarding: ModulePermissions;
  };
  employeemanagement: {
    employee: ModulePermissions;
    department: ModulePermissions;
    leave: ModulePermissions;
    attendence: ModulePermissions;
    performance: ModulePermissions;
  };
  settings: {
    companyprofile: ModulePermissions;
    rolespermisions: ModulePermissions;
    systemsettings: ModulePermissions;
    rolesDetails: ModulePermissions;
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

  // Convert API permissions to flat permission array
  convertPermissionsToArray: (permissions: UserPermissions): string[] => {
    const permissionArray: string[] = [];
    
    // Dashboard permissions
    if (permissions.dashboard) {
      Object.entries(permissions.dashboard).forEach(([module, actions]) => {
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
    
    // Employee management permissions
    if (permissions.employeemanagement) {
      Object.entries(permissions.employeemanagement).forEach(([module, actions]) => {
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
    
    return permissionArray;
  },

  // Convert flat permission array to API format
  convertArrayToPermissions: (permissions: string[]): UserPermissions => {
    const apiPermissions: UserPermissions = {
      dashboard: {
        dashboard: { view: false }
      },
      hiring: {
        candidate: { view: false, create: false, edit: false, delete: false },
        interview: { view: false, create: false, edit: false, delete: false },
        job: { view: false, create: false, edit: false, delete: false },
        onboarding: { view: false, create: false, edit: false, delete: false }
      },
      employeemanagement: {
        employee: { view: false, create: false, edit: false, delete: false },
        department: { view: false, create: false, edit: false, delete: false },
        leave: { view: false, create: false, edit: false, delete: false },
        attendence: { view: false, create: false, edit: false, delete: false },
        performance: { view: false, create: false, edit: false, delete: false }
      },
      settings: {
        companyprofile: { view: false, create: false, edit: false, delete: false },
        rolespermisions: { view: false, create: false, edit: false, delete: false },
        systemsettings: { view: false, create: false, edit: false, delete: false },
        rolesDetails: { view: false, edit: false }
      }
    };

    permissions.forEach(permission => {
      const [module, action] = permission.toLowerCase().split('_');
      
      if (module && action) {
        if (apiPermissions.dashboard[module as keyof typeof apiPermissions.dashboard]) {
          (apiPermissions.dashboard[module as keyof typeof apiPermissions.dashboard] as any)[action] = true;
        } else if (apiPermissions.hiring[module as keyof typeof apiPermissions.hiring]) {
          (apiPermissions.hiring[module as keyof typeof apiPermissions.hiring] as any)[action] = true;
        } else if (apiPermissions.employeemanagement[module as keyof typeof apiPermissions.employeemanagement]) {
          (apiPermissions.employeemanagement[module as keyof typeof apiPermissions.employeemanagement] as any)[action] = true;
        } else if (apiPermissions.settings[module as keyof typeof apiPermissions.settings]) {
          (apiPermissions.settings[module as keyof typeof apiPermissions.settings] as any)[action] = true;
        }
      }
    });

    return apiPermissions;
  }
}; 