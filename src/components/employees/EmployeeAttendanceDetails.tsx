import { format, parseISO } from "date-fns";
import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  UserCheck,
  UserX,
  Timer
} from "lucide-react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late';
  workingHours: string;
}

interface EmployeeAttendanceDetailsProps {
  employee: AttendanceRecord;
  employeeHistory: AttendanceRecord[];
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
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

const getProgressColor = (value: number) => {
  if (value >= 90) return "bg-green-500";
  if (value >= 70) return "bg-yellow-500";
  return "bg-red-500";
};

export function EmployeeAttendanceDetails({ 
  employee, 
  employeeHistory 
}: EmployeeAttendanceDetailsProps) {
  const attendanceRate = (
    (employeeHistory.filter(r => r.status === 'Present').length / employeeHistory.length) * 100
  ).toFixed(1);

  const punctualityRate = (
    (employeeHistory.filter(r => r.status !== 'Late').length / employeeHistory.length) * 100
  ).toFixed(1);

  const stats = [
    {
      title: "Attendance Rate",
      value: attendanceRate,
      icon: CalendarCheck,
      description: "Percentage of days present"
    },
    {
      title: "Punctuality Rate",
      value: punctualityRate,
      icon: CalendarClock,
      description: "Percentage of days on time"
    },
    {
      title: "Absent Days",
      value: employeeHistory.filter(r => r.status === 'Absent').length,
      icon: CalendarX,
      description: "Total days absent this month"
    }
  ];

  return (
    <DialogContent className="max-w-4xl max-h-[90vh]">
      <ScrollArea className="h-full max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl font-semibold">
              {getInitials(employee.employeeName)}
            </span>
            <div>
              <DialogTitle className="text-2xl">{employee.employeeName}</DialogTitle>
              <DialogDescription className="text-base">
                {employee.department} • Employee ID: {employee.employeeId}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 my-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {typeof stat.value === 'number' && stat.value % 1 === 0 ? stat.value : `${stat.value}%`}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                {typeof stat.value === 'string' && (
                  <Progress 
                    value={parseFloat(stat.value)} 
                    className={`mt-2 ${getProgressColor(parseFloat(stat.value))}`}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Attendance History</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Working Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeHistory.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{format(parseISO(record.date), 'MMM dd, yyyy')}</TableCell>
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
                          <TableCell>{record.checkIn}</TableCell>
                          <TableCell>{record.checkOut}</TableCell>
                          <TableCell>{record.workingHours}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardContent className="p-6">
                <ScrollArea className="h-[400px]">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                    {employeeHistory.slice(0, 14).map((record) => (
                      <div key={record.id} className="mb-8 flex gap-4">
                        <div className={`relative mt-3 flex h-6 w-6 items-center justify-center rounded-full border ${
                          record.status === "Present"
                            ? "border-green-500 bg-green-50"
                            : record.status === "Late"
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-red-500 bg-red-50"
                        }`}>
                          {getStatusIcon(record.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">
                              {format(parseISO(record.date), 'EEEE, MMMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {record.workingHours}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {record.status === "Present" && `Checked in at ${record.checkIn} and worked until ${record.checkOut}`}
                            {record.status === "Late" && `Late arrival at ${record.checkIn}, worked until ${record.checkOut}`}
                            {record.status === "Absent" && "Absent for the day"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </DialogContent>
  );
} 