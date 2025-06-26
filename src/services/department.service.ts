import axios from '../lib/axios';

const BASE_URL = '/departments';

// Type for Department (POST: only name and description required)
export interface Department {
  name: string;
  description: string;
  code?: string;
  manager?: string;
  location?: string;
  budget?: number;
  status?: 'active' | 'inactive';
  employeeCount?: number;
  projects?: number;
  [key: string]: any;
}

// Create a new department
export const createDepartment = async (data: Department) => {
  return axios.post(BASE_URL, data);
};

// Get all departments
export const getDepartments = async () => {
  return axios.get(BASE_URL);
};

// Get a department by ID
export const getDepartmentById = async (id: string | number) => {
  return axios.get(`${BASE_URL}/${id}`);
};

// Update a department by ID
export const updateDepartment = async (id: string | number, data: Partial<Department>) => {
  return axios.patch(`${BASE_URL}/${id}`, data);
};

// Delete a department by ID
export const deleteDepartment = async (id: string | number) => {
  return axios.delete(`${BASE_URL}/${id}`);
}; 