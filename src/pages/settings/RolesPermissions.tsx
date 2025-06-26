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
  History,
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

interface RoleHistory {
  id: string;
  roleName: string;
  action: 'created' | 'updated' | 'deleted';
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  timestamp: string;
  user: string;
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
        role: { view: true, create: false, edit: false, delete: false }
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

// 🚀 PERFORMANCE: Memoized Components for Heavy Renders
const MemoizedPermissionCheckbox = memo(({ 
  id, 
  checked, 
  onCheckedChange, 
  label, 
  disabled = false 
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) => {
  // 🔥 BOOLEAN VALIDATION: Ensure checked is strictly boolean
  const isCheckedBoolean = checked === true;
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={isCheckedBoolean}
        onCheckedChange={(checkedValue) => {
          // 🔥 BOOLEAN CONVERSION: Ensure the callback receives strict boolean
          const booleanValue = checkedValue === true;
          onCheckedChange(booleanValue);
        }}
        disabled={disabled}
      />
      <Label htmlFor={id} className="capitalize text-sm">
        {label}
      </Label>
    </div>
  );
});

MemoizedPermissionCheckbox.displayName = 'MemoizedPermissionCheckbox';

// 🚀 PERFORMANCE: Memoized Permission Group Component
const MemoizedPermissionGroup = memo(({ 
  groupKey, 
  group, 
  permissions, 
  onPermissionChange, 
  onSelectAll,
  areAllSelected,
  assignedCount,
  totalCount,
  isEditing = false
}: {
  groupKey: string;
  group: any;
  permissions: any;
  onPermissionChange: (module: string, submodule: string, action: string, checked: boolean) => void;
  onSelectAll: (module: string, shouldSelect: boolean) => void;
  areAllSelected: boolean;
  assignedCount: number;
  totalCount: number;
  isEditing?: boolean;
}) => {
  return (
    <AccordionItem value={groupKey} className="border rounded-lg">
      <AccordionTrigger className="p-4 hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="font-semibold">{group.description}</span>
            <Badge variant="secondary">
              {assignedCount} / {totalCount} permissions
            </Badge>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <Checkbox
              id={`select-all-${isEditing ? 'edit-' : ''}${groupKey}`}
              checked={areAllSelected === true}
              onCheckedChange={(checked) => {
                // 🔥 BOOLEAN CONVERSION: Ensure strict boolean value
                const booleanValue = checked === true;
                onSelectAll(groupKey, booleanValue);
              }}
            />
            <Label htmlFor={`select-all-${isEditing ? 'edit-' : ''}${groupKey}`} className="text-sm">
              Select All
            </Label>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        <div className="space-y-4 pt-4 border-t">
          {Object.entries(group.modules).map(([moduleKey, moduleName]) => (
            <Card key={moduleKey}>
              <CardHeader>
                <CardTitle className="text-base">{String(moduleName)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(permissions?.[groupKey]?.[moduleKey] || {}).map((action) => {
                    const permissionValue = permissions?.[groupKey]?.[moduleKey]?.[action];
                    // 🔥 BOOLEAN VALIDATION: Ensure strict boolean check
                    const isChecked = permissionValue === true;
                    
                    return (
                      <MemoizedPermissionCheckbox
                        key={`${groupKey}-${moduleKey}-${action}`}
                        id={`${isEditing ? 'edit-' : ''}${groupKey}-${moduleKey}-${action}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          // 🔥 BOOLEAN CONVERSION: Ensure strict boolean value
                          const booleanValue = checked === true;
                          onPermissionChange(groupKey, moduleKey, action, booleanValue);
                        }}
                        label={action}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

MemoizedPermissionGroup.displayName = 'MemoizedPermissionGroup';

// 🚀 PERFORMANCE: Optimized Stats Card Component
const MemoizedStatsCard = memo(({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
  <Card>
    <CardContent className="flex items-center justify-between p-6">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="p-3 bg-gray-100 rounded-lg">
        {icon}
      </div>
    </CardContent>
  </Card>
));

MemoizedStatsCard.displayName = 'MemoizedStatsCard';

// 🚀 PERFORMANCE: Optimized Role Row Component
const MemoizedRoleRow = memo(({ 
  role, 
  userCount, 
  onEdit, 
  onDelete, 
  onAssignUser, 
  onViewUsers 
}: {
  role: Role;
  userCount: number;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onAssignUser: (role: Role) => void;
  onViewUsers: (role: Role) => void;
}) => {
  const isSystemRole = role.name.toLowerCase() === 'super_admin' || role.name.toLowerCase() === 'super admin';
  
  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col">
          <Badge variant="outline">{role.name}</Badge>
          
        </div>
      </TableCell>
      <TableCell>{role.description}</TableCell>
      <TableCell>
        <Button variant="link" className="p-0 h-auto" onClick={() => onViewUsers(role)}>
          {userCount || 0}
        </Button>
      </TableCell>
      <TableCell className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={() => onEdit(role)}
          disabled={isSystemRole}
        >
          <Pencil className="h-3 w-3" /> Edit
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={() => onDelete(role)}
          disabled={isSystemRole}
        >
          <Trash2 className="h-3 w-3" /> Delete
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => onAssignUser(role)}
          disabled={isSystemRole}
        >
          <UserPlus className="h-3 w-4" /> Add User
        </Button>
      </TableCell>
    </TableRow>
  );
});

MemoizedRoleRow.displayName = 'MemoizedRoleRow';

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
    refreshRoles
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
  const [roleHistory, setRoleHistory] = useState<RoleHistory[]>([]);
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
      const currentRole = roles.find(r => r.id === roleId || r._id === roleId);
      
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
    roles.forEach(role => {
      counts[role.name] = 0;
    });
    users.forEach(user => {
      if (user.role && counts[user.role] !== undefined) {
        counts[user.role]++;
      }
    });
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
    roleHistory,
    setRoleHistory,
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
    roleHistory,
    setRoleHistory,
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
      
      const newHistoryEntry: RoleHistory = {
        id: new Date().toISOString(),
        roleName: editingRoleName,
        action: 'updated',
        changes: [
          { field: 'name', oldValue: editingRole.name, newValue: editingRoleName },
          { field: 'description', oldValue: editingRole.description || '', newValue: editingRoleDescription },
          { field: 'permissions', oldValue: 'Previous permissions', newValue: 'New permissions set' }
        ],
        timestamp: new Date().toISOString(),
        user: user?.email || 'System'
      };
      setRoleHistory(prev => [newHistoryEntry, ...prev]);

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
  }, [editingRole, editingRolePermissions, editingRoleName, editingRoleDescription, transformPermissionsToArray, setRoleHistory, user, toast, refreshRoles]);

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    return roles.filter((role: Role) =>
      role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(roleSearchTerm.toLowerCase()))
    );
  }, [roles, roleSearchTerm]);

  // Handle permission change for new role
  const handleNewRolePermissionChange = useCallback((module: string, submodule: string, action: string, checked: boolean) => {
    if (!hasPermission('settings.role.manage')) {
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

      // Add to history
      const newHistoryEntry: RoleHistory = {
        id: new Date().toISOString(),
          roleName: newRoleName,
          action: 'created',
          changes: [
          { field: 'name', oldValue: '', newValue: newRoleName },
          { field: 'description', oldValue: '', newValue: newRoleDescription },
          { field: 'permissions', oldValue: {}, newValue: 'Initial permissions set' },
          ],
          timestamp: new Date().toISOString(),
        user: user?.email || 'System'
      };
      setRoleHistory(prev => [newHistoryEntry, ...prev]);

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
  }, [newRoleName, newRolePermissions, newRoleDescription, createRoleWithPermissions, toast, setSelectedTemplate, setNewRoleName, setNewRolePermissions, setNewRoleDescription, user, setRoleHistory, refreshRoles]);

  // Handle role deletion
  const handleDeleteRole = useCallback(async (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  }, [setIsDeleteDialogOpen, setRoleToDelete]);

  const confirmDeleteRole = useCallback(async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete.name);
      
      // 🔥 NEW: Refresh roles in frontend to remove deleted role immediately
      await refreshRoles();
      
      const newHistoryEntry: RoleHistory = {
        id: new Date().toISOString(),
        roleName: roleToDelete.name,
            action: 'deleted',
        changes: [{ field: 'role', oldValue: roleToDelete.name, newValue: '' }],
            timestamp: new Date().toISOString(),
        user: user?.email || 'System'
      };
      setRoleHistory(prev => [newHistoryEntry, ...prev]);

      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  }, [roleToDelete, deleteRole, setIsDeleteDialogOpen, setRoleToDelete, user, setRoleHistory, refreshRoles]);

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
    setRoleToAssignUser(role);
    setIsAssignUserDialogOpen(true);
    setUserSearchTerm('');
  };

  const handleAssignRoleToUser = (userId: string) => {
    if (roleToAssignUser) {
      // Prevent assigning Super Admin role to users (it's a system role)
      const systemRoles = ['SUPER_ADMIN', 'Super Admin', 'super_admin'];
      if (systemRoles.includes(roleToAssignUser.name) || systemRoles.some(role => role.toLowerCase() === roleToAssignUser.name.toLowerCase())) {
        toast({
          title: "🛡️ System Role Protected",
          description: `Cannot assign system role "${roleToAssignUser.name}" to users. System roles are protected.`,
          variant: "destructive",
          duration: 5000,
          className: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-black",
        });
        return;
      }

      assignRoleToUser(userId, roleToAssignUser.name);
      toast({
        title: "User Assigned",
        description: `User has been successfully assigned the "${roleToAssignUser.name}" role.`,
      });
      setIsAssignUserDialogOpen(false);
    }
  };

  const handleViewUsersClick = (role: Role) => {
    setViewUsersRole(role);
  };

  const handleUnassignUser = (userId: string) => {
    if (viewUsersRole) {
      unassignRoleFromUser(userId);
      toast({
        title: "User Unassigned",
        description: `User has been unassigned from the "${viewUsersRole.name}" role.`,
      });
    }
  };

  const handleUnassignAllUsers = () => {
    if (viewUsersRole) {
      users.forEach(u => {
        if (u.role === viewUsersRole.name) {
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

      // 🚀 PERFORMANCE: Memoized stats cards data
  const statCards = useMemo(() => [
    { title: 'Total Roles', value: roles.length, icon: <Users className="h-6 w-6 text-blue-500" /> },
    { title: 'Active Users', value: users.length, icon: <UserCheck className="h-6 w-6 text-green-500" /> },
    { title: 'Permission Groups', value: Object.keys(permissionGroups).length, icon: <Shield className="h-6 w-6 text-purple-500" /> },
    { title: 'Recent Changes', value: 3, icon: <History className="h-6 w-6 text-orange-500" /> }
  ], [roles.length, users.length]);

  return (
    <PermissionGuard requiredPermission={COMPONENT_PERMISSIONS.RolesPermissions}>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-600 mt-2">Manage user roles and their associated permissions</p>
            </div>
          </div>

        {/* 🚀 PERFORMANCE: Optimized Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(card => (
            <MemoizedStatsCard key={card.title} {...card} />
          ))}
          </div>

        <Tabs defaultValue="roles" className="w-full">
          <TabsList>
            <TabsTrigger value="roles" className="flex items-center gap-2"><Users className="h-4 w-4" />Roles</TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2"><Plus className="h-4 w-4" />Create Role</TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2"><History className="h-4 w-4" />History</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Existing Roles</CardTitle>
                    <CardDescription>Manage permissions for existing roles</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-64">
                    <Input
                      placeholder="Search roles..."
                      value={roleSearchTerm}
                      onChange={(e) => setRoleSearchTerm(e.target.value)}
                    />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRoles.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {roleSearchTerm ? 'No roles found' : 'No roles available'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {roleSearchTerm 
                        ? `No roles match "${roleSearchTerm}". Try a different search term.`
                        : 'No roles have been created yet. Create your first role to get started.'
                      }
                    </p>
                    {!roleSearchTerm && (
                      <Button onClick={() => setRoleSearchTerm('')} className="bg-gray-900 hover:bg-gray-800 mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Create First Role
                      </Button>
                    )}
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Assigned Users</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role: Role) => (
                      <MemoizedRoleRow
                        key={role.id || role._id}
                        role={role}
                        userCount={userCountsByRole[role.name] || 0}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteRole}
                        onAssignUser={handleAssignUserClick}
                        onViewUsers={handleViewUsersClick}
                      />
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                    <CardTitle className="text-xl font-bold">Create New Role</CardTitle>
                    <CardDescription>Define a new role and assign its permissions</CardDescription>
              </CardHeader>
                <CardContent className="space-y-8">
                {/* Role Templates */}
                    <div>
                        <Label className="text-base font-semibold">Role Templates</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                    {ROLE_TEMPLATES.map((template) => (
                      <Card
                        key={template.id}
                                className={`cursor-pointer hover:shadow-lg transition-all border-2 ${selectedTemplate?.id === template.id ? 'border-blue-500' : 'border-transparent'}`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                                <CardContent className="p-4 relative">
                                    <h3 className="font-semibold">{template.name}</h3>
                                    <p className="text-sm text-gray-500">{template.description}</p>
                            {selectedTemplate?.id === template.id && (
                                        <div className="absolute top-2 right-2 h-5 w-5 bg-blue-500 text-white rounded-full flex items-center justify-center">
                                            <Check className="h-3 w-3" />
                          </div>
                                    )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                    {/* Role Name */}
                <div className="space-y-2">
                      <Label htmlFor="roleName" className="text-base font-semibold">Role Name</Label>
                  <Input
                        id="roleName"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g., Team Lead"
                  />
                </div>

                    {/* Role Description */}
                    <div className="space-y-2">
                      <Label htmlFor="roleDescription" className="text-base font-semibold">Role Description</Label>
                      <Input
                        id="roleDescription"
                        value={newRoleDescription}
                        onChange={(e) => setNewRoleDescription(e.target.value)}
                        placeholder="Enter a description for the role"
                  />
                </div>

                    {/* Assign Permissions */}
                    <div>
                         <Label className="text-base font-semibold">Assign Permissions</Label>
                         <Accordion type="multiple" className="w-full mt-2 space-y-3">
                            {Object.entries(permissionGroups).map(([groupKey, group]) => (
                                <MemoizedPermissionGroup
                                  key={groupKey}
                                  groupKey={groupKey}
                                  group={group}
                                  permissions={newRolePermissions}
                                  onPermissionChange={handleNewRolePermissionChange}
                                  onSelectAll={handleSelectAllModulePermissions}
                                  areAllSelected={areAllModulePermissionsSelected(groupKey)}
                                  assignedCount={countAssignedPermissions((newRolePermissions as any)[groupKey])}
                                  totalCount={countTotalPermissionsInGroup((newRolePermissions as any)[groupKey])}
                                />
                      ))}
                        </Accordion>
                </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={handleCreateRole} disabled={!newRoleName.trim()} className="bg-gray-900 hover:bg-gray-800 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Create Role
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Role History</CardTitle>
                <CardDescription>Track changes to roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                 {roleHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Performed By</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roleHistory.map(entry => (
                        <TableRow key={entry.id}>
                          <TableCell><Badge variant="outline">{entry.roleName}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={entry.action === 'created' ? 'default' : 'destructive'} className="capitalize">
                              {entry.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {entry.action === 'created' && `Role "${entry.roleName}" was created.`}
                            {entry.action === 'deleted' && `Role "${entry.roleName}" was deleted.`}
                            {entry.action === 'updated' && `Role "${entry.roleName}" was updated.`}
                          </TableCell>
                          <TableCell>{entry.user}</TableCell>
                          <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                 ) : (
                  <p className="text-gray-500">No history to display yet. Create or delete a role to see changes here.</p>
                 )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Role</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteRole}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Role: {editingRole?.name || 'Unknown'}</DialogTitle>
              <DialogDescription>
                Modify the name, description, and permissions for the "{editingRole?.name || 'Unknown'}" role.
                <span className="text-sm text-blue-600 ml-2">
                  Changes are automatically saved to the backend.
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto space-y-6">
              {/* Role Name and Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="editRoleName" className="text-sm font-semibold">Role Name</Label>
                  <Input
                    id="editRoleName"
                    value={editingRoleName}
                    onChange={(e) => setEditingRoleName(e.target.value)}
                    placeholder="Enter role name"
                  />
                                    </div>
                <div className="space-y-2">
                  <Label htmlFor="editRoleDescription" className="text-sm font-semibold">Role Description</Label>
                  <Input
                    id="editRoleDescription"
                    value={editingRoleDescription}
                    onChange={(e) => setEditingRoleDescription(e.target.value)}
                    placeholder="Enter role description"
                  />
                              </div>
              </div>
              
              {/* Permissions Content - Always show, no loading state */}
              {editingRolePermissions && (
                 <Accordion type="multiple" className="w-full mt-2 space-y-3">
                    {Object.entries(permissionGroups).map(([groupKey, group]) => (
                        <MemoizedPermissionGroup
                          key={groupKey}
                          groupKey={groupKey}
                          group={group}
                          permissions={editingRolePermissions}
                          onPermissionChange={handleEditRolePermissionChange}
                          onSelectAll={handleSelectAllEditingModulePermissions}
                          areAllSelected={areAllEditingModulePermissionsSelected(groupKey)}
                          assignedCount={countAssignedPermissions((editingRolePermissions as any)?.[groupKey])}
                          totalCount={countTotalPermissionsInGroup((editingRolePermissions as any)?.[groupKey])}
                          isEditing={true}
                        />
                    ))}
                </Accordion>
              )}
                  </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditModalOpen(false);
                setEditingRole(null);
                setEditingRolePermissions(null);
                setEditingRoleName('');
                setEditingRoleDescription('');
              }}>
                  Cancel
                </Button>
              <Button onClick={handleUpdateRole} disabled={!editingRolePermissions}>
                Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        {/* Assign User Dialog */}
        <Dialog open={isAssignUserDialogOpen} onOpenChange={setIsAssignUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role: {roleToAssignUser?.name}</DialogTitle>
              <DialogDescription>
                Select a user to assign the "{roleToAssignUser?.name}" role to.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Input
                placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                className="mb-4"
              />
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {users
                  .filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) && u.role !== roleToAssignUser?.name)
                  .map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                        <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      <Button size="sm" onClick={() => handleAssignRoleToUser(u.id)}>
                              Assign
                            </Button>
                        </div>
                  ))}
                      </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Assigned Users Dialog */}
          <Dialog open={!!viewUsersRole} onOpenChange={() => setViewUsersRole(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Users with Role: {viewUsersRole?.name}</DialogTitle>
                    <DialogDescription>
                        Manage users assigned to the "{viewUsersRole?.name}" role.
                    </DialogDescription>
              </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                        {users
                            .filter(u => u.role === viewUsersRole?.name)
                            .map(u => (
                                <div key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                            <div>
                                        <p className="font-medium">{u.name}</p>
                                        <p className="text-sm text-gray-500">{u.email}</p>
                            </div>
                                    <Button size="sm" variant="outline" onClick={() => handleUnassignUser(u.id)}>
                              Unassign
                            </Button>
                          </div>
                        ))}
                        {users.filter(u => u.role === viewUsersRole?.name).length === 0 && (
                            <p className="text-center text-gray-500 py-4">No users are assigned to this role.</p>
                        )}
                      </div>
                    {users.filter(u => u.role === viewUsersRole?.name).length > 0 && (
                      <DialogFooter className="!justify-between mt-4">
                          <Button variant="outline" onClick={() => setViewUsersRole(null)}>Close</Button>
                          <Button variant="destructive" onClick={handleUnassignAllUsers}>
                              <X className="mr-2 h-4 w-4" /> Unassign All
                    </Button>
                      </DialogFooter>
                )}
              </div>
            </DialogContent>
          </Dialog>

      </div>
    </PermissionGuard>
  );
} 