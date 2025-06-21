import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  UserPlus,
  Users,
  X,
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertCircle,
  UserCheck,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  GitCompare,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PERMISSIONS } from '@/contexts/AuthContext';
import { useAuth, MockUser } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PermissionGuard } from '@/components/PermissionGuard';
import { COMPONENT_PERMISSIONS } from '@/constants/componentPermissions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Role } from '@/types/models';

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
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

interface PermissionDependency {
  permission: string;
  requires: string[];
}

// Group permissions by category for display
const permissionGroups: Record<string, { description: string; permissions: string[] }> = {
  'Dashboard': {
    description: 'Access to dashboard and analytics',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD
    ]
  },
  'Employee Management': {
    description: 'Manage employees and their information',
    permissions: [
      PERMISSIONS.VIEW_EMPLOYEES,
      // PERMISSIONS.MANAGE_EMPLOYEES,
      // PERMISSIONS.VIEW_EMPLOYEE_DETAILS,
      // PERMISSIONS.EDIT_EMPLOYEE_DETAILS,
      // PERMISSIONS.DELETE_EMPLOYEE,
      // PERMISSIONS.VIEW_DEPARTMENTS,
      // PERMISSIONS.MANAGE_DEPARTMENTS,
      // PERMISSIONS.VIEW_DEPARTMENT_DETAILS,
      // PERMISSIONS.EDIT_DEPARTMENT_DETAILS,
      // PERMISSIONS.DELETE_DEPARTMENT,
      // PERMISSIONS.VIEW_ATTENDANCE,
      // PERMISSIONS.MANAGE_ATTENDANCE,
      // PERMISSIONS.VIEW_ATTENDANCE_DETAILS,
      // PERMISSIONS.EDIT_ATTENDANCE,
      // PERMISSIONS.DELETE_ATTENDANCE,
      // PERMISSIONS.VIEW_PERFORMANCE,
      // PERMISSIONS.MANAGE_PERFORMANCE,
      // PERMISSIONS.VIEW_PERFORMANCE_DETAILS,
      // PERMISSIONS.EDIT_PERFORMANCE,
      // PERMISSIONS.DELETE_PERFORMANCE,
      // PERMISSIONS.VIEW_LEAVE,
      // PERMISSIONS.MANAGE_LEAVE,
      // PERMISSIONS.VIEW_LEAVE_DETAILS,
      // PERMISSIONS.APPROVE_LEAVE,
      // PERMISSIONS.REJECT_LEAVE,
      // PERMISSIONS.DELETE_LEAVE,
    ]
  },
  'Hiring Management': {
    description: 'Manage hiring process and candidates',
    permissions: [
      PERMISSIONS.VIEW_JOBS,
      PERMISSIONS.MANAGE_JOBS,
      PERMISSIONS.VIEW_JOB_DETAILS,
      PERMISSIONS.EDIT_JOB_DETAILS,
      PERMISSIONS.DELETE_JOB,
      PERMISSIONS.VIEW_CANDIDATES,
      PERMISSIONS.MANAGE_CANDIDATES,
      PERMISSIONS.VIEW_CANDIDATE_DETAILS,
      PERMISSIONS.EDIT_CANDIDATE_DETAILS,
      PERMISSIONS.DELETE_CANDIDATE,
      PERMISSIONS.VIEW_INTERVIEWS,
      PERMISSIONS.MANAGE_INTERVIEWS,
      PERMISSIONS.VIEW_INTERVIEW_DETAILS,
      PERMISSIONS.EDIT_INTERVIEW,
      PERMISSIONS.DELETE_INTERVIEW,
      PERMISSIONS.VIEW_ONBOARDING,
      PERMISSIONS.MANAGE_ONBOARDING,
      PERMISSIONS.VIEW_ONBOARDING_DETAILS,
      PERMISSIONS.EDIT_ONBOARDING_DETAILS,
      PERMISSIONS.DELETE_ONBOARDING
    ]
  },
  'Project Management': {
    description: 'Manage projects and tasks',
    permissions: [
      PERMISSIONS.VIEW_PROJECTS,
  //     PERMISSIONS.MANAGE_PROJECTS,
  //     PERMISSIONS.VIEW_PROJECT_DETAILS,
  //     PERMISSIONS.EDIT_PROJECT_DETAILS,
  //     PERMISSIONS.DELETE_PROJECT,
  //     PERMISSIONS.VIEW_TASKS,
  //     PERMISSIONS.MANAGE_TASKS,
  //     PERMISSIONS.VIEW_TASK_DETAILS,
  //     PERMISSIONS.EDIT_TASK_DETAILS,
  //     PERMISSIONS.DELETE_TASK,
  //     PERMISSIONS.VIEW_SPRINT_DETAILS,
  //     PERMISSIONS.EDIT_SPRINT_DETAILS,
  //     PERMISSIONS.DELETE_SPRINT,
  //     PERMISSIONS.VIEW_TIMELINE,
  //     PERMISSIONS.EDIT_TIMELINE,
  //     PERMISSIONS.VIEW_RESOURCES,
  //     PERMISSIONS.ALLOCATE_RESOURCES,
  //     PERMISSIONS.VIEW_DELIVERABLES,
  //     PERMISSIONS.MANAGE_DELIVERABLES,
  //   ]
  // },
  // 'Sales & Clients': {
  //   description: 'Manage clients and sales',
  //   permissions: [
  //     PERMISSIONS.VIEW_CLIENTS,
  //     PERMISSIONS.MANAGE_CLIENTS,
  //     PERMISSIONS.VIEW_CLIENT_DETAILS,
  //     PERMISSIONS.EDIT_CLIENT_DETAILS,
  //     PERMISSIONS.DELETE_CLIENT,
  //     PERMISSIONS.VIEW_PROPOSALS,
  //     PERMISSIONS.MANAGE_PROPOSALS,
  //     PERMISSIONS.VIEW_PROPOSAL_DETAILS,
  //     PERMISSIONS.EDIT_PROPOSAL_DETAILS,
  //     PERMISSIONS.DELETE_PROPOSAL,
  //     PERMISSIONS.VIEW_CONTRACTS,
  //     PERMISSIONS.MANAGE_CONTRACTS,
  //     PERMISSIONS.VIEW_CONTRACT_DETAILS,
  //     PERMISSIONS.EDIT_CONTRACT_DETAILS,
  //     PERMISSIONS.DELETE_CONTRACT,
  //     PERMISSIONS.VIEW_REVENUE_DETAILS,
    ]
  },
  'Asset Management': {
    description: 'Manage company assets',
    permissions: [
      PERMISSIONS.VIEW_ASSETS,
      // PERMISSIONS.MANAGE_ASSETS,
      // PERMISSIONS.VIEW_ASSET_DETAILS,
      // PERMISSIONS.EDIT_ASSET_DETAILS,
      // PERMISSIONS.DELETE_ASSET,
      // PERMISSIONS.VIEW_LICENSES,
      // PERMISSIONS.MANAGE_LICENSES,
      // PERMISSIONS.VIEW_LICENSE_DETAILS,
      // PERMISSIONS.EDIT_LICENSE_DETAILS,
      // PERMISSIONS.DELETE_LICENSE,
      // PERMISSIONS.VIEW_MAINTENANCE,
      // PERMISSIONS.MANAGE_MAINTENANCE,
      // PERMISSIONS.VIEW_MAINTENANCE_DETAILS,
      // PERMISSIONS.SCHEDULE_MAINTENANCE,
      // PERMISSIONS.EDIT_MAINTENANCE,
      // PERMISSIONS.DELETE_MAINTENANCE,
    ]
  },
  'Finance': {
    description: 'Manage financial information',
    permissions: [
      PERMISSIONS.VIEW_INVOICES,
      // PERMISSIONS.MANAGE_INVOICES,
      // PERMISSIONS.VIEW_INVOICE_DETAILS,
      // PERMISSIONS.EDIT_INVOICE_DETAILS,
      // PERMISSIONS.DELETE_INVOICE,
      // PERMISSIONS.VIEW_EXPENSES,
      // PERMISSIONS.MANAGE_EXPENSES,
      // PERMISSIONS.VIEW_EXPENSE_DETAILS,
      // PERMISSIONS.EDIT_EXPENSE_DETAILS,
      // PERMISSIONS.DELETE_EXPENSE,
      // PERMISSIONS.VIEW_PAYROLL,
      // PERMISSIONS.MANAGE_PAYROLL,
      // PERMISSIONS.VIEW_PAYROLL_DETAILS,
      // PERMISSIONS.PROCESS_PAYROLL,
      // PERMISSIONS.EDIT_PAYROLL_DETAILS,
      // PERMISSIONS.DELETE_PAYROLL,
      // PERMISSIONS.VIEW_REPORTS,
      // PERMISSIONS.MANAGE_REPORTS,
      // PERMISSIONS.VIEW_REPORT_DETAILS,
    ]
  },
  'Settings': {
    description: 'Access to system settings',
    permissions: [
      PERMISSIONS.VIEW_SETTINGS,
      PERMISSIONS.MANAGE_SETTINGS,
      PERMISSIONS.VIEW_COMPANY_PROFILE,
      PERMISSIONS.EDIT_COMPANY_PROFILE,
      PERMISSIONS.MANAGE_ROLES,
      PERMISSIONS.VIEW_SYSTEM_SETTINGS,
      PERMISSIONS.EDIT_SYSTEM_SETTINGS,
    ]
  }
};

// Add role templates
const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: Object.values(PERMISSIONS),
    category: 'System'
  },
  {
    id: 'hr_manager',
    name: 'HR Manager',
    description: 'Complete HR management and oversight',
    permissions: [
      // Hiring Management only
      PERMISSIONS.VIEW_JOBS,
      PERMISSIONS.MANAGE_JOBS,
      PERMISSIONS.VIEW_JOB_DETAILS,
      PERMISSIONS.EDIT_JOB_DETAILS,
      PERMISSIONS.DELETE_JOB,
      PERMISSIONS.VIEW_CANDIDATES,
      PERMISSIONS.MANAGE_CANDIDATES,
      PERMISSIONS.VIEW_CANDIDATE_DETAILS,
      PERMISSIONS.EDIT_CANDIDATE_DETAILS,
      PERMISSIONS.DELETE_CANDIDATE,
      PERMISSIONS.VIEW_INTERVIEWS,
      PERMISSIONS.MANAGE_INTERVIEWS,
      PERMISSIONS.VIEW_INTERVIEW_DETAILS,
      PERMISSIONS.EDIT_INTERVIEW,
      PERMISSIONS.DELETE_INTERVIEW,
      PERMISSIONS.VIEW_ONBOARDING,
      PERMISSIONS.MANAGE_ONBOARDING,
      PERMISSIONS.VIEW_ONBOARDING_DETAILS,
      PERMISSIONS.EDIT_ONBOARDING_DETAILS,
      PERMISSIONS.DELETE_ONBOARDING
    ],
    category: 'HR'
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Department management and oversight',
    permissions: [
      PERMISSIONS.VIEW_EMPLOYEES,
      PERMISSIONS.VIEW_EMPLOYEE_DETAILS,
      PERMISSIONS.VIEW_DEPARTMENTS,
      PERMISSIONS.VIEW_DEPARTMENT_DETAILS,
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.VIEW_PROJECT_DETAILS,
      PERMISSIONS.VIEW_TASKS,
      PERMISSIONS.VIEW_TASK_DETAILS,
    ],
    category: 'Management'
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Basic employee access',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_EMPLOYEE_DETAILS,
      PERMISSIONS.VIEW_TASKS,
      PERMISSIONS.VIEW_TASK_DETAILS,
    ],
    category: 'Basic'
  }
];

// Add permission dependencies
const PERMISSION_DEPENDENCIES: PermissionDependency[] = [
  {
    permission: PERMISSIONS.MANAGE_EMPLOYEES,
    requires: [PERMISSIONS.VIEW_EMPLOYEES]
  },
  {
    permission: PERMISSIONS.MANAGE_DEPARTMENTS,
    requires: [PERMISSIONS.VIEW_DEPARTMENTS]
  },
  {
    permission: PERMISSIONS.MANAGE_PROJECTS,
    requires: [PERMISSIONS.VIEW_PROJECTS]
  }
];

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
    users 
  } = useAuth();
  
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = useState<boolean>(false);
  const [roleToAssignUser, setRoleToAssignUser] = useState<Role | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [roleSearchTerm, setRoleSearchTerm] = useState<string>('');
  const [viewUsersRole, setViewUsersRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(null);
  const [roleHistory, setRoleHistory] = useState<RoleHistory[]>([
    {
      id: '1',
      roleName: 'Administrator',
      action: 'created',
      changes: [],
      timestamp: new Date().toISOString(),
      user: 'System'
    }
  ]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showDependencies, setShowDependencies] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [rolesToCompare, setRolesToCompare] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

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
    showDependencies,
    setShowDependencies,
    isComparing,
    setIsComparing,
    rolesToCompare,
    setRolesToCompare,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    roleToDelete,
    setRoleToDelete,
    isBulkDeleteDialogOpen,
    setIsBulkDeleteDialogOpen,
  };
};

// Memoized components for better performance
const RoleTable = React.memo(({ 
  roles, 
  users, 
  onEdit, 
  onDelete, 
  onAssignUser, 
  onViewUsers,
  hasPermission,
  roleSearchTerm,
  selectedRoles,
  onRoleSelect,
  isLoading,
  roleToDelete
}: {
  roles: Role[];
  users: MockUser[];
  onEdit: (role: Role) => void;
  onDelete: (roleName: string) => void;
  onAssignUser: (role: Role) => void;
  onViewUsers: (role: Role) => void;
  hasPermission: (permission: string) => boolean;
  roleSearchTerm: string;
  selectedRoles: string[];
  onRoleSelect: (roleName: string) => void;
  isLoading: boolean;
  roleToDelete: string | null;
}) => {
  const filteredRoles = useMemo(() => 
    roles.filter(role =>
      role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(roleSearchTerm.toLowerCase()))
    ),
    [roles, roleSearchTerm]
  );

  // Check if a role is a system role
  const isSystemRole = (roleName: string) => {
    const systemRoles = ['Administrator', 'Admin'];
    return systemRoles.some(r => r.toLowerCase() === roleName.toLowerCase());
  };

  return (
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
        {filteredRoles.map(role => {
          const assignedUsers = users.filter(user => user.role === role.name);
          const isDeleting = isLoading && roleToDelete === role.name;
          const isSystem = isSystemRole(role.name);
          
          return (
            <TableRow key={role.id} className={`${isDeleting ? 'opacity-50' : ''} ${role.pending ? 'opacity-50' : ''}`}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <Badge variant={isSystem ? "secondary" : "outline"}>
                    {role.name}
                    {isSystem && (
                      <Shield className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                  {isSystem && (
                    <Badge variant="outline" className="text-xs">
                      System
                    </Badge>
                  )}
                  {isDeleting && (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                      <span>Deleting...</span>
                    </div>
                  )}
                  {role.pending && (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                      <span>Creating...</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {role.description || (isSystem ? 'System Role' : 'Custom Role')}
              </TableCell>
              <TableCell>
                <span className="font-semibold">{assignedUsers.length}</span>
                {assignedUsers.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => onViewUsers(role)}
                    disabled={isDeleting || role.pending}
                  >
                    View Users
                  </Button>
                )}
              </TableCell>
              <TableCell className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(role)}
                        disabled={!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions) || isDeleting || role.pending}
                      >
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit role permissions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(role.name)}
                        disabled={!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions) || isLoading || role.pending || isSystem}
                      >
                        {isDeleting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isSystem ? 'System roles cannot be deleted' : 'Delete role'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => onAssignUser(role)}
                        disabled={!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions) || isDeleting || role.pending}
                      >
                        <UserPlus className="w-4 h-4 mr-2" /> Add User
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assign users to this role</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
});

RoleTable.displayName = 'RoleTable';

export default function RolesPermissions() {
  const { toast } = useToast();
  const {
    roles,
    users,
    updateRole,
    createRole,
    deleteRole,
    assignRoleToUser,
    unassignRoleFromUser,
    hasPermission,
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
    showDependencies,
    setShowDependencies,
    isComparing,
    setIsComparing,
    rolesToCompare,
    setRolesToCompare,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    roleToDelete,
    setRoleToDelete,
    isBulkDeleteDialogOpen,
    setIsBulkDeleteDialogOpen,
  } = useRoleManagement();

  // Add effect to listen for roles updates
  useEffect(() => {
    const handleRolesUpdated = (event: CustomEvent) => {
      const { action, roleName, roleId } = event.detail;
      
      if (action === 'deleted') {
        // Clear any selected roles that were deleted
        setSelectedRoles(prev => prev.filter(role => role !== roleName));
        
        // Clear selected role if it was deleted
        if (selectedRole?.name === roleName) {
          setSelectedRole(null);
        }
        
        // Clear role to assign if it was deleted
        if (roleToAssignUser?.name === roleName) {
          setRoleToAssignUser(null);
          setIsAssignUserDialogOpen(false);
        }
        
        // Clear view users role if it was deleted
        if (viewUsersRole?.name === roleName) {
          setViewUsersRole(null);
        }
        
        // Clear role to delete if it was deleted
        if (roleToDelete === roleName) {
          setRoleToDelete(null);
          setIsDeleteDialogOpen(false);
        }
      }
    };

    window.addEventListener('rolesUpdated', handleRolesUpdated as EventListener);
    return () => {
      window.removeEventListener('rolesUpdated', handleRolesUpdated as EventListener);
    };
  }, [selectedRole, roleToAssignUser, viewUsersRole, roleToDelete]);

  const handlePermissionChange = useCallback((roleName: string, permission: string, checked: boolean) => {
    if (!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit role permissions.",
        variant: "destructive",
      });
      return;
    }

    const role = roles.find(r => r.name === roleName);
    if (!role) return;

    const updatedPermissions = checked
      ? [...(role.permissions || []), permission]
      : (role.permissions || []).filter(p => p !== permission);

    updateRole(roleName, updatedPermissions);
    
    // Add to history
    setRoleHistory(prev => [
      {
        id: Date.now().toString(),
        roleName: roleName,
        action: 'updated',
        changes: [
          {
            field: 'permissions',
            oldValue: role.permissions || [],
            newValue: updatedPermissions
          }
        ],
        timestamp: new Date().toISOString(),
        user: 'Current User' // Replace with actual user name
      },
      ...prev
    ]);
    
    toast({
      title: "Success",
      description: `Permissions updated for ${roleName} role.`,
    });
  }, [hasPermission, roles, toast, updateRole]);

  const handleNewRolePermissionChange = useCallback((permission: string, checked: boolean) => {
    if (!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create new roles.",
        variant: "destructive",
      });
      return;
    }

    setNewRolePermissions(prev =>
      checked ? [...prev, permission] : prev.filter(p => p !== permission)
    );
  }, [hasPermission, toast]);

  const handleCreateRole = useCallback(async () => {
    if (!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create new roles.",
        variant: "destructive",
      });
      return;
    }

    if (!newRoleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required.",
        variant: "destructive",
      });
      return;
    }

    if (roles.some(role => role.name === newRoleName)) {
      toast({
        title: "Error",
        description: "A role with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createRole({
        name: newRoleName,
        permissions: newRolePermissions,
        description: `Custom role: ${newRoleName}`,
      });

      // Add to history
      setRoleHistory(prev => [
        {
          id: Date.now().toString(),
          roleName: newRoleName,
          action: 'created',
          changes: [
            {
              field: 'permissions',
              oldValue: [],
              newValue: newRolePermissions
            }
          ],
          timestamp: new Date().toISOString(),
          user: 'Current User' // Replace with actual user name
        },
        ...prev
      ]);

      setNewRoleName('');
      setNewRolePermissions([]);
      toast({
        title: "Success",
        description: "New role created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, newRoleName, newRolePermissions, roles, toast, createRole]);

  const handleDeleteRole = useCallback((roleName: string) => {
    if (!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete roles.",
        variant: "destructive",
      });
      return;
    }

    const usersWithRole = users.filter(user => user.role === roleName);
    if (usersWithRole.length > 0) {
      toast({
        title: "Error",
        description: "Cannot delete role that is assigned to users. Please unassign users first.",
        variant: "destructive",
      });
      return;
    }

    setRoleToDelete(roleName);
    setIsDeleteDialogOpen(true);
  }, [hasPermission, users, toast]);

  const confirmDeleteRole = useCallback(async () => {
    if (!roleToDelete) return;

    setIsLoading(true);
    try {
      const roleToDeleteObj = roles.find(r => r.name === roleToDelete);
      await deleteRole(roleToDelete);

      // Add to history
      if (roleToDeleteObj) {
        setRoleHistory(prev => [
          {
            id: Date.now().toString(),
            roleName: roleToDelete,
            action: 'deleted',
            changes: [
              {
                field: 'permissions',
                oldValue: roleToDeleteObj.permissions || [],
                newValue: []
              }
            ],
            timestamp: new Date().toISOString(),
            user: 'Current User'
          },
          ...prev
        ]);
      }

      // Clear any UI state related to the deleted role
      setSelectedRoles(prev => prev.filter(role => role !== roleToDelete));
      if (selectedRole?.name === roleToDelete) {
        setSelectedRole(null);
      }
      if (roleToAssignUser?.name === roleToDelete) {
        setRoleToAssignUser(null);
        setIsAssignUserDialogOpen(false);
      }
      if (viewUsersRole?.name === roleToDelete) {
        setViewUsersRole(null);
      }

      // Success toast is now handled by AuthContext
    } catch (error: any) {
      console.error('Error deleting role:', error);
      // Error toast is now handled by AuthContext
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  }, [roleToDelete, roles, deleteRole, selectedRole, roleToAssignUser, viewUsersRole]);

  const handleBulkDelete = async () => {
    if (!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete roles.",
        variant: "destructive",
      });
      return;
    }

    setIsBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setIsLoading(true);
      for (const roleName of selectedRoles) {
        await deleteRole(roleName);
      }
      setSelectedRoles([]);
      // Success toast is now handled by AuthContext for each individual role
    } catch (error) {
      console.error('Error in bulk delete:', error);
      // Error toast is now handled by AuthContext
    } finally {
      setIsLoading(false);
      setIsBulkDeleteDialogOpen(false);
    }
  };

  const handleOpenAssignUserDialog = useCallback((role: Role) => {
    if (!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions)) {
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
  }, [hasPermission, toast]);

  const handleAssignUser = useCallback((userId: string) => {
    if (!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to assign users to roles.",
        variant: "destructive",
      });
      return;
    }

    if (!roleToAssignUser) return;

    setIsLoading(true);
    try {
      assignRoleToUser(userId, roleToAssignUser.name);
      toast({
        title: "Success",
        description: "User role has been updated successfully.",
      });
      setIsAssignUserDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign role to user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, roleToAssignUser, toast, assignRoleToUser]);

  const handleUnassignUser = useCallback((userId: string) => {
    if (!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to unassign users from roles.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      unassignRoleFromUser(userId);
      toast({
        title: "Success",
        description: "User role has been unassigned successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unassign role from user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, toast, unassignRoleFromUser]);

  const filteredUsers = useMemo(() => 
    users.filter((user: MockUser) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    ),
    [users, userSearchTerm]
  );

  const handleTemplateSelect = (template: RoleTemplate) => {
    setNewRoleName(template.name);
    setNewRolePermissions(template.permissions);
    setSelectedTemplate(template);
  };

  const handleRoleCompare = (role1: string, role2: string) => {
    setRolesToCompare([role1, role2]);
    setIsComparing(true);
  };

  const checkPermissionDependencies = (permission: string, currentPermissions: string[]) => {
    const dependency = PERMISSION_DEPENDENCIES.find(d => d.permission === permission);
    if (!dependency) return true;
    return dependency.requires.every(req => currentPermissions.includes(req));
  };

  return (
    <PermissionGuard requiredPermission={COMPONENT_PERMISSIONS.RolesPermissions}>
      <div className="space-y-6 p-6 pb-16">
        {/* Enhanced Header Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
              <p className="text-muted-foreground">
                Manage user roles and their associated permissions
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isLoading && (
                <div className="flex items-center space-x-2 bg-muted/50 px-4 py-2 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Processing...</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (rolesToCompare.length === 2) {
                    handleRoleCompare(rolesToCompare[0], rolesToCompare[1]);
                  }
                }}
                className="h-10 rounded-lg"
              >
                <GitCompare className="mr-2 h-4 w-4" />
                Compare Roles
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Roles</div>
                    <div className="text-2xl font-bold">{roles.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Active Users</div>
                    <div className="text-2xl font-bold">{users.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Permission Groups</div>
                    <div className="text-2xl font-bold">{Object.keys(permissionGroups).length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <History className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Recent Changes</div>
                    <div className="text-2xl font-bold">{roleHistory.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDependencies(!showDependencies)}
              className="h-9"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {showDependencies ? 'Hide Dependencies' : 'Show Dependencies'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTemplate(null)}
              className="h-9"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Template
            </Button>
            {selectedRoles.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="h-9"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedRoles.length})
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Role
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            {/* Existing Roles Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-xl">
                      <Users className="mr-2 h-5 w-5" /> Existing Roles
                    </CardTitle>
                    <CardDescription>Manage permissions for existing roles</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search roles..."
                      value={roleSearchTerm}
                      onChange={e => setRoleSearchTerm(e.target.value)}
                      className="w-64 pl-9 h-10 rounded-lg"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <RoleTable
                    roles={roles}
                    users={users}
                    onEdit={setSelectedRole}
                    onDelete={handleDeleteRole}
                    onAssignUser={handleOpenAssignUserDialog}
                    onViewUsers={setViewUsersRole}
                    hasPermission={hasPermission}
                    roleSearchTerm={roleSearchTerm}
                    selectedRoles={selectedRoles}
                    onRoleSelect={(roleName) => {
                      setSelectedRoles(prev =>
                        prev.includes(roleName)
                          ? prev.filter(r => r !== roleName)
                          : [...prev, roleName]
                      );
                    }}
                    isLoading={isLoading}
                    roleToDelete={roleToDelete}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            {/* Create Role Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-xl">
                      <UserPlus className="mr-2 h-5 w-5" /> Create New Role
                    </CardTitle>
                    <CardDescription>Define a new role and assign its permissions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Role Templates */}
                <div className="space-y-2">
                  <Label className="text-base">Role Templates</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ROLE_TEMPLATES.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                            {selectedTemplate?.id === template.id && (
                              <CheckCircle2 className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Role Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="newRoleName" className="text-base">Role Name</Label>
                  <Input
                    id="newRoleName"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g., Team Lead"
                    disabled={!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions) || isLoading}
                    className="h-10 rounded-lg"
                  />
                </div>

                {/* Permissions Section */}
                <div className="space-y-4">
                  <Label className="text-base">Assign Permissions</Label>
                  <ScrollArea className="h-[400px] rounded-lg border bg-card">
                    <div className="p-4 space-y-6">
                      {Object.entries(permissionGroups).map(([category, { description, permissions }]) => (
                        <Accordion type="single" collapsible key={category}>
                          <AccordionItem value={category}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-lg">{category}</h4>
                                  <Badge variant="outline" className="ml-2">
                                    {permissions.length} permissions
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`select-all-${category}`}
                                    checked={permissions.every(permission => 
                                      newRolePermissions.includes(permission)
                                    )}
                                    onCheckedChange={(checked: boolean) => {
                                      if (checked) {
                                        const newPermissions = [...newRolePermissions];
                                        (permissions as string[]).forEach(permission => {
                                          if (!newPermissions.includes(permission)) {
                                            newPermissions.push(permission);
                                          }
                                        });
                                        setNewRolePermissions(newPermissions);
                                      } else {
                                        setNewRolePermissions(prev => 
                                          prev.filter(p => !(permissions as string[]).includes(p))
                                        );
                                      }
                                    }}
                                    disabled={!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions) || isLoading}
                                  />
                                  <label
                                    htmlFor={`select-all-${category}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Select All
                                  </label>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">{description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                  {permissions.map((permission) => {
                                    const hasDependencies = PERMISSION_DEPENDENCIES.some(
                                      d => d.permission === permission
                                    );
                                    const isEnabled = !showDependencies || 
                                      checkPermissionDependencies(permission, newRolePermissions);

                                    return (
                                      <div
                                        key={permission}
                                        className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                                          isEnabled
                                            ? 'hover:bg-muted/50'
                                            : 'opacity-50 cursor-not-allowed'
                                        }`}
                                      >
                                        <Checkbox
                                          id={`new-role-${permission}`}
                                          checked={newRolePermissions.includes(permission)}
                                          onCheckedChange={(checked: boolean) => 
                                            isEnabled && handleNewRolePermissionChange(permission, checked)
                                          }
                                          disabled={!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions) || 
                                            isLoading || !isEnabled}
                                        />
                                        <div className="flex-1">
                                          <label
                                            htmlFor={`new-role-${permission}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            {permission.replace(/_/g, ' ')}
                                          </label>
                                          {showDependencies && hasDependencies && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              Requires: {PERMISSION_DEPENDENCIES
                                                .find(d => d.permission === permission)
                                                ?.requires.map(r => r.replace(/_/g, ' '))
                                                .join(', ')}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleCreateRole} 
                    disabled={!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions) || isLoading}
                    className="w-full sm:w-auto h-10 rounded-lg bg-[#000000] hover:bg-[#000000] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Create Role
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* Role History Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <History className="mr-2 h-5 w-5" /> Role History
                </CardTitle>
                <CardDescription>Track changes made to roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {roleHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No role history available
                      </div>
                    ) : (
                      roleHistory.map((history) => (
                        <div key={history.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="p-2 rounded-full bg-muted">
                            {history.action === 'created' && <Plus className="h-4 w-4" />}
                            {history.action === 'updated' && <Edit2 className="h-4 w-4" />}
                            {history.action === 'deleted' && <Trash2 className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{history.roleName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {history.action.charAt(0).toUpperCase() + history.action.slice(1)} by {history.user}
                                </p>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(history.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {history.changes.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {history.changes.map((change, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium">{change.field}:</span>{' '}
                                    <span className="text-muted-foreground">
                                      {change.field === 'permissions' ? (
                                        <span>
                                          {change.oldValue.length} → {change.newValue.length} permissions
                                        </span>
                                      ) : (
                                        <span>
                                          {JSON.stringify(change.oldValue)} → {JSON.stringify(change.newValue)}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Role</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the role "{roleToDelete}"? 
                {(() => {
                  const usersWithRole = users.filter(user => user.role === roleToDelete);
                  return usersWithRole.length > 0 
                    ? ` This role is currently assigned to ${usersWithRole.length} user(s). You must unassign all users before deleting this role.`
                    : " This action cannot be undone.";
                })()}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteRole}
                disabled={(() => {
                  const usersWithRole = users.filter(user => user.role === roleToDelete);
                  return usersWithRole.length > 0;
                })()}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Selected Roles</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedRoles.length} selected roles? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmBulkDelete}>
                Delete All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Comparison Dialog */}
        <Dialog open={isComparing} onOpenChange={setIsComparing}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Compare Roles</DialogTitle>
              <DialogDescription>
                Select two roles to compare their permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={rolesToCompare[0]}
                  onValueChange={(value) => setRolesToCompare([value, rolesToCompare[1]])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select first role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={rolesToCompare[1]}
                  onValueChange={(value) => setRolesToCompare([rolesToCompare[0], value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select second role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {rolesToCompare[0] && rolesToCompare[1] && (
                <div className="border rounded-lg">
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-[50%]">Permission</TableHead>
                          <TableHead className="text-center">{rolesToCompare[0]}</TableHead>
                          <TableHead className="text-center">{rolesToCompare[1]}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(permissionGroups).map(([category, { permissions }]) => (
                          <React.Fragment key={category}>
                            <TableRow className="bg-muted/50">
                              <TableCell colSpan={3} className="font-semibold">
                                {category}
                              </TableCell>
                            </TableRow>
                            {permissions.map((permission) => {
                              const role1 = roles.find(r => r.name === rolesToCompare[0]);
                              const role2 = roles.find(r => r.name === rolesToCompare[1]);
                              const hasPermission1 = (role1?.permissions || []).includes(permission);
                              const hasPermission2 = (role2?.permissions || []).includes(permission);

                              return (
                                <TableRow key={permission}>
                                  <TableCell className="font-medium">
                                    {permission.replace(/_/g, ' ')}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {hasPermission1 ? (
                                      <div className="flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <span className="sr-only">Has permission</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center">
                                        <XCircle className="h-5 w-5 text-red-500" />
                                        <span className="sr-only">No permission</span>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {hasPermission2 ? (
                                      <div className="flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <span className="sr-only">Has permission</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center">
                                        <XCircle className="h-5 w-5 text-red-500" />
                                        <span className="sr-only">No permission</span>
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        {selectedRole && (
          <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader className="space-y-4">
                <DialogTitle className="flex items-center text-xl">
                  <Pencil className="mr-2 h-5 w-5" /> Edit Permissions for {selectedRole.name}
                </DialogTitle>
                <DialogDescription>
                  Adjust the permissions for the {selectedRole.name} role. Changes will be reflected immediately for all users with this role.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <ScrollArea className="h-[500px] rounded-lg border bg-card">
                  <div className="p-4 space-y-6">
                    {Object.entries(permissionGroups).map(([category, { description, permissions }]) => (
                      <div key={category} className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-lg">{category}</h4>
                              <p className="text-sm text-muted-foreground">{description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`select-all-${category}-edit`}
                                checked={permissions.every(permission => 
                                  (selectedRole.permissions || []).includes(permission)
                                )}
                                onCheckedChange={(checked: boolean) => {
                                  if (checked) {
                                    const newPermissions = [...(selectedRole.permissions || [])];
                                    (permissions as string[]).forEach(permission => {
                                      if (!newPermissions.includes(permission)) {
                                        newPermissions.push(permission);
                                      }
                                    });
                                    setSelectedRole(prev => {
                                      if (!prev) return null;
                                      return { ...prev, permissions: newPermissions };
                                    });
                                    (permissions as string[]).forEach(permission => {
                                      handlePermissionChange(selectedRole.name, permission, true);
                                    });
                                  } else {
                                    const newPermissions = (selectedRole.permissions || []).filter(
                                      p => !(permissions as string[]).includes(p)
                                    );
                                    setSelectedRole(prev => {
                                      if (!prev) return null;
                                      return { ...prev, permissions: newPermissions };
                                    });
                                    (permissions as string[]).forEach(permission => {
                                      handlePermissionChange(selectedRole.name, permission, false);
                                    });
                                  }
                                }}
                                disabled={!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions) || isLoading}
                              />
                              <label
                                htmlFor={`select-all-${category}-edit`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Select All
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {permissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                              <Checkbox 
                                id={`${selectedRole.name}-${permission}`}
                                checked={(selectedRole.permissions || []).includes(permission)}
                                onCheckedChange={(checked: boolean) => {
                                  handlePermissionChange(selectedRole.name, permission, checked);
                                  setSelectedRole(prev => {
                                    if (!prev) return null;
                                    const updatedPermissions = checked
                                      ? [...(prev.permissions || []), permission]
                                      : (prev.permissions || []).filter(p => p !== permission);
                                    return { ...prev, permissions: updatedPermissions };
                                  });
                                }}
                                disabled={!hasPermission(COMPONENT_PERMISSIONS.RolesPermissions) || isLoading}
                              />
                              <label
                                htmlFor={`${selectedRole.name}-${permission}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {permission.replace(/_/g, ' ')}
                              </label>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedRole(null)}
                  className="h-10 rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedRole) {
                      // Update all permissions for the role
                      updateRole(selectedRole.name, selectedRole.permissions || []);
                      
                      // Add to history
                      setRoleHistory(prev => [
                        {
                          id: Date.now().toString(),
                          roleName: selectedRole.name,
                          action: 'updated',
                          changes: [
                            {
                              field: 'permissions',
                              oldValue: roles.find(r => r.name === selectedRole.name)?.permissions || [],
                              newValue: selectedRole.permissions || []
                            }
                          ],
                          timestamp: new Date().toISOString(),
                          user: 'Current User'
                        },
                        ...prev
                      ]);
                    }
                    setSelectedRole(null);
                    toast({
                      title: "Success",
                      description: `Permissions for ${selectedRole?.name} role have been updated.`,
                    });
                  }}
                  className="h-10 rounded-lg bg-[#000000] hover:bg-[#000000] text-white"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Assign User Dialog */}
        <Dialog open={isAssignUserDialogOpen} onOpenChange={setIsAssignUserDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Assign Users to Role</DialogTitle>
              <DialogDescription>
                Select users to assign to the {roleToAssignUser?.name} role
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  className="pl-9 h-10 rounded-lg"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[300px] rounded-lg border bg-card">
                <div className="p-4 space-y-2">
                  {filteredUsers.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No users found</AlertTitle>
                      <AlertDescription>
                        Try adjusting your search criteria.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    filteredUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email} - {user.role}</p>
                        </div>
                        <div className="flex space-x-2">
                          {user.role === roleToAssignUser?.name ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUnassignUser(user.id)}
                              disabled={isLoading}
                              className="h-8 rounded-lg"
                            >
                              Unassign
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleAssignUser(user.id)}
                              disabled={isLoading}
                              className="h-8 rounded-lg bg-[#000000] hover:bg-[#000000] text-white"
                            >
                              Assign
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Users Dialog */}
        {viewUsersRole && (
          <Dialog open={!!viewUsersRole} onOpenChange={() => setViewUsersRole(null)}>
            <DialogContent>
              <DialogHeader className="space-y-4">
                <DialogTitle className="text-xl">Users assigned to {viewUsersRole.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {users.filter(user => user.role === viewUsersRole.name).length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No users assigned</AlertTitle>
                    <AlertDescription>
                      There are no users currently assigned to this role.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <ScrollArea className="h-[300px] rounded-lg border bg-card">
                      <div className="p-4 space-y-2">
                        {users.filter(user => user.role === viewUsersRole.name).map(user => (
                          <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div>
                              <span className="font-medium">{user.name}</span>
                              <span className="ml-2 text-sm text-muted-foreground">{user.email}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => {
                                handleUnassignUser(user.id);
                                toast({
                                  title: 'Success',
                                  description: `User ${user.name} has been unassigned from this role.`,
                                });
                              }}
                              disabled={isLoading}
                              className="h-8 rounded-lg"
                            >
                              Unassign
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <Button
                      variant="outline"
                      className="w-full h-10 rounded-lg"
                      onClick={() => {
                        users.filter(user => user.role === viewUsersRole.name).forEach(user => {
                          handleUnassignUser(user.id);
                        });
                        toast({
                          title: 'Success',
                          description: `All users have been unassigned from the ${viewUsersRole.name} role.`,
                        });
                        setViewUsersRole(null);
                      }}
                      disabled={isLoading}
                    >
                      Unassign All
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PermissionGuard>
  );
} 