import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Key,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Plus,
  Search,
  Calendar,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash,
  Users,
  DollarSign,
} from 'lucide-react';
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
} from "@/components/ui/tooltip";
import * as XLSX from 'xlsx';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { AddLicenseDialog } from '@/components/assets/AddLicenseDialog';
import { ViewLicenseDetailsDialog } from '@/components/assets/ViewLicenseDetailsDialog';

// Mock data for demonstration
const mockLicensesData = [
  {
    id: 1,
    name: "Microsoft 365 Business Premium",
    type: "Subscription",
    seats: 50,
    used: 45,
    status: "Active",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    cost: 12,
    vendor: "Microsoft",
    autoRenew: true
  },
  {
    id: 2,
    name: "Adobe Creative Cloud",
    type: "Subscription",
    seats: 10,
    used: 8,
    status: "Active",
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    cost: 52.99,
    vendor: "Adobe",
    autoRenew: true
  },
  {
    id: 3,
    name: "JetBrains IntelliJ IDEA",
    type: "Perpetual",
    seats: 15,
    used: 12,
    status: "Active",
    startDate: "2023-12-01",
    endDate: "2024-12-01",
    cost: 149,
    vendor: "JetBrains",
    autoRenew: true
  },
  {
    id: 4,
    name: "Slack Enterprise",
    type: "Subscription",
    seats: 100,
    used: 85,
    status: "Active",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    cost: 15,
    vendor: "Slack",
    autoRenew: true
  },
  {
    id: 5,
    name: "Salesforce CRM",
    type: "Subscription",
    seats: 20,
    used: 18,
    status: "Active",
    startDate: "2024-02-01",
    endDate: "2025-02-01",
    cost: 75,
    vendor: "Salesforce",
    autoRenew: true
  },
  {
    id: 6,
    name: "Zoom Pro",
    type: "Subscription",
    seats: 30,
    used: 25,
    status: "Active",
    startDate: "2024-03-01",
    endDate: "2025-03-01",
    cost: 14.99,
    vendor: "Zoom",
    autoRenew: true
  },
  {
    id: 7,
    name: "GitHub Enterprise",
    type: "Subscription",
    seats: 25,
    used: 20,
    status: "Expired",
    startDate: "2023-01-01",
    endDate: "2024-01-01",
    cost: 210,
    vendor: "GitHub",
    autoRenew: false
  },
  {
    id: 8,
    name: "Trello Business Class",
    type: "Subscription",
    seats: 40,
    used: 35,
    status: "Active",
    startDate: "2024-04-01",
    endDate: "2025-04-01",
    cost: 10,
    vendor: "Atlassian",
    autoRenew: true
  },
];

interface License {
  id: number;
  name: string;
  type: string;
  seats: number;
  used: number;
  status: string;
  startDate: string;
  endDate: string;
  cost: number;
  vendor: string;
  autoRenew: boolean;
}

type SortField = keyof Omit<License, 'id' | 'cost' | 'seats' | 'used' | 'autoRenew'> | 'cost' | 'seats' | 'used';
type SortOrder = 'asc' | 'desc';

function getStatusBadge(status: string) {
  const statusMap: Record<string, { bg: string; text: string }> = {
    "Active": { bg: "bg-green-100", text: "text-green-700" },
    "Expired": { bg: "bg-red-100", text: "text-red-700" },
    "Pending": { bg: "bg-yellow-100", text: "text-yellow-700" },
  };

  const { bg, text } = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700" };

  return (
    <Badge
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium",
        bg,
        text
      )}
    >
      {status}
    </Badge>
  );
}

export default function Licenses() {
  const [licenses, setLicenses] = useState<License[]>(mockLicensesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField ] = useState<SortField>('name');
  const [sortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddLicenseOpen, setIsAddLicenseOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [viewingLicense, setViewingLicense] = useState<License | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call or re-fetch data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLicenses(mockLicensesData); // Reset to original mock data for demonstration
    setIsRefreshing(false);
    toast.success('Licenses data refreshed!');
  };

  const handleAddLicense = (newLicense: Omit<License, 'id'>) => {
    const newId = Math.max(...licenses.map(l => l.id), 0) + 1;
    setLicenses(prev => [...prev, { ...newLicense, id: newId }]);
    toast.success('License added successfully!');
  };

  const handleEditLicense = (updatedLicense: License) => {
    setLicenses(prev => prev.map(license =>
      license.id === updatedLicense.id ? updatedLicense : license
    ));
    setEditingLicense(null);
    toast.success('License updated successfully!');
  };

  const handleManageUsers = (license: License) => {
    console.log('Manage Users for license:', license.name);
    toast.info(`Managing users for '${license.name}'.`);
    // Implement logic to manage users for this license
  };

  const handleRenewLicense = (license: License) => {
    console.log('Renew License:', license.name);
    toast.info(`Renewing license for '${license.name}'.`);
    // Implement license renewal logic
  };

  const handleCancelLicense = (id: number) => {
    setLicenses(prev => prev.filter(license => license.id !== id));
    console.log('Cancel License:', id);
    toast.success('License cancelled successfully!');
  };

  const handleViewDetails = (license: License) => {
    setViewingLicense(license);
    setIsViewDetailsOpen(true);
  };

  const filteredLicenses = useMemo(() => {
    let filtered = licenses;

    if (searchQuery) {
      filtered = filtered.filter(license =>
        Object.values(license).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(license => license.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(license => license.type === typeFilter);
    }

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    return filtered;
  }, [searchQuery, statusFilter, typeFilter, sortField, sortOrder, licenses]);

  const totalPages = Math.ceil(filteredLicenses.length / itemsPerPage);
  const paginatedLicenses = filteredLicenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLicenses.map(license => ({
        Name: license.name,
        Type: license.type,
        Seats: license.seats,
        Used: license.used,
        Status: license.status,
        StartDate: license.startDate,
        EndDate: license.endDate,
        Cost: license.cost,
        Vendor: license.vendor,
        AutoRenew: license.autoRenew ? 'Yes' : 'No'
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Licenses');
    XLSX.writeFile(workbook, 'licenses.xlsx');
  };

  const licenseStats = useMemo(() => {
    const activeLicenses = licenses.filter(l => l.status === 'Active').length;
    const expiringSoon = licenses.filter(l => {
      const endDate = new Date(l.endDate);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return l.status === 'Active' && diffDays > 0 && diffDays <= 90; // Licenses expiring within 90 days
    }).length;
    const totalMonthlyCost = licenses.reduce((sum, l) => sum + (l.cost * l.used), 0);

    return {
      totalLicenses: licenses.length,
      activeLicenses,
      expiringSoon,
      totalMonthlyCost,
    };
  }, [licenses]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">License Management</h1>
        <Button onClick={() => { setEditingLicense(null); setIsAddLicenseOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add License
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-3 mb-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Key className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Total Licenses</div>
                <div className="text-xl sm:text-2xl font-bold">{licenseStats.totalLicenses}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Subscriptions</div>
                <div className="text-xl sm:text-2xl font-bold">{licenseStats.activeLicenses}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Expiring Soon</div>
                <div className="text-xl sm:text-2xl font-bold">{licenseStats.expiringSoon}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground"> Monthly Cost</div>
                <div className="text-xl sm:text-2xl font-bold">${licenseStats.totalMonthlyCost.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
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
                placeholder="Search by name, type, vendor..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10 h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-36 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-36 bg-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Subscription">Subscription</SelectItem>
                <SelectItem value="Perpetual">Perpetual</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 flex justify-end">
              <Button onClick={handleExport} size="icon" className="h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200">
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Licenses Table */}
      <Card className="border border-gray-200 shadow-none rounded-xl bg-white">
        <CardContent className="p-0">
          <div className="px-4 pt-4 pb-2">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">License List</h2>
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
                    <SelectItem value="20">20 rows</SelectItem>
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
                  <TableHead className="text-gray-700 font-semibold">Name</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Type</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Seats</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Start Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold">End Date</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Cost</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRefreshing ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading licenses...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedLicenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No licenses found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLicenses.map((license) => (
                    <TableRow key={license.id} className="hover:bg-gray-50 transition">
                      <TableCell className="font-medium text-gray-900">{license.name}</TableCell>
                      <TableCell className="text-gray-700">{license.type}</TableCell>
                      <TableCell className="text-gray-700">{license.used}/{license.seats}</TableCell>
                      <TableCell>{getStatusBadge(license.status)}</TableCell>
                      <TableCell className="text-gray-700">{license.startDate}</TableCell>
                      <TableCell className="text-gray-700">{license.endDate}</TableCell>
                      <TableCell className="text-gray-700">${license.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(license)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditingLicense(license); setIsAddLicenseOpen(true); }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit License
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageUsers(license)}>
                              <Users className="mr-2 h-4 w-4" />
                              Manage Users
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRenewLicense(license)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Renew License
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleCancelLicense(license.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Cancel License
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLicenses.length)} of {filteredLicenses.length} entries
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

      {/* Add/Edit License Dialog */}
      <AddLicenseDialog
        open={isAddLicenseOpen}
        onOpenChange={setIsAddLicenseOpen}
        onSubmit={(licenseFormData) => {
          if (editingLicense) {
            handleEditLicense({ ...licenseFormData, id: editingLicense.id });
          } else {
            handleAddLicense(licenseFormData);
          }
        }}
        initialData={editingLicense ? { ...editingLicense, id: editingLicense.id } : undefined}
      />

      {/* View License Details Dialog */}
      <ViewLicenseDetailsDialog
        license={viewingLicense}
        open={isViewDetailsOpen}
        onOpenChange={setIsViewDetailsOpen}
      />
    </div>
  );
}