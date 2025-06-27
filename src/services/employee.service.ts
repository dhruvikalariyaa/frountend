import axiosInstance from '@/lib/axios';
import { EmployeeFormValues } from '@/components/employees/AddEmployeeDialog';

// Types
export interface Employee {
  id: string;
  employeeId?: string;
  user?: {
    _id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
  };
  department?: { name?: string } | string;
  role?: { name?: string } | string;
  status?: string;
  joinDate?: string;
  joiningDate?: string;
  phone?: string;
  address?: any;
  salary?: number;
  emergencyContact?: any;
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
  };
  createdAt?: string;
  [key: string]: any;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  onLeaveEmployees: number;
  newEmployeesThisMonth: number;
  departmentDistribution: { [key: string]: number };
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Constants
export const DEPARTMENTS = ["Engineering", "Design", "Sales", "HR", "Marketing", "Finance", "Operations"];
export const ROLES = ["Software Engineer", "UI/UX Designer", "Product Manager", "Sales Executive", "HR Manager", "Marketing Specialist", "Team Lead", "Project Manager", "Business Analyst", "DevOps Engineer", "QA Engineer"];
export const STATUS_OPTIONS = ["Active", "On Leave", "Inactive"];

// Get all employees
export async function getEmployees() {
  const response = await axiosInstance.get('/employees');
  return response.data;
}

// Get employee by ID
export async function getEmployeeById(id: string | number) {
  const response = await axiosInstance.get(`/employees/${id}`);
  return response.data;
}

// Create a new employee
export async function createEmployee(data: EmployeeFormValues) {
  const response = await axiosInstance.post('/employees', data);
  return response.data;
}

// Update employee
export async function updateEmployee(id: string | number, data: EmployeeFormValues) {
  const response = await axiosInstance.patch(`/employees/${id}`, data);
  return response.data;
}

// Delete employee
export async function deleteEmployee(id: string | number) {
  const response = await axiosInstance.delete(`/employees/${id}`);
  return response.data;
}

// Get all departments
export async function getDepartments() {
  const response = await axiosInstance.get('/departments');
  return response.data;
}

// Get all roles
export async function getRoles() {
  const response = await axiosInstance.get('/roles');
  return response.data;
}

// Get employee by employeeId (string, not DB id)
export async function getEmployeeByEmployeeId(employeeId: string) {
  const response = await axiosInstance.get(`/employees/by-employee-id/${employeeId}`);
  return response.data;
}

// Get current user's employee profile
export async function getCurrentEmployeeProfile() {
  const response = await axiosInstance.get('/employees/me');
  return response.data;
}

// Assign a role to a user (new API)
export async function assignRoleToUser(userId: string, roleId: string) {
  await axiosInstance.put(`/users/${userId}/roles`, {
    roles: [roleId],
  });
}

// Unassign all roles from a user (new API)
export async function unassignRoleFromUser(userId: string) {
  await axiosInstance.put(`/users/${userId}/roles`, {
    roles: [],
  });
} 

