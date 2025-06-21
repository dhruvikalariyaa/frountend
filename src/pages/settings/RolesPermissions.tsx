import React, { useState, useCallback, useMemo } from 'react';
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
  GitCompare,
  History,
  UserCheck,
  UserPlus,
  AlertTriangle,
  Check
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
import { useAuth, MockUser } from '../../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PermissionGuard } from '@/components/PermissionGuard';
import { COMPONENT_PERMISSIONS } from '@/constants/componentPermissions';
import { Role } from '@/types/models';
import { UserPermissions } from '@/services/permission.service';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

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

// Define permission groups based on the new API structure
const permissionGroups = {
  dashboard: {
    description: 'Dashboard',
    modules: {
      dashboard: 'Dashboard Access'
    }
  },
  hiring: {
    description: 'Hiring Management',
    modules: {
      candidate: 'Candidate Management',
      interview: 'Interview Management',
      job: 'Job Management',
      onboarding: 'Onboarding Management'
    }
  },
  employeemanagement: {
    description: 'Employee Management',
    modules: {
      employee: 'Employee Management',
      department: 'Department Management',
      leave: 'Leave Management',
      attendence: 'Attendance Management',
      performance: 'Performance Management'
    }
  },
  settings: {
    description: 'Settings',
    modules: {
      companyprofile: 'Company Profile',
      rolespermisions: 'Roles & Permissions',
      systemsettings: 'System Settings',
      rolesDetails: 'Role Details'
    }
  }
};

// Role templates with the new permission structure
const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'administrator',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: {
      dashboard: { dashboard: { view: true } },
      hiring: {
        candidate: { view: true, create: true, edit: true, delete: true },
        interview: { view: true, create: true, edit: true, delete: true },
        job: { view: true, create: true, edit: true, delete: true },
        onboarding: { view: true, create: true, edit: true, delete: true }
      },
      employeemanagement: {
        employee: { view: true, create: true, edit: true, delete: true },
        department: { view: true, create: true, edit: true, delete: true },
        leave: { view: true, create: true, edit: true, delete: true },
        attendence: { view: true, create: true, edit: true, delete: true },
        performance: { view: true, create: true, edit: true, delete: true }
      },
      settings: {
        companyprofile: { view: true, create: true, edit: true, delete: true },
        rolespermisions: { view: true, create: true, edit: true, delete: true },
        systemsettings: { view: true, create: true, edit: true, delete: true },
        rolesDetails: { view: true, edit: true }
      }
    },
    category: 'System'
  },
  {
    id: 'hr_manager',
    name: 'HR Manager',
    description: 'Complete HR management and oversight',
    permissions: {
      dashboard: { dashboard: { view: true } },
      hiring: {
        candidate: { view: true, create: true, edit: true, delete: true },
        interview: { view: true, create: true, edit: true, delete: true },
        job: { view: true, create: true, edit: true, delete: true },
        onboarding: { view: true, create: true, edit: true, delete: true }
      },
      employeemanagement: {
        employee: { view: true, create: true, edit: true, delete: false },
        department: { view: true, create: false, edit: false, delete: false },
        leave: { view: true, create: false, edit: true, delete: false },
        attendence: { view: true, create: false, edit: false, delete: false },
        performance: { view: true, create: false, edit: true, delete: false }
      },
      settings: {
        companyprofile: { view: true, create: false, edit: false, delete: false },
        rolespermisions: { view: false, create: false, edit: false, delete: false },
        systemsettings: { view: false, create: false, edit: false, delete: false },
        rolesDetails: { view: false, edit: false }
      }
    },
    category: 'HR'
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Basic employee access',
    permissions: {
      dashboard: { dashboard: { view: true } },
      hiring: {
        candidate: { view: false, create: false, edit: false, delete: false },
        interview: { view: false, create: false, edit: false, delete: false },
        job: { view: true, create: false, edit: false, delete: false },
        onboarding: { view: false, create: false, edit: false, delete: false }
      },
      employeemanagement: {
        employee: { view: false, create: false, edit: false, delete: false },
        department: { view: true, create: false, edit: false, delete: false },
        leave: { view: true, create: true, edit: false, delete: false },
        attendence: { view: true, create: false, edit: false, delete: false },
        performance: { view: true, create: false, edit: false, delete: false }
      },
      settings: {
        companyprofile: { view: true, create: false, edit: false, delete: false },
        rolespermisions: { view: false, create: false, edit: false, delete: false },
        systemsettings: { view: false, create: false, edit: false, delete: false },
        rolesDetails: { view: false, edit: false }
      }
    },
    category: 'Basic'
  }
];

const ALL_POSSIBLE_PERMISSIONS: UserPermissions = {
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
    user
  } = useAuth();
  
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRolePermissions, setNewRolePermissions] = useState<UserPermissions>(
    JSON.parse(JSON.stringify(ALL_POSSIBLE_PERMISSIONS))
  );
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
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [rolesToCompare, setRolesToCompare] = useState<Role[]>([]);

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
    newRoleName,
    setNewRoleName,
    newRolePermissions,
    setNewRolePermissions,
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
    userCountsByRole,
    isCompareModalOpen,
    setIsCompareModalOpen,
    rolesToCompare,
    setRolesToCompare
  };
};

export default function RolesPermissions() {
  const { toast } = useToast();
  const {
    roles,
    updateRole,
    createRole,
    deleteRole,
    hasPermission,
    users,
    newRoleName,
    setNewRoleName,
    newRolePermissions,
    setNewRolePermissions,
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
    isCompareModalOpen,
    setIsCompareModalOpen,
    rolesToCompare,
    setRolesToCompare
  } = useRoleManagement();
  const { user } = useAuth();

  // Filter roles based on search term
  const filteredRoles = useMemo(() => {
    return roles.filter((role: Role) =>
      role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(roleSearchTerm.toLowerCase()))
    );
  }, [roles, roleSearchTerm]);

  // Handle permission change for new role
  const handleNewRolePermissionChange = useCallback((module: string, submodule: string, action: string, checked: boolean) => {
    if (!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create new roles.",
        variant: "destructive",
      });
      return;
    }

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
       // @ts-ignore
      newPermissions[module as keyof UserPermissions][submodule][action] = checked;
      return newPermissions;
    });
  }, [hasPermission, toast, setNewRolePermissions]);

  const handleSelectAllModulePermissions = useCallback((module: string, shouldSelect: boolean) => {
    setNewRolePermissions(prev => {
      const newPermissions = { ...prev };
      const modulePermissions = (newPermissions as any)[module];
      if (modulePermissions) {
        Object.keys(modulePermissions).forEach(submodule => {
          Object.keys(modulePermissions[submodule]).forEach(action => {
            modulePermissions[submodule][action] = shouldSelect;
          });
        });
      }
      return newPermissions;
    });
  }, [setNewRolePermissions]);

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
    return Object.values(modulePermissions).reduce((count: number, submodule: any) => {
        return count + Object.values(submodule).filter(value => value === true).length;
    }, 0);
  };

  // Handle template selection
  const handleTemplateSelect = useCallback((template: RoleTemplate) => {
    setSelectedTemplate(template);
    setNewRolePermissions(template.permissions);
    setNewRoleName(template.name);
      toast({
      title: "Template Applied!",
      description: `The "${template.name}" template is ready to be customized.`,
      });
  }, [setNewRoleName, setNewRolePermissions, setSelectedTemplate, toast]);

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

    try {
      await createRole({
        name: newRoleName,
        description: `Custom role: ${newRoleName}`,
        permissions: newRolePermissions
      });

      const newHistoryEntry: RoleHistory = {
        id: new Date().toISOString(),
          roleName: newRoleName,
          action: 'created',
          changes: [
          { field: 'name', oldValue: '', newValue: newRoleName },
          { field: 'permissions', oldValue: {}, newValue: 'Initial permissions set' },
          ],
          timestamp: new Date().toISOString(),
        user: user?.email || 'System'
      };
      setRoleHistory(prev => [newHistoryEntry, ...prev]);

      setNewRoleName('');
      setNewRolePermissions(JSON.parse(JSON.stringify(ALL_POSSIBLE_PERMISSIONS)));
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  }, [newRoleName, newRolePermissions, createRole, toast, setSelectedTemplate, setNewRoleName, setNewRolePermissions, user, setRoleHistory]);

  // Handle role deletion
  const handleDeleteRole = useCallback(async (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  }, [setIsDeleteDialogOpen, setRoleToDelete]);

  const confirmDeleteRole = useCallback(async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete.name);
      
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
  }, [roleToDelete, deleteRole, setIsDeleteDialogOpen, setRoleToDelete, user, setRoleHistory]);

  const handleEditRolePermissionChange = useCallback((module: string, submodule: string, action: string, checked: boolean) => {
    setEditingRolePermissions(prev => {
      if (!prev) return null;
      const newPermissions = JSON.parse(JSON.stringify(prev)); // Deep copy
      if (!newPermissions[module as keyof UserPermissions]) {
        // @ts-ignore
        newPermissions[module as keyof UserPermissions] = {};
      }
      // @ts-ignore
      if (!newPermissions[module as keyof UserPermissions][submodule]) {
        // @ts-ignore
        newPermissions[module as keyof UserPermissions][submodule] = {};
      }
      // @ts-ignore
      newPermissions[module as keyof UserPermissions][submodule][action] = checked;
      return newPermissions;
    });
  }, [setEditingRolePermissions]);

  const handleSelectAllEditingModulePermissions = useCallback((module: string, shouldSelect: boolean) => {
    setEditingRolePermissions(prev => {
      if (!prev) return null;
      const newPermissions = JSON.parse(JSON.stringify(prev)); // Deep copy
      const modulePermissions = (newPermissions as any)[module];
      if (modulePermissions) {
        Object.keys(modulePermissions).forEach(submodule => {
          Object.keys(modulePermissions[submodule]).forEach(action => {
            modulePermissions[submodule][action] = shouldSelect;
          });
        });
      }
      return newPermissions;
    });
  }, [setEditingRolePermissions]);

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

  const handleEditClick = (role: Role) => {
    const fullPermissions = JSON.parse(JSON.stringify(ALL_POSSIBLE_PERMISSIONS));
    
    // Deep merge the role's permissions into the full structure
    const mergePermissions = (target: any, source: any) => {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] instanceof Object && target.hasOwnProperty(key)) {
                    mergePermissions(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
    };

    if (role.permissions) {
        mergePermissions(fullPermissions, role.permissions);
    }
    
    setEditingRole(role);
    setEditingRolePermissions(fullPermissions);
    setIsEditModalOpen(true);
  };

  const handleUpdateRole = useCallback(async () => {
    if (!editingRole || !editingRolePermissions) return;

    try {
      await updateRole(editingRole.name, editingRolePermissions);

      const newHistoryEntry: RoleHistory = {
        id: new Date().toISOString(),
        roleName: editingRole.name,
        action: 'updated',
        changes: [{ field: 'permissions', oldValue: 'Previous permissions', newValue: 'New permissions set' }],
        timestamp: new Date().toISOString(),
        user: user?.email || 'System'
      };
      setRoleHistory(prev => [newHistoryEntry, ...prev]);

      setIsEditModalOpen(false);
      setEditingRole(null);
      setEditingRolePermissions(null);
      toast({
        title: "Role Updated",
        description: `Successfully updated the role: ${editingRole.name}`,
      });
    } catch (error) {
      console.error('Failed to update role:', error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the role.",
        variant: "destructive",
      });
    }
  }, [editingRole, editingRolePermissions, updateRole, setRoleHistory, user, toast]);

  const handleAssignUserClick = (role: Role) => {
    setRoleToAssignUser(role);
    setIsAssignUserDialogOpen(true);
    setUserSearchTerm('');
  };

  const handleAssignRoleToUser = (userId: string) => {
    if (roleToAssignUser) {
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

  const handleCompareRoleToggle = (role: Role) => {
    setRolesToCompare(prev =>
      prev.some(r => r.id === role.id)
        ? prev.filter(r => r.id !== role.id)
        : [...prev, role]
    );
  };

  const renderPermissionComparison = () => {
    if (rolesToCompare.length < 2) return null;

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Permission</TableHead>
            {rolesToCompare.map(role => <TableHead key={role.id}>{role.name}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(permissionGroups).map(([groupKey, group]) => (
            <React.Fragment key={groupKey}>
              <TableRow>
                <TableCell colSpan={rolesToCompare.length + 1} className="font-semibold bg-gray-50">
                  {group.description}
                </TableCell>
              </TableRow>
              {Object.entries(group.modules).map(([moduleKey, moduleName]) =>
                Object.keys((ALL_POSSIBLE_PERMISSIONS as any)[groupKey][moduleKey]).map(action => (
                  <TableRow key={`${groupKey}-${moduleKey}-${action}`}>
                    <TableCell className="pl-8">{`${moduleName} - ${action}`}</TableCell>
                    {rolesToCompare.map(role => {
                      const hasPermission = !!(role.permissions as any)?.[groupKey]?.[moduleKey]?.[action];
                      return (
                        <TableCell key={`${role.id}-${moduleKey}-${action}`} className="text-center">
                          {hasPermission ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    );
  };

  const statCards = [
    { title: 'Total Roles', value: roles.length, icon: <Users className="h-6 w-6 text-blue-500" /> },
    { title: 'Active Users', value: users.length, icon: <UserCheck className="h-6 w-6 text-green-500" /> },
    { title: 'Permission Groups', value: Object.keys(permissionGroups).length, icon: <Shield className="h-6 w-6 text-purple-500" /> },
    { title: 'Recent Changes', value: 3, icon: <History className="h-6 w-6 text-orange-500" /> }
  ];

  return (
    <PermissionGuard requiredPermission={COMPONENT_PERMISSIONS.RolesPermissions}>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
            <p className="text-gray-600 mt-2">Manage user roles and their associated permissions</p>
            </div>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsCompareModalOpen(true)}>
            <GitCompare className="h-4 w-4" />
                Compare Roles
              </Button>
          </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(card => (
            <Card key={card.title}>
              <CardContent className="flex items-center justify-between p-6">
                  <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                  </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  {card.icon}
                </div>
              </CardContent>
            </Card>
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
                  <div className="w-1/3">
                    <Input
                      placeholder="Search roles..."
                      value={roleSearchTerm}
                      onChange={(e) => setRoleSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
                      <TableRow key={role.id || role._id}>
                        <TableCell><Badge variant="outline">{role.name}</Badge></TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                           <Button variant="link" className="p-0 h-auto" onClick={() => handleViewUsersClick(role)}>
                            {userCountsByRole[role.name] || 0}
                          </Button>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1" 
                            onClick={() => handleEditClick(role)}
                            disabled={role.name.toLowerCase() === 'administrator'}
                          >
                              <Pencil className="h-3 w-3" /> Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex items-center gap-1" 
                            onClick={() => handleDeleteRole(role)}
                            disabled={role.name.toLowerCase() === 'administrator'}
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => handleAssignUserClick(role)}
                          >
                            <UserPlus className="h-3 w-3" /> Add User
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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

                    {/* Assign Permissions */}
                    <div>
                         <Label className="text-base font-semibold">Assign Permissions</Label>
                         <Accordion type="multiple" className="w-full mt-2 space-y-3">
                            {Object.entries(permissionGroups).map(([groupKey, group]) => (
                                <AccordionItem key={groupKey} value={groupKey} className="border rounded-lg">
                                    <AccordionTrigger className="p-4 hover:no-underline">
                              <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold">{group.description}</span>
                                                <Badge variant="secondary">
                                                  {countAssignedPermissions((newRolePermissions as any)[groupKey])} / {countTotalPermissionsInGroup((newRolePermissions as any)[groupKey])} permissions
                                  </Badge>
                                </div>
                                            <div className="flex items-center gap-2 pr-2">
                                  <Checkbox
                                                    id={`select-all-${groupKey}`}
                                                    checked={areAllModulePermissionsSelected(groupKey)}
                                                    onCheckedChange={(checked) => handleSelectAllModulePermissions(groupKey, checked as boolean)}
                                                 />
                                                 <Label htmlFor={`select-all-${groupKey}`} className="text-sm">Select All</Label>
                                </div>
                              </div>
                            </AccordionTrigger>
                                    <AccordionContent className="p-4 pt-0">
                                        <div className="space-y-4 pt-4 border-t">
                                            {Object.entries(group.modules).map(([moduleKey, moduleName]) => (
                                            <Card key={moduleKey}>
                                                <CardHeader>
                                                <CardTitle className="text-base">{moduleName}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {['view', 'create', 'edit', 'delete'].map((action) => (
                                                    (newRolePermissions[groupKey as keyof UserPermissions] as any)?.[moduleKey]?.[action] !== undefined && (
                                                        <div key={action} className="flex items-center space-x-2">
                                        <Checkbox
                                                            id={`${groupKey}-${moduleKey}-${action}`}
                                                            checked={(newRolePermissions[groupKey as keyof UserPermissions] as any)?.[moduleKey]?.[action] || false}
                                                            onCheckedChange={(checked) =>
                                                            handleNewRolePermissionChange(
                                                                groupKey,
                                                                moduleKey,
                                                                action,
                                                                checked as boolean
                                                            )
                                                            }
                                                        />
                                                        <Label htmlFor={`${groupKey}-${moduleKey}-${action}`} className="capitalize">
                                                            {action}
                                                        </Label>
                                        </div>
                                                    )
                                                    ))}
                                      </div>
                                                </CardContent>
                                            </Card>
                                            ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
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
              <DialogTitle>Edit Role: {editingRole?.name}</DialogTitle>
              <DialogDescription>
                Modify the permissions for the "{editingRole?.name}" role.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
              {editingRolePermissions && (
                 <Accordion type="multiple" className="w-full mt-2 space-y-3">
                    {Object.entries(permissionGroups).map(([groupKey, group]) => (
                        <AccordionItem key={groupKey} value={groupKey} className="border rounded-lg">
                            <AccordionTrigger className="p-4 hover:no-underline">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{group.description}</span>
                                        <Badge variant="secondary">
                                          {countAssignedPermissions((editingRolePermissions as any)[groupKey])} / {countTotalPermissionsInGroup((editingRolePermissions as any)[groupKey])} permissions
                                        </Badge>
              </div>
                                    <div className="flex items-center gap-2 pr-2">
                              <Checkbox
                                            id={`select-all-edit-${groupKey}`}
                                            checked={areAllEditingModulePermissionsSelected(groupKey)}
                                            onCheckedChange={(checked) => handleSelectAllEditingModulePermissions(groupKey, checked as boolean)}
                                         />
                                         <Label htmlFor={`select-all-edit-${groupKey}`} className="text-sm">Select All</Label>
                            </div>
                          </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                <div className="space-y-4 pt-4 border-t">
                                    {Object.entries(group.modules).map(([moduleKey, moduleName]) => (
                                    <Card key={moduleKey}>
                                        <CardHeader>
                                        <CardTitle className="text-base">{moduleName}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {['view', 'create', 'edit', 'delete'].map((action) => (
                                            (editingRolePermissions[groupKey as keyof UserPermissions] as any)?.[moduleKey]?.[action] !== undefined && (
                                                <div key={action} className="flex items-center space-x-2">
                              <Checkbox 
                                                    id={`edit-${groupKey}-${moduleKey}-${action}`}
                                                    checked={(editingRolePermissions[groupKey as keyof UserPermissions] as any)?.[moduleKey]?.[action] || false}
                                                    onCheckedChange={(checked) =>
                                                      handleEditRolePermissionChange(
                                                        groupKey,
                                                        moduleKey,
                                                        action,
                                                        checked as boolean
                                                      )
                                                    }
                                                />
                                                <Label htmlFor={`edit-${groupKey}-${moduleKey}-${action}`} className="capitalize">
                                                    {action}
                                                </Label>
                            </div>
                                            )
                          ))}
                        </div>
                                        </CardContent>
                                    </Card>
                                    ))}
                      </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
              )}
                  </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
              <Button onClick={handleUpdateRole}>
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

        {/* Compare Roles Dialog */}
        <Dialog open={isCompareModalOpen} onOpenChange={setIsCompareModalOpen}>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Compare Roles</DialogTitle>
                    <DialogDescription>
                        Select at least two roles to see a side-by-side comparison of their permissions.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {roles.map(role => (
                      <div
                        key={role.id}
                        onClick={() => handleCompareRoleToggle(role)}
                        className={cn(
                          "p-4 border rounded-lg cursor-pointer transition-all",
                          rolesToCompare.some(r => r.id === role.id) ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{role.name}</span>
                          <Checkbox
                            checked={rolesToCompare.some(r => r.id === role.id)}
                            onCheckedChange={() => handleCompareRoleToggle(role)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {rolesToCompare.length > 0 && (
                     <div className="max-h-[50vh] overflow-y-auto">
                        {renderPermissionComparison()}
                      </div>
                  )}
                </div>
            </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
} 