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
  Calendar, 
  Clock, 
  Search, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  UserCheck,
  UserX,
  Timer,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format, parseISO, addDays } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { EmployeeAttendanceDetails } from "@/components/employees/EmployeeAttendanceDetails";
import { format as formatDate } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { attendanceService, type AttendanceRecord, type Employee } from "@/services/attendance.service";

// Add new type for form
const markAttendanceSchema = z.object({
  employeeId: z.string({
    required_error: "Please select an employee",
  }),
  status: z.enum(["Present", "Absent", "Late"], {
    required_error: "Please select attendance status",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  notes: z.string().optional(),
});

type MarkAttendanceFormValues = z.infer<typeof markAttendanceSchema>;

// Add type for stats
type StatItem = {
  title: string;
  value: string;
  percentage: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
};

export default function Attendance() {
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [markAttendanceDialog, setMarkAttendanceDialog] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [employeesData, attendanceRecords] = await Promise.all([
          attendanceService.getEmployees(),
          attendanceService.getAttendanceRecords({
            startDate: date?.from,
            endDate: date?.to,
          }),
        ]);

        setEmployees(employeesData);
        setAttendanceData(attendanceRecords);

        // Fetch stats
        const statsData = await attendanceService.getAttendanceStats(new Date());
        setStats([
          {
            title: "Present Today",
            value: statsData.presentToday.toString(),
            percentage: statsData.presentPercentage,
            trend: "up",
            icon: CheckCircle2,
            color: "text-green-500",
          },
          {
            title: "Absent Today",
            value: statsData.absentToday.toString(),
            percentage: statsData.absentPercentage,
            trend: "down",
            icon: XCircle,
            color: "text-red-500",
          },
          {
            title: "Late Today",
            value: statsData.lateToday.toString(),
            percentage: statsData.latePercentage,
            trend: "neutral",
            icon: AlertCircle,
            color: "text-yellow-500",
          },
          {
            title: "Total Hours This Week",
            value: `${statsData.totalHoursThisWeek}h`,
            percentage: statsData.hoursPercentage,
            trend: "up",
            icon: Clock,
            color: "text-blue-500",
          },
        ]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch attendance data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [date?.from, date?.to, toast]); // Updated dependencies

  // Fetch data when filters change
  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        setLoading(true);
        const records = await attendanceService.getAttendanceRecords({
          startDate: date?.from,
          endDate: date?.to,
          department: departmentFilter !== "all" ? departmentFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchQuery || undefined,
        });
        setAttendanceData(records);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch filtered data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredData();
  }, [date?.from, date?.to, departmentFilter, statusFilter, searchQuery, toast]); // Updated dependencies

  // Mark attendance function
  const handleMarkAttendance = async (data: MarkAttendanceFormValues) => {
    try {
      const employee = employees.find(emp => emp.id.toString() === data.employeeId);
      if (!employee) throw new Error("Employee not found");

      const attendanceData = {
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        date: format(data.date, 'yyyy-MM-dd'),
        status: data.status,
        checkIn: data.status === "Absent" ? "-" : data.checkIn || "-",
        checkOut: data.status === "Absent" ? "-" : data.checkOut || "-",
        workingHours: data.status === "Absent" ? "0h" : calculateWorkingHours(data.checkIn, data.checkOut),
        notes: data.notes
      };

      await attendanceService.markAttendance(attendanceData);
      
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
      
      // Refresh data
      const records = await attendanceService.getAttendanceRecords({
        startDate: date?.from,
        endDate: date?.to,
      });
      setAttendanceData(records);
      
      setMarkAttendanceDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  // Export function
  const exportData = async () => {
    try {
      if (!date?.from || !date?.to) {
        throw new Error("Please select a date range");
      }

      const data = await attendanceService.exportAttendance({
        startDate: date.from,
        endDate: date.to,
        department: departmentFilter !== "all" ? departmentFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      // Convert to CSV and download
      const headers = [
        'Employee Name',
        'Employee ID',
        'Department',
        'Date',
        'Status',
        'Check In',
        'Check Out',
        'Working Hours'
      ];

      const csvData = data.map(record => [
        record.employeeName,
        record.employeeId,
        record.department,
        format(new Date(record.date), 'yyyy-MM-dd'),
        record.status,
        record.checkIn,
        record.checkOut,
        record.workingHours
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Attendance data has been exported as CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    }
  };

  // Department options for filtering
  const departments = [...new Set(employees.map(emp => emp.department))];

  // Add this helper function after the types section
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Calculate pagination
  const totalPages = Math.ceil(attendanceData.length / itemsPerPage);
  const paginatedData = attendanceData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper function to calculate working hours
  const calculateWorkingHours = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return "-";
    
    const [checkInHour, checkInMinute] = checkIn.split(":").map(Number);
    const [checkOutHour, checkOutMinute] = checkOut.split(":").map(Number);
    
    const totalMinutes = (checkOutHour * 60 + checkOutMinute) - (checkInHour * 60 + checkInMinute);
    const hours = Math.floor(totalMinutes / 60);
    
    return `${hours}h`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'Absent':
        return <UserX className="h-4 w-4 text-red-500" />;
      case 'Late':
        return <Timer className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const EmployeeDetailsDialog = ({ employee }: { employee: AttendanceRecord }) => {
    const employeeHistory = attendanceData.filter(
      record => record.employeeId === employee.employeeId
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Employee Attendance Details</DialogTitle>
          <DialogDescription>
            View detailed attendance history for {employee.employeeName}
          </DialogDescription>
        </DialogHeader>
        <EmployeeAttendanceDetails employee={employee} employeeHistory={employeeHistory} />
      </DialogContent>
    );
  };

  const MarkAttendanceDialog = () => {
    const form = useForm<MarkAttendanceFormValues>({
      resolver: zodResolver(markAttendanceSchema),
      defaultValues: {
        date: new Date(),
        status: "Present",
      },
    });

    const { status } = form.watch();
    const showTimeFields = status !== "Absent";

    const onSubmit = async (data: MarkAttendanceFormValues) => {
      try {
        await handleMarkAttendance(data);
        form.reset();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to mark attendance",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    return (
    <Dialog open={markAttendanceDialog} onOpenChange={setMarkAttendanceDialog}>
        <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
              Enter attendance details for the employee
          </DialogDescription>
        </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
                      </FormControl>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.name} - {emp.employeeId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Late">Late</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showTimeFields && (
                <>
                  <FormField
                    control={form.control}
                    name="checkIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check In Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            placeholder="Check in time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkOut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check Out Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            placeholder="Check out time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Add any notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

        <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMarkAttendanceDialog(false)}>
            Cancel
          </Button>
                <Button type="submit">Mark Attendance</Button>
        </DialogFooter>
            </form>
          </Form>
      </DialogContent>
    </Dialog>
  );
  };

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
        </div>
          <div className="flex items-center space-x-4">
          <Button onClick={() => setMarkAttendanceDialog(true)}>
          <Calendar className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          // Loading skeleton for stats
          Array(4).fill(0).map((_, index) => (
            <Card key={`loading-stat-${index}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-gray-100 animate-pulse">
                    <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-200 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat, index) => (
            <Card key={`${stat.title}-${index}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`p-2 sm:p-3 rounded-lg ${
                    stat.title === "Present Today" ? "bg-green-100" :
                    stat.title === "Absent Today" ? "bg-red-100" :
                    stat.title === "Late Today" ? "bg-yellow-100" :
                    "bg-blue-100"
                  }`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      stat.title === "Present Today" ? "text-green-600" :
                      stat.title === "Absent Today" ? "text-red-600" :
                      stat.title === "Late Today" ? "text-yellow-600" :
                      "text-blue-600"
                    }`} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</div>
                    <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                    <div className={`text-xs flex items-center ${
                      stat.trend === 'up' ? 'text-green-600' :
                      stat.trend === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {getTrendIcon(stat.trend)}
                      <span className="ml-1">{stat.percentage}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

        {/* Filters Card */}
        <Card className="border border-gray-200 shadow-none rounded-xl mb-6 bg-white">
          <CardContent className="p-4">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Filters & Search</h2>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full">
              <div className="relative w-full md:max-w-xs">
          <Input 
            placeholder="Search by employee name..." 
                  className="pl-10 h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-48 bg-white">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-36 bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
        
        <Popover>
          <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm w-full md:w-auto bg-white">
              <Calendar className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

              <div className="flex-1 flex justify-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={exportData}
                        className="h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                      >
                        <Download   className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export CSV</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
      </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records Table */}
      <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Records</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {loading ? (
                // Loading skeleton for table
                <div className="p-4 space-y-4">
                  {Array(5).fill(0).map((_, index) => (
                    <div key={`loading-row-${index}`} className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Working Hours</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((record) => (
                      <TableRow key={`${record.id}-${record.date}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                                  {getInitials(record.employeeName)}
                                </span>
                            <span className="font-medium">{record.employeeName}</span>
                          </div>
                        </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {record.department}
                              </Badge>
                            </TableCell>
                        <TableCell>{format(parseISO(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>{record.checkOut}</TableCell>
                      <TableCell>
                          <HoverCard>
                            <HoverCardTrigger>
                        <Badge
                          variant="outline"
                          className={
                            record.status === "Present"
                                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : record.status === "Late"
                                    ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                    : "bg-red-50 text-red-700 hover:bg-red-100"
                          }
                        >
                              <span className="flex items-center gap-1">
                                {getStatusIcon(record.status)}
                        {record.status}
                              </span>
                        </Badge>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="flex justify-between space-x-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">Status Details</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {record.status === "Present" ? "On time attendance" :
                                     record.status === "Late" ? "Arrived after scheduled time" :
                                     "Not present for the day"}
                                  </p>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                      </TableCell>
                      <TableCell>{record.workingHours}</TableCell>
                            <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </DialogTrigger>
                            <EmployeeDetailsDialog employee={record} />
                          </Dialog>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 px-4">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, attendanceData.length)} of {attendanceData.length} entries
              </div>
              <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
                  className="h-8 px-3 text-sm"
        >
          Next
        </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mark Attendance Dialog */}
      <MarkAttendanceDialog />
    </div>
  );
} 

