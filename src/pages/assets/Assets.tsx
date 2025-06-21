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
  Laptop,
  MoreVertical,
  Plus,
  Search,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Trash,
  Tag,
  Calendar,
  DollarSign,
  User,
  Wrench,
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
import { AddAssetDialog } from '@/components/assets/AddAssetDialog';
import { ViewAssetDetailsDialog } from '@/components/assets/ViewAssetDetailsDialog';
import { toast } from 'sonner';

// Mock data for demonstration
const mockAssetsData = [
  {
    id: 1,
    name: "MacBook Pro 16\"",
    type: "Hardware",
    category: "Laptop",
    status: "In Use",
    assignedTo: "John Doe",
    location: "Office A",
    purchaseDate: "2024-01-15",
    warranty: "2027-01-15",
    value: 2499,
    condition: "Excellent"
  },
  {
    id: 2,
    name: "Dell XPS Server",
    type: "Hardware",
    category: "Server",
    status: "In Use",
    assignedTo: "IT Department",
    location: "Server Room",
    purchaseDate: "2023-12-01",
    warranty: "2026-12-01",
    value: 4999,
    condition: "Good"
  },
  {
    id: 3,
    name: "Microsoft 365",
    type: "Software",
    category: "License",
    status: "Active",
    assignedTo: "All Employees",
    location: "Cloud",
    purchaseDate: "2024-01-01",
    warranty: "2025-01-01",
    value: 12,
    condition: "Active"
  },
  {
    id: 4,
    name: "Cisco Router",
    type: "Hardware",
    category: "Network",
    status: "In Use",
    assignedTo: "Network Team",
    location: "Server Room",
    purchaseDate: "2023-11-15",
    warranty: "2026-11-15",
    value: 1299,
    condition: "Good"
  },
  {
    id: 5,
    name: "HP LaserJet Printer",
    type: "Hardware",
    category: "Printer",
    status: "Maintenance",
    assignedTo: "Office Admin",
    location: "Office B",
    purchaseDate: "2023-10-01",
    warranty: "2026-10-01",
    value: 399,
    condition: "Fair"
  },
  {
    id: 6,
    name: "Adobe Creative Cloud",
    type: "Software",
    category: "License",
    status: "Active",
    assignedTo: "Design Team",
    location: "Cloud",
    purchaseDate: "2024-02-10",
    warranty: "2025-02-10",
    value: 50,
    condition: "Active"
  },
  {
    id: 7,
    name: "iPhone 15",
    type: "Hardware",
    category: "Smartphone",
    status: "In Use",
    assignedTo: "Jane Smith",
    location: "Office A",
    purchaseDate: "2024-03-01",
    warranty: "2027-03-01",
    value: 999,
    condition: "Excellent"
  },
  {
    id: 8,
    name: "External SSD 1TB",
    type: "Hardware",
    category: "Storage",
    status: "Available",
    assignedTo: "None",
    location: "IT Storage",
    purchaseDate: "2024-01-20",
    warranty: "2026-01-20",
    value: 120,
    condition: "New"
  },
];

type Asset = typeof mockAssetsData[0];
type SortField = keyof Omit<Asset, 'id' | 'value'> | 'value';
type SortOrder = 'asc' | 'desc';

function getStatusBadge(status: string) {
  const statusMap: Record<string, { bg: string; text: string }> = {
    "In Use": { bg: "bg-green-100", text: "text-green-700" },
    "Active": { bg: "bg-blue-100", text: "text-blue-700" },
    "Maintenance": { bg: "bg-yellow-100", text: "text-yellow-700" },
    "Retired": { bg: "bg-red-100", text: "text-red-700" },
    "Available": { bg: "bg-gray-100", text: "text-gray-700" },
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

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>(mockAssetsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField] = useState<SortField>('name');
  const [sortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call or re-fetch data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAssets(mockAssetsData); // Reset to original mock data for demonstration
    setIsRefreshing(false);
  };

  const handleAddAsset = (newAsset: Asset) => {
    // In a real app, this would be an API call to add the asset
    const newId = Math.max(...assets.map(a => a.id), 0) + 1;
    setAssets(prev => [...prev, { ...newAsset, id: newId }]);
    toast.success('Asset added successfully!');
  };

  const handleEditAsset = (updatedAsset: Asset) => {
    // In a real app, this would be an API call to update the asset
    setAssets(prev => prev.map(asset =>
      asset.id === updatedAsset.id ? updatedAsset : asset
    ));
    setEditingAsset(null); // Clear editing state
    toast.success('Asset updated successfully!');
  };

  const filteredAssets = useMemo(() => {
    let filtered = assets; // Use the state-managed assets

    if (searchQuery) {
      filtered = filtered.filter(asset =>
        Object.values(asset).some(value =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => asset.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(asset => asset.category === categoryFilter);
    }

    // Sorting
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
  }, [searchQuery, statusFilter, categoryFilter, sortField, sortOrder, assets]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredAssets.map(asset => ({
        Name: asset.name,
        Type: asset.type,
        Category: asset.category,
        Status: asset.status,
        AssignedTo: asset.assignedTo,
        Location: asset.location,
        PurchaseDate: asset.purchaseDate,
        Warranty: asset.warranty,
        Value: asset.value,
        Condition: asset.condition
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');
    XLSX.writeFile(workbook, 'assets.xlsx');
  };

  const handleViewDetails = (asset: Asset) => {
    setViewingAsset(asset);
    setIsViewDetailsOpen(true);
  };

  const handleDeleteAsset = (id: number) => {
    // In a real app, this would be an API call to delete the asset
    setAssets(prev => prev.filter(asset => asset.id !== id));
    console.log('Delete Asset:', id);
    toast.success('Asset retired successfully!');
  };

  const openEditDialog = (asset: Asset) => {
    setEditingAsset(asset);
    setIsAddAssetOpen(true);
  };

  const handleAssignToEmployee = (asset: Asset) => {
    // In a real app, this would involve opening a dialog to select an employee
    // For now, we'll just update the status directly for demonstration
    setAssets(prevAssets =>
      prevAssets.map(a =>
        a.id === asset.id ? { ...a, status: 'In Use' } : a
      )
    );
    console.log(`Asset '${asset.name}' status changed to 'In Use' due to assignment.`);
    toast.success(`Asset '${asset.name}' assigned and status set to 'In Use'.`);
    // Implement assignment logic (e.g., open a new dialog)
  };

  const handleScheduleMaintenance = (asset: Asset) => {
    // In a real app, this would involve opening a dialog to schedule maintenance details
    // For now, we'll just update the status directly for demonstration
    setAssets(prevAssets =>
      prevAssets.map(a =>
        a.id === asset.id ? { ...a, status: 'Maintenance' } : a
      )
    );
    console.log(`Asset '${asset.name}' status changed to 'Maintenance' due to scheduling maintenance.`);
    toast.success(`Asset '${asset.name}' scheduled for maintenance and status updated.`);
    // Implement scheduling logic (e.g., open a new dialog)
  };

  const assetStats = useMemo(() => ({
    totalAssets: assets.length,
    inUseAssets: assets.filter(asset => asset.status === 'In Use').length,
    totalValue: assets.reduce((sum, asset) => sum + asset.value, 0),
    pendingMaintenance: assets.filter(asset => asset.status === 'Maintenance').length,
  }), [assets]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Asset Management</h1>
        <Button onClick={() => { setEditingAsset(null); setIsAddAssetOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-3 mb-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Laptop className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Total Assets</div>
                <div className="text-xl sm:text-2xl font-bold">{assetStats.totalAssets}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Assets In Use</div>
                <div className="text-xl sm:text-2xl font-bold">{assetStats.inUseAssets}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Maintenance</div>
                <div className="text-xl sm:text-2xl font-bold">{assetStats.pendingMaintenance}</div>
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
                <div className="text-xs sm:text-sm font-medium text-muted-foreground">Total Value</div>
                <div className="text-xl sm:text-2xl font-bold">${assetStats.totalValue.toLocaleString()}</div>
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
                placeholder="Search by name, type, category, or assignee..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value); setCurrentPage(1);}}> 
              <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-36 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="In Use">In Use</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(value) => {setCategoryFilter(value); setCurrentPage(1);}}> 
              <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-36 bg-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Laptop">Laptop</SelectItem>
                <SelectItem value="Server">Server</SelectItem>
                <SelectItem value="License">License</SelectItem>
                <SelectItem value="Network">Network</SelectItem>
                <SelectItem value="Printer">Printer</SelectItem>
                <SelectItem value="Smartphone">Smartphone</SelectItem>
                <SelectItem value="Storage">Storage</SelectItem>
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

      {/* Assets Table */}
      <Card className="border border-gray-200 shadow-none rounded-xl bg-white">
        <CardContent className="p-0">
          <div className="px-4 pt-4 pb-2">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Asset List</h2>
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
                  <TableHead className="text-gray-700 font-semibold">Category</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Assigned To</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Location</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Value</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRefreshing ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading assets...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No assets found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAssets.map((asset) => (
                    <TableRow key={asset.id} className="hover:bg-gray-50 transition">
                      <TableCell className="font-medium text-gray-900">{asset.name}</TableCell>
                      <TableCell className="text-gray-700">{asset.type}</TableCell>
                      <TableCell className="text-gray-700">{asset.category}</TableCell>
                      <TableCell>{getStatusBadge(asset.status)}</TableCell>
                      <TableCell className="text-gray-700">{asset.assignedTo}</TableCell>
                      <TableCell className="text-gray-700">{asset.location}</TableCell>
                      <TableCell className="text-gray-700">${asset.value.toLocaleString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(asset)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(asset)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Asset
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignToEmployee(asset)}>
                              <User className="mr-2 h-4 w-4" />
                              Assign to Employee
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleScheduleMaintenance(asset)}>
                              <Wrench className="mr-2 h-4 w-4" />
                              Schedule Maintenance
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteAsset(asset.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Retire Asset
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length} entries
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

      {/* Add/Edit Asset Dialog */}
      <AddAssetDialog
        open={isAddAssetOpen}
        onOpenChange={setIsAddAssetOpen}
        onSubmit={editingAsset ? handleEditAsset : handleAddAsset}
        initialData={editingAsset}
      />

      {/* View Asset Details Dialog */}
      <ViewAssetDetailsDialog
        asset={viewingAsset}
        open={isViewDetailsOpen}
        onOpenChange={setIsViewDetailsOpen}
      />
    </div>
  );
}