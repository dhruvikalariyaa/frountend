import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import { authService } from '../services/auth.service';
import { roleService } from '../services/role.service';
import { Role } from '../types/models';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
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
  updateUserRole: (userId: string, role: string) => void;
  updateUserPermissions: (permissions: string[]) => void;
  users: MockUser[];
  roles: Role[];
  userRoles: Record<string, string>;
  updateRole: (roleName: string, permissions: string[]) => void;
  createRole: (role: Partial<Role>) => void;
  deleteRole: (roleName: string) => void;
  assignRoleToUser: (userId: string, roleName: string) => void;
  unassignRoleFromUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Define all available permissions with module-based structure
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  
  // Employee Management
  VIEW_EMPLOYEES: 'VIEW_EMPLOYEES',
  MANAGE_EMPLOYEES: 'MANAGE_EMPLOYEES',
  VIEW_DEPARTMENTS: 'VIEW_DEPARTMENTS',
  MANAGE_DEPARTMENTS: 'MANAGE_DEPARTMENTS',
  VIEW_ATTENDANCE: 'VIEW_ATTENDANCE',
  MANAGE_ATTENDANCE: 'MANAGE_ATTENDANCE',
  VIEW_PERFORMANCE: 'VIEW_PERFORMANCE',
  MANAGE_PERFORMANCE: 'MANAGE_PERFORMANCE',
  VIEW_LEAVE: 'VIEW_LEAVE',
  MANAGE_LEAVE: 'MANAGE_LEAVE',
  
  // Employee Component Permissions
  VIEW_EMPLOYEE_DETAILS: 'VIEW_EMPLOYEE_DETAILS',
  EDIT_EMPLOYEE_DETAILS: 'EDIT_EMPLOYEE_DETAILS',
  DELETE_EMPLOYEE: 'DELETE_EMPLOYEE',
  VIEW_DEPARTMENT_DETAILS: 'VIEW_DEPARTMENT_DETAILS',
  EDIT_DEPARTMENT_DETAILS: 'EDIT_DEPARTMENT_DETAILS',
  DELETE_DEPARTMENT: 'DELETE_DEPARTMENT',
  VIEW_ATTENDANCE_DETAILS: 'VIEW_ATTENDANCE_DETAILS',
  EDIT_ATTENDANCE: 'EDIT_ATTENDANCE',
  DELETE_ATTENDANCE: 'DELETE_ATTENDANCE',
  VIEW_PERFORMANCE_DETAILS: 'VIEW_PERFORMANCE_DETAILS',
  EDIT_PERFORMANCE: 'EDIT_PERFORMANCE',
  DELETE_PERFORMANCE: 'DELETE_PERFORMANCE',
  VIEW_LEAVE_DETAILS: 'VIEW_LEAVE_DETAILS',
  APPROVE_LEAVE: 'APPROVE_LEAVE',
  REJECT_LEAVE: 'REJECT_LEAVE',
  DELETE_LEAVE: 'DELETE_LEAVE',
  EDIT_LEAVE_DETAILS: 'EDIT_LEAVE_DETAILS',
  
  // Hiring Management
  VIEW_JOBS: 'VIEW_JOBS',
  MANAGE_JOBS: 'MANAGE_JOBS',
  VIEW_CANDIDATES: 'VIEW_CANDIDATES',
  MANAGE_CANDIDATES: 'MANAGE_CANDIDATES',
  VIEW_INTERVIEWS: 'VIEW_INTERVIEWS',
  MANAGE_INTERVIEWS: 'MANAGE_INTERVIEWS',
  VIEW_ONBOARDING: 'VIEW_ONBOARDING',
  MANAGE_ONBOARDING: 'MANAGE_ONBOARDING',
  
  // Hiring Component Permissions
  VIEW_JOB_DETAILS: 'VIEW_JOB_DETAILS',
  EDIT_JOB_DETAILS: 'EDIT_JOB_DETAILS',
  DELETE_JOB: 'DELETE_JOB',
  VIEW_CANDIDATE_DETAILS: 'VIEW_CANDIDATE_DETAILS',
  EDIT_CANDIDATE_DETAILS: 'EDIT_CANDIDATE_DETAILS',
  DELETE_CANDIDATE: 'DELETE_CANDIDATE',
  VIEW_INTERVIEW_DETAILS: 'VIEW_INTERVIEW_DETAILS',
  DELETE_INTERVIEW: 'DELETE_INTERVIEW',
  SCHEDULE_INTERVIEW: 'SCHEDULE_INTERVIEW',
  EDIT_INTERVIEW: 'EDIT_INTERVIEW',
  VIEW_ONBOARDING_DETAILS: 'VIEW_ONBOARDING_DETAILS',
  MANAGE_ONBOARDING_TASKS: 'MANAGE_ONBOARDING_TASKS',
  EDIT_ONBOARDING_DETAILS: 'EDIT_ONBOARDING_DETAILS',
  DELETE_ONBOARDING: 'DELETE_ONBOARDING',
  
  // Project Management
  VIEW_PROJECTS: 'VIEW_PROJECTS',
  MANAGE_PROJECTS: 'MANAGE_PROJECTS',
  VIEW_TASKS: 'VIEW_TASKS',
  MANAGE_TASKS: 'MANAGE_TASKS',
  
  // Project Component Permissions
  VIEW_PROJECT_DETAILS: 'VIEW_PROJECT_DETAILS',
  EDIT_PROJECT_DETAILS: 'EDIT_PROJECT_DETAILS',
  DELETE_PROJECT: 'DELETE_PROJECT',
  VIEW_TASK_DETAILS: 'VIEW_TASK_DETAILS',
  EDIT_TASK_DETAILS: 'EDIT_TASK_DETAILS',
  DELETE_TASK: 'DELETE_TASK',
  VIEW_SPRINT_DETAILS: 'VIEW_SPRINT_DETAILS',
  EDIT_SPRINT_DETAILS: 'EDIT_SPRINT_DETAILS',
  DELETE_SPRINT: 'DELETE_SPRINT',
  MANAGE_SPRINTS: 'MANAGE_SPRINTS',
  VIEW_TIMELINE: 'VIEW_TIMELINE',
  EDIT_TIMELINE: 'EDIT_TIMELINE',
  VIEW_RESOURCES: 'VIEW_RESOURCES',
  ALLOCATE_RESOURCES: 'ALLOCATE_RESOURCES',
  VIEW_DELIVERABLES: 'VIEW_DELIVERABLES',
  MANAGE_DELIVERABLES: 'MANAGE_DELIVERABLES',
  EDIT_DELIVERABLE_DETAILS: 'EDIT_DELIVERABLE_DETAILS',
  DELETE_DELIVERABLE: 'DELETE_DELIVERABLE',
  VIEW_DELIVERABLE_DETAILS: 'VIEW_DELIVERABLE_DETAILS',
  
  // Sales & Clients
  VIEW_CLIENTS: 'VIEW_CLIENTS',
  MANAGE_CLIENTS: 'MANAGE_CLIENTS',
  VIEW_PROPOSALS: 'VIEW_PROPOSALS',
  MANAGE_PROPOSALS: 'MANAGE_PROPOSALS',
  VIEW_CONTRACTS: 'VIEW_CONTRACTS',
  MANAGE_CONTRACTS: 'MANAGE_CONTRACTS',
  VIEW_DEALS: 'VIEW_DEALS',
  MANAGE_DEALS: 'MANAGE_DEALS',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  MANAGE_ANALYTICS: 'MANAGE_ANALYTICS',
  
  // Sales Component Permissions
  VIEW_CLIENT_DETAILS: 'VIEW_CLIENT_DETAILS',
  EDIT_CLIENT_DETAILS: 'EDIT_CLIENT_DETAILS',
  DELETE_CLIENT: 'DELETE_CLIENT',
  VIEW_PROPOSAL_DETAILS: 'VIEW_PROPOSAL_DETAILS',
  EDIT_PROPOSAL_DETAILS: 'EDIT_PROPOSAL_DETAILS',
  DELETE_PROPOSAL: 'DELETE_PROPOSAL',
  VIEW_CONTRACT_DETAILS: 'VIEW_CONTRACT_DETAILS',
  EDIT_CONTRACT_DETAILS: 'EDIT_CONTRACT_DETAILS',
  DELETE_CONTRACT: 'DELETE_CONTRACT',
  VIEW_REVENUE_DETAILS: 'VIEW_REVENUE_DETAILS',
  MANAGE_REVENUE: 'MANAGE_REVENUE',
  VIEW_DEAL_DETAILS: 'VIEW_DEAL_DETAILS',
  EDIT_DEAL_DETAILS: 'EDIT_DEAL_DETAILS',
  DELETE_DEAL: 'DELETE_DEAL',
  
  // Asset Management
  VIEW_ASSETS: 'VIEW_ASSETS',
  MANAGE_ASSETS: 'MANAGE_ASSETS',
  VIEW_LICENSES: 'VIEW_LICENSES',
  MANAGE_LICENSES: 'MANAGE_LICENSES',
  VIEW_MAINTENANCE: 'VIEW_MAINTENANCE',
  MANAGE_MAINTENANCE: 'MANAGE_MAINTENANCE',
  
  // Asset Component Permissions
  VIEW_ASSET_DETAILS: 'VIEW_ASSET_DETAILS',
  EDIT_ASSET_DETAILS: 'EDIT_ASSET_DETAILS',
  DELETE_ASSET: 'DELETE_ASSET',
  VIEW_LICENSE_DETAILS: 'VIEW_LICENSE_DETAILS',
  EDIT_LICENSE_DETAILS: 'EDIT_LICENSE_DETAILS',
  DELETE_LICENSE: 'DELETE_LICENSE',
  VIEW_MAINTENANCE_DETAILS: 'VIEW_MAINTENANCE_DETAILS',
  SCHEDULE_MAINTENANCE: 'SCHEDULE_MAINTENANCE',
  EDIT_MAINTENANCE: 'EDIT_MAINTENANCE',
  DELETE_MAINTENANCE: 'DELETE_MAINTENANCE',
  
  // Finance
  VIEW_INVOICES: 'VIEW_INVOICES',
  MANAGE_INVOICES: 'MANAGE_INVOICES',
  VIEW_EXPENSES: 'VIEW_EXPENSES',
  MANAGE_EXPENSES: 'MANAGE_EXPENSES',
  VIEW_PAYROLL: 'VIEW_PAYROLL',
  MANAGE_PAYROLL: 'MANAGE_PAYROLL',
  VIEW_REPORTS: 'VIEW_REPORTS',
  MANAGE_REPORTS: 'MANAGE_REPORTS',
  
  // Finance Component Permissions
  VIEW_INVOICE_DETAILS: 'VIEW_INVOICE_DETAILS',
  EDIT_INVOICE_DETAILS: 'EDIT_INVOICE_DETAILS',
  DELETE_INVOICE: 'DELETE_INVOICE',
  VIEW_EXPENSE_DETAILS: 'VIEW_EXPENSE_DETAILS',
  EDIT_EXPENSE_DETAILS: 'EDIT_EXPENSE_DETAILS',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  VIEW_PAYROLL_DETAILS: 'VIEW_PAYROLL_DETAILS',
  EDIT_PAYROLL_DETAILS: 'EDIT_PAYROLL_DETAILS',
  VIEW_REPORT_DETAILS: 'VIEW_REPORT_DETAILS',
  GENERATE_REPORTS: 'GENERATE_REPORTS',
  PROCESS_PAYROLL: 'PROCESS_PAYROLL',
  DELETE_PAYROLL: 'DELETE_PAYROLL',
  EDIT_REPORT_DETAILS: 'EDIT_REPORT_DETAILS',
  DELETE_REPORT: 'DELETE_REPORT',
  
  // Settings
  VIEW_SETTINGS: 'VIEW_SETTINGS',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_ROLES: 'MANAGE_ROLES',
  
  // Settings Component Permissions
  VIEW_COMPANY_PROFILE: 'VIEW_COMPANY_PROFILE',
  EDIT_COMPANY_PROFILE: 'EDIT_COMPANY_PROFILE',
  VIEW_ROLES_DETAILS: 'VIEW_ROLES_DETAILS',
  EDIT_ROLES_DETAILS: 'EDIT_ROLES_DETAILS',
  VIEW_SYSTEM_SETTINGS: 'VIEW_SYSTEM_SETTINGS',
  EDIT_SYSTEM_SETTINGS: 'EDIT_SYSTEM_SETTINGS',
} as const;

// New module-based permission structure
export const MODULE_PERMISSIONS = {
  dashboard: {
    view: PERMISSIONS.VIEW_DASHBOARD,
  },
  employees: {
    view: PERMISSIONS.VIEW_EMPLOYEES,
    create: PERMISSIONS.MANAGE_EMPLOYEES,
    edit: PERMISSIONS.EDIT_EMPLOYEE_DETAILS,
    delete: PERMISSIONS.DELETE_EMPLOYEE,
    details: PERMISSIONS.VIEW_EMPLOYEE_DETAILS,
  },
  departments: {
    view: PERMISSIONS.VIEW_DEPARTMENTS,
    create: PERMISSIONS.MANAGE_DEPARTMENTS,
    edit: PERMISSIONS.EDIT_DEPARTMENT_DETAILS,
    delete: PERMISSIONS.DELETE_DEPARTMENT,
    details: PERMISSIONS.VIEW_DEPARTMENT_DETAILS,
  },
  attendance: {
    view: PERMISSIONS.VIEW_ATTENDANCE,
    create: PERMISSIONS.MANAGE_ATTENDANCE,
    edit: PERMISSIONS.EDIT_ATTENDANCE,
    delete: PERMISSIONS.DELETE_ATTENDANCE,
    details: PERMISSIONS.VIEW_ATTENDANCE_DETAILS,
  },
  performance: {
    view: PERMISSIONS.VIEW_PERFORMANCE,
    create: PERMISSIONS.MANAGE_PERFORMANCE,
    edit: PERMISSIONS.EDIT_PERFORMANCE,
    delete: PERMISSIONS.DELETE_PERFORMANCE,
    details: PERMISSIONS.VIEW_PERFORMANCE_DETAILS,
  },
  leave: {
    view: PERMISSIONS.VIEW_LEAVE,
    create: PERMISSIONS.MANAGE_LEAVE,
    edit: PERMISSIONS.EDIT_LEAVE_DETAILS,
    delete: PERMISSIONS.DELETE_LEAVE,
    details: PERMISSIONS.VIEW_LEAVE_DETAILS,
    approve: PERMISSIONS.APPROVE_LEAVE,
    reject: PERMISSIONS.REJECT_LEAVE,
  },
  hiring: {
    jobs: {
      view: PERMISSIONS.VIEW_JOBS,
      create: PERMISSIONS.MANAGE_JOBS,
      edit: PERMISSIONS.EDIT_JOB_DETAILS,
      delete: PERMISSIONS.DELETE_JOB,
      details: PERMISSIONS.VIEW_JOB_DETAILS,
    },
    candidates: {
      view: PERMISSIONS.VIEW_CANDIDATES,
      create: PERMISSIONS.MANAGE_CANDIDATES,
      edit: PERMISSIONS.EDIT_CANDIDATE_DETAILS,
      delete: PERMISSIONS.DELETE_CANDIDATE,
      details: PERMISSIONS.VIEW_CANDIDATE_DETAILS,
    },
    interviews: {
      view: PERMISSIONS.VIEW_INTERVIEWS,
      create: PERMISSIONS.MANAGE_INTERVIEWS,
      edit: PERMISSIONS.EDIT_INTERVIEW,
      delete: PERMISSIONS.DELETE_INTERVIEW,
      details: PERMISSIONS.VIEW_INTERVIEW_DETAILS,
      schedule: PERMISSIONS.SCHEDULE_INTERVIEW,
    },
    onboarding: {
      view: PERMISSIONS.VIEW_ONBOARDING,
      create: PERMISSIONS.MANAGE_ONBOARDING,
      edit: PERMISSIONS.EDIT_ONBOARDING_DETAILS,
      delete: PERMISSIONS.DELETE_ONBOARDING,
      details: PERMISSIONS.VIEW_ONBOARDING_DETAILS,
      tasks: PERMISSIONS.MANAGE_ONBOARDING_TASKS,
    },
  },
  projects: {
    view: PERMISSIONS.VIEW_PROJECTS,
    create: PERMISSIONS.MANAGE_PROJECTS,
    edit: PERMISSIONS.EDIT_PROJECT_DETAILS,
    delete: PERMISSIONS.DELETE_PROJECT,
    details: PERMISSIONS.VIEW_PROJECT_DETAILS,
  },
  tasks: {
    view: PERMISSIONS.VIEW_TASKS,
    create: PERMISSIONS.MANAGE_TASKS,
    edit: PERMISSIONS.EDIT_TASK_DETAILS,
    delete: PERMISSIONS.DELETE_TASK,
    details: PERMISSIONS.VIEW_TASK_DETAILS,
  },
  sprints: {
    view: PERMISSIONS.VIEW_SPRINT_DETAILS,
    create: PERMISSIONS.MANAGE_SPRINTS,
    edit: PERMISSIONS.EDIT_SPRINT_DETAILS,
    delete: PERMISSIONS.DELETE_SPRINT,
    details: PERMISSIONS.VIEW_SPRINT_DETAILS,
  },
  timeline: {
    view: PERMISSIONS.VIEW_TIMELINE,
    edit: PERMISSIONS.EDIT_TIMELINE,
  },
  resources: {
    view: PERMISSIONS.VIEW_RESOURCES,
    allocate: PERMISSIONS.ALLOCATE_RESOURCES,
  },
  deliverables: {
    view: PERMISSIONS.VIEW_DELIVERABLES,
    create: PERMISSIONS.MANAGE_DELIVERABLES,
    edit: PERMISSIONS.EDIT_DELIVERABLE_DETAILS,
    delete: PERMISSIONS.DELETE_DELIVERABLE,
    details: PERMISSIONS.VIEW_DELIVERABLE_DETAILS,
  },
  sales: {
    clients: {
      view: PERMISSIONS.VIEW_CLIENTS,
      create: PERMISSIONS.MANAGE_CLIENTS,
      edit: PERMISSIONS.EDIT_CLIENT_DETAILS,
      delete: PERMISSIONS.DELETE_CLIENT,
      details: PERMISSIONS.VIEW_CLIENT_DETAILS,
    },
    proposals: {
      view: PERMISSIONS.VIEW_PROPOSALS,
      create: PERMISSIONS.MANAGE_PROPOSALS,
      edit: PERMISSIONS.EDIT_PROPOSAL_DETAILS,
      delete: PERMISSIONS.DELETE_PROPOSAL,
      details: PERMISSIONS.VIEW_PROPOSAL_DETAILS,
    },
    contracts: {
      view: PERMISSIONS.VIEW_CONTRACTS,
      create: PERMISSIONS.MANAGE_CONTRACTS,
      edit: PERMISSIONS.EDIT_CONTRACT_DETAILS,
      delete: PERMISSIONS.DELETE_CONTRACT,
      details: PERMISSIONS.VIEW_CONTRACT_DETAILS,
    },
    deals: {
      view: PERMISSIONS.VIEW_DEALS,
      create: PERMISSIONS.MANAGE_DEALS,
      edit: PERMISSIONS.EDIT_DEAL_DETAILS,
      delete: PERMISSIONS.DELETE_DEAL,
      details: PERMISSIONS.VIEW_DEAL_DETAILS,
    },
    analytics: {
      view: PERMISSIONS.VIEW_ANALYTICS,
      manage: PERMISSIONS.MANAGE_ANALYTICS,
    },
    revenue: {
      view: PERMISSIONS.VIEW_REVENUE_DETAILS,
      manage: PERMISSIONS.MANAGE_REVENUE,
    },
  },
  assets: {
    view: PERMISSIONS.VIEW_ASSETS,
    create: PERMISSIONS.MANAGE_ASSETS,
    edit: PERMISSIONS.EDIT_ASSET_DETAILS,
    delete: PERMISSIONS.DELETE_ASSET,
    details: PERMISSIONS.VIEW_ASSET_DETAILS,
  },
  licenses: {
    view: PERMISSIONS.VIEW_LICENSES,
    create: PERMISSIONS.MANAGE_LICENSES,
    edit: PERMISSIONS.EDIT_LICENSE_DETAILS,
    delete: PERMISSIONS.DELETE_LICENSE,
    details: PERMISSIONS.VIEW_LICENSE_DETAILS,
  },
  maintenance: {
    view: PERMISSIONS.VIEW_MAINTENANCE,
    create: PERMISSIONS.MANAGE_MAINTENANCE,
    edit: PERMISSIONS.EDIT_MAINTENANCE,
    delete: PERMISSIONS.DELETE_MAINTENANCE,
    details: PERMISSIONS.VIEW_MAINTENANCE_DETAILS,
    schedule: PERMISSIONS.SCHEDULE_MAINTENANCE,
  },
  finance: {
    invoices: {
      view: PERMISSIONS.VIEW_INVOICES,
      create: PERMISSIONS.MANAGE_INVOICES,
      edit: PERMISSIONS.EDIT_INVOICE_DETAILS,
      delete: PERMISSIONS.DELETE_INVOICE,
      details: PERMISSIONS.VIEW_INVOICE_DETAILS,
    },
    expenses: {
      view: PERMISSIONS.VIEW_EXPENSES,
      create: PERMISSIONS.MANAGE_EXPENSES,
      edit: PERMISSIONS.EDIT_EXPENSE_DETAILS,
      delete: PERMISSIONS.DELETE_EXPENSE,
      details: PERMISSIONS.VIEW_EXPENSE_DETAILS,
    },
    payroll: {
      view: PERMISSIONS.VIEW_PAYROLL,
      create: PERMISSIONS.MANAGE_PAYROLL,
      edit: PERMISSIONS.EDIT_PAYROLL_DETAILS,
      delete: PERMISSIONS.DELETE_PAYROLL,
      details: PERMISSIONS.VIEW_PAYROLL_DETAILS,
      process: PERMISSIONS.PROCESS_PAYROLL,
    },
    reports: {
      view: PERMISSIONS.VIEW_REPORTS,
      create: PERMISSIONS.MANAGE_REPORTS,
      edit: PERMISSIONS.EDIT_REPORT_DETAILS,
      delete: PERMISSIONS.DELETE_REPORT,
      details: PERMISSIONS.VIEW_REPORT_DETAILS,
      generate: PERMISSIONS.GENERATE_REPORTS,
    },
  },
  settings: {
    view: PERMISSIONS.VIEW_SETTINGS,
    manage: PERMISSIONS.MANAGE_SETTINGS,
    users: PERMISSIONS.MANAGE_USERS,
    roles: PERMISSIONS.MANAGE_ROLES,
    companyProfile: {
      view: PERMISSIONS.VIEW_COMPANY_PROFILE,
      edit: PERMISSIONS.EDIT_COMPANY_PROFILE,
    },
    rolesDetails: {
      view: PERMISSIONS.VIEW_ROLES_DETAILS,
      edit: PERMISSIONS.EDIT_ROLES_DETAILS,
    },
    systemSettings: {
      view: PERMISSIONS.VIEW_SYSTEM_SETTINGS,
      edit: PERMISSIONS.EDIT_SYSTEM_SETTINGS,
    },
  },
} as const;

// Update ROLE_PERMISSIONS to include EMPLOYEE
export let ROLE_PERMISSIONS = {
  ADMIN: Object.values(PERMISSIONS),
  EMPLOYEE: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_EMPLOYEE_DETAILS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.VIEW_PERFORMANCE,
    PERMISSIONS.VIEW_LEAVE,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_PROJECT_DETAILS,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.VIEW_TASK_DETAILS,
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

const loadFromStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return null;
  }
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
        // Ensure permissions is always an array
        const userWithPermissions = {
          ...parsedUser,
          permissions: Array.isArray(parsedUser.permissions) ? parsedUser.permissions : []
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
            _id: role._id || role.id
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

  // Update the hasPermission function to handle type safety
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Ensure user.permissions is an array
    const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
    
    // Check if user has the permission directly
    if (userPermissions.includes(permission)) return true;
    
    // Check if user's role has the permission
    const rolePermissions = AUTH_ROLE_PERMISSIONS[user.role];
    return rolePermissions ? rolePermissions.includes(permission) : false;
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      const userData = response.data.user;
      
      // Create user object
      const userObject = {
        id: userData._id,
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        permissions: Object.values(PERMISSIONS),
      };
      
      // Set user data and authentication state
      setUser(userObject);
      setIsAuthenticated(true);
      
      // Save to localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(userObject));
      
      toast({
        title: "🎉 Welcome Back!",
        description: `Hello ${userObject.name}! You've successfully logged into your account.`,
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

        const registeredUser: User = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          permissions: Array.isArray(newUser.permissions) ? newUser.permissions : [],
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
        return {
          ...prevUser,
          role: newRole,
          permissions: Array.isArray(AUTH_ROLE_PERMISSIONS[newRole]) ? AUTH_ROLE_PERMISSIONS[newRole] : []
        };
      });
    }
  };

  const updateUserPermissions = (permissions: string[]) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      // Ensure permissions is always an array
      const safePermissions = Array.isArray(permissions) ? permissions : [];
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
      const newRole = await roleService.createRole(role);
      console.log('Created new role:', newRole);
      
      // Ensure the new role has proper ID fields
      const roleWithIds = {
        ...newRole,
        id: newRole.id || newRole._id,
        _id: newRole._id || newRole.id
      };
      
      setRoles(prev => [...prev, roleWithIds]);
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: { roleName: roleWithIds.name, permissions: roleWithIds.permissions }
      }));
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
    }
  };

  // Update role using backend
  const updateRole = async (roleName: string, permissions: string[]) => {
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
      
      const updatedRole = await roleService.updateRole(roleId, { permissions });
      setRoles(prev => prev.map(r => (r.id || r._id) === updatedRole.id ? updatedRole : r));
      
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
  };

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
      
      // Update user's permissions
      const rolePermissions = AUTH_ROLE_PERMISSIONS[roleName] || [];
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: roleName, permissions: rolePermissions }
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
            permissions: rolePermissions
          };
          // Update localStorage to persist the changes
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
      
      // Force a re-render of components that depend on permissions
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: { roleName, permissions: rolePermissions }
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
      
      // Reset user's permissions to default
      const defaultPermissions = AUTH_ROLE_PERMISSIONS.EMPLOYEE;
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: 'EMPLOYEE', permissions: defaultPermissions }
            : user
        )
      );

      // If the current user's role is being updated, update their permissions too
      if (user?.id === userId) {
        setUser(prevUser => {
          if (!prevUser) return null;
          const updatedUser = {
            ...prevUser,
            role: 'EMPLOYEE',
            permissions: defaultPermissions
          };
          // Update localStorage to persist the changes
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
      
      // Force a re-render of components that depend on permissions
      window.dispatchEvent(new CustomEvent('permissionsUpdated', {
        detail: { roleName: 'EMPLOYEE', permissions: defaultPermissions }
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
            permissions: [...permissions]
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