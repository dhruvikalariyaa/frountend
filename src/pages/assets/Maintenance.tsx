import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Plus,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash,
} from "lucide-react";
import { ViewMaintenanceDialog } from "@/components/assets/ViewMaintenanceDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock data for demonstration
const maintenanceTasks = [
  {
    id: 1,
    assetName: "Dell XPS Server",
    type: "Preventive",
    status: "Scheduled",
    priority: "High",
    assignedTo: "IT Support Team",
    dueDate: "2024-03-01",
    lastMaintenance: "2024-01-01",
    frequency: "Monthly",
    description: "Regular server maintenance and updates",
  },
  {
    id: 2,
    assetName: "Network Switches",
    type: "Preventive",
    status: "In Progress",
    priority: "Medium",
    assignedTo: "Network Team",
    dueDate: "2024-02-25",
    lastMaintenance: "2024-01-25",
    frequency: "Monthly",
    description: "Firmware updates and performance check",
  },
  {
    id: 3,
    assetName: "Office Printers",
    type: "Corrective",
    status: "Completed",
    priority: "Low",
    assignedTo: "IT Support Team",
    dueDate: "2024-02-20",
    lastMaintenance: "2024-02-20",
    frequency: "As Needed",
    description: "Fixed paper jam and replaced toner",
  },
  {
    id: 4,
    assetName: "UPS Systems",
    type: "Preventive",
    status: "Overdue",
    priority: "High",
    assignedTo: "IT Support Team",
    dueDate: "2024-02-15",
    lastMaintenance: "2024-01-15",
    frequency: "Monthly",
    description: "Battery check and system test",
  },
];

const stats = [
  {
    title: "Pending Tasks",
    value: "12",
    change: "+3",
    trend: "up",
    icon: Clock,
  },
  {
    title: "Completed",
    value: "25",
    change: "+5",
    trend: "up",
    icon: CheckCircle2,
  },
  {
    title: "Overdue Tasks",
    value: "3",
    change: "-2",
    trend: "down",
    icon: AlertCircle,
  },
  {
    title: "Upcoming Tasks",
    value: "8",
    change: "+2",
    trend: "up",
    icon: Calendar,
  },
];

function getStatusBadge(status: string) {
  const statusMap: Record<string, { bg: string; text: string }> = {
    Scheduled: { bg: "bg-blue-50", text: "text-blue-700" },
    "In Progress": { bg: "bg-yellow-50", text: "text-yellow-700" },
    Completed: { bg: "bg-green-50", text: "text-green-700" },
    Overdue: { bg: "bg-red-50", text: "text-red-700" },
  };

  const { bg, text } = statusMap[status] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
  };

  return (
    <Badge variant="outline" className={`${bg} ${text}`}>
      {status}
    </Badge>
  );
}

function getPriorityBadge(priority: string) {
  const priorityMap: Record<string, { bg: string; text: string }> = {
    High: { bg: "bg-red-50", text: "text-red-700" },
    Medium: { bg: "bg-yellow-50", text: "text-yellow-700" },
    Low: { bg: "bg-green-50", text: "text-green-700" },
  };

  const { bg, text } = priorityMap[priority] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
  };

  return (
    <Badge variant="outline" className={`${bg} ${text}`}>
      {priority}
    </Badge>
  );
}

export default function Maintenance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleViewDetails = (task: any) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Will be replaced with actual API call
      console.log("Refreshing data...");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredTasks = maintenanceTasks.filter((task) => {
    const matchesSearch =
      searchQuery === "" ||
      task.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Maintenance Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-3 mb-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    {stat.title}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="flex items-center text-xs">
                    <span
                      className={`font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    {/* <span className="text-gray-500 ml-1">from last month</span> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <Card className="border border-gray-200 shadow-none rounded-xl mb-6 bg-white">
        <CardContent className="p-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Filters & Search
            </h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full">
            <div className="relative w-full md:max-w-xs">
              <Input
                placeholder="Search by asset name or assigned team..."
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
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-36 bg-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={() => {}}
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Maintenance Tasks
                </h2>
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
                        <RefreshCw
                          className={`h-4 w-4 ${
                            isRefreshing ? "animate-spin" : ""
                          }`}
                        />
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
                  <TableHead className="text-gray-700 font-semibold">
                    Asset Name
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Type
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Priority
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Assigned To
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Due Date
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRefreshing ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Loading maintenance tasks...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <TableCell className="font-medium text-gray-900">
                        {task.assetName}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {task.type}
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell className="text-gray-700">
                        {task.assignedTo}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {task.dueDate}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(task)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Wrench className="mr-2 h-4 w-4" />
                              Assign to Team
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Cancel Task
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredTasks.length)} of{" "}
              {filteredTasks.length} entries
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

      {/* View Maintenance Dialog */}
      <ViewMaintenanceDialog
        task={selectedTask}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}
