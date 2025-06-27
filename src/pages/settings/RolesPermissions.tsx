import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  Users,
  X,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  UserPlus,
  Check,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PermissionGuard } from '@/components/PermissionGuard';
import { COMPONENT_PERMISSIONS } from '@/constants/componentPermissions';
import { Role } from '@/types/models';
import { UserPermissions, permissionService, GroupedPermissionsResponse } from '@/services/permission.service';
import { roleService } from '@/services/role.service';
import { performanceService, usePerformanceTracking } from '@/services/performance.service';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getEmployees, Employee, assignRoleToUser as apiAssignRoleToUser, unassignRoleFromUser as apiUnassignRoleFromUser } from '@/services/employee.service';
import { RoleStats, RolesTable } from './components/RolesTable';
import { CreateRoleForm } from './components/CreateRoleForm';

import { AssignUserDialog } from './components/AssignUserDialog';
import { EditRoleDialog } from './components/EditRoleDialog';
import { DeleteRoleDialog } from './components/DeleteRoleDialog';
import { ViewUsersDialog } from './components/ViewUsersDialog';
// 🔥 BOOLEAN UTILITY: Helper function to ensure strict boolean values throughout the component
const toBooleanStrict = (value: any): boolean => {
  // Handle explicit true values
  if (value === true || value === 'true' || value === 1 || value === '1') {
    return true;
  }
  // Handle explicit false values
  if (value === false || value === 'false' || value === 0 || value === '0' || value === null || value === undefined || value === '') {
    return false;
  }
  // For any other value, convert to boolean but only log in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Non-boolean value detected in permissions:', value, 'Type:', typeof value, 'Converting to:', Boolean(value));
  }
  return Boolean(value);
};

// 🔥 BOOLEAN VALIDATION: Helper to validate permission objects
const validatePermissionStructure = (permissions: any): boolean => {
  if (!permissions || typeof permissions !== 'object') {
    return false;
  }
  
  try {
    Object.values(permissions).forEach((module: any) => {
      if (module && typeof module === 'object') {
        Object.values(module).forEach((submodule: any) => {
          if (submodule && typeof submodule === 'object') {
            Object.values(submodule).forEach((permission: any) => {
              if (typeof permission !== 'boolean' && process.env.NODE_ENV === 'development') {
                console.warn('⚠️ Non-boolean permission value found:', permission, 'Type:', typeof permission);
              }
            });
          }
        });
      }
    });
    return true;
  } catch (error) {
    console.error('❌ Error validating permission structure:', error);
    return false;
  }
};

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: UserPermissions;
  category: string;
}



// Define permission groups based on the backend API structure
const permissionGroups = {
  employee_management: {
    description: 'Employee Management',
    modules: {
      employees: 'Employee Management',
      department: 'Department Management'
    }
  },
  hiring: {
    description: 'Hiring Management',
    modules: {
      candidate: 'Candidate Management',
      job: 'Job Management'
    }
  },
  settings: {
    description: 'Settings',
    modules: {
      user: 'User Management',
      role: 'Role Management'
    }
  },
  system: {
    description: 'System',
    modules: {
      system: 'System Administration'
    }
  }
};

// Role templates with the new permission structure
const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: {
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
        role: { view: true, create: true, edit: true, delete: true }
      },
      system: {
        system: { admin: true }
      }
    },
    category: 'System'
  },
  {
    id: 'hr_manager',
    name: 'HR Manager',
    description: 'Complete HR management and oversight',
    permissions: {
      employee_management: {
        employees: { view: true, create: true, edit: true, delete: false },
        department: { manage: true }
      },
      hiring: {
        candidate: { view: true, create: true, edit: true, delete: false },
        job: { view: true, edit: true, delete: false, post: true }
      },
      settings: {
        user: { view: true, create: false, edit: false, delete: false },
        role: { view: false, create: false, edit: false, delete: false}
      },
      system: {
        system: { admin: false }
      }
    },
    category: 'HR'
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Basic employee access',
    permissions: {
      employee_management: {
        employees: { view: false, create: false, edit: false, delete: false },
        department: { manage: false }
      },
      hiring: {
        candidate: { view: false, create: false, edit: false, delete: false },
        job: { view: true, edit: false, delete: false, post: false }
      },
      settings: {
        user: { view: false, create: false, edit: false, delete: false },
        role: { view: false, create: false, edit: false, delete: false }
      },
      system: {
        system: { admin: false }
      }
    },
    category: 'Basic'
  }
];

const ALL_POSSIBLE_PERMISSIONS: UserPermissions = {
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
    role: { view: false, create: false, edit: false, delete: false }
  },
  system: {
    system: { admin: false }
  }
};

// Custom hooks for better state management
const useRoleManagement = () => {
  const { 
    roles, 
    userRoles, 
    updateRole, 
    createRole, 
    deleteRole, 
    assignRoleToUser, 
    unassignRoleFromUser,
    hasPermission,
    users,
    user,
    refreshRoles,
    refreshUsers
  } = useAuth();
  
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRolePermissions, setNewRolePermissions] = useState<UserPermissions>(
    JSON.parse(JSON.stringify(ALL_POSSIBLE_PERMISSIONS))
  );
  const [newRoleDescription, setNewRoleDescription] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = useState<boolean>(false);
  const [roleToAssignUser, setRoleToAssignUser] = useState<Role | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [roleSearchTerm, setRoleSearchTerm] = useState<string>('');
  const [viewUsersRole, setViewUsersRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(null);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRolePermissions, setEditingRolePermissions] = useState<UserPermissions | null>(null);
  const [editingRoleName, setEditingRoleName] = useState<string>('');
  const [editingRoleDescription, setEditingRoleDescription] = useState<string>('');
  // 🔥 NEW: State for permissions API data
  const [allPermissions, setAllPermissions] = useState<GroupedPermissionsResponse | null>(null);
  const [rolePermissionsCache, setRolePermissionsCache] = useState<{[roleId: string]: UserPermissions}>({});
  const [isLoadingPermissions, setIsLoadingPermissions] = useState<boolean>(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  
  // 🔥 NEW: State for tracking changes before saving to backend

  // 🔥 NEW: Fetch all permissions from API
  const fetchAllPermissions = useCallback(async () => {
    try {
      setIsLoadingPermissions(true);
      setPermissionsError(null);
      
      const permissions = await permissionService.getAllPermissions();
      setAllPermissions(permissions);
      
      return permissions;
    } catch (error: any) {
      console.error('Error fetching all permissions:', error);
      setPermissionsError(error.message || 'Failed to fetch permissions');
      throw error;
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  // 🔥 NEW: Fetch permissions for a specific role
  const fetchRolePermissions = useCallback(async (roleId: string) => {
    try {
      setIsLoadingPermissions(true);
      setPermissionsError(null);
      
      const permissions = await permissionService.getRolePermissions(roleId);
      
      // Cache the permissions
      setRolePermissionsCache(prev => ({
        ...prev,
        [roleId]: permissions
      }));
      
      return permissions;
    } catch (error: any) {
      console.error('❌ Error in fetchRolePermissions:', error);
      
      setPermissionsError(error.message || 'Failed to fetch role permissions');
      throw error;
    } finally {
      setIsLoadingPermissions(false);
    }
  }, []);

  // 🔥 NEW: Create role with permissions and sync to backend
  const createRoleWithPermissions = useCallback(async (roleName: string, permissions: UserPermissions, description?: string) => {
    try {
      setIsLoading(true);
      
      // Create role data
      const roleData: Partial<Role> = {
        name: roleName,
        description: description || '',
        permissions: permissions
      };
      
      // Use AuthContext createRole which handles backend API call and transformation
      await createRole(roleData);
      
      return roleData;
    } catch (error: any) {
      console.error('Error creating role:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [createRole]);

  // 🔥 NEW: Transform permissions from object to array format for backend
  const transformPermissionsToArray = useCallback((permissions: UserPermissions): string[] => {
    const permissionsArray: string[] = [];
    
    // 🔥 DEBUG: Check if permissions object is valid
    if (!permissions || typeof permissions !== 'object') {
      console.error('❌ Invalid permissions object passed to transformPermissionsToArray:', permissions);
      return permissionsArray;
    }
    
    // 🔥 FIX: Transform each module and include ALL permissions (true ones only for backend)
    // But we need to ensure we're sending the complete state, not just true permissions
    Object.entries(permissions).forEach(([module, modulePerms]) => {
      if (modulePerms && typeof modulePerms === 'object') {
        Object.entries(modulePerms).forEach(([submodule, submodulePerms]) => {
          if (submodulePerms && typeof submodulePerms === 'object') {
            Object.entries(submodulePerms).forEach(([action, hasPermission]) => {
              // 🔥 CRITICAL FIX: Only add permissions that are explicitly true
              // Backend expects only enabled permissions in the array
              if (hasPermission === true) {
                const permissionString = `${module}.${submodule}.${action}`;
                permissionsArray.push(permissionString);
              }
              // Note: False permissions are handled by their absence from the array
              // Backend will understand that missing permissions = disabled
            });
          }
        });
      }
    });
    
    // 🔥 IMPORTANT: Empty array is valid - it means no permissions are enabled
    // Don't warn about empty array as it's a valid state when all permissions are disabled
    
    return permissionsArray;
  }, []);

  // 🔥 NEW: Update role permissions and sync to backend
  const updateRolePermissions = useCallback(async (roleId: string, permissions: UserPermissions) => {
    try {
      setIsLoading(true);
      
      // 🔥 FIX: Transform permissions to array format for backend
      const permissionsArray = transformPermissionsToArray(permissions);
      
      // 🔥 IMPORTANT: Empty array is valid - means all permissions are disabled
      // This is actually the fix for the uncheck/disable issue!
      
      // 🔥 FIX: Get the role details to send complete data
      const rolesArray = Array.isArray(roles) ? roles : [];
      const currentRole = rolesArray.find(r => r.id === roleId || r._id === roleId);
      
      // 🔥 FIX: Send complete role data in backend expected format
      const roleUpdateData = {
        name: currentRole?.name || 'Unknown Role',
        description: currentRole?.description || '',
        permissions: permissionsArray, // This can be empty array for all disabled permissions
        isActive: true
      };
      
      // 🔥 DEBUG: Log what we're sending for unchecked permissions
      if (permissionsArray.length === 0) {
        console.log('📤 Sending empty permissions array (all permissions disabled) for role:', currentRole?.name);
      }
      
      // Update permissions via backend API with proper format
      const updatedRole = await roleService.updateRole(roleId, roleUpdateData);
      
      // 🔥 NEW: Check if backend returned empty permissions
      if (!updatedRole.permissions || updatedRole.permissions.length === 0) {
        // This is actually EXPECTED when all permissions are disabled!
        // Only log error if we sent permissions but got none back
        if (permissionsArray.length > 0) {
          console.error('❌ CRITICAL: Backend returned empty permissions array despite sending permissions!');
          
          return {
            ...updatedRole,
            _hasEmptyPermissionsError: true
          };
        } else {
          // This is normal - we disabled all permissions
          console.log('✅ All permissions successfully disabled for role:', currentRole?.name);
        }
      }
      
      // Update cache
      setRolePermissionsCache(prev => ({
        ...prev,
        [roleId]: permissions
      }));
      
      return updatedRole;
    } catch (error: any) {
      console.error('Error updating role permissions:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [transformPermissionsToArray, roles]);

  const userCountsByRole = useMemo(() => {
    const counts: { [roleName: string]: number } = {};
    
    // Defensive: Ensure roles is an array
    const rolesArray = Array.isArray(roles) ? roles : [];
    rolesArray.forEach(role => {
      counts[role.name] = 0;
    });
    
    // Defensive: Ensure users is an array
    const usersArray = Array.isArray(users) ? users : [];
    
    // Debug logging to see the actual data structure
    console.log('🔍 userCountsByRole calculation:', {
      rolesArray: rolesArray.map(r => ({ name: r.name, id: r.id, _id: r._id })),
      usersArray: usersArray.map(u => ({ 
        id: u.id, 
        name: u.name, 
        email: u.email, 
        role: u.role,
        roles: u.roles
      })),
      initialCounts: counts
    });
    
    usersArray.forEach(user => {
      if (user) {
        let userAssignedToRole = false;
        
        // 🔥 IMPROVED: Check roles array first (most reliable)
        if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
          user.roles.forEach(userRole => {
            // Handle both string and object role formats
            let roleName = '';
            if (typeof userRole === 'string') {
              roleName = userRole;
            } else if (typeof userRole === 'object' && userRole) {
              roleName = userRole.name || userRole._id || userRole.id || '';
            }
            
            // Check if this role name exists in our counts
            if (roleName && counts[roleName] !== undefined) {
              counts[roleName]++;
              userAssignedToRole = true;
              console.log(`✅ User ${user.name || user.email} assigned to role ${roleName} (from roles array)`);
            } else if (roleName) {
              // Try to find role by ID matching
              const matchingRole = rolesArray.find(r => 
                r.id === roleName || r._id === roleName || r.name === roleName
              );
              if (matchingRole && counts[matchingRole.name] !== undefined) {
                counts[matchingRole.name]++;
                userAssignedToRole = true;
                console.log(`✅ User ${user.name || user.email} assigned to role ${matchingRole.name} (matched by ID: ${roleName})`);
              }
            }
          });
        }
        
        // 🔥 FALLBACK: Check traditional role field if not assigned via roles array
        if (!userAssignedToRole && user.role) {
          let roleName = '';
          if (typeof user.role === 'string') {
            roleName = user.role;
          } else if (typeof user.role === 'object' && user.role) {
            roleName = user.role.name || user.role._id || user.role.id || '';
          }
          
          if (roleName && counts[roleName] !== undefined) {
            counts[roleName]++;
            userAssignedToRole = true;
            console.log(`✅ User ${user.name || user.email} assigned to role ${roleName} (from role field)`);
          } else if (roleName) {
            // Try to find role by ID matching
            const matchingRole = rolesArray.find(r => 
              r.id === roleName || r._id === roleName || r.name === roleName
            );
            if (matchingRole && counts[matchingRole.name] !== undefined) {
              counts[matchingRole.name]++;
              userAssignedToRole = true;
              console.log(`✅ User ${user.name || user.email} assigned to role ${matchingRole.name} (matched by ID from role field: ${roleName})`);
            }
          }
        }
        
        // Log users without valid role assignments
        if (!userAssignedToRole) {
          console.log(`⚠️ User ${user?.name || user?.email || 'unknown'} has no valid role assignment:`, {
            role: user?.role,
            roles: user?.roles,
            availableRoles: Object.keys(counts)
          });
        }
      }
    });
    
    console.log('📊 Final role counts:', counts);
    return counts;
  }, [users, roles]);

  return {
    roles,
    userRoles,
    updateRole,
    createRole,
    deleteRole,
    assignRoleToUser,
    unassignRoleFromUser,
    hasPermission,
    users,
    user,
    refreshRoles,
    refreshUsers,
    newRoleName,
    setNewRoleName,
    newRolePermissions,
    setNewRolePermissions,
    newRoleDescription,
    setNewRoleDescription,
    selectedRole,
    setSelectedRole,
    isAssignUserDialogOpen,
    setIsAssignUserDialogOpen,
    roleToAssignUser,
    setRoleToAssignUser,
    userSearchTerm,
    setUserSearchTerm,
    roleSearchTerm,
    setRoleSearchTerm,
    viewUsersRole,
    setViewUsersRole,
    isLoading,
    setIsLoading,
    selectedTemplate,
    setSelectedTemplate,
    selectedRoles,
    setSelectedRoles,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    roleToDelete,
    setRoleToDelete,
    editingRole,
    setEditingRole,
    isEditModalOpen,
    setIsEditModalOpen,
    editingRolePermissions,
    setEditingRolePermissions,
    editingRoleName,
    setEditingRoleName,
    editingRoleDescription,
    setEditingRoleDescription,
    userCountsByRole,
    // 🔥 NEW: Permissions API state and functions
    allPermissions,
    rolePermissionsCache,
    isLoadingPermissions,
    permissionsError,
    fetchAllPermissions,
    fetchRolePermissions,
    createRoleWithPermissions,
    updateRolePermissions,
    transformPermissionsToArray
  };
};

// Simple debounce utility function with optimized timing
const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// 🚀 PERFORMANCE: Environment-based logging utility
const isDevelopment = process.env.NODE_ENV === 'development';
const optimizedLog = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) console.log(`ℹ️ ${message}`, ...args);
  },
  success: (message: string, ...args: any[]) => {
    if (isDevelopment) console.log(`✅ ${message}`, ...args);
  },
  warning: (message: string, ...args: any[]) => {
    if (isDevelopment) console.warn(`⚠️ ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`❌ ${message}`, ...args); // Always log errors
  },
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment && window.location.search.includes('debug=true')) {
      console.log(`🔧 ${message}`, ...args);
    }
  }
};

// 🚀 PERFORMANCE: Optimized permission change handler with faster debounce
const FAST_DEBOUNCE_DELAY = 500; // Reduced from 1000ms to 500ms for faster response

export default function RolesPermissions() {
  // 🚀 PERFORMANCE: Track component performance
  const { trackApiCall, logReport } = usePerformanceTracking('RolesPermissions');
  
  const { toast } = useToast();
  const {
    roles,
    updateRole,
    createRole,
    deleteRole,
    hasPermission,
    users,
    refreshRoles,
    refreshUsers,
    newRoleName,
    setNewRoleName,
    newRolePermissions,
    setNewRolePermissions,
    newRoleDescription,
    setNewRoleDescription,
    roleSearchTerm,
    setRoleSearchTerm,
    selectedTemplate,
    setSelectedTemplate,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    roleToDelete,
    setRoleToDelete,
    editingRole,
    setEditingRole,
    isEditModalOpen,
    setIsEditModalOpen,
    editingRolePermissions,
    setEditingRolePermissions,
    editingRoleName,
    setEditingRoleName,
    editingRoleDescription,
    setEditingRoleDescription,
    userCountsByRole,
    isAssignUserDialogOpen,
    setIsAssignUserDialogOpen,
    roleToAssignUser,
    setRoleToAssignUser,
    assignRoleToUser,
    userSearchTerm,
    setUserSearchTerm,
    viewUsersRole,
    setViewUsersRole,
    unassignRoleFromUser,
    allPermissions,
    rolePermissionsCache,
    isLoadingPermissions,
    permissionsError,
    fetchAllPermissions,
    fetchRolePermissions,
    createRoleWithPermissions,
    updateRolePermissions,
    transformPermissionsToArray
  } = useRoleManagement();
  const { user } = useAuth();

  // 🚀 PERFORMANCE: Log performance report on component unmount
  useEffect(() => {
    return () => {
      logReport();
    };
  }, [logReport]);

  // 🔥 NEW: Initialize permissions on component mount
  useEffect(() => {
    const initializePermissions = async () => {
      try {
        // Fetch all available permissions
        await fetchAllPermissions();
        
        toast({
          title: "✅ Permissions Loaded",
          description: "All available permissions have been loaded from the server.",
          duration: 2000,
        });
      } catch (error: any) {
        console.error('❌ Failed to initialize permissions:', error);
        
        // Don't show error toast for permissions initialization failure
        // as it's not critical for basic functionality
        console.warn('⚠️ Permissions initialization failed, continuing with default permissions');
      }
    };

    // Only initialize if we haven't loaded permissions yet
    if (!allPermissions && !isLoadingPermissions) {
      initializePermissions();
    }
  }, [allPermissions, isLoadingPermissions, fetchAllPermissions, toast]);

  // 🔥 IMPROVED: Enhanced debounced save function for permissions with faster response
  const debouncedSavePermissions = useCallback(
    debounce(async (roleId: string, permissions: UserPermissions) => {
      try {
        // Additional validation
        if (!roleId || roleId.trim() === '') {
          optimizedLog.error('Invalid roleId in debouncedSavePermissions:', roleId);
          toast({
            title: "❌ Save Failed",
            description: "Invalid role ID. Please refresh the page and try again.",
            variant: "destructive",
          });
          return;
        }
        
        // Check if permissions object is valid
        if (!permissions || typeof permissions !== 'object') {
          optimizedLog.error('Invalid permissions object:', permissions);
          toast({
            title: "❌ Save Failed",
            description: "Invalid permissions data. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        // 🔥 FIX: Use updateRolePermissions instead of updateRole to avoid conflicts
        const result = await updateRolePermissions(roleId, permissions);
        
        // 🔥 NEW: Refresh roles in frontend to show updated permissions immediately
        await refreshRoles();
        
        // 🔥 NEW: Check if backend returned empty permissions error
        if (result && (result as any)._hasEmptyPermissionsError) {
          console.error('❌ Backend returned empty permissions array!');
          toast({
            title: "⚠️ Backend Issue Detected",
            description: "Permissions were sent but backend returned empty array. Check server logs.",
            variant: "destructive",
            duration: 5000,
          });
          return;
        }
        
        toast({
          title: "✅ Permissions Saved",
          description: "Role permissions have been updated successfully.",
          duration: 1000, // 🚀 PERFORMANCE: Even faster toast duration
        });
        
      } catch (error: any) {
        console.error('❌ Failed to save permissions:', error);
        
        let errorMessage = "Failed to save permissions. Please try again.";
        if (error.response?.status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (error.response?.status === 403) {
          errorMessage = "You don't have permission to update roles.";
        } else if (error.response?.status === 404) {
          errorMessage = "Role not found. Please refresh the page.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "❌ Save Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }, FAST_DEBOUNCE_DELAY), // 🚀 PERFORMANCE: Use faster debounce delay
    [updateRolePermissions, toast, refreshRoles]
  );

  // 🔥 ENHANCED: Improved handleEditClick with better error handling and fallbacks
  const handleEditClick = async (role: Role) => {
    if (!hasPermission('settings.role.edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit roles.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get role ID with multiple fallbacks
      const roleId = role.id || role._id || role.name || '';
      
      if (!roleId) {
        console.error('❌ No role identifier found for role:', role);
        toast({
          title: "❌ Error",
          description: "Role identifier not found. Cannot edit permissions.",
          variant: "destructive",
        });
        return;
      }
      
      // 🔥 PERFORMANCE: Show modal immediately with cached data, then update
      setIsEditModalOpen(true);
      setEditingRole(role);
      setEditingRoleName(role.name || '');
      setEditingRoleDescription(role.description || '');
        
      // Start with role.permissions if available, otherwise use default structure
      let initialPermissions = role.permissions as UserPermissions || JSON.parse(JSON.stringify(ALL_POSSIBLE_PERMISSIONS));
      
      // 🔥 BOOLEAN VALIDATION: Validate and clean permissions structure
      if (!validatePermissionStructure(initialPermissions)) {
        console.warn('⚠️ Invalid permission structure detected, using default permissions');
        initialPermissions = JSON.parse(JSON.stringify(ALL_POSSIBLE_PERMISSIONS));
      }
      
      const transformedPermissions = transformBackendPermissions(initialPermissions);
      setEditingRolePermissions(transformedPermissions);
      
      // 🔥 BACKGROUND: Try to fetch fresh permissions from API (non-blocking)
      try {
        const freshPermissions = await fetchRolePermissions(roleId);
        
        const transformedFreshPermissions = transformBackendPermissions(freshPermissions);
        setEditingRolePermissions(transformedFreshPermissions);
          
          toast({
          title: "🔄 Permissions Refreshed",
          description: `Latest permissions loaded for role: ${role.name}`,
            duration: 2000,
          });
      } catch (apiError: any) {
        // Don't show error toast since we already have cached data
      }
      
    } catch (error: any) {
      console.error('❌ Error in handleEditClick:', error);
      setIsEditModalOpen(false);
      setEditingRole(null);
      setEditingRolePermissions(null);
      
      toast({
        title: "❌ Error",
        description: "Failed to open role editor. Please try again.",
        variant: "destructive",
      });
    }
  };

  // 🔥 NEW: Enhanced permission transformation function with strict boolean conversion
  const transformBackendPermissions = useCallback((backendPerms: any): UserPermissions => {
    // Start with the default structure - all permissions set to false (boolean)
    const transformed: UserPermissions = {
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
        role: { view: false, create: false, edit: false, delete: false }
      },
      system: {
        system: { admin: false }
      }
    };

    // 🔥 BOOLEAN CONVERSION: Helper function to ensure strict boolean values
    const toBooleanStrict = (value: any): boolean => {
      if (value === true || value === 'true' || value === 1 || value === '1') {
        return true;
      }
      if (value === false || value === 'false' || value === 0 || value === '0' || value === null || value === undefined) {
        return false;
      }
      // For any other value, convert to boolean
      return Boolean(value);
    };

    // Handle empty or null permissions
    if (!backendPerms) {
      return transformed;
    }

    // Handle array format from backend (e.g., ["employee_management.employees.view"])
    if (Array.isArray(backendPerms)) {
      if (backendPerms.length === 0) {
        return transformed;
      }
      
      try {
        backendPerms.forEach((permission: any, index: number) => {
          let permissionString: string;
          
          // Handle different permission formats
          if (typeof permission === 'string') {
            permissionString = permission;
          } else if (typeof permission === 'object' && permission !== null) {
            // Handle permission objects with 'name' field
            if (permission.name && typeof permission.name === 'string') {
              permissionString = permission.name;
            } else {
              if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ Permission object missing name field at index', index, ':', permission);
              }
              return;
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Skipping non-string/non-object permission at index', index, ':', permission, 'Type:', typeof permission);
            }
            return;
          }
          
          // Ensure permission string is not empty
          if (!permissionString.trim()) {
            return;
          }
          
          // Parse permission strings like "employee_management.employees.view" or "employees.create"
          const parts = permissionString.split('.');
          
          if (parts.length === 2) {
            // Handle format like "employees.create" - need to map to our structure
            const [moduleOrSubmodule, action] = parts;
            
            // Map common modules to our structure
            let module: string;
            let submodule: string;
            
            if (moduleOrSubmodule === 'employees') {
              module = 'employee_management';
              submodule = 'employees';
            } else if (moduleOrSubmodule === 'department') {
              module = 'employee_management';
              submodule = 'department';
            } else if (moduleOrSubmodule === 'candidate') {
              module = 'hiring';
              submodule = 'candidate';
            } else if (moduleOrSubmodule === 'job') {
              module = 'hiring';
              submodule = 'job';
            } else if (moduleOrSubmodule === 'user') {
              module = 'settings';
              submodule = 'user';
            } else if (moduleOrSubmodule === 'role') {
              module = 'settings';
              submodule = 'role';
            } else if (moduleOrSubmodule === 'system') {
              module = 'system';
              submodule = 'system';
            } else {
              return;
            }
            
            if (transformed[module as keyof UserPermissions]) {
              const modulePerms = transformed[module as keyof UserPermissions] as any;
              if (modulePerms[submodule]) {
                if (modulePerms[submodule][action] !== undefined) {
                  // 🔥 BOOLEAN CONVERSION: Always set to true (boolean) for enabled permissions
                  modulePerms[submodule][action] = true;
                }
              }
            }
          } else if (parts.length === 3) {
            // Handle format like "employee_management.employees.view"
            const [module, submodule, action] = parts;
            
            if (transformed[module as keyof UserPermissions]) {
              const modulePerms = transformed[module as keyof UserPermissions] as any;
              if (modulePerms[submodule]) {
                if (modulePerms[submodule][action] !== undefined) {
                  // 🔥 BOOLEAN CONVERSION: Always set to true (boolean) for enabled permissions
                  modulePerms[submodule][action] = true;
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('❌ Error processing permissions array:', error);
        return transformed; // Return default structure on error
      }
      
      return transformed;
    }

    // Handle object format from backend
    if (backendPerms && typeof backendPerms === 'object') {
      // Check if the backend permissions have the expected structure
      const hasExpectedStructure = backendPerms.employee_management || 
                                 backendPerms.hiring || 
                                 backendPerms.settings || 
                                 backendPerms.system;
      
      if (hasExpectedStructure) {
        // Merge backend permissions with our default structure
        Object.keys(backendPerms).forEach(moduleKey => {
          if (transformed[moduleKey as keyof UserPermissions] && backendPerms[moduleKey]) {
            const modulePerms = backendPerms[moduleKey];
            
            // Process each submodule
            Object.keys(modulePerms).forEach(submoduleKey => {
              if ((transformed[moduleKey as keyof UserPermissions] as any)[submoduleKey] && modulePerms[submoduleKey]) {
                const submodulePerms = modulePerms[submoduleKey];
                
                // Process each action
                Object.keys(submodulePerms).forEach(actionKey => {
                  if ((transformed[moduleKey as keyof UserPermissions] as any)[submoduleKey][actionKey] !== undefined) {
                    const value = submodulePerms[actionKey];
                    // 🔥 BOOLEAN CONVERSION: Convert any value to strict boolean
                    (transformed[moduleKey as keyof UserPermissions] as any)[submoduleKey][actionKey] = toBooleanStrict(value);
                  }
                });
              }
            });
          }
        });
      }
    }
    
    return transformed;
  }, []);

  // 🔥 NEW: Function to handle permission changes with local state first
  const handlePermissionChange = useCallback((roleId: string, module: string, submodule: string, action: string, checked: boolean) => {
    // 🔥 BOOLEAN VALIDATION: Ensure checked is strictly boolean
    const isCheckedBoolean = checked === true;
    
    // Validate roleId
    if (!roleId || roleId.trim() === '') {
      console.error('❌ Invalid roleId provided to handlePermissionChange:', roleId);
      toast({
        title: "❌ Permission Update Failed",
        description: "Role ID is missing. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }
    
    // 🔥 PERFORMANCE: Show immediate feedback with boolean status
    toast({
      title: isCheckedBoolean ? "✅ Permission Enabled" : "❌ Permission Disabled",
      description: `${module}.${submodule}.${action} ${isCheckedBoolean ? 'enabled' : 'disabled'}. Saving...`,
      duration: 1500,
    });
    
    // Update local state immediately for responsive UI
    const updatePermissions = (prevPermissions: UserPermissions | null): UserPermissions => {
      if (!prevPermissions) {
        prevPermissions = JSON.parse(JSON.stringify(ALL_POSSIBLE_PERMISSIONS));
      }
      
      const newPermissions = JSON.parse(JSON.stringify(prevPermissions));
      
      // Ensure the module exists
      if (!newPermissions[module as keyof UserPermissions]) {
        (newPermissions as any)[module] = {};
      }
      
      // Ensure the submodule exists
      if (!(newPermissions[module as keyof UserPermissions] as any)[submodule]) {
        (newPermissions[module as keyof UserPermissions] as any)[submodule] = {};
      }
      
      // 🔥 BOOLEAN CONVERSION: Set the permission - ensure it's strictly boolean
      (newPermissions[module as keyof UserPermissions] as any)[submodule][action] = isCheckedBoolean;
      
      return newPermissions;
    };
    
    // Update editing role permissions if this is for the currently editing role
    if (editingRole && (editingRole.id === roleId || editingRole._id === roleId)) {
      setEditingRolePermissions(prev => updatePermissions(prev));
    }
    
    // Debounced save to backend
    const currentPermissions = editingRolePermissions || rolePermissionsCache[roleId] || ALL_POSSIBLE_PERMISSIONS;
    const permissionsToSave = updatePermissions(currentPermissions);
    debouncedSavePermissions(roleId, permissionsToSave);
  }, [editingRole, editingRolePermissions, rolePermissionsCache, debouncedSavePermissions, setEditingRolePermissions, toast]);

  // Handle role update
  const handleUpdateRole = useCallback(async () => {
    if (!editingRole || !editingRolePermissions) {
      console.error('Cannot update role: missing editingRole or editingRolePermissions');
      return;
    }

    try {
      // 🔥 NEW: Save name and description changes if they were modified
      if (editingRoleName !== editingRole.name || editingRoleDescription !== editingRole.description) {
        const roleId = editingRole.id || editingRole._id || '';
        
        const roleUpdateData = {
          name: editingRoleName.trim(),
          description: editingRoleDescription.trim(),
          permissions: transformPermissionsToArray(editingRolePermissions),
          isActive: true
        };
        
        await roleService.updateRole(roleId, roleUpdateData);
        
        // 🔥 NEW: Refresh roles in frontend to show updated data immediately
        await refreshRoles();
        
        toast({
          title: "✅ Role Updated",
          description: `Role "${editingRoleName}" has been updated successfully.`,
          duration: 2000,
        });
      }
      


      setIsEditModalOpen(false);
      setEditingRole(null);
      setEditingRolePermissions(null);
      setEditingRoleName('');
      setEditingRoleDescription('');
      
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast({
        title: "❌ Update Failed",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    }
  }, [editingRole, editingRolePermissions, editingRoleName, editingRoleDescription, transformPermissionsToArray, user, toast, refreshRoles]);

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    // Defensive: Ensure roles is an array
    const rolesArray = Array.isArray(roles) ? roles : [];
    return rolesArray.filter((role: Role) =>
      role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(roleSearchTerm.toLowerCase()))
    );
  }, [roles, roleSearchTerm]);

  // Handle permission change for new role
  const handleNewRolePermissionChange = useCallback((module: string, submodule: string, action: string, checked: boolean) => {
    if (!hasPermission('settings.role.create')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create new roles.",
        variant: "destructive",
      });
      return;
    }

    // 🔥 BOOLEAN VALIDATION: Ensure checked is strictly boolean
    const isCheckedBoolean = checked === true;

    setNewRolePermissions(prev => {
      const newPermissions = { ...prev };
      if (!newPermissions[module as keyof UserPermissions]) {
        // @ts-ignore
        newPermissions[module as keyof UserPermissions] = {};
      }
       // @ts-ignore
      if (!newPermissions[module as keyof UserPermissions][submodule]) {
         // @ts-ignore
        newPermissions[module as keyof UserPermissions][submodule] = {};
      }
       // @ts-ignore - 🔥 BOOLEAN CONVERSION: Set strictly boolean value
      newPermissions[module as keyof UserPermissions][submodule][action] = isCheckedBoolean;
      return newPermissions;
    });
  }, [hasPermission, toast, setNewRolePermissions]);

  const handleSelectAllModulePermissions = useCallback((module: string, shouldSelect: boolean) => {
    // 🔥 BOOLEAN VALIDATION: Ensure shouldSelect is strictly boolean
    const shouldSelectBoolean = shouldSelect === true;
    
    // 🔥 PERFORMANCE: Show immediate feedback
    toast({
      title: shouldSelectBoolean ? "✅ Selecting All Permissions" : "❌ Unselecting All Permissions",
      description: `${shouldSelectBoolean ? 'Enabling' : 'Disabling'} all permissions in ${module} module...`,
      duration: 1500,
    });
    
    setNewRolePermissions(prev => {
      const newPermissions = { ...prev };
      const modulePermissions = (newPermissions as any)[module];
      if (modulePermissions) {
        Object.keys(modulePermissions).forEach(submodule => {
          Object.keys(modulePermissions[submodule]).forEach(action => {
            // 🔥 BOOLEAN CONVERSION: Set strictly boolean value
            modulePermissions[submodule][action] = shouldSelectBoolean;
          });
        });
      }
      return newPermissions;
    });
  }, [setNewRolePermissions, toast]);

  const areAllModulePermissionsSelected = (moduleKey: string): boolean => {
    const modulePermissions = (newRolePermissions as any)[moduleKey];
    if (!modulePermissions) return false;

    const submodules = Object.values(modulePermissions) as { [action: string]: boolean }[];
    if (submodules.length === 0) return true; // No permissions to select, so it's "all selected"

    return submodules.every(submodule => 
      Object.values(submodule).every(permission => permission === true)
    );
  };

  const countTotalPermissionsInGroup = (modulePermissions: any): number => {
    if (!modulePermissions) return 0;
    return Object.values(modulePermissions).reduce((count: number, submodule: any) => {
        return count + Object.keys(submodule).length;
    }, 0);
  };

  const countAssignedPermissions = (modulePermissions: any): number => {
    if (!modulePermissions) return 0;
    const count = Object.values(modulePermissions).reduce((count: number, submodule: any) => {
        const trueCount = Object.values(submodule).filter(value => {
          return value === true;
        }).length;
        return count + trueCount;
    }, 0);
    return count;
  };

  // Handle template selection
  const handleTemplateSelect = useCallback((template: RoleTemplate) => {
    setSelectedTemplate(template);
    setNewRolePermissions(template.permissions);
    setNewRoleName(template.name);
    setNewRoleDescription(template.description);
      toast({
      title: "Template Applied!",
      description: `The "${template.name}" template is ready to be customized.`,
      });
  }, [setNewRoleName, setNewRolePermissions, setSelectedTemplate, setNewRoleDescription, toast]);

  // Handle role creation
  const handleCreateRole = useCallback(async () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!newRoleDescription.trim()) {
      toast({
        title: "Error",
        description: "Role description is required.",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one permission is selected with proper typing
    const hasAnyPermission = Object.values(newRolePermissions).some((module: any) => 
      Object.values(module).some((submodule: any) => 
        Object.values(submodule).some((permission: any) => permission === true)
      )
    );

    if (!hasAnyPermission) {
      toast({
        title: "No Permissions Selected",
        description: "Please select at least one permission for the role.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use the new createRoleWithPermissions function that syncs with backend
      await createRoleWithPermissions(
        newRoleName, 
        newRolePermissions, 
        newRoleDescription
      );

      // 🔥 NEW: Refresh roles in frontend to show newly created role immediately
      await refreshRoles();



      // Reset form
      setNewRoleName('');
      setNewRolePermissions(JSON.parse(JSON.stringify(ALL_POSSIBLE_PERMISSIONS)));
      setNewRoleDescription('');
      setSelectedTemplate(null);

      // Show success message
      toast({
        title: "Success",
        description: `Role "${newRoleName}" created successfully and saved to database.`,
      });
    } catch (error: any) {
      let errorMessage = "Failed to create role. Please try again.";
      
      // Handle specific error cases
      if (error?.response?.status === 400) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = "Invalid role data. Please check the role name and permissions.";
        }
      } else if (error?.response?.status === 409) {
        errorMessage = "A role with this name already exists. Please choose a different name.";
      } else if (error?.response?.status === 403) {
        errorMessage = "You don't have permission to create roles.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [newRoleName, newRolePermissions, newRoleDescription, createRoleWithPermissions, toast, setSelectedTemplate, setNewRoleName, setNewRolePermissions, setNewRoleDescription, user, refreshRoles]);

  // Handle role deletion
  const handleDeleteRole = useCallback(async (role: Role) => {
    if (!hasPermission('settings.role.delete')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete roles.",
        variant: "destructive",
      });
      return;
    }
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  }, [hasPermission, toast, setIsDeleteDialogOpen, setRoleToDelete]);

  const confirmDeleteRole = useCallback(async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete.name);
      
      // 🔥 NEW: Refresh roles in frontend to remove deleted role immediately
      await refreshRoles();
      


      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  }, [roleToDelete, deleteRole, setIsDeleteDialogOpen, setRoleToDelete, user, refreshRoles]);

  const handleEditRolePermissionChange = useCallback((module: string, submodule: string, action: string, checked: boolean) => {
    if (!editingRole) return;
    
    // Use the API-integrated permission change handler
    const roleId = editingRole.id || editingRole._id || '';
    handlePermissionChange(roleId, module, submodule, action, checked);
  }, [editingRole, handlePermissionChange]);

  const handleSelectAllEditingModulePermissions = useCallback((module: string, shouldSelect: boolean) => {
    if (!editingRole || !editingRolePermissions) return;
    
    const roleId = editingRole.id || editingRole._id || '';
    
    // 🔥 BOOLEAN VALIDATION: Ensure shouldSelect is strictly boolean
    const shouldSelectBoolean = shouldSelect === true;
    
    // 🔥 PERFORMANCE: Show immediate feedback
    toast({
      title: shouldSelectBoolean ? "✅ Selecting All Permissions" : "❌ Unselecting All Permissions",
      description: `${shouldSelectBoolean ? 'Enabling' : 'Disabling'} all permissions in ${module} module...`,
      duration: 1500,
    });
    
    // Update local state immediately for responsive UI
    setEditingRolePermissions(prev => {
      if (!prev) return null;
      const newPermissions = JSON.parse(JSON.stringify(prev)); // Deep copy
      const modulePermissions = (newPermissions as any)[module];
      
      if (modulePermissions) {
        Object.keys(modulePermissions).forEach(submodule => {
          Object.keys(modulePermissions[submodule]).forEach(action => {
            // 🔥 BOOLEAN CONVERSION: Set strictly boolean value
            modulePermissions[submodule][action] = shouldSelectBoolean;
          });
        });
      }
      
      return newPermissions;
    });
    
    // 🔥 FIX: Save all permissions at once instead of individual API calls
    // This is much more efficient and prevents API flooding
    const updatedPermissions = { ...editingRolePermissions };
    const modulePermissions = (updatedPermissions as any)[module];
    
    if (modulePermissions) {
      Object.keys(modulePermissions).forEach(submodule => {
        Object.keys(modulePermissions[submodule]).forEach(action => {
          // 🔥 BOOLEAN CONVERSION: Set strictly boolean value
          modulePermissions[submodule][action] = shouldSelectBoolean;
        });
      });
      
      // Save the entire updated permissions object
      debouncedSavePermissions(roleId, updatedPermissions);
    }
  }, [editingRole, editingRolePermissions, setEditingRolePermissions, debouncedSavePermissions, toast]);

  const areAllEditingModulePermissionsSelected = (moduleKey: string): boolean => {
    if (!editingRolePermissions) return false;
    const modulePermissions = (editingRolePermissions as any)[moduleKey];
    if (!modulePermissions) return false;

    const submodules = Object.values(modulePermissions) as { [action: string]: boolean }[];
    if (submodules.length === 0) return true;

    return submodules.every(submodule => 
      Object.values(submodule).every(permission => permission === true)
    );
  };

  const handleAssignUserClick = (role: Role) => {
    if (!hasPermission('settings.user.edit')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to assign users to roles.",
        variant: "destructive",
      });
      return;
    }
    setRoleToAssignUser(role);
    setIsAssignUserDialogOpen(true);
    setUserSearchTerm('');
  };

  const handleAssignRoleToUser = async (userId: string) => {
    if (roleToAssignUser) {
      try {
        setApiUsersLoading(true);
        
        // Use the role ID or _id for assignment
        const roleIdToAssign = roleToAssignUser.id || roleToAssignUser._id || roleToAssignUser.name;
        await apiAssignRoleToUser(userId, roleIdToAssign);
        
        toast({
          title: "✅ User Assigned",
          description: `User has been successfully assigned the "${roleToAssignUser.name}" role.`,
          duration: 3000,
        });
        
        // Refresh all user data sources to update counts
        await Promise.all([
          fetchApiUsers(), // Refresh employee list for assign dialog
          refreshRoles(), // Refresh roles to update counts
          refreshUsers() // 🔥 FIX: Also refresh users in AuthContext for count calculation
        ]);
        
        console.log('✅ All user lists refreshed after role assignment');
      } catch (error) {
        console.error('❌ Failed to assign role:', error);
        toast({
          title: "❌ Assignment Failed",
          description: "Failed to assign role to user. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setApiUsersLoading(false);
      }
    }
  };

  const handleViewUsersClick = (role: Role) => {
    if (!hasPermission('settings.user.view')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view users.",
        variant: "destructive",
      });
      return;
    }
    setViewUsersRole(role);
  };

  const handleUnassignUser = async (userId: string) => {
    try {
      setApiUsersLoading(true);
      
      await apiUnassignRoleFromUser(userId);
      
      toast({
        title: "✅ User Unassigned",
        description: "User has been successfully unassigned from the role.",
        duration: 3000,
      });
      
      // Refresh all user data sources to update counts
      await Promise.all([
        fetchApiUsers(), // Refresh employee list for assign dialog
        refreshRoles(), // Refresh roles to update counts
        refreshUsers() // 🔥 FIX: Also refresh users in AuthContext for count calculation
      ]);
      
      console.log('✅ All user lists refreshed after role unassignment');
    } catch (error) {
      console.error('❌ Failed to unassign role:', error);
      toast({
        title: "❌ Unassignment Failed",
        description: "Failed to unassign role from user. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setApiUsersLoading(false);
    }
  };

  const handleUnassignAllUsers = () => {
    if (viewUsersRole) {
      // Defensive: Ensure users is an array
      const usersArray = Array.isArray(users) ? users : [];
      usersArray.forEach(u => {
        if (u && u.role === viewUsersRole.name) {
          unassignRoleFromUser(u.id);
        }
      });
      toast({
        title: "All Users Unassigned",
        description: `All users have been unassigned from the "${viewUsersRole.name}" role.`,
      });
      setViewUsersRole(null);
    }
  };

  // State for API-fetched employees for Assign User dialog
  const [apiUsers, setApiUsers] = useState<Employee[]>([]);
  const [apiUsersLoading, setApiUsersLoading] = useState(false);
  const [apiUsersError, setApiUsersError] = useState<string | null>(null);

  // Fetch users from API when Assign User dialog opens or after assign/unassign
  const fetchApiUsers = useCallback(() => {
    console.log('🔄 Fetching API users for assignment dialog...');
    setApiUsersLoading(true);
    setApiUsersError(null);
    getEmployees()
      .then((data) => {
        console.log('✅ API users fetched:', data?.length || 0, 'users');
        console.log('📋 Sample user data:', data?.[0]);
        setApiUsers(Array.isArray(data) ? data : []);
        setApiUsersLoading(false);
      })
      .catch((err) => {
        console.error('❌ Failed to fetch API users:', err);
        setApiUsersError('Failed to load users');
        setApiUsersLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isAssignUserDialogOpen) {
      fetchApiUsers();
    }
  }, [isAssignUserDialogOpen, fetchApiUsers]);

  // Wrap assign/unassign to refresh list after action
  const handleAssignAndRefresh = async (userId: string) => {
    await handleAssignRoleToUser(userId);
    // Additional refresh after assignment
    await Promise.all([
      fetchApiUsers(),
      refreshUsers() // 🔥 FIX: Ensure AuthContext users are refreshed
    ]);
  };
  
  const handleUnassignAndRefresh = async (userId: string) => {
    await handleUnassignUser(userId);
    // Additional refresh after unassignment
    await Promise.all([
      fetchApiUsers(),
      refreshUsers() // 🔥 FIX: Ensure AuthContext users are refreshed
    ]);
  };

  return (
    <PermissionGuard requiredPermission={COMPONENT_PERMISSIONS.RolesPermissions}>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-600 mt-2">Manage user roles and their associated permissions</p>
          </div>
          </div>
        <RoleStats rolesCount={Array.isArray(roles) ? roles.length : 0} usersCount={Array.isArray(users) ? users.length : 0} permissionGroupsCount={Object.keys(permissionGroups).length} />
        <Tabs defaultValue="roles" className="w-full">
          <TabsList>
            <TabsTrigger value="roles" className="flex items-center gap-2"><Users className="h-4 w-4" />Roles</TabsTrigger>
            {hasPermission('settings.role.create') && (
              <TabsTrigger value="create" className="flex items-center gap-2"><Plus className="h-4 w-4" />Create Role</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="roles" className="mt-6">
            <RolesTable
              roles={roles}
              userCountsByRole={userCountsByRole}
              roleSearchTerm={roleSearchTerm}
              onRoleSearchChange={setRoleSearchTerm}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteRole}
                        onAssignUser={handleAssignUserClick}
                        onViewUsers={handleViewUsersClick}
              onCreateFirstRole={() => setRoleSearchTerm("")}
            />
          </TabsContent>
          {hasPermission('settings.role.create') && (
            <TabsContent value="create" className="mt-6">
              <CreateRoleForm
                roleName={newRoleName}
                roleDescription={newRoleDescription}
                                    permissions={newRolePermissions}
                templates={ROLE_TEMPLATES}
                selectedTemplate={selectedTemplate}
                permissionGroups={permissionGroups}
                onRoleNameChange={setNewRoleName}
                onRoleDescriptionChange={setNewRoleDescription}
                                    onPermissionChange={handleNewRolePermissionChange}
                onSelectAllPermissions={handleSelectAllModulePermissions}
                onTemplateSelect={handleTemplateSelect}
                onCreateRole={handleCreateRole}
                areAllModulePermissionsSelected={areAllModulePermissionsSelected}
                countAssignedPermissions={countAssignedPermissions}
                countTotalPermissionsInGroup={countTotalPermissionsInGroup}
              />
            </TabsContent>
          )}

        </Tabs>
        <DeleteRoleDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          role={roleToDelete}
          onConfirm={confirmDeleteRole}
        />
        <EditRoleDialog
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          role={editingRole}
          roleName={editingRoleName}
          roleDescription={editingRoleDescription}
                          permissions={editingRolePermissions}
          permissionGroups={permissionGroups}
          onRoleNameChange={setEditingRoleName}
          onRoleDescriptionChange={setEditingRoleDescription}
                          onPermissionChange={handleEditRolePermissionChange}
          onSelectAllPermissions={handleSelectAllEditingModulePermissions}
          areAllModulePermissionsSelected={areAllEditingModulePermissionsSelected}
          countAssignedPermissions={countAssignedPermissions}
          countTotalPermissionsInGroup={countTotalPermissionsInGroup}
          onSave={handleUpdateRole}
          onCancel={() => {
                setIsEditModalOpen(false);
                setEditingRole(null);
                setEditingRolePermissions(null);
                setEditingRoleName('');
                setEditingRoleDescription('');
          }}
        />
        <AssignUserDialog
          isOpen={isAssignUserDialogOpen}
          onOpenChange={setIsAssignUserDialogOpen}
          role={roleToAssignUser}
          users={apiUsers}
          userSearchTerm={userSearchTerm}
          onUserSearchChange={setUserSearchTerm}
          onAssignUser={handleAssignAndRefresh}
          onUnassignUser={handleUnassignAndRefresh}
          isLoading={apiUsersLoading}
          error={apiUsersError}
          isProcessing={apiUsersLoading}
        />
        <ViewUsersDialog
          isOpen={!!viewUsersRole}
          onOpenChange={() => setViewUsersRole(null)}
          role={viewUsersRole}
          users={users.map(u => ({
            id: u.id,
            name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown User',
            email: u.email,
            role: u.role
          }))}
          onUnassignUser={handleUnassignUser}
          onUnassignAllUsers={handleUnassignAllUsers}
          isProcessing={apiUsersLoading}
        />
      </div>
    </PermissionGuard>
  );
} 