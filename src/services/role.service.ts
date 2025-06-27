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

// 🔥 NEW: Permission mapping interface
interface PermissionMapping {
  [key: string]: string; // permission string -> permission ID
}

// 🔥 NEW: Cache for permission mappings
let permissionMappingCache: PermissionMapping | null = null;

// 🔥 NEW: Function to get permission mappings from API
const getPermissionMapping = async (): Promise<PermissionMapping> => {
  if (permissionMappingCache) {
    console.log('📋 Using cached permission mappings');
    return permissionMappingCache;
  }

  try {
    console.log('🔍 Fetching permission mappings from API...');
    
    // Fetch all permissions from the permissions API
    const response = await axiosInstance.get('/permissions');
    
    // 🔥 PERFORMANCE: Reduce logging in production
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.log('📋 Permissions API response:', response.data);
      console.log('📋 Response type:', typeof response.data);
      console.log('📋 Response keys:', Object.keys(response.data || {}));
    }
    
    const mapping: PermissionMapping = {};
    
    // Handle the permissions API response structure
    if (response.data && typeof response.data === 'object') {
      if (isDev) console.log('📋 Response data is an object, processing...');
      
      // Check if response.data is empty
      if (Object.keys(response.data).length === 0) {
        console.log('⚠️ Response data is empty object!');
        return mapping;
      }
      
      // 🔥 FIX: Handle the actual API response structure
      // Backend returns: { data: [permission objects], total, page, limit, hasMore }
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('📋 Found permissions data array with', response.data.data.length, 'permissions');
        
        response.data.data.forEach((permission: any, index: any) => {
          if (isDev && index < 3) { // Only log first 3 in dev mode
            console.log(`📋 Processing permission ${index + 1}:`, permission);
          }
          
          if (permission && typeof permission === 'object') {
            // Handle permission object structure: {_id, name, action, description, ...}
            const permissionId = permission._id || permission.id;
            const permissionName = permission.name; // e.g., "candidate.view", "candidate.create"
            
            if (permissionId && permissionName) {
              // Map permission name directly to ID
              mapping[permissionName] = permissionId;
              if (isDev && index < 3) {
                console.log(`📝 Mapped: ${permissionName} -> ${permissionId}`);
              }
              
              // Add mapping for candidate permissions to hiring.candidate.*
              const parts = permissionName.split('.');
              if (parts.length === 2) {
                const [module, action] = parts;
                let fullPermissionName = '';
                if (module === 'candidate') {
                  fullPermissionName = `hiring.candidate.${action}`;
                  mapping[fullPermissionName] = permissionId;
                  if (isDev && index < 3) {
                    console.log(`📝 Also mapped: ${fullPermissionName} -> ${permissionId}`);
                  }
                } else if (module === 'job') {
                  fullPermissionName = `hiring.job.${action}`;
                  mapping[fullPermissionName] = permissionId;
                  if (isDev && index < 3) {
                    console.log(`📝 Also mapped: ${fullPermissionName} -> ${permissionId}`);
                  }
                } else if (module === 'employees') {
                  fullPermissionName = `employee_management.employees.${action}`;
                  mapping[fullPermissionName] = permissionId;
                  if (isDev && index < 3) {
                    console.log(`📝 Also mapped: ${fullPermissionName} -> ${permissionId}`);
                  }
                } else if (module === 'department') {
                  fullPermissionName = `employee_management.department.${action}`;
                  mapping[fullPermissionName] = permissionId;
                  if (isDev && index < 3) {
                    console.log(`📝 Also mapped: ${fullPermissionName} -> ${permissionId}`);
                  }
                } else if (module === 'user') {
                  fullPermissionName = `settings.user.${action}`;
                  mapping[fullPermissionName] = permissionId;
                  if (isDev && index < 3) {
                    console.log(`📝 Also mapped: ${fullPermissionName} -> ${permissionId}`);
                  }
                } else if (module === 'role') {
                  fullPermissionName = `settings.role.${action}`;
                  mapping[fullPermissionName] = permissionId;
                  if (isDev && index < 3) {
                    console.log(`📝 Also mapped: ${fullPermissionName} -> ${permissionId}`);
                  }
                } else if (module === 'system') {
                  fullPermissionName = `system.system.${action}`;
                  mapping[fullPermissionName] = permissionId;
                  if (isDev && index < 3) {
                    console.log(`📝 Also mapped: ${fullPermissionName} -> ${permissionId}`);
                  }
                } else {
                  // Fallback: try to guess the module group
                  fullPermissionName = `${module}.${module}.${action}`;
                  mapping[fullPermissionName] = permissionId;
                  if (isDev && index < 3) {
                    console.log(`📝 Also mapped: ${fullPermissionName} -> ${permissionId}`);
                  }
                }
              }
            } else if (isDev) {
              console.warn(`⚠️ Permission missing required fields:`, {
                id: permissionId,
                name: permissionName,
                fullObject: permission
              });
            }
          } else if (isDev) {
            console.warn(`⚠️ Invalid permission object at index ${index}:`, permission);
          }
        });
        
        console.log('✅ Processed', response.data.data.length, 'permissions from API');
      } else {
        console.log('⚠️ No data array found in response, trying legacy parsing...');
        
        // Legacy parsing logic for nested structure (keep as fallback)
        Object.entries(response.data).forEach(([module, moduleData]: [string, any]) => {
          if (isDev) {
            console.log(`📋 Processing module: "${module}"`, moduleData);
            console.log(`📋 Module data type:`, typeof moduleData);
            console.log(`📋 Module data keys:`, Object.keys(moduleData || {}));
          }
          
          if (moduleData && typeof moduleData === 'object') {
            Object.entries(moduleData).forEach(([submodule, permissions]: [string, any]) => {
              if (isDev) {
                console.log(`📋 Processing submodule: "${module}.${submodule}"`, permissions);
                console.log(`📋 Submodule data type:`, typeof permissions);
                console.log(`📋 Is array?:`, Array.isArray(permissions));
              }
              
              if (Array.isArray(permissions)) {
                if (isDev) console.log(`📋 Processing ${permissions.length} permissions in array`);
                permissions.forEach((permission: any, index: number) => {
                  if (isDev && index < 2) {
                    console.log(`📋 Processing permission ${index}:`, permission);
                    console.log(`📋 Permission keys:`, Object.keys(permission || {}));
                  }
                  
                  // Handle different permission object structures
                  if (permission.id && permission.action) {
                    const permissionString = `${module}.${submodule}.${permission.action}`;
                    mapping[permissionString] = permission.id;
                    if (isDev && index < 2) {
                      console.log(`📝 Mapped: ${permissionString} -> ${permission.id}`);
                    }
                  } else if (permission._id && permission.action) {
                    const permissionString = `${module}.${submodule}.${permission.action}`;
                    mapping[permissionString] = permission._id;
                    if (isDev && index < 2) {
                      console.log(`📝 Mapped: ${permissionString} -> ${permission._id}`);
                    }
                  } else if (permission.id && permission.name) {
                    // Handle alternative naming
                    const permissionString = `${module}.${submodule}.${permission.name}`;
                    mapping[permissionString] = permission.id;
                    if (isDev && index < 2) {
                      console.log(`📝 Mapped: ${permissionString} -> ${permission.id}`);
                    }
                  } else if (isDev) {
                    console.log(`⚠️ Permission object doesn't have expected structure:`, permission);
                    console.log(`⚠️ Expected: {id/_id: string, action/name: string}`);
                  }
                });
              } else if (isDev) {
                console.log(`⚠️ Submodule data is not an array:`, permissions);
              }
            });
          } else if (isDev) {
            console.log(`⚠️ Module data is not an object:`, moduleData);
          }
        });
      }
    }
    
    // Cache the mapping for future use
    permissionMappingCache = mapping;
    console.log('✅ Permission mapping cache created with', Object.keys(mapping).length, 'entries');
    
    return mapping;
  } catch (error) {
    console.error('❌ Failed to fetch permission mappings:', error);
    throw new Error('Failed to fetch permission mappings from server');
  }
};

// 🔥 NEW: Function to convert permission strings to IDs
const convertPermissionStringsToIds = async (permissionStrings: string[]): Promise<string[]> => {
  try {
    const mapping = await getPermissionMapping();
    const permissionIds: string[] = [];
    
    console.log('🔄 Converting permission strings to IDs...');
    console.log('📝 Input strings:', permissionStrings);
    console.log('📋 Available mappings:', Object.keys(mapping));
    
    permissionStrings.forEach(permissionString => {
      // 🔥 FIX: Try multiple formats for candidate permissions
      let permissionId = mapping[permissionString];
      
      if (!permissionId) {
        // Try alternative formats
        const alternatives = [
          // Try without module prefix
          permissionString.replace('hiring.candidate.', 'candidate.'),
          permissionString.replace('employee_management.employees.', 'employees.'),
          permissionString.replace('employee_management.department.', 'department.'),
          permissionString.replace('hiring.job.', 'job.'),
          permissionString.replace('settings.user.', 'user.'),
          permissionString.replace('settings.role.', 'role.'),
          permissionString.replace('system.system.', 'system.'),
        ];
        
        for (const alt of alternatives) {
          if (mapping[alt]) {
            permissionId = mapping[alt];
            console.log(`✅ Found alternative mapping: ${permissionString} -> ${alt} -> ${permissionId}`);
            break;
          }
        }
      }
      
      if (permissionId) {
        permissionIds.push(permissionId);
        console.log(`✅ Converted: ${permissionString} -> ${permissionId}`);
      } else {
        console.warn(`⚠️ No ID found for permission: ${permissionString}`);
        console.warn(`⚠️ Available permissions:`, Object.keys(mapping));
        
        // 🔥 DEBUG: Show similar permissions for debugging
        const similarPermissions = Object.keys(mapping).filter(key => 
          key.includes(permissionString.split('.').pop() || '') || 
          permissionString.includes(key.split('.').pop() || '')
        );
        if (similarPermissions.length > 0) {
          console.warn(`🔍 Similar permissions found:`, similarPermissions);
        }
      }
    });
    
    console.log('🎯 Final permission IDs:', permissionIds);
    return permissionIds;
    
  } catch (error) {
    console.error('❌ Failed to convert permission strings to IDs:', error);
    throw error;
  }
};

// 🔥 NEW: Function to clear permission mapping cache
const clearPermissionMappingCache = () => {
  console.log('🗑️ Clearing permission mapping cache...');
  permissionMappingCache = null;
};

// 🔥 NEW: Debug function to check permission mappings
const debugPermissionMappings = async () => {
  try {
    const mapping = await getPermissionMapping();
    console.log('🔍 DEBUG: Current permission mappings:');
    console.log('📋 Total mappings:', Object.keys(mapping).length);
    
    // Check for candidate permissions specifically
    const candidatePermissions = Object.keys(mapping).filter(key => key.includes('candidate'));
    console.log('🎯 Candidate permissions found:', candidatePermissions);
    
    // Check for hiring permissions
    const hiringPermissions = Object.keys(mapping).filter(key => key.includes('hiring'));
    console.log('🎯 Hiring permissions found:', hiringPermissions);
    
    return mapping;
  } catch (error) {
    console.error('❌ Debug failed:', error);
    return {};
  }
};

export const roleService = {
  // 🔥 NEW: Debug function
  debugPermissions: debugPermissionMappings,
  
  // Create a new role
  createRole: async (roleData: Partial<Role>) => {
    try {
      console.log('=== roleService.createRole ===');
      console.log('Role data being sent:', JSON.stringify(roleData, null, 2));
      
      // 🔥 DEBUG: Check permission mappings first
      await debugPermissionMappings();
      
      // Transform permissions if needed
      const backendData: any = { ...roleData };
      
      if (roleData.permissions) {
        if (Array.isArray(roleData.permissions)) {
          // Check if permissions are already IDs (24-character hex strings) or permission strings
          const firstPermission = roleData.permissions[0];
          const isAlreadyIds = firstPermission && typeof firstPermission === 'string' && 
                             firstPermission.length === 24 && /^[0-9a-fA-F]{24}$/.test(firstPermission);
          
          if (!isAlreadyIds) {
            console.log('🔄 Converting permission strings to IDs for create...');
            try {
              const permissionIds = await convertPermissionStringsToIds(roleData.permissions);
              backendData.permissions = permissionIds;
              console.log('✅ Successfully converted permissions to IDs:', permissionIds);
            } catch (error) {
              console.error('❌ Failed to convert permissions to IDs:', error);
              throw new Error('Failed to convert permissions to IDs. Please try again.');
            }
          }
        } else {
          // Convert object format to permission IDs
          console.log('🔄 Converting permissions object to IDs for create...');
          const permissionsArray: string[] = [];
          
          Object.entries(roleData.permissions).forEach(([module, modulePerms]: [string, any]) => {
            if (modulePerms && typeof modulePerms === 'object') {
              Object.entries(modulePerms).forEach(([submodule, submodulePerms]: [string, any]) => {
                if (submodulePerms && typeof submodulePerms === 'object') {
                  Object.entries(submodulePerms).forEach(([action, hasPermission]: [string, any]) => {
                    if (hasPermission === true) {
                      const permissionString = `${module}.${submodule}.${action}`;
                      permissionsArray.push(permissionString);
                      console.log(`📝 Added permission: ${permissionString}`);
                    }
                  });
                }
              });
            }
          });
          
          console.log('🎯 All permissions to convert:', permissionsArray);
          
          try {
            const permissionIds = await convertPermissionStringsToIds(permissionsArray);
            backendData.permissions = permissionIds;
            console.log('✅ Successfully converted object permissions to IDs:', permissionIds);
          } catch (error) {
            console.error('❌ Failed to convert object permissions to IDs:', error);
            throw new Error('Failed to convert permissions to IDs. Please try again.');
          }
        }
      }
      
      console.log('📤 Final backend data for create:', JSON.stringify(backendData, null, 2));
      
      const response = await axiosInstance.post<Role>('/roles', backendData);
      return response.data;
    } catch (error: any) {
      console.error('roleService.createRole error:', error);
      throw error;
    }
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
    console.log('=== roleService.updateRole ===');
    console.log('Role ID:', id);
    console.log('Role data being sent:', JSON.stringify(roleData, null, 2));
    
    // Log the request details
    const token = localStorage.getItem('accessToken');
    console.log('Auth token:', token ? 'Present' : 'Missing');
    console.log('Request URL:', `/roles/${id}`);
    console.log('Request method: PATCH');
    console.log('Request body:', roleData);
    
    // 🔥 DEBUG: Check permission mappings first
    await debugPermissionMappings();
    
    // Transform data to backend expected format
    const backendData: any = {};
    
    // Always include required fields
    if (roleData.name) {
      backendData.name = roleData.name;
    }
    
    if (roleData.description !== undefined) {
      backendData.description = roleData.description || '';
    }
    
    // Handle permissions - convert to permission IDs
    if (roleData.permissions) {
      if (Array.isArray(roleData.permissions)) {
        // Check if permissions are already IDs or permission strings
        const firstPermission = roleData.permissions[0];
        const isAlreadyIds = firstPermission && typeof firstPermission === 'string' && 
                           firstPermission.length === 24 && /^[0-9a-fA-F]{24}$/.test(firstPermission);
        
        if (isAlreadyIds) {
          console.log('✅ Permissions are already in ID format');
          backendData.permissions = roleData.permissions;
        } else {
          console.log('🔄 Converting permission strings to IDs...');
          try {
            const permissionIds = await convertPermissionStringsToIds(roleData.permissions);
            backendData.permissions = permissionIds;
            console.log('✅ Successfully converted permissions to IDs:', permissionIds);
          } catch (error) {
            console.error('❌ Failed to convert permissions to IDs:', error);
            throw new Error('Failed to convert permissions to IDs. Please try again.');
          }
        }
      } else {
        // Convert object format to array format first, then to IDs
        console.log('🔄 Converting permissions object to array format, then to IDs');
        const permissionsArray: string[] = [];
        
        Object.entries(roleData.permissions).forEach(([module, modulePerms]: [string, any]) => {
          if (modulePerms && typeof modulePerms === 'object') {
            Object.entries(modulePerms).forEach(([submodule, submodulePerms]: [string, any]) => {
              if (submodulePerms && typeof submodulePerms === 'object') {
                Object.entries(submodulePerms).forEach(([action, hasPermission]: [string, any]) => {
                  if (hasPermission === true) {
                    const permissionString = `${module}.${submodule}.${action}`;
                    permissionsArray.push(permissionString);
                    console.log(`📝 Added permission for update: ${permissionString}`);
                  }
                });
              }
            });
          }
        });
        
        console.log('🎯 Converted permissions to array:', permissionsArray);
        
        try {
          const permissionIds = await convertPermissionStringsToIds(permissionsArray);
          backendData.permissions = permissionIds;
          console.log('✅ Successfully converted object permissions to IDs:', permissionIds);
        } catch (error) {
          console.error('❌ Failed to convert object permissions to IDs:', error);
          throw new Error('Failed to convert permissions to IDs. Please try again.');
        }
      }
    }
    
    // Always include isActive field (default to true)
    backendData.isActive = roleData.isActive !== undefined ? roleData.isActive : true;
    
    console.log('📤 Final backend data for update:', JSON.stringify(backendData, null, 2));
    
    try {
      const response = await axiosInstance.patch<Role>(`/roles/${id}`, backendData);
      console.log('✅ Role update successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Role update failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
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
    try {
      console.log('=== roleService.updateRolePermissions ===');
      console.log('Role ID:', roleId);
      console.log('Permissions:', JSON.stringify(permissions, null, 2));
      
      // Convert permissions object to permission IDs
      const permissionsArray: string[] = [];
      
      Object.entries(permissions).forEach(([module, modulePerms]: [string, any]) => {
        if (modulePerms && typeof modulePerms === 'object') {
          Object.entries(modulePerms).forEach(([submodule, submodulePerms]: [string, any]) => {
            if (submodulePerms && typeof submodulePerms === 'object') {
              Object.entries(submodulePerms).forEach(([action, hasPermission]: [string, any]) => {
                if (hasPermission === true) {
                  permissionsArray.push(`${module}.${submodule}.${action}`);
                }
              });
            }
          });
        }
      });
      
      console.log('🎯 Converted permissions to array:', permissionsArray);
      
      // Convert permission strings to IDs
      const permissionIds = await convertPermissionStringsToIds(permissionsArray);
      console.log('✅ Converted permissions to IDs:', permissionIds);
      
      // Use the general updateRole endpoint with permissions data
      const response = await axiosInstance.patch<Role>(`/roles/${roleId}`, { 
        permissions: permissionIds 
      });
      return response.data;
    } catch (error: any) {
      console.error('roleService.updateRolePermissions error:', error);
      
      // If the specific permissions endpoint doesn't exist, try the permissions API directly
      if (error.response?.status === 404) {
        console.log('Trying alternative permissions endpoint...');
        try {
          // Alternative: try updating through permissions API
          const permissionsResponse = await axiosInstance.patch<UserPermissions>(`/permissions/role/${roleId}`, permissions);
          
          // Return a role-like object since permissions endpoint might not return full role
          return {
            id: roleId,
            _id: roleId,
            name: 'Updated Role',
            description: '',
            permissions: permissionsResponse.data,
            createdAt: new Date(),
            updatedAt: new Date()
          } as Role;
        } catch (altError: any) {
          console.error('Alternative permissions update also failed:', altError);
          throw error; // Throw the original error
        }
      }
      
      throw error;
    }
  },

  // Clear permission mapping cache
  clearPermissionCache: clearPermissionMappingCache
};