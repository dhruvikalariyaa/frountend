import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import { authService } from '../services/auth.service';
import { permissionService, UserPermissions } from '../services/permission.service';
import { roleService } from '../services/role.service';
import { Role } from '../types/models';
import { Users, UserPlus, LayoutDashboard, Building2, Package, Wallet, Settings, Briefcase } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: UserPermissions;
  phone?: string;
  location?: string;
  department?: string;
  bio?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasModulePermission: (module: string, action: string) => boolean;
  updateUserRole: (userId: string, role: string) => void;
  updateUserPermissions: (permissions: UserPermissions) => void;
  refreshUserPermissions: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  users: MockUser[];
  roles: Role[];
  userRoles: Record<string, string>;
  updateRole: (roleName: string, permissions: UserPermissions) => void;
  createRole: (role: Partial<Role>) => void;
  deleteRole: (roleName: string) => void;
  assignRoleToUser: (userId: string, roleName: string) => void;
  unassignRoleFromUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Define all available permissions based on the backend API structure
export const PERMISSIONS = {
  // Employee Management
  EMPLOYEES_VIEW: 'EMPLOYEES_VIEW',
  EMPLOYEES_CREATE: 'EMPLOYEES_CREATE',
  EMPLOYEES_EDIT: 'EMPLOYEES_EDIT',
  EMPLOYEES_DELETE: 'EMPLOYEES_DELETE',
  
  DEPARTMENT_MANAGE: 'DEPARTMENT_MANAGE',
  
  // Hiring
  CANDIDATE_VIEW: 'CANDIDATE_VIEW',
  CANDIDATE_CREATE: 'CANDIDATE_CREATE',
  CANDIDATE_EDIT: 'CANDIDATE_EDIT',
  CANDIDATE_DELETE: 'CANDIDATE_DELETE',
  
  JOB_VIEW: 'JOB_VIEW',
  JOB_EDIT: 'JOB_EDIT',
  JOB_DELETE: 'JOB_DELETE',
  JOB_POST: 'JOB_POST',
  
  // Settings
  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_EDIT: 'USER_EDIT',
  USER_DELETE: 'USER_DELETE',
  
  ROLE_MANAGE: 'ROLE_MANAGE',
  
  // System
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
} as const;

// Module-based permission structure
export const MODULE_PERMISSIONS = {
  employee_management: {
    employees: {
      view: PERMISSIONS.EMPLOYEES_VIEW,
      create: PERMISSIONS.EMPLOYEES_CREATE,
      edit: PERMISSIONS.EMPLOYEES_EDIT,
      delete: PERMISSIONS.EMPLOYEES_DELETE,
    },
    department: {
      manage: PERMISSIONS.DEPARTMENT_MANAGE,
    },
  },
  hiring: {
    candidate: {
      view: PERMISSIONS.CANDIDATE_VIEW,
      create: PERMISSIONS.CANDIDATE_CREATE,
      edit: PERMISSIONS.CANDIDATE_EDIT,
      delete: PERMISSIONS.CANDIDATE_DELETE,
    },
    job: {
      view: PERMISSIONS.JOB_VIEW,
      edit: PERMISSIONS.JOB_EDIT,
      delete: PERMISSIONS.JOB_DELETE,
      post: PERMISSIONS.JOB_POST,
    },
  },
  settings: {
    user: {
      view: PERMISSIONS.USER_VIEW,
      create: PERMISSIONS.USER_CREATE,
      edit: PERMISSIONS.USER_EDIT,
      delete: PERMISSIONS.USER_DELETE,
    },
    role: {
      manage: PERMISSIONS.ROLE_MANAGE,
    },
  },
  system: {
    system: {
      admin: PERMISSIONS.SYSTEM_ADMIN,
    },
  },
} as const;

// Update ROLE_PERMISSIONS to include EMPLOYEE with correct permissions
export let ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  EMPLOYEE: [
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.DEPARTMENT_MANAGE,
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.USER_VIEW,
  ],
} as const;

// Add type for custom roles
export type CustomRole = {
  name: string;
  permissions: string[];
};

// Update the AUTH_ROLE_PERMISSIONS type to be mutable
export const AUTH_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [...Object.values(PERMISSIONS)],
  EMPLOYEE: [...ROLE_PERMISSIONS.EMPLOYEE],
};

export interface MockUser {
  id: string;
  _id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any; // Allow additional properties from API
}

export const initialMockUsers: MockUser[] = [
  // No mock users - use only real API data
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add these functions at the top level of the file, before the AuthProvider
const STORAGE_KEYS = {
  ROLES: 'crm_roles',
  ROLE_PERMISSIONS: 'crm_role_permissions',
  USER_ROLES: 'crm_user_roles'
};

// Helper function to convert permissions array to object
const permissionsArrayToObject = (permissions: string[]): Record<string, any> => {
  return permissions.reduce((acc, permission) => {
    acc[permission] = true;
    return acc;
  }, {} as Record<string, any>);
};

// Helper function to transform permissions for backend
const transformPermissionsForBackend = (permissions: UserPermissions): Record<string, any> => {
  const simplified: Record<string, any> = {};
  
  // Transform employee management permissions
  if (permissions.employee_management) {
    simplified.employee_management = {};
    Object.entries(permissions.employee_management).forEach(([submodule, actions]) => {
      if (actions && typeof actions === 'object') {
        simplified.employee_management[submodule] = actions;
      }
    });
  }
  
  // Transform hiring permissions
  if (permissions.hiring) {
    simplified.hiring = {};
    Object.entries(permissions.hiring).forEach(([submodule, actions]) => {
      if (actions && typeof actions === 'object') {
        simplified.hiring[submodule] = actions;
      }
    });
  }
  
  // Transform settings permissions
  if (permissions.settings) {
    simplified.settings = {};
    Object.entries(permissions.settings).forEach(([submodule, actions]) => {
      if (actions && typeof actions === 'object') {
        simplified.settings[submodule] = actions;
      }
    });
  }
  
  // Transform system permissions
  if (permissions.system) {
    simplified.system = {};
    Object.entries(permissions.system).forEach(([submodule, actions]) => {
      if (actions && typeof actions === 'object') {
        simplified.system[submodule] = actions;
      }
    });
  }
  
  return simplified;
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

const ICONS: Record<string, React.ReactNode> = {
  employee_management: <Users className="h-5 w-5" />,
  hiring: <UserPlus className="h-5 w-5" />,
  projects: <Briefcase className="h-5 w-5" />,
  sales: <Building2 className="h-5 w-5" />,
  assets: <Package className="h-5 w-5" />,
  finance: <Wallet className="h-5 w-5" />,
  settings: <Settings className="h-5 w-5" />,
  dashboard: <LayoutDashboard className="h-5 w-5" />,
  // ...add more as needed
};

const MODULE_ROUTES: Record<string, { title: string, href: string, subRoutes?: Record<string, { title: string, href: string }> }> = {
  employee_management: {
    title: "Employee Management",
    href: "/employees",
    subRoutes: {
      employees: { title: "All Employees", href: "/employees" },
      department: { title: "Departments", href: "/employees/departments" },
      // ...add more submodules as needed
    }
  },
  hiring: {
    title: "Hiring",
    href: "/hiring",
    subRoutes: {
      job: { title: "Job Postings", href: "/hiring/jobs" },
      candidate: { title: "Candidates", href: "/hiring/candidates" },
      // ...add more submodules as needed
    }
  },
  // ...add more modules as needed
};

function getSidebarItemsFromPermissions(permissions: UserPermissions) {
  const items = [];
  for (const moduleKey in permissions) {
    const modulePerm = (permissions as any)[moduleKey];
    const moduleRoute = MODULE_ROUTES[moduleKey];
    if (!moduleRoute) continue;

    // Check if any submodule has view permission
    const subItems = [];
    for (const subKey in modulePerm) {
      const subPerm = modulePerm[subKey];
      if (subPerm.view) {
        const subRoute = moduleRoute.subRoutes?.[subKey];
        if (subRoute) {
          subItems.push({
            title: subRoute.title,
            href: subRoute.href,
            module: moduleKey,
            subModule: subKey,
          });
        }
      }
    }
    if (subItems.length > 0) {
      items.push({
        title: moduleRoute.title,
        icon: ICONS[moduleKey] || <LayoutDashboard className="h-5 w-5" />,
        href: moduleRoute.href,
        module: moduleKey,
        subItems,
      });
    }
  }
  return items;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate checking for a logged-in user on component mount
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure permissions is a valid object
        const userWithPermissions = {
          ...parsedUser,
          permissions: typeof parsedUser.permissions === 'object' && parsedUser.permissions !== null 
            ? parsedUser.permissions 
            : {}
        };
        setUser(userWithPermissions);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Fetch roles from backend on mount
  useEffect(() => {
    const fetchRoles = async () => {
      if (isAuthenticated) {
        try {
          console.log('Fetching roles from backend...');
          const res = await roleService.getRoles();
          console.log('Raw roles response from backend:', res);
          console.log('Response structure:', {
            hasData: !!res.data,
            hasDataData: !!res.data?.data,
            dataType: typeof res.data,
            dataDataType: typeof res.data?.data
          });
          
          const rolesArray = res.data?.data || res.data || [];
          console.log('Roles array extracted:', rolesArray);
          console.log('Roles array length:', rolesArray.length);
          console.log('First role sample:', rolesArray[0]);
          
          const rolesWithIds = rolesArray.map((role: Role, index: number) => {
            // console.log(`Processing role ${index + 1}:`, role.name);
            // console.log(`Role ${index + 1} permissions:`, role.permissions);
            // console.log(`Role ${index + 1} permissions type:`, typeof role.permissions);
            // console.log(`Role ${index + 1} permissions keys:`, role.permissions ? Object.keys(role.permissions) : 'null');
            
            return {
            ...role,
            id: role.id || role._id,
            _id: role._id || role.id,
            permissions: role.permissions || {} // Keep permissions as an object
            };
          });
          
          console.log('Processed roles with IDs:', rolesWithIds);
          setRoles(rolesWithIds);
          
          if (rolesWithIds.length === 0) {
            console.warn('No roles found in the response');
          }
        } catch (err: any) {
          console.error('Error fetching roles:', err);
          console.error('Error details:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data
          });
          
          // Show error toast
          toast({
            title: "⚠️ Roles Fetch Failed",
            description: "Failed to fetch roles from the server. Please refresh the page.",
            variant: "destructive",
            duration: 5000,
            className: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-black",
          });
        }
      } else {
        console.log('User not authenticated, skipping roles fetch');
      }
    };
    fetchRoles();
    // Load real users from API if authenticated
    if (isAuthenticated) {
      refreshUsers();
    }
  }, [isAuthenticated, toast]);

  // Function to refresh roles from backend
  const refreshRoles = async () => {
    if (isAuthenticated) {
      try {
        console.log('Refreshing roles from backend...');
        const res = await roleService.getRoles();
        console.log('Raw refreshed roles response:', res);
        
        const rolesArray = res.data?.data || res.data || [];
        console.log('Refreshed roles array extracted:', rolesArray);
        
        const rolesWithIds = rolesArray.map((role: Role) => ({
          ...role,
          id: role.id || role._id,
          _id: role._id || role.id,
          permissions: role.permissions || {} // Keep permissions as an object
        }));
        
        console.log('Processed refreshed roles with IDs:', rolesWithIds);
        
        // Check if roles have permissions, if not fetch them separately
        const rolesWithPermissions = await Promise.all(
          rolesWithIds.map(async (role) => {
            if (!role.permissions || Object.keys(role.permissions).length === 0) {
              console.log(`Role ${role.name} has no permissions, fetching separately...`);
              try {
                const permissions = await roleService.getRolePermissions(role.id || role._id);
                console.log(`Fetched permissions for ${role.name}:`, permissions);
                return {
                  ...role,
                  permissions: permissions || {}
                };
              } catch (permError) {
                console.error(`Failed to fetch permissions for role ${role.name}:`, permError);
                return role;
              }
            }
            return role;
          })
        );
        
        console.log('Final roles with permissions:', rolesWithPermissions);
        setRoles(rolesWithPermissions);
        
        if (rolesWithPermissions.length === 0) {
          console.warn('No roles found in the refreshed response');
        }
      } catch (err: any) {
        console.error('Error refreshing roles:', err);
        console.error('Refresh error details:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        
        toast({
          title: "⚠️ Roles Refresh Failed",
          description: "Failed to refresh roles from the server.",
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-black",
        });
      }
    } else {
      console.log('User not authenticated, skipping roles refresh');
    }
  };

  // Update the hasPermission function to handle the new permission structure
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    // Super Admin role has full access to everything (system role)
    if (user.role.toLowerCase() === 'super_admin' || user.role.toLowerCase() === 'super admin') {
      return true;
    }
    
    // Handle different permission formats
    const parts = permission.toLowerCase().split('_');
    
    if (parts.length >= 2) {
      const [module, action] = parts;
      
      // Check if it's a module-level permission (e.g., "hiring_view")
      if (user.permissions && (user.permissions as any)[module]) {
        const modulePermissions = (user.permissions as any)[module];
        
        // Check if any submodule has the required action
        return Object.values(modulePermissions).some((submodule: any) => {
          return submodule[action] === true;
        });
      }
    }
    
    // Handle dot notation (e.g., "hiring.candidate.view")
    const [module, subModule, action] = permission.toLowerCase().split('.');
    
    if (module && subModule && action && user.permissions) {
      return Boolean((user.permissions as any)?.[module]?.[subModule]?.[action]);
    }
    
    return false;
  };

  // New function to check module permissions directly
  const hasModulePermission = (module: string, action: string): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    // Super Admin role has full access to everything (system role)
    if (user.role.toLowerCase() === 'super_admin' || user.role.toLowerCase() === 'super admin') {
      return true;
    }

    const modulePermissions = (user.permissions as any)?.[module];
    if (!modulePermissions) {
      return false;
    }

    // Check if any submodule has the required action permission
    return Object.values(modulePermissions).some((submodule: any) => {
      return submodule[action] === true;
    });
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      
      // Handle different response structures
      let userData;
      if (response.user) {
        userData = response.user;
      } else {
        throw new Error('Invalid response structure from server');
      }

      // If Super Admin, create a virtual user object with all permissions
      const isSuperAdmin =
        (Array.isArray(userData.roles) && userData.roles.some((r: string) => ['SUPER_ADMIN', 'Super Admin', 'super_admin'].includes(r))) ||
        (typeof userData.roles === 'string' && ['SUPER_ADMIN', 'Super Admin', 'super_admin'].includes(userData.roles));

      if (isSuperAdmin) {
        // Grant all permissions for all modules
        const allPermissionsObject = {
          employee_management: {
            employees: { view: true, create: true, edit: true, delete: true },
            department: { manage: true }
          },
          hiring: {
            candidate: { view: true, create: true, edit: true, delete: true },
            job: { view: true, edit: true, delete: true, post: true }
          },
          settings: {
            user: { view: true, create: true, edit: true, delete: true },
            role: { manage: true }
          },
          system: {
            system: { admin: true }
          }
        };
        const superAdminUser = {
          id: userData._id || 'super_admin',
          email: userData.email || 'superadmin@system.local',
          firstName: userData.firstName || 'Super',
          lastName: userData.lastName || 'Admin',
          role: 'Super Admin',
          permissions: allPermissionsObject,
        };
        setUser(superAdminUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(superAdminUser));
        toast({
          title: "🎉 Welcome Super Admin!",
          description: `Hello Super Admin! You have full system access.`,
          duration: 4000,
          className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-black",
        });
        return;
      }
      
      // Fetch permissions from separate API endpoint
      console.log('Fetching permissions from separate API...');
      let permissionsData;
      try {
        permissionsData = await permissionService.getUserPermissions();
        console.log('Permissions fetched successfully:', permissionsData);
      } catch (permissionsError) {
        console.error('Failed to fetch permissions, using default permissions:', permissionsError);
        // Use default permissions if the permissions API fails
        permissionsData = {
          permissions: {
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
          } as UserPermissions,
          roles: userData.roles || []
        };
      }
      
      // Create user object with fetched permissions
      const userObject = {
        id: userData._id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: permissionsData.roles && permissionsData.roles.length > 0 ? permissionsData.roles[0] : 'User', // Use roles from permissions API
        permissions: permissionsData.permissions, // Use permissions from separate API
      };
      
      // Set user data and authentication state
      setUser(userObject);
      setIsAuthenticated(true);
      
      // Save to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(userObject));
      
      toast({
        title: "🎉 Welcome Back!",
        description: `Hello ${userObject.firstName} ${userObject.lastName}! You've successfully logged into your account.`,
        duration: 4000,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-black",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      let errorMessage = "Please check your email and password and try again.";
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Login Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
        className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-black",
      });
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    console.log(`Attempting to register with email: ${email}`);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (users.some(u => u.email === email)) {
          toast({
            title: "⚠️ Registration Failed",
            description: "A user with this email already exists. Please try a different email.",
            variant: "destructive",
            duration: 5000,
            className: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-black",
          });
          reject(new Error("User already exists"));
          return;
        }
        
        const newUser: MockUser = {
          id: `u${users.length + 1}`,
          name: `User ${users.length + 1}`,
          email,
          password,
          role: 'EMPLOYEE',
          permissions: [...ROLE_PERMISSIONS.EMPLOYEE],
        };
        setUsers(prevUsers => [...prevUsers, newUser]);

        // Convert permissions array to UserPermissions object
        const permissionsObject = permissionService.convertArrayToPermissions(newUser.permissions || []);

        const registeredUser: User = {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.name?.split(' ')[0] || 'User',
          lastName: newUser.name?.split(' ')[1] || '',
          role: newUser.role || 'EMPLOYEE',
          permissions: permissionsObject,
        };

        setUser(registeredUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(registeredUser));
        toast({
          title: "🎉 Account Created!",
          description: "Your account has been created and you are now logged in.",
          duration: 4000,
          className: "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 text-black",
        });
        navigate('/dashboard');
        resolve();
      }, 500);
    });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    navigate('/login');
    toast({
      title: "👋 See You Soon!",
      description: "You've been successfully logged out. Come back anytime!",
      duration: 3000,
      className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-black",
    });
  };

  const updateUserRole = (userId: string, newRole: string) => {
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId 
          ? { ...u, role: newRole, permissions: Array.isArray(AUTH_ROLE_PERMISSIONS[newRole]) ? AUTH_ROLE_PERMISSIONS[newRole] : [] }
          : u
      )
    );

    // If the current user's role is being updated, update their permissions too
    if (user?.id === userId) {
      setUser(prevUser => {
        if (!prevUser) return null;
        // Convert permissions array to UserPermissions object
        const rolePermissions = AUTH_ROLE_PERMISSIONS[newRole] || [];
        const permissionsObject = permissionService.convertArrayToPermissions(rolePermissions);
        return {
          ...prevUser,
          role: newRole,
          permissions: permissionsObject
        };
      });
    }
  };

  const updateUserPermissions = (permissions: UserPermissions) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      // Ensure permissions is always a UserPermissions object
      const safePermissions = permissions || {
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
      const updatedUser = {
        ...prevUser,
        permissions: safePermissions
      };
      // Update localStorage to persist the changes
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Create role using backend
  const createRole = async (role: Partial<Role>) => {
    try {
      // Transform permissions to the format expected by the backend
      const roleData = {
        ...role,
        permissions: transformPermissionsForBackend(role.permissions as UserPermissions)
      };
      
      const newRole = await roleService.createRole(roleData);
      
      // Use the original role name if backend doesn't return it
      const finalRoleName = newRole.name || role.name;
      
      // Refresh roles from backend to ensure consistency
      await refreshRoles();
      
      // Dispatch custom event to notify UI about role creation
      window.dispatchEvent(new CustomEvent('rolesUpdated', {
        detail: { action: 'created', roleName: finalRoleName, roleId: newRole.id || newRole._id }
      }));
      
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: { roleName: finalRoleName, permissions: newRole.permissions }
      }));
      
      toast({
        title: `✅ Role "${finalRoleName}" Created!`,
        description: `The role has been successfully created and is now available in the system. You can now assign this role to users.`,
        duration: 5000,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-black",
      });
    } catch (err: any) {
      console.error('❌ Failed to create role:', err);
      console.error('❌ Error response status:', err?.response?.status);
      console.error('❌ Error response data:', err?.response?.data);
      
      let errorMessage = "Failed to create role. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
        toast({
          title: "🚫 Role Creation Failed",
        description: errorMessage,
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-black",
        });
      // Re-throw the error so the calling component can handle it
      throw err;
    }
  };

  // Update role using backend
  const updateRole = useCallback(async (roleName: string, permissions: UserPermissions) => {
    try {
      console.log('=== UPDATING ROLE ===');
      console.log('Role name to update:', roleName);
      console.log('Current roles in state:', roles);
      console.log('Permissions to update:', JSON.stringify(permissions, null, 2));
      
      // Prevent editing of system roles
      const systemRoles = ['SUPER_ADMIN', 'Super Admin', 'super_admin'];
      if (systemRoles.includes(roleName) || systemRoles.some(role => role.toLowerCase() === roleName.toLowerCase())) {
        toast({
          title: "🛡️ System Role Protected",
          description: `Cannot edit system role "${roleName}". System roles are protected.`,
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-black",
        });
        return;
      }

      let role = roles.find(r => r.name === roleName);
      console.log('Found role in current state:', role);
      
      // If role not found, try refreshing roles from backend
      if (!role) {
        console.log('Role not found in current state, refreshing roles from backend...');
        try {
          // Trigger a refresh by dispatching the event
          window.dispatchEvent(new CustomEvent('refreshRoles'));
          // Wait a bit for the refresh to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try to find the role again in the updated roles state
          const currentRoles = roles; // This will be the updated roles after refresh
          role = currentRoles.find(r => r.name === roleName);
          console.log('Found role after refresh:', role);
        } catch (refreshError) {
          console.error('Error refreshing roles:', refreshError);
        }
      }
      
      if (!role) {
        console.error('Role still not found after refresh. Available roles:', roles.map(r => ({ name: r.name, id: r.id || r._id })));
        toast({
          title: "🔍 Role Not Found",
          description: `The role "${roleName}" could not be found in the system. Please refresh the page and try again.`,
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-black",
        });
        return;
      }

      // Use _id as fallback if id is not available
      const roleId = role.id || role._id;
      console.log('Role ID to update:', roleId);
      console.log('Full role object:', role);
      
      if (!roleId) {
        console.error('Role object missing ID:', role);
        toast({
          title: "🔧 Role ID Missing",
          description: "Role ID not found. Please refresh the page and try again.",
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-black",
        });
        return;
      }
      
      // Validate role ID format
      if (typeof roleId !== 'string' || roleId.length < 10) {
        console.error('Invalid role ID format:', roleId);
        toast({
          title: "🔧 Invalid Role ID",
          description: "Role ID format is invalid. Please refresh the page and try again.",
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-black",
        });
        return;
      }
      
      const permissionsObject = permissions;
      
      console.log('Updating role with ID:', roleId);
      console.log('Role name:', roleName);
      console.log('Original permissions:', JSON.stringify(permissionsObject, null, 2));
      
      // Transform permissions to a simpler format that backend might expect
      const simplifiedPermissions = transformPermissionsForBackend(permissionsObject);
      console.log('Simplified permissions for backend:', JSON.stringify(simplifiedPermissions, null, 2));
      
      console.log('Calling roleService.updateRole with:', { roleId, permissions: simplifiedPermissions });
      const updatedRole = await roleService.updateRole(roleId, { permissions: simplifiedPermissions });
      console.log('Backend response:', updatedRole);
      
      // Refresh roles from backend to ensure consistency
      console.log('Refreshing roles from backend after update...');
      window.dispatchEvent(new CustomEvent('refreshRoles'));
      
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: { roleName: updatedRole.name, permissions: updatedRole.permissions }
      }));
      
      toast({
        title: "✅ Role Updated!",
        description: `Role "${roleName}" has been updated successfully.`,
        duration: 4000,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-black",
      });
    } catch (err: any) {
      console.error('Failed to update role:', err);
      console.error('Error response data:', err?.response?.data);
      console.error('Error response status:', err?.response?.status);
      console.error('Error response headers:', err?.response?.headers);
      
      let errorMessage = "Failed to update role. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: "🚫 Role Update Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
        className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-black",
      });
      
      // Re-throw the error so the calling component can handle it
      throw err;
    }
  }, [roles, toast]);

  // Delete role using backend
  const deleteRole = async (roleName: string) => {
    try {
      // Prevent deletion of system roles
      const systemRoles = ['SUPER_ADMIN', 'Super Admin', 'super_admin'];
      if (systemRoles.includes(roleName) || systemRoles.some(role => role.toLowerCase() === roleName.toLowerCase())) {
        toast({
          title: "🛡️ System Role Protected",
          description: `Cannot delete system role "${roleName}". System roles are protected.`,
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-black",
        });
        return;
      }

      const role = roles.find(r => r.name === roleName);
      if (!role) {
        toast({
          title: "🔍 Role Not Found",
          description: "The specified role could not be found in the system.",
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-black",
        });
        return;
      }

      // Use _id as fallback if id is not available
      const roleId = role.id || role._id;
      if (!roleId) {
        console.error('Role object:', role);
        toast({
          title: "🔧 Role ID Missing",
          description: "Role ID not found. Please refresh the page and try again.",
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-black",
        });
        return;
      }
      
      console.log('Deleting role with ID:', roleId, 'Role object:', role);
      await roleService.deleteRole(roleId);
      setRoles(prev => prev.filter(r => (r.id || r._id) !== roleId));
      
      // Refresh roles from backend to ensure consistency
      await refreshRoles();
      
      // Dispatch custom event to notify UI about role deletion
      window.dispatchEvent(new CustomEvent('rolesUpdated', {
        detail: { action: 'deleted', roleName, roleId }
      }));
      
      // Also dispatch permissions updated event
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: { roleName, permissions: [] }
      }));
      
      toast({
        title: "🗑️ Role Deleted!",
        description: `Role "${roleName}" has been deleted successfully.`,
        duration: 4000,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-black",
      });
    } catch (err: any) {
      console.error('Failed to delete role:', err);
      
      let errorMessage = "Failed to delete role. Please try again.";
      if (err.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast({
        title: "🚫 Role Deletion Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
        className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-black",
      });
      
      // Re-throw the error so the calling component can handle it
      throw err;
    }
  };

  // Update the assignRoleToUser function to handle permissions
  const assignRoleToUser = (userId: string, roleName: string) => {
    // Prevent assigning Super Admin role to users (it's a system role)
    const systemRoles = ['SUPER_ADMIN', 'Super Admin', 'super_admin'];
    if (systemRoles.includes(roleName) || systemRoles.some(role => role.toLowerCase() === roleName.toLowerCase())) {
      toast({
        title: "🛡️ System Role Protected",
        description: `Cannot assign system role "${roleName}" to users. System roles are protected.`,
        variant: "destructive",
        duration: 5000,
        className: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-black",
      });
      return;
    }

    setUserRoles(prev => {
      const updated = { ...prev, [userId]: roleName };
      saveToStorage(STORAGE_KEYS.USER_ROLES, updated);
      
      // Get the full permissions object for the assigned role
      const role = roles.find(r => r.name === roleName);
      const permissionsObject = role ? role.permissions : {};
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: roleName, permissions: permissionService.convertPermissionsToArray(permissionsObject as UserPermissions) } // Mock user permissions are flat array
            : user
        )
      );

      // If the current user's role is being updated, refresh their permissions from API
      if (user?.id === userId) {
        // Refresh permissions from API for current user
        refreshUserPermissions();
      }
      
      // Force a re-render of components that depend on permissions
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: { roleName, permissions: permissionsObject }
      }));
      
      return updated;
    });
  };

  // Update the unassignRoleFromUser function to handle permissions
  const unassignRoleFromUser = (userId: string) => {
    setUserRoles(prev => {
      const updated = { ...prev };
      delete updated[userId];
      saveToStorage(STORAGE_KEYS.USER_ROLES, updated);
      
      // Reset user's permissions to a default role (e.g., 'Employee')
      const defaultRole = roles.find(r => r.name === 'Employee');
      const defaultPermissionsObject = defaultRole ? defaultRole.permissions : {};
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: 'Employee', permissions: permissionService.convertPermissionsToArray(defaultPermissionsObject as UserPermissions) }
            : user
        )
      );

      // If the current user's role is being updated, refresh their permissions from API
      if (user?.id === userId) {
        // Refresh permissions from API for current user
        refreshUserPermissions();
      }
      
      // Force a re-render of components that depend on permissions
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: { roleName: 'Employee', permissions: defaultPermissionsObject }
      }));
      
      return updated;
    });
  };
 
  // Listen for custom events
  useEffect(() => {
    const handleRolesUpdated = (event: CustomEvent) => {
      console.log('Roles updated event received:', event.detail);
      // Refresh roles when a role is created/updated
      refreshRoles();
    };

    const handlePermissionsUpdated = (event: CustomEvent) => {
      console.log('Permissions updated event received:', event.detail);
      // Refresh user permissions when permissions change
      refreshUserPermissions();
    };

    const handleRefreshRoles = () => {
      console.log('Refresh roles event received');
      refreshRoles();
    };

    const handleUpdateRoles = (event: CustomEvent) => {
      console.log('Update roles event received:', event.detail);
      if (event.detail?.roles) {
        console.log('Updating roles with new data:', event.detail.roles);
        setRoles(event.detail.roles);
      }
    };

    window.addEventListener('rolesUpdated', handleRolesUpdated as EventListener);
    window.addEventListener('permissionsUpdated', handlePermissionsUpdated as EventListener);
    window.addEventListener('refreshRoles', handleRefreshRoles as EventListener);
    window.addEventListener('updateRoles', handleUpdateRoles as EventListener);

    return () => {
      window.removeEventListener('rolesUpdated', handleRolesUpdated as EventListener);
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdated as EventListener);
      window.removeEventListener('refreshRoles', handleRefreshRoles as EventListener);
      window.removeEventListener('updateRoles', handleUpdateRoles as EventListener);
    };
  }, []);

  const refreshUserPermissions = async () => {
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, skipping permissions refresh');
      return;
    }

    try {
      console.log('Refreshing user permissions...');
      const permissionsData = await permissionService.getUserPermissions();
      
      // Update user with new permissions and roles
      const updatedUser = {
        ...user,
        role: permissionsData.roles && permissionsData.roles.length > 0 ? permissionsData.roles[0] : user.role,
        permissions: permissionsData.permissions || user.permissions,
      };
      
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      console.log('User permissions refreshed successfully');
    } catch (error: any) {
      console.error('Failed to refresh user permissions:', error);
      toast({
        title: "⚠️ Permissions Update Failed",
        description: "Failed to refresh your permissions. Some features may not work correctly.",
        variant: "destructive",
        duration: 5000,
        className: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-black",
      });
    }
  };

  const refreshUsers = async () => {
    try {
      console.log('🔄 Refreshing users from AuthContext...');
      
      // 🔥 FIX: Use employee service instead of auth service to get users with role assignments
      const { getEmployees } = await import('../services/employee.service');
      const employeesData = await getEmployees();
      console.log('📥 Raw employees response:', employeesData);
      
      // Transform employee data to user format
      const usersArray = Array.isArray(employeesData) ? employeesData : [];
      console.log('✅ Employees processed:', usersArray?.length || 0, 'users');
      console.log('📋 Sample employee from AuthContext:', usersArray?.[0]);
      
      // Transform employees to MockUser format for compatibility
      const processedUsers = usersArray.map((emp: any) => {
        // Get user info from nested user object or directly from employee
        const user = emp.user || emp;
        const name = user.name || 
                    `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                    user.email || 
                    'Unknown User';
        
        // Get role information - check multiple sources
        let role = '';
        let roles: string[] = [];
        
        // Check user.roles array first (most reliable for role assignments)
        if (user.roles && Array.isArray(user.roles)) {
          roles = user.roles.map((r: any) => typeof r === 'object' ? r.name || r._id || r.id : r).filter(Boolean);
          role = roles[0] || ''; // Use first role as primary role
        }
        
        // Fallback to emp.role if no user roles
        if (!role && emp.role) {
          role = typeof emp.role === 'object' ? emp.role.name || emp.role._id || emp.role.id : emp.role;
        }
        
        // Fallback to user.role if still no role
        if (!role && user.role) {
          role = typeof user.role === 'object' ? user.role.name || user.role._id || user.role.id : user.role;
        }
        
        console.log(`👤 Processing user: ${name}, role: ${role}, roles: ${JSON.stringify(roles)}`);
        
        return {
          id: user._id || user.id || emp._id || emp.id,
          _id: user._id || emp._id,
          name: name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email || emp.email,
          role: role,
          roles: roles,
          // Include any additional properties
          ...user,
          ...emp
        };
      });
      
      console.log('🔄 Processed users for AuthContext:', processedUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        roles: u.roles
      })));
      
      setUsers(processedUsers);
    } catch (error) {
      console.error('❌ Failed to refresh users:', error);
      toast({
        title: "⚠️ Users Refresh Failed",
        description: "Failed to refresh users from the server.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    hasPermission,
    hasModulePermission,
    updateUserRole,
    updateUserPermissions,
    refreshUserPermissions,
    refreshRoles,
    refreshUsers,
    users,
    roles,
    userRoles,
    updateRole,
    createRole,
    deleteRole,
    assignRoleToUser,
    unassignRoleFromUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 