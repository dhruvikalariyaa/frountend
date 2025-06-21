import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import { authService } from '../services/auth.service';
import { roleService } from '../services/role.service';
import { permissionService, UserPermissions } from '../services/permission.service';
import { Role } from '../types/models';

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

// Define all available permissions based on the new API structure
export const PERMISSIONS = {
  // Hiring Management
  CANDIDATE_VIEW: 'CANDIDATE_VIEW',
  CANDIDATE_CREATE: 'CANDIDATE_CREATE',
  CANDIDATE_EDIT: 'CANDIDATE_EDIT',
  CANDIDATE_DELETE: 'CANDIDATE_DELETE',
  
  INTERVIEW_VIEW: 'INTERVIEW_VIEW',
  INTERVIEW_CREATE: 'INTERVIEW_CREATE',
  INTERVIEW_EDIT: 'INTERVIEW_EDIT',
  INTERVIEW_DELETE: 'INTERVIEW_DELETE',
  
  JOB_VIEW: 'JOB_VIEW',
  JOB_CREATE: 'JOB_CREATE',
  JOB_EDIT: 'JOB_EDIT',
  JOB_DELETE: 'JOB_DELETE',
  
  ONBOARDING_VIEW: 'ONBOARDING_VIEW',
  ONBOARDING_CREATE: 'ONBOARDING_CREATE',
  ONBOARDING_EDIT: 'ONBOARDING_EDIT',
  ONBOARDING_DELETE: 'ONBOARDING_DELETE',
  
  // Employee Management
  EMPLOYEE_VIEW: 'EMPLOYEE_VIEW',
  EMPLOYEE_CREATE: 'EMPLOYEE_CREATE',
  EMPLOYEE_EDIT: 'EMPLOYEE_EDIT',
  EMPLOYEE_DELETE: 'EMPLOYEE_DELETE',
  
  DEPARTMENT_VIEW: 'DEPARTMENT_VIEW',
  DEPARTMENT_CREATE: 'DEPARTMENT_CREATE',
  DEPARTMENT_EDIT: 'DEPARTMENT_EDIT',
  DEPARTMENT_DELETE: 'DEPARTMENT_DELETE',
  
  LEAVE_VIEW: 'LEAVE_VIEW',
  LEAVE_CREATE: 'LEAVE_CREATE',
  LEAVE_EDIT: 'LEAVE_EDIT',
  LEAVE_DELETE: 'LEAVE_DELETE',
  
  ATTENDENCE_VIEW: 'ATTENDENCE_VIEW',
  ATTENDENCE_CREATE: 'ATTENDENCE_CREATE',
  ATTENDENCE_EDIT: 'ATTENDENCE_EDIT',
  ATTENDENCE_DELETE: 'ATTENDENCE_DELETE',
  
  PERFORMANCE_VIEW: 'PERFORMANCE_VIEW',
  PERFORMANCE_CREATE: 'PERFORMANCE_CREATE',
  PERFORMANCE_EDIT: 'PERFORMANCE_EDIT',
  PERFORMANCE_DELETE: 'PERFORMANCE_DELETE',
  
  // Settings
  COMPANYPROFILE_VIEW: 'COMPANYPROFILE_VIEW',
  COMPANYPROFILE_CREATE: 'COMPANYPROFILE_CREATE',
  COMPANYPROFILE_EDIT: 'COMPANYPROFILE_EDIT',
  COMPANYPROFILE_DELETE: 'COMPANYPROFILE_DELETE',
  
  ROLESPERMISIONS_VIEW: 'ROLESPERMISIONS_VIEW',
  ROLESPERMISIONS_CREATE: 'ROLESPERMISIONS_CREATE',
  ROLESPERMISIONS_EDIT: 'ROLESPERMISIONS_EDIT',
  ROLESPERMISIONS_DELETE: 'ROLESPERMISIONS_DELETE',
  
  SYSTEMSETTINGS_VIEW: 'SYSTEMSETTINGS_VIEW',
  SYSTEMSETTINGS_CREATE: 'SYSTEMSETTINGS_CREATE',
  SYSTEMSETTINGS_EDIT: 'SYSTEMSETTINGS_EDIT',
  SYSTEMSETTINGS_DELETE: 'SYSTEMSETTINGS_DELETE',
  
  ROLESDETAILS_VIEW: 'ROLESDETAILS_VIEW',
  ROLESDETAILS_EDIT: 'ROLESDETAILS_EDIT',
} as const;

// Module-based permission structure
export const MODULE_PERMISSIONS = {
  dashboard: {
    dashboard: {
      view: 'DASHBOARD_VIEW'
    }
  },
  hiring: {
    candidate: {
      view: PERMISSIONS.CANDIDATE_VIEW,
      create: PERMISSIONS.CANDIDATE_CREATE,
      edit: PERMISSIONS.CANDIDATE_EDIT,
      delete: PERMISSIONS.CANDIDATE_DELETE,
    },
    interview: {
      view: PERMISSIONS.INTERVIEW_VIEW,
      create: PERMISSIONS.INTERVIEW_CREATE,
      edit: PERMISSIONS.INTERVIEW_EDIT,
      delete: PERMISSIONS.INTERVIEW_DELETE,
    },
    job: {
      view: PERMISSIONS.JOB_VIEW,
      create: PERMISSIONS.JOB_CREATE,
      edit: PERMISSIONS.JOB_EDIT,
      delete: PERMISSIONS.JOB_DELETE,
    },
    onboarding: {
      view: PERMISSIONS.ONBOARDING_VIEW,
      create: PERMISSIONS.ONBOARDING_CREATE,
      edit: PERMISSIONS.ONBOARDING_EDIT,
      delete: PERMISSIONS.ONBOARDING_DELETE,
    },
  },
  employeemanagement: {
    employee: {
      view: PERMISSIONS.EMPLOYEE_VIEW,
      create: PERMISSIONS.EMPLOYEE_CREATE,
      edit: PERMISSIONS.EMPLOYEE_EDIT,
      delete: PERMISSIONS.EMPLOYEE_DELETE,
    },
    department: {
      view: PERMISSIONS.DEPARTMENT_VIEW,
      create: PERMISSIONS.DEPARTMENT_CREATE,
      edit: PERMISSIONS.DEPARTMENT_EDIT,
      delete: PERMISSIONS.DEPARTMENT_DELETE,
    },
    leave: {
      view: PERMISSIONS.LEAVE_VIEW,
      create: PERMISSIONS.LEAVE_CREATE,
      edit: PERMISSIONS.LEAVE_EDIT,
      delete: PERMISSIONS.LEAVE_DELETE,
    },
    attendence: {
      view: PERMISSIONS.ATTENDENCE_VIEW,
      create: PERMISSIONS.ATTENDENCE_CREATE,
      edit: PERMISSIONS.ATTENDENCE_EDIT,
      delete: PERMISSIONS.ATTENDENCE_DELETE,
    },
    performance: {
      view: PERMISSIONS.PERFORMANCE_VIEW,
      create: PERMISSIONS.PERFORMANCE_CREATE,
      edit: PERMISSIONS.PERFORMANCE_EDIT,
      delete: PERMISSIONS.PERFORMANCE_DELETE,
    },
  },
  settings: {
    companyprofile: {
      view: PERMISSIONS.COMPANYPROFILE_VIEW,
      create: PERMISSIONS.COMPANYPROFILE_CREATE,
      edit: PERMISSIONS.COMPANYPROFILE_EDIT,
      delete: PERMISSIONS.COMPANYPROFILE_DELETE,
    },
    rolespermisions: {
      view: PERMISSIONS.ROLESPERMISIONS_VIEW,
      create: PERMISSIONS.ROLESPERMISIONS_CREATE,
      edit: PERMISSIONS.ROLESPERMISIONS_EDIT,
      delete: PERMISSIONS.ROLESPERMISIONS_DELETE,
    },
    systemsettings: {
      view: PERMISSIONS.SYSTEMSETTINGS_VIEW,
      create: PERMISSIONS.SYSTEMSETTINGS_CREATE,
      edit: PERMISSIONS.SYSTEMSETTINGS_EDIT,
      delete: PERMISSIONS.SYSTEMSETTINGS_DELETE,
    },
    rolesDetails: {
      view: PERMISSIONS.ROLESDETAILS_VIEW,
      edit: PERMISSIONS.ROLESDETAILS_EDIT,
    },
  },
} as const;

// Update ROLE_PERMISSIONS to include EMPLOYEE with correct permissions
export let ROLE_PERMISSIONS = {
  ADMIN: Object.values(PERMISSIONS),
  EMPLOYEE: [
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.DEPARTMENT_VIEW,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_CREATE,
    PERMISSIONS.ATTENDENCE_VIEW,
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.COMPANYPROFILE_VIEW,
  ],
} as const;

// Add type for custom roles
export type CustomRole = {
  name: string;
  permissions: string[];
};

// Update the AUTH_ROLE_PERMISSIONS type to be mutable
export const AUTH_ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: [...Object.values(PERMISSIONS)],
  EMPLOYEE: [...ROLE_PERMISSIONS.EMPLOYEE],
};

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  permissions?: string[];
}

export const initialMockUsers: MockUser[] = [
  // Admin users with predefined roles
  

  // Users without assigned roles (can be assigned later)
  { id: 'u1', name: 'John Doe', email: 'john@example.com', password: 'password', role: '' },
  { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', password: 'password', role: '' },
  { id: 'u3', name: 'Mike Johnson', email: 'mike@example.com', password: 'password', role: '' },
  { id: 'u4', name: 'Sarah Wilson', email: 'sarah@example.com', password: 'password', role: '' },
  { id: 'u5', name: 'David Brown', email: 'david@example.com', password: 'password', role: '' },
  { id: 'u6', name: 'Emily Davis', email: 'emily@example.com', password: 'password', role: '' },
  { id: 'u7', name: 'Robert Taylor', email: 'robert@example.com', password: 'password', role: '' },
  { id: 'u8', name: 'Lisa Anderson', email: 'lisa@example.com', password: 'password', role: '' },
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

// Helper function to convert permissions object to array
const permissionsObjectToArray = (permissions: Record<string, any> | string[] | undefined): string[] => {
  if (!permissions) return [];
  if (Array.isArray(permissions)) return permissions;
  if (typeof permissions === 'object') {
    return Object.keys(permissions).filter(key => permissions[key] === true);
  }
  return [];
};

// Helper function to convert permissions array to object
const permissionsArrayToObject = (permissions: string[]): Record<string, any> => {
  return permissions.reduce((acc, permission) => {
    acc[permission] = true;
    return acc;
  }, {} as Record<string, any>);
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<MockUser[]>(initialMockUsers);
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
          const res = await roleService.getRoles();
          console.log('Fetched roles from backend:', res);
          
          const rolesArray = res.data.data || [];
          const rolesWithIds = rolesArray.map((role: Role) => ({
            ...role,
            id: role.id || role._id,
            _id: role._id || role.id,
            permissions: role.permissions || {} // Keep permissions as an object
          }));
          
          console.log('Processed roles with IDs:', rolesWithIds);
          setRoles(rolesWithIds);
        } catch (err) {
          console.error('Error fetching roles:', err);
          // handle error, maybe show toast
        }
      }
    };
    fetchRoles();
  }, [isAuthenticated]);

  // Function to refresh roles from backend
  const refreshRoles = async () => {
    if (isAuthenticated) {
      try {
        const res = await roleService.getRoles();
        console.log('Refreshed roles from backend:', res);
        
        const rolesArray = res.data.data || [];
        const rolesWithIds = rolesArray.map((role: Role) => ({
          ...role,
          id: role.id || role._id,
          _id: role._id || role.id,
          permissions: role.permissions || {} // Keep permissions as an object
        }));
        
        console.log('Processed refreshed roles with IDs:', rolesWithIds);
        setRoles(rolesWithIds);
      } catch (err) {
        console.error('Error refreshing roles:', err);
      }
    }
  };

  // Update the hasPermission function to handle the new permission structure
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    if (user.role.toLowerCase() === 'administrator' || user.role.toLowerCase() === 'admin') {
      return true;
    }
    
    const [module, action] = permission.toLowerCase().split('_');
    if (!module || !action) return false;

    const [mainModule, subModule] = module.split('.');
    
    if(user.permissions){
      if (mainModule && subModule) {
        return Boolean((user.permissions as any)?.[mainModule]?.[subModule]?.[action]);
      }
      return Boolean((user.permissions as any)?.[module]?.[action]);
    }
    return false;
  };

  // New function to check module permissions directly
  const hasModulePermission = (module: string, action: string): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    if (user.role.toLowerCase() === 'administrator' || user.role.toLowerCase() === 'admin') {
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
      const userData = response.data.user;
      
      // Create user object
      const userObject = {
        id: userData._id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        permissions: userData.permissions,
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
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "❌ Login Failed",
        description: "Please check your email and password and try again.",
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
          firstName: newUser.name.split(' ')[0],
          lastName: newUser.name.split(' ')[1],
          role: newUser.role,
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
      // Convert permissions array to the format expected by the backend
      const roleData = {
        ...role,
        permissions: Array.isArray(role.permissions) 
          ? permissionsArrayToObject(role.permissions)
          : role.permissions
      };
      
      const newRole = await roleService.createRole(roleData);
      console.log('Created new role:', newRole);
      console.log('Original role name:', role.name);
      console.log('Backend returned role name:', newRole.name);
      
      // Use the original role name if backend doesn't return it
      const finalRoleName = newRole.name || role.name;
      console.log('Final role name for toast:', finalRoleName);
      
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
      console.error('Failed to create role:', err);
      if (err?.response?.data?.message) {
        toast({
          title: "🚫 Role Creation Failed",
          description: err.response.data.message,
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-black",
        });
      } else {
        toast({
          title: "🚫 Role Creation Failed",
          description: "Failed to create role. Please try again.",
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-black",
        });
      }
      // Re-throw the error so the calling component can handle it
      throw err;
    }
  };

  // Update role using backend
  const updateRole = useCallback(async (roleName: string, permissions: UserPermissions) => {
    try {
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
      
      const permissionsObject = permissions;
      
      const updatedRole = await roleService.updateRole(roleId, { permissions: permissionsObject });
      
      // Refresh roles from backend to ensure consistency
      await refreshRoles();
      
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
      
      let errorMessage = "Failed to update role. Please try again.";
      if (err.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
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
      const systemRoles = ['ADMIN'];
      if (systemRoles.includes(roleName.toUpperCase())) {
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

      // If the current user's role is being updated, update their permissions too
      if (user?.id === userId) {
        setUser(prevUser => {
          if (!prevUser) return null;
          const updatedUser = {
            ...prevUser,
            role: roleName,
            permissions: permissionsObject as UserPermissions
          };
          // Update localStorage to persist the changes
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          return updatedUser;
        });
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

      // If the current user's role is being updated, update their permissions too
      if (user?.id === userId) {
        setUser(prevUser => {
          if (!prevUser) return null;
          const updatedUser = {
            ...prevUser,
            role: 'Employee',
            permissions: defaultPermissionsObject as UserPermissions
          };
          // Update localStorage to persist the changes
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
      
      // Force a re-render of components that depend on permissions
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: { roleName: 'Employee', permissions: defaultPermissionsObject }
      }));
      
      return updated;
    });
  };
 
  // Add an effect to handle permission updates
  useEffect(() => {
    const handlePermissionsUpdated = (event: CustomEvent) => {
      const { roleName, permissions } = event.detail;
      // Update any components that need to react to permission changes
      if (user?.role === roleName) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            permissions: permissions
          };
        });
      }
    };

    window.addEventListener('permissionsUpdated', handlePermissionsUpdated as EventListener);
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdated as EventListener);
    };
  }, [user]);

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