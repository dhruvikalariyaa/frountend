import  { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Search, MoreHorizontal, Plus, RefreshCw, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import * as XLSX from 'xlsx';
import { AddLeaveRequestDialog } from '@/components/employees/AddLeaveRequestDialog';
import { ViewLeaveRequestDialog } from '@/components/employees/ViewLeaveRequestDialog';

// Mock data for leave requests
const leaveRequests = [
  {
    id: 1,
    employee: 'John Doe',
    type: 'Annual Leave',
    startDate: '2024-03-15',
    endDate: '2024-03-20',
    status: 'Approved',
    days: 5,
    reason: 'Family vacation',
  },
  {
    id: 2,
    employee: 'Jane Smith',
    type: 'Sick Leave',
    startDate: '2024-03-10',
    endDate: '2024-03-12',
    status: 'Pending',
    days: 3,
    reason: 'Medical appointment',
  },
  {
    id: 3,
    employee: 'Mike Johnson',
    type: 'Maternity Leave',
    startDate: '2024-04-01',
    endDate: '2024-07-01',
    status: 'Approved',
    days: 90,
    reason: 'Maternity leave',
  },
  {
    id: 4,
    employee: 'Sarah Wilson',
    type: 'Unpaid Leave',
    startDate: '2024-03-25',
    endDate: '2024-03-27',
    status: 'Rejected',
    days: 3,
    reason: 'Personal reasons',
  },
];

// Mock data for leave balances
const leaveBalances = [
  {
    type: 'Annual Leave',
    total: 20,
    used: 5,
    remaining: 15,
  },
  {
    type: 'Sick Leave',
    total: 10,
    used: 2,
    remaining: 8,
  },
  {
    type: 'Maternity Leave',
    total: 90,
    used: 0,
    remaining: 90,
  },
  {
    type: 'Unpaid Leave',
    total: 30,
    used: 3,
    remaining: 27,
  },
];

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
}

export default function LeaveManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [leaveRequestsData, setLeaveRequestsData] = useState(leaveRequests);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Refreshing data...');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApproveRequest = (id: number) => {
    console.log('Approve leave request:', id);
    setLeaveRequestsData(prev => 
      prev.map(req => req.id === id ? { ...req, status: 'Approved' } : req)
    );
  };

  const handleRejectRequest = (id: number) => {
    console.log('Reject leave request:', id);
    setLeaveRequestsData(prev => 
      prev.map(req => req.id === id ? { ...req, status: 'Rejected' } : req)
    );
  };

  const handleDeleteRequest = (id: number) => {
    console.log('Delete leave request:', id);
    setLeaveRequestsData(prev => prev.filter(req => req.id !== id));
  };

  const leaveStats = {
    totalLeaveRequests: leaveRequestsData.length,
    pendingApprovals: leaveRequestsData.filter(request => request.status === 'Pending').length,
    approvedLeaves: leaveRequestsData.filter(request => request.status === 'Approved').length,
    rejectedLeaves: leaveRequestsData.filter(request => request.status === 'Rejected').length,
  };

  const filteredRequests = leaveRequestsData.filter((request) => {
    const matchesSearch =
      searchQuery === '' ||
      request.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRequests.map(request => ({
        'Employee': request.employee,
        'Type': request.type,
        'Start Date': request.startDate,
        'End Date': request.endDate,
        'Days': request.days,
        'Status': request.status,
        'Reason': request.reason
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LeaveRequests');
    XLSX.writeFile(workbook, 'leave_requests.xlsx');
  };

  const handleAddRequest = (newRequest: any) => {
    console.log('Add leave request:', newRequest);
    // Will be replaced with API call
  };

  const handleViewDetails = (request: any) => {
    setSelectedLeaveRequest(request);
    setIsViewOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <Button onClick={() => {
          setIsAddEditOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Leave Request
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leave Requests</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.totalLeaveRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Overall</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires action</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.approvedLeaves}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Leaves</CardTitle>
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveStats.rejectedLeaves}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {leaveBalances.map((balance) => (
              <Card key={balance.type} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{balance.type}</CardTitle>
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{balance.remaining}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {balance.used} days used of {balance.total}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <Card className="border border-gray-200 shadow-none rounded-xl mb-6 bg-white">
        <CardContent className="p-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full">
            <div className="relative w-full md:max-w-xs">
              <Input
                placeholder="Search by employee, type, or reason..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 flex justify-end">
              <Button onClick={handleExport} size="icon" className="h-10 w-10 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card className="border border-gray-200 shadow-none rounded-xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leave Requests</CardTitle>
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
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl px-4">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-gray-700 font-semibold">Employee</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Type</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Start Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold">End Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Days</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Reason</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRefreshing ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading leave requests...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50 transition">
                      <TableCell className="font-medium text-gray-900">{request.employee}</TableCell>
                      <TableCell className="text-gray-700">{request.type}</TableCell>
                      <TableCell className="text-gray-700">{request.startDate}</TableCell>
                      <TableCell className="text-gray-700">{request.endDate}</TableCell>
                      <TableCell className="text-gray-700">{request.days}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-700">{request.reason}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleApproveRequest(request.id)}>
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectRequest(request.id)}>
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteRequest(request.id)}
                            >
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} entries
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

      {/* Leave Request Dialogs (Placeholders for now) */}
      <AddLeaveRequestDialog
        open={isAddEditOpen}
        onOpenChange={(open) => {
          setIsAddEditOpen(open);
        }}
        onSubmit={handleAddRequest}
      />

      <ViewLeaveRequestDialog
        request={selectedLeaveRequest}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />
    </div>
  );
} 