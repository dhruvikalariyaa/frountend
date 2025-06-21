import  { useState } from 'react';
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
import { Search, Star, TrendingUp, Download, MoreVertical, Edit, Trash, Eye, Plus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as XLSX from 'xlsx';
import { AddReviewDialog } from '@/components/employees/AddReviewDialog';
import { ViewPerformanceDialog } from '@/components/employees/ViewPerformanceDialog';

// Mock data for performance
const performanceData = [
  {
    id: 1,
    employeeName: "John Doe",
    department: "Engineering",
    role: "Senior Developer",
    rating: 4.5,
    projectsCompleted: 12,
    productivity: 95,
    status: "Exceeding",
  },
  {
    id: 2,
    employeeName: "Jane Smith",
    department: "Design",
    role: "UI/UX Designer",
    rating: 4.8,
    projectsCompleted: 15,
    productivity: 98,
    status: "Exceeding",
  },
  {
    id: 3,
    employeeName: "Mike Johnson",
    department: "Sales",
    role: "Sales Manager",
    rating: 4.2,
    projectsCompleted: 8,
    productivity: 88,
    status: "Meeting",
  },
  {
    id: 4,
    employeeName: "Sarah Williams",
    department: "HR",
    role: "HR Manager",
    rating: 4.0,
    projectsCompleted: 10,
    productivity: 85,
    status: "Meeting",
  },
  {
    id: 5,
    employeeName: "David Brown",
    department: "Engineering",
    role: "DevOps Engineer",
    rating: 4.6,
    projectsCompleted: 14,
    productivity: 92,
    status: "Exceeding",
  },
];

export default function Performance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Refreshing data...');
    } finally {
      setIsRefreshing(false);
    }
  };

  const performanceStats = {
    totalEmployees: performanceData.length,
    averageRating: (performanceData.reduce((sum, emp) => sum + emp.rating, 0) / performanceData.length).toFixed(1),
    averageProductivity: Math.round(performanceData.reduce((sum, emp) => sum + emp.productivity, 0) / performanceData.length),
    exceedingEmployees: performanceData.filter(emp => emp.status === "Exceeding").length,
  };

  const filteredData = performanceData.filter((record) => {
    const matchesSearch =
      searchQuery === '' ||
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map(record => ({
        'Employee Name': record.employeeName,
        'Department': record.department,
        'Role': record.role,
        'Rating': record.rating,
        'Projects Completed': record.projectsCompleted,
        'Productivity': `${record.productivity}%`,
        'Status': record.status
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Performance');
    XLSX.writeFile(workbook, 'employee_performance.xlsx');
  };

  const handleAddReview = (newReview: any) => {
    console.log('Add review:', newReview);
    // Will be replaced with API call
  };

  const handleEditClick = (review: any) => {
    setEditingReview(review);
    setIsAddEditOpen(true);
  };

  const handleEditSubmit = (updatedReview: any) => {
    console.log('Updated review:', {
      id: editingReview.id,
      ...updatedReview
    });
    setIsAddEditOpen(false);
    setEditingReview(null);
  };

  const handleViewDetails = (performance: any) => {
    setSelectedPerformance(performance);
    setIsViewOpen(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFull = rating >= i;
      const isHalf = rating >= i - 0.5 && rating < i;

      stars.push(
        <div key={i} className="relative w-4 h-4">
          <Star
            className={`h-4 w-4 absolute ${
              isFull ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
          {isHalf && (
            <div className="absolute top-0 left-0 h-full w-1/2 overflow-hidden">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex gap-1 items-center">
        {stars}
        <span className="ml-1 text-gray-700 text-sm">({rating})</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Performance</h1>
        <Button onClick={() => {
          setEditingReview(null);
          setIsAddEditOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Review
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Average Rating</div>
                <div className="text-xl sm:text-2xl font-bold">{performanceStats.averageRating}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Average Productivity</div>
                <div className="text-xl sm:text-2xl font-bold">{performanceStats.averageProductivity}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Exceeding Employees</div>
                <div className="text-xl sm:text-2xl font-bold">{performanceStats.exceedingEmployees}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border border-gray-200 shadow-none rounded-xl mb-6 bg-white">
        <CardContent className="p-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full">
            <div className="relative w-full md:max-w-xs">
              <Input
                placeholder="Search by name, department, or role..."
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Exceeding">Exceeding</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
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

      {/* Table and Pagination */}
      <Card className="border border-gray-200 shadow-none rounded-xl bg-white">
        <CardContent className="p-0">
          <div className="px-4 pt-4 pb-2">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Performance List</h2>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-40 h-8">
                    <SelectValue placeholder="5" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 rows</SelectItem>
                    <SelectItem value="10">10 rows</SelectItem>
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
                        className="h-8 w-8"
                      >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Refresh Data</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl px-4">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-gray-700 font-semibold">Employee</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Department</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Role</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Rating</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Projects</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Productivity</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRefreshing ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading performance data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50 transition">
                      <TableCell className="font-medium text-gray-900">{record.employeeName}</TableCell>
                      <TableCell className="text-gray-700">{record.department}</TableCell>
                      <TableCell className="text-gray-700">{record.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {renderStars(record.rating)}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">{record.projectsCompleted}</TableCell>
                      <TableCell>
                        <div className="w-full">
                          <Progress value={record.productivity} className="h-2" />
                          <span className="text-sm text-muted-foreground mt-1">
                            {record.productivity}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            record.status === "Exceeding"
                              ? "bg-green-50 text-green-700"
                              : "bg-blue-50 text-blue-700"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(record)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(record)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Review
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
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
          <div className="flex items-center justify-between mt-4 px-4 pb-4">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 px-3 text-sm"
              >
                Previous
              </Button>
              <Button 
                className="bg-black text-white h-8 w-8 p-0 text-sm"
                disabled
              >
                {currentPage}
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Performance Dialog */}
      <ViewPerformanceDialog
        performance={selectedPerformance}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />

      {/* Add/Edit Review Dialog */}
      <AddReviewDialog
        open={isAddEditOpen}
        onOpenChange={(open) => {
          setIsAddEditOpen(open);
          if (!open) setEditingReview(null);
        }}
        onSubmit={editingReview ? handleEditSubmit : handleAddReview}
        initialData={editingReview}
      />
    </div>
  );
} 