
// Types
export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
  joinDate: string;
  phone?: string;
  address?: string;
  salary?: number;
  employeeId?: string;
  emergencyContact?: string;
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
  };
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

// Mock data
const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@dvijinfotech.com",
    department: "Engineering",
    role: "Software Engineer",
    status: "Active",
    joinDate: "2023-01-15",
    phone: "+91 98765 43210",
    address: "123 Main Street, Mumbai",
    salary: 75000,
    employeeId: "EMP001",
    emergencyContact: "+91 98765 43211",
    bankDetails: {
      accountNumber: "1234567890",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0001234"
    }
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@dvijinfotech.com",
    department: "Design",
    role: "UI/UX Designer",
    status: "Active",
    joinDate: "2023-02-20",
    phone: "+91 98765 43212",
    address: "456 Park Avenue, Delhi",
    salary: 65000,
    employeeId: "EMP002",
    emergencyContact: "+91 98765 43213"
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@dvijinfotech.com",
    department: "Sales",
    role: "Sales Executive",
    status: "On Leave",
    joinDate: "2023-03-10",
    employeeId: "EMP003"
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.williams@dvijinfotech.com",
    department: "HR",
    role: "HR Manager",
    status: "Active",
    joinDate: "2023-04-05",
    employeeId: "EMP004"
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@dvijinfotech.com",
    department: "Engineering",
    role: "DevOps Engineer",
    status: "Active",
    joinDate: "2023-05-12",
    employeeId: "EMP005"
  },
  {
    id: 6,
    name: "Emily Chen",
    email: "emily.chen@dvijinfotech.com",
    department: "Design",
    role: "UI/UX Designer",
    status: "Active",
    joinDate: "2023-06-15",
    employeeId: "EMP006"
  },
  {
    id: 7,
    name: "Alex Turner",
    email: "alex.turner@dvijinfotech.com",
    department: "Engineering",
    role: "Team Lead",
    status: "Active",
    joinDate: "2023-07-01",
    employeeId: "EMP007"
  },
  {
    id: 8,
    name: "Lisa Anderson",
    email: "lisa.anderson@dvijinfotech.com",
    department: "Marketing",
    role: "Marketing Specialist",
    status: "Inactive",
    joinDate: "2023-08-20",
    employeeId: "EMP008"
  },
  {
    id: 9,
    name: "Robert Wilson",
    email: "robert.wilson@dvijinfotech.com",
    department: "Engineering",
    role: "QA Engineer",
    status: "Active",
    joinDate: "2023-09-10",
    employeeId: "EMP009"
  },
  {
    id: 10,
    name: "Maria Garcia",
    email: "maria.garcia@dvijinfotech.com",
    department: "Operations",
    role: "Project Manager",
    status: "Active",
    joinDate: "2023-10-05",
    employeeId: "EMP010"
  }
];

// Constants
export const DEPARTMENTS = ["Engineering", "Design", "Sales", "HR", "Marketing", "Finance", "Operations"];
export const ROLES = ["Software Engineer", "UI/UX Designer", "Product Manager", "Sales Executive", "HR Manager", "Marketing Specialist", "Team Lead", "Project Manager", "Business Analyst", "DevOps Engineer", "QA Engineer"];
export const STATUS_OPTIONS = ["Active", "On Leave", "Inactive"];

class EmployeeService {
  private employees: Employee[] = mockEmployees;

  // GET methods
  async getEmployees(filters: EmployeeFilters = {}): Promise<Employee[]> {
    // When integrating with real API, replace with actual API call
    // return await axios.get('/api/employees', { params: filters });
    
    let filteredEmployees = [...this.employees];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.employeeId?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.department && filters.department !== "All") {
      filteredEmployees = filteredEmployees.filter(emp => emp.department === filters.department);
    }

    if (filters.role && filters.role !== "All") {
      filteredEmployees = filteredEmployees.filter(emp => emp.role === filters.role);
    }

    if (filters.status && filters.status !== "All") {
      filteredEmployees = filteredEmployees.filter(emp => emp.status === filters.status);
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredEmployees.sort((a: Employee, b: Employee) => {
        const direction = filters.sortDirection === 'desc' ? -1 : 1;
        const aValue = a[filters.sortBy as keyof Employee];
        const bValue = b[filters.sortBy as keyof Employee];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * direction;
        }
        return 0;
      });
    }

    // Apply pagination
    if (filters.page && filters.pageSize) {
      const start = (filters.page - 1) * filters.pageSize;
      const end = start + filters.pageSize;
      filteredEmployees = filteredEmployees.slice(start, end);
    }

    return filteredEmployees;
  }

  async getEmployeeById(id: number): Promise<Employee | null> {
    // When integrating with real API, replace with actual API call
    // return await axios.get(`/api/employees/${id}`);
    
    const employee = this.employees.find(emp => emp.id === id);
    return employee || null;
  }

  async getEmployeeStats(): Promise<EmployeeStats> {
    // When integrating with real API, replace with actual API call
    // return await axios.get('/api/employees/stats');
    
    const activeEmployees = this.employees.filter(emp => emp.status === "Active").length;
    const onLeaveEmployees = this.employees.filter(emp => emp.status === "On Leave").length;
    
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const newEmployees = this.employees.filter(emp => new Date(emp.joinDate) >= firstDayOfMonth).length;

    const departmentCounts: { [key: string]: number } = {};
    this.employees.forEach(emp => {
      departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
    });

    return {
      totalEmployees: this.employees.length,
      activeEmployees,
      departments: new Set(this.employees.map(emp => emp.department)).size,
      onLeaveEmployees,
      newEmployeesThisMonth: newEmployees,
      departmentDistribution: departmentCounts
    };
  }

  // POST methods
  async addEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    // When integrating with real API, replace with actual API call
    // return await axios.post('/api/employees', employee);
    
    const newEmployee = {
      ...employee,
      id: Math.max(...this.employees.map(emp => emp.id)) + 1
    };
    
    this.employees.push(newEmployee);
    return newEmployee;
  }

  // PUT methods
  async updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee> {
    // When integrating with real API, replace with actual API call
    // return await axios.put(`/api/employees/${id}`, employee);
    
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) throw new Error('Employee not found');
    
    this.employees[index] = { ...this.employees[index], ...employee };
    return this.employees[index];
  }

  // DELETE methods
  async deleteEmployee(id: number): Promise<void> {
    // When integrating with real API, replace with actual API call
    // return await axios.delete(`/api/employees/${id}`);
    
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) throw new Error('Employee not found');
    
    this.employees.splice(index, 1);
  }

  // Export methods
  async exportEmployees(filters: EmployeeFilters = {}): Promise<Employee[]> {
    // When integrating with real API, replace with actual API call
    // return await axios.get('/api/employees/export', { params: filters });
    
    return this.getEmployees(filters);
  }
}

export const employeeService = new EmployeeService(); 