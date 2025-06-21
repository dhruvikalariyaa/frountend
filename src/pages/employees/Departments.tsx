import { useState } from 'react';
import { AddDepartmentDialog } from '@/components/employees/AddDepartmentDialog';
import { ViewDepartmentDialog } from '@/components/employees/ViewDepartmentDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Download, MoreVertical, Edit, Trash, Eye, Plus, Building2, DollarSign, Users, RefreshCw, SortAsc, SortDesc } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as XLSX from 'xlsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
// import { toast } from 'sonner';
// import axios from 'axios';

// Mock data for departments
export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  manager: string;
  location: string;
  budget: number;
  status: 'active' | 'inactive';
  employeeCount: number;
  projects: number;
}

export const mockDepartments: Department[] = [
  {
    id: 1,
    name: 'Engineering',
    code: 'ENG',
    description: 'Software development and technical operations',
    manager: 'John Doe',
    location: 'Floor 3',
    budget: 1000000,
    status: 'active',
    employeeCount: 45,
    projects: 12,
  },
  {
    id: 2,
    name: 'Human Resources',
    code: 'HR',
    description: 'Employee management and recruitment',
    manager: 'Jane Smith',
    location: 'Floor 2',
    budget: 500000,
    status: 'active',
    employeeCount: 15,
    projects: 5,
  },
  {
    id: 3,
    name: 'Marketing',
    code: 'MKT',
    description: 'Brand management and digital marketing',
    manager: 'Sarah Johnson',
    location: 'Floor 4',
    budget: 750000,
    status: 'active',
    employeeCount: 25,
    projects: 8,
  },
  {
    id: 4,
    name: 'Finance',
    code: 'FIN',
    description: 'Financial planning and accounting',
    manager: 'Michael Chen',
    location: 'Floor 1',
    budget: 600000,
    status: 'active',
    employeeCount: 20,
    projects: 6,
  },
  {
    id: 5,
    name: 'Sales',
    code: 'SLS',
    description: 'Business development and client relations',
    manager: 'David Wilson',
    location: 'Floor 5',
    budget: 1200000,
    status: 'active',
    employeeCount: 35,
    projects: 15,
  },
  {
    id: 6,
    name: 'Research & Development',
    code: 'R&D',
    description: 'Product innovation and research',
    manager: 'Emily Brown',
    location: 'Floor 6',
    budget: 1500000,
    status: 'active',
    employeeCount: 30,
    projects: 10,
  },
  {
    id: 7,
    name: 'Customer Support',
    code: 'CS',
    description: 'Customer service and technical support',
    manager: 'Robert Taylor',
    location: 'Floor 2',
    budget: 400000,
    status: 'active',
    employeeCount: 28,
    projects: 4,
  },
  {
    id: 8,
    name: 'Legal',
    code: 'LEG',
    description: 'Legal compliance and corporate affairs',
    manager: 'Lisa Anderson',
    location: 'Floor 1',
    budget: 450000,
    status: 'active',
    employeeCount: 12,
    projects: 3,
  },
  {
    id: 9,
    name: 'Quality Assurance',
    code: 'QA',
    description: 'Quality control and testing',
    manager: 'James Wilson',
    location: 'Floor 3',
    budget: 550000,
    status: 'inactive',
    employeeCount: 18,
    projects: 7,
  },
  {
    id: 10,
    name: 'Operations',
    code: 'OPS',
    description: 'Business operations and logistics',
    manager: 'Patricia Martinez',
    location: 'Floor 2',
    budget: 800000,
    status: 'active',
    employeeCount: 22,
    projects: 9,
  },
  {
    id: 11,
    name: 'Product Management',
    code: 'PM',
    description: 'Product strategy and roadmap',
    manager: 'Thomas Lee',
    location: 'Floor 4',
    budget: 650000,
    status: 'active',
    employeeCount: 15,
    projects: 11,
  },
  {
    id: 12,
    name: 'Information Technology',
    code: 'IT',
    description: 'IT infrastructure and support',
    manager: 'Rachel Green',
    location: 'Floor 3',
    budget: 900000,
    status: 'active',
    employeeCount: 25,
    projects: 8,
  }
];

type SortField = 'name' | 'code' | 'manager' | 'budget' | 'status';
type SortOrder = 'asc' | 'desc';

/* 
// Types for API integration
interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  manager: string;
  location: string;
  budget: number;
  status: 'active' | 'inactive';
  employeeCount: number;
  projects: number;
}

// API Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const departmentService = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/departments`);
    return response.data;
  },
  
  create: async (department: Omit<Department, 'id'>) => {
    const response = await axios.post(`${API_BASE_URL}/departments`, department);
    return response.data;
  },
  
  update: async (id: number, department: Partial<Department>) => {
    const response = await axios.put(`${API_BASE_URL}/departments/${id}`, department);
    return response.data;
  },
  
  delete: async (id: number) => {
    await axios.delete(`${API_BASE_URL}/departments/${id}`);
  }
};
*/

export default function DepartmentsPage() {
  // const [departments, setDepartments] = useState<Department[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 2000000]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* 
  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      setError('Failed to fetch departments');
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);
  */

  const handleBudgetRangeChange = (value: number[]) => {
    setBudgetRange([value[0], value[1]]);
  };

  /* 
  // API handlers for CRUD operations
  const handleAddDepartment = async (newDepartment: Omit<Department, 'id'>) => {
    try {
      const addedDepartment = await departmentService.create(newDepartment);
      setDepartments(prev => [...prev, addedDepartment]);
      toast.success('Department added successfully');
    } catch (err) {
      toast.error('Failed to add department');
    }
  };

  const handleEditDepartment = async (id: number, updatedData: Partial<Department>) => {
    try {
      const updatedDepartment = await departmentService.update(id, updatedData);
      setDepartments(prev => prev.map(dept => 
        dept.id === id ? { ...dept, ...updatedDepartment } : dept
      ));
      toast.success('Department updated successfully');
    } catch (err) {
      toast.error('Failed to update department');
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      await departmentService.delete(id);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      toast.success('Department deleted successfully');
    } catch (err) {
      toast.error('Failed to delete department');
    }
  };
  */

  const handleAddDepartment = (newDepartment: any) => {
    console.log('Add department:', newDepartment);
    // Will be replaced with API call
  };


  const handleEditSubmit = (updatedDepartment: any) => {
    console.log('Updated department:', {
      id: editingDepartment.id,
      ...updatedDepartment
    });
    setIsAddEditOpen(false);
    setEditingDepartment(null);
  };

  const handleViewDetails = (department: any) => {
    setSelectedDepartment(department);
    setIsDetailsOpen(true);
  };

  const handleDeleteDepartment = (id: number) => {
    console.log('Delete department:', id);
    // Will be replaced with API call
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Will be replaced with actual API call
      console.log('Refreshing data...');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const filteredDepartments = mockDepartments
    .filter((department) => {
      const matchesSearch =
        searchQuery === '' ||
        department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.manager.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || department.status === statusFilter;
      const matchesBudget =
        department.budget >= budgetRange[0] && department.budget <= budgetRange[1];

      return matchesSearch && matchesStatus && matchesBudget;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortOrder === 'asc' ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      return ((aValue as number) - (bValue as number)) * modifier;
    });

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredDepartments.map(dept => ({
        Name: dept.name,
        Code: dept.code,
        Manager: dept.manager,
        Location: dept.location,
        Budget: dept.budget,
        Status: dept.status,
        'Employee Count': dept.employeeCount,
        Projects: dept.projects
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments');
    XLSX.writeFile(workbook, 'departments.xlsx');
  };

  const departmentStats = {
    totalDepartments: mockDepartments.length,
    totalEmployees: mockDepartments.reduce((sum, dept) => sum + dept.employeeCount, 0),
    totalBudget: mockDepartments.reduce((sum, dept) => sum + dept.budget, 0),
    activeDepartments: mockDepartments.filter((dept) => dept.status === 'active').length,
  };

  /* 
  // Loading and error states for API integration
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }
  */

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Department Management</h1>
          </div>
          <div className="flex items-center space-x-4">
        <Button onClick={() => {
          setEditingDepartment(null);
          setIsAddEditOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
          </div>
      </div>

      {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Total Departments</div>
                <div className="text-xl sm:text-2xl font-bold">{departmentStats.totalDepartments}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Total Budget</div>
                <div className="text-xl sm:text-2xl font-bold">
                  ${departmentStats.totalBudget.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Active Departments</div>
                <div className="text-xl sm:text-2xl font-bold">{departmentStats.activeDepartments}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
        <Card>
        <CardContent className="p-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
            </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full">
            <div className="relative w-full md:max-w-xs">
              <Input
                placeholder="Search by name, code, or manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-36 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-sm font-medium">Budget Range</div>
              <div className="flex items-center gap-4">
                <Slider
                  defaultValue={[0, 2000000]}
                  max={2000000}
                  step={100000}
                  value={budgetRange}
                  onValueChange={handleBudgetRangeChange}
                  className="w-full"
                  minStepsBetweenThumbs={1}
                />
                <div className="text-sm text-gray-500 min-w-[120px] whitespace-nowrap">
                  ${budgetRange[0].toLocaleString()} - ${budgetRange[1].toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-end">
                <Button 
                  onClick={handleExport} 
                  size="icon" 
                  className="h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </div>
          </div>
        </CardContent>
      </Card>

      {/* Table and Pagination */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Department List</CardTitle>
                </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Rows per page" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} rows
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                      >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Refresh Data</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {sortField === 'name' && (
                          sortOrder === 'asc' ? 
                            <SortAsc className="h-4 w-4" /> : 
                            <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('budget')}>
                      <div className="flex items-center space-x-1">
                        <span>Budget</span>
                        {sortField === 'budget' && (
                          sortOrder === 'asc' ? 
                            <SortAsc className="h-4 w-4" /> : 
                            <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRefreshing ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading departments...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  ) : paginatedDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <span className="text-sm text-muted-foreground">No departments found</span>
                          <Button variant="outline" onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                          }}>
                            Clear Filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                ) : (
                  paginatedDepartments.map((department) => (
                      <TableRow key={department.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{department.name}</TableCell>
                        <TableCell>{department.code}</TableCell>
                        <TableCell>{department.manager}</TableCell>
                        <TableCell>{department.location}</TableCell>
                        <TableCell>${department.budget.toLocaleString()}</TableCell>
                      <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${
                              department.status === "active" 
                                ? "bg-green-50 text-green-700" 
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {department.status.charAt(0).toUpperCase() + department.status.slice(1)}
                          </Badge>
                      </TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(department)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setEditingDepartment(department);
                                setIsAddEditOpen(true);
                              }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteDepartment(department.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
            {!isRefreshing && paginatedDepartments.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDepartments.length)} of {filteredDepartments.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 text-sm"
              >
                Previous
              </Button>
              <Button 
                    variant="default"
                    className="h-8 w-8 p-0 text-sm bg-[#000000] hover:bg-[#000000] text-white"
                disabled
              >
                {currentPage}
              </Button>
              <Button
                variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-sm"
              >
                Next
              </Button>
            </div>
          </div>
            )}
        </CardContent>
      </Card>

      {/* View Department Dialog */}
      <ViewDepartmentDialog
        department={selectedDepartment}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      {/* Add/Edit Department Dialog */}
      <AddDepartmentDialog
        open={isAddEditOpen}
        onOpenChange={setIsAddEditOpen}
        onSubmit={editingDepartment ? handleEditSubmit : handleAddDepartment}
        initialData={editingDepartment}
      />
      </div>
    </div>
  );
} 