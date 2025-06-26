import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  RefreshCw,
  MoreVertical,
  Calendar,
  Users,
  UserCheck,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddEmployeeDialog, EmployeeFormValues } from "@/components/employees/AddEmployeeDialog";
import { format, isValid, parseISO } from 'date-fns';
import { ViewEmployeeDialog } from "@/components/employees/ViewEmployeeDialog";
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getDepartments, getRoles, type Employee, type EmployeeStats, DEPARTMENTS, ROLES, STATUS_OPTIONS } from "@/services/employee.service";
import { PermissionGuard } from "@/components/PermissionGuard";
import { PERMISSIONS } from "@/contexts/AuthContext";
import DepartmentDropdown from '@/components/employees/DepartmentDropdown';
import RoleDropdown from '@/components/employees/RoleDropdown';

export default function Employees() {
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: "name", direction: "asc" });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployeeForm, setEditingEmployeeForm] = useState<EmployeeFormValues | undefined>(undefined);
  const [totalEmployees, setTotalEmployees] = useState(0);

  // Helper function to map backend data to frontend format
  const mapBackendDataToFrontend = (employeesData: any[]): Employee[] => {
    return employeesData.map((emp: any) => {
      const mapped = {
        ...emp,
        name:
          emp.name && emp.name.trim() !== ""
            ? emp.name
            : (emp.firstName && emp.lastName
                ? `${emp.firstName} ${emp.lastName}`
                : emp.firstName || emp.lastName || "N/A"),
        department:
          typeof emp.department === "object"
            ? emp.department.name || emp.department.title || "N/A"
            : emp.department || "N/A",
        role:
          typeof emp.role === "object"
            ? emp.role.name || emp.role.title || "N/A"
            : emp.role || "N/A",
        joinDate: emp.joiningDate || emp.joinDate || "",
        status: emp.status || "Active",
        email: emp.email || "N/A",
      };
      return mapped;
    });
  };

  // Fetch initial data only once
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const employeesData = await getEmployees();
        const mappedEmployees: Employee[] = mapBackendDataToFrontend(employeesData);
        setAllEmployees(mappedEmployees);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
          duration: 1000,
        });
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter and sort data in memory
  useEffect(() => {
    let filteredEmployees = allEmployees.filter((emp: Employee) => {
      const matchesSearch =
        !searchTerm ||
        (emp.user?.firstName && typeof emp.user.firstName === 'string' && emp.user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (emp.user?.email && typeof emp.user.email === 'string' && emp.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (emp.user?.roles && Array.isArray(emp.user.roles) && emp.user.roles.join(', ').toLowerCase().includes(searchTerm.toLowerCase()));

      // Department filter: compare to department name
      const employeeDepartmentName = typeof emp.department === "object" 
        ? emp.department?.name 
        : emp.department;
      
      const matchesDepartment =
        selectedDepartment === "All" ||
        (employeeDepartmentName && employeeDepartmentName === selectedDepartment);

      const matchesRole =
        selectedRole === "All" ||
        (typeof emp.role === "object" 
          ? emp.role?.name === selectedRole
          : emp.role === selectedRole);

      const matchesStatus = selectedStatus === "All" || emp.status === selectedStatus;

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });

    // Sort data
    filteredEmployees.sort((a: Employee, b: Employee) => {
      const aValue = a[sortConfig.key as keyof Employee] || '';
      const bValue = b[sortConfig.key as keyof Employee] || '';
      if (sortConfig.direction === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    setEmployees(paginatedEmployees);
    setTotalEmployees(filteredEmployees.length);
  }, [allEmployees, searchTerm, selectedDepartment, selectedRole, selectedStatus, sortConfig, currentPage, pageSize]);

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Actions handlers
  const handleView = async (employee: Employee) => {
    try {
      const employeeDetails = await getEmployeeById(employee.id);
      if (employeeDetails) {
        setViewingEmployee(employeeDetails);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employee details",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  const handleEdit = async (employee: Employee) => {
    try {
      const employeeDetails = await getEmployeeById(employee.id);
      if (employeeDetails) {
        // Convert employee data to form values format
        const nameParts = employeeDetails.name ? employeeDetails.name.split(' ') : [employeeDetails.firstName || '', employeeDetails.lastName || ''];
        const formValues: EmployeeFormValues = {
          firstName: employeeDetails.user?.firstName || employeeDetails.firstName || nameParts[0] || '',
          lastName: employeeDetails.user?.lastName || employeeDetails.lastName || nameParts.slice(1).join(' ') || '',
          email: employeeDetails.user?.email || employeeDetails.email || '',
          phone: employeeDetails.user?.phone || employeeDetails.phone || '',
          department: typeof employeeDetails.department === 'object'
            ? (employeeDetails.department.name || employeeDetails.department.title || '')
            : (employeeDetails.department || ''),
          roles: Array.isArray(employeeDetails.user?.roles) && employeeDetails.user.roles.length > 0
            ? employeeDetails.user.roles.map((role: any) => typeof role === 'object' ? role.name : role)
            : (typeof employeeDetails.role === 'object' ? [employeeDetails.role.name || employeeDetails.role.title || ''] : [employeeDetails.role || '']),
          employeeId: employeeDetails.employeeId || '',
          joiningDate: new Date(employeeDetails.joinDate || employeeDetails.joiningDate),
          salary: employeeDetails.salary || 0,
          address: typeof employeeDetails.address === 'object' && employeeDetails.address !== null
            ? {
                street: employeeDetails.address.street || '',
                city: employeeDetails.address.city || '',
                state: employeeDetails.address.state || '',
                country: employeeDetails.address.country || '',
                postalCode: employeeDetails.address.postalCode || ''
              }
            : { street: '', city: '', state: '', country: '', postalCode: '' },
          emergencyContact: typeof employeeDetails.emergencyContact === 'object' && employeeDetails.emergencyContact !== null
            ? employeeDetails.emergencyContact.phone || ''
            : employeeDetails.emergencyContact || '',
          bankDetails: employeeDetails.bankDetails || {
            accountNumber: '',
            bankName: '',
            ifscCode: '',
          },
          password: '', // Add default password for edit form
          departmentId: '', // Add default departmentId
        };
        setEditingEmployee(employeeDetails);
        setEditingEmployeeForm(formValues);
        setIsEditDialogOpen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employee details",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  const handleDelete = async (employee: Employee) => {
    try {
      await deleteEmployee(employee.id);
      toast({
        title: "Success",
        description: `${employee.name} has been deleted`,
        duration: 1000,
      });
      // Refresh data
      const employeesData = await getEmployees();
      const mappedEmployees: Employee[] = mapBackendDataToFrontend(employeesData);
      setAllEmployees(mappedEmployees);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  // Refresh data handler (manual refresh)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const employeesData = await getEmployees();
      const mappedEmployees: Employee[] = mapBackendDataToFrontend(employeesData);
      setAllEmployees(mappedEmployees);
      toast({
        title: "Refreshed",
        description: "Employee data has been refreshed",
        duration: 1000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      const data = await getEmployees();

      // Map backend data to frontend display format
      const mappedEmployees: Employee[] = mapBackendDataToFrontend(data);

      // Filter data for export
      const filteredData = mappedEmployees.filter((emp: Employee) => {
        const matchesSearch = !searchTerm || 
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof emp.role === 'string' ? emp.role.toLowerCase().includes(searchTerm.toLowerCase()) : '');
        
        const employeeDepartmentName = typeof emp.department === "object" 
          ? emp.department?.name 
          : emp.department;
        
        const matchesDepartment = selectedDepartment === "All" || (employeeDepartmentName && employeeDepartmentName === selectedDepartment);
        const matchesRole = selectedRole === "All" || emp.role === selectedRole;
        const matchesStatus = selectedStatus === "All" || emp.status === selectedStatus;
        
        return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
      });

      const headers = ['Name', 'Email', 'Department', 'Role', 'Status', 'Join Date'];
      const csvContent = [
        headers.join(','),
        ...filteredData.map((emp: Employee) => 
          [emp.name, emp.email, emp.department, emp.role, emp.status, emp.joinDate].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Employee data has been exported",
        duration: 1000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  // Simple refresh for add employee dialog
  const handleAddEmployeeRefresh = async () => {
    const employeesData = await getEmployees();
    const mappedEmployees: Employee[] = mapBackendDataToFrontend(employeesData);
    setAllEmployees(mappedEmployees);
  };

  // Handle add employee
  const handleAddEmployee = async (data: EmployeeFormValues) => {
    try {
      await createEmployee(data);
      
      // Refresh data
      const employeesData = await getEmployees();
      
      // Map backend data to frontend display format
      const mappedEmployees: Employee[] = mapBackendDataToFrontend(employeesData);
      
      setAllEmployees(mappedEmployees);

      toast({
        title: "Success",
        description: "Employee added successfully",
        duration: 1000,
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (data: EmployeeFormValues) => {
    if (!editingEmployee) return;

    try {
      await updateEmployee(editingEmployee.id, data);
      
      // Refresh data
      const employeesData = await getEmployees();
      
      // Map backend data to frontend display format
      const mappedEmployees: Employee[] = mapBackendDataToFrontend(employeesData);
      
      setAllEmployees(mappedEmployees);

      toast({
        title: "Success",
        description: "Employee updated successfully",
        duration: 1000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
        duration: 1000,
      });
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalEmployees / pageSize);

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEES_CREATE}>
              <AddEmployeeDialog 
                mode="add"
                onRefresh={handleAddEmployeeRefresh}
              />
            </PermissionGuard>
          </div>
        </div>

        {/* Stats Cards */}
        {employees.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">Total Employees</div>
                    <div className="text-xl sm:text-2xl font-bold">{employees.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                    <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">Active Employees</div>
                    <div className="text-xl sm:text-2xl font-bold">{employees.filter(e => e.status === "Active").length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">Departments</div>
                    <div className="text-xl sm:text-2xl font-bold">{employees.map(e => e.department).filter((v, i, a) => a.indexOf(v) === i).length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters Card */}
        <Card className="border border-gray-200 shadow-none rounded-xl mb-6 bg-white">
          <CardContent className="p-4">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full">
              <div className="relative w-full md:max-w-xs">
                <Input
                  placeholder="Search by name, email, or role..."
                  className="pl-10 h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <DepartmentDropdown value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} />
              <RoleDropdown value={selectedRole} onChange={e => setSelectedRole(e.target.value)} />
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-36 bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {/* Employee List */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Employee List</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
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
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {sortConfig.key === "name" && (
                          sortConfig.direction === "asc" ? 
                            <SortAsc className="h-4 w-4" /> : 
                            <SortDesc className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Join Date</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(loading || isRefreshing) ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Loading employees...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <span className="text-sm text-muted-foreground">No employees found</span>
                          <Button variant="outline" onClick={() => {
                            setSearchTerm("");
                            setSelectedDepartment("All");
                            setSelectedRole("All");
                            setSelectedStatus("All");
                          }}>
                            Clear Filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.user?.firstName || "Not provided"}</TableCell>
                        <TableCell>{employee.user?.email || "Not provided"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {typeof employee.department === 'object' ? employee.department?.name : employee.department || ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {/* Fix role display - check multiple possible sources */}
                          {(() => {
                            // First check if user.roles exists and is an array
                            if (employee.user?.roles && Array.isArray(employee.user.roles)) {
                              if (employee.user.roles.length > 0) {
                                return employee.user.roles.map((role: any) => 
                                  typeof role === 'object' ? (role.name || role) : role
                                ).join(', ');
                              }
                            }
                            // Then check the mapped role field
                            if (employee.role) {
                              return typeof employee.role === 'object' 
                                ? (employee.role.name || 'Not provided')
                                : employee.role;
                            }
                            // Default fallback
                            return 'Not provided';
                          })()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${
                              employee.status === "Active" 
                                ? "bg-green-50 text-green-700" 
                                : employee.status === "Inactive"
                                ? "bg-red-50 text-red-700"
                                : employee.status === "On Leave"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {employee.status || 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {employee.joinDate && isValid(parseISO(employee.joinDate))
                            ? format(parseISO(employee.joinDate), 'PPP')
                            : ''}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Actions</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem onClick={() => handleView(employee)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(employee)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Employee
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(employee)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Employee
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
            {!loading && !isRefreshing && employees.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalEmployees)} of {totalEmployees} entries
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
      </div>

      {/* View Employee Dialog */}
      <ViewEmployeeDialog
        employee={viewingEmployee}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

      {/* Edit Employee Dialog */}
      <AddEmployeeDialog
        mode="edit"
        employee={editingEmployeeForm}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEmployeeEdit={handleEditSubmit}
      />
    </div>
  );
}
