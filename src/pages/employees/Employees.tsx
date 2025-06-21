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
import { format } from 'date-fns';
import { ViewEmployeeDialog } from "@/components/employees/ViewEmployeeDialog";
import { employeeService, type Employee, type EmployeeStats, DEPARTMENTS, ROLES, STATUS_OPTIONS } from "@/services/employee.service";

export default function Employees() {
  // State management
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeesData, statsData] = await Promise.all([
          employeeService.getEmployees({
            page: currentPage,
            pageSize,
            sortBy: sortConfig.key,
            sortDirection: sortConfig.direction,
            search: searchTerm || undefined,
            department: selectedDepartment,
            role: selectedRole,
            status: selectedStatus
          }),
          employeeService.getEmployeeStats()
        ]);

        setEmployees(employeesData);
        setStats(statsData);
        setTotalEmployees(statsData.totalEmployees);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, sortConfig, searchTerm, selectedDepartment, selectedRole, selectedStatus]);

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
      const employeeDetails = await employeeService.getEmployeeById(employee.id);
      if (employeeDetails) {
        setViewingEmployee(employeeDetails);
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employee details",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (employee: Employee) => {
    try {
      const employeeDetails = await employeeService.getEmployeeById(employee.id);
      if (employeeDetails) {
        // Convert employee data to form values format
        const formValues: EmployeeFormValues = {
          firstName: employeeDetails.name.split(' ')[0],
          lastName: employeeDetails.name.split(' ')[1] || '',
          email: employeeDetails.email,
          phone: employeeDetails.phone || '',
          position: employeeDetails.role,
          department: employeeDetails.department.toLowerCase(),
          role: employeeDetails.role.toLowerCase(),
          employeeId: employeeDetails.employeeId || '',
          joiningDate: new Date(employeeDetails.joinDate),
          salary: employeeDetails.salary || 0,
          address: employeeDetails.address || '',
          emergencyContact: employeeDetails.emergencyContact || '',
          bankDetails: employeeDetails.bankDetails || {
            accountNumber: '',
            bankName: '',
            ifscCode: '',
          },
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
      });
    }
  };

  const handleDelete = async (employee: Employee) => {
    try {
      await employeeService.deleteEmployee(employee.id);
      toast({
        title: "Success",
        description: `${employee.name} has been deleted`,
      });
      // Refresh data
      const employeesData = await employeeService.getEmployees({
        page: currentPage,
        pageSize
      });
      setEmployees(employeesData);
      const statsData = await employeeService.getEmployeeStats();
      setStats(statsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  // Refresh data handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [employeesData, statsData] = await Promise.all([
        employeeService.getEmployees({
          page: currentPage,
          pageSize
        }),
        employeeService.getEmployeeStats()
      ]);
      setEmployees(employeesData);
      setStats(statsData);
      toast({
        title: "Refreshed",
        description: "Employee data has been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      const data = await employeeService.exportEmployees({
        department: selectedDepartment,
        role: selectedRole,
        status: selectedStatus,
        search: searchTerm
      });

      const headers = ['Name', 'Email', 'Department', 'Role', 'Status', 'Join Date'];
      const csvContent = [
        headers.join(','),
        ...data.map(emp => 
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
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  // Handle add employee
  const handleAddEmployee = async (data: EmployeeFormValues) => {
    try {
      const bankDetails = data.bankDetails && Object.values(data.bankDetails).some(val => val)
        ? data.bankDetails
        : undefined;

      const newEmployee = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        department: data.department.charAt(0).toUpperCase() + data.department.slice(1),
        role: data.role.charAt(0).toUpperCase() + data.role.slice(1),
        status: 'Active',
        joinDate: format(data.joiningDate, 'yyyy-MM-dd'),
        phone: data.phone || undefined,
        address: data.address || undefined,
        salary: data.salary || undefined,
        employeeId: data.employeeId || undefined,
        emergencyContact: data.emergencyContact || undefined,
        bankDetails
      };

      await employeeService.addEmployee(newEmployee);
      
      // Refresh data
      const [employeesData, statsData] = await Promise.all([
        employeeService.getEmployees({
          page: currentPage,
          pageSize
        }),
        employeeService.getEmployeeStats()
      ]);
      setEmployees(employeesData);
      setStats(statsData);

      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (data: EmployeeFormValues) => {
    if (!editingEmployee) return;

    try {
      const bankDetails = data.bankDetails && Object.values(data.bankDetails).some(val => val)
        ? data.bankDetails
        : undefined;

      const updatedEmployee = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        department: data.department.charAt(0).toUpperCase() + data.department.slice(1),
        role: data.role.charAt(0).toUpperCase() + data.role.slice(1),
        status: editingEmployee.status,
        joinDate: format(data.joiningDate, 'yyyy-MM-dd'),
        phone: data.phone || undefined,
        address: data.address || undefined,
        salary: data.salary || undefined,
        employeeId: data.employeeId || undefined,
        emergencyContact: data.emergencyContact || undefined,
        bankDetails
      };

      await employeeService.updateEmployee(editingEmployee.id, updatedEmployee);
      
      // Refresh data
      const employeesData = await employeeService.getEmployees({
        page: currentPage,
        pageSize
      });
      setEmployees(employeesData);

      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
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
            <AddEmployeeDialog 
              mode="add"
              onEmployeeAdd={handleAddEmployee}
            />
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">Total Employees</div>
                    <div className="text-xl sm:text-2xl font-bold">{stats.totalEmployees}</div>
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
                    <div className="text-xl sm:text-2xl font-bold">{stats.activeEmployees}</div>
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
                    <div className="text-xl sm:text-2xl font-bold">{stats.departments}</div>
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
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-48 bg-white">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Departments</SelectItem>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-48 bg-white">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {employee.department}
                          </Badge>
                        </TableCell>
                        <TableCell>{employee.role}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${
                              employee.status === "Active" 
                                ? "bg-green-50 text-green-700" 
                                : employee.status === "Inactive"
                                ? "bg-red-50 text-red-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(employee.joinDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
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
