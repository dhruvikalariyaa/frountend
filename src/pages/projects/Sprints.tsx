import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  FileText,
  MoreVertical,
  Plus,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart,
  Filter,
  ArrowRight,
} from "lucide-react";

// Mock data for sprints
const sprints = [
  {
    id: "SPRINT-001",
    name: "Sprint 1",
    project: "Website Redesign",
    status: "Active",
    startDate: "2024-03-15",
    endDate: "2024-03-28",
    team: ["John Smith", "Sarah Johnson", "Mike Brown"],
    velocity: 24,
    completedPoints: 18,
    remainingPoints: 6,
    burndown: [
      { day: 1, remaining: 24 },
      { day: 2, remaining: 20 },
      { day: 3, remaining: 18 },
      { day: 4, remaining: 15 },
      { day: 5, remaining: 12 },
      { day: 6, remaining: 10 },
      { day: 7, remaining: 8 },
      { day: 8, remaining: 6 },
    ],
    tasks: [
      {
        id: "TASK-001",
        title: "Design Homepage Layout",
        points: 5,
        status: "Completed",
        assignee: "John Smith",
      },
      {
        id: "TASK-002",
        title: "Implement User Authentication",
        points: 8,
        status: "In Progress",
        assignee: "Mike Brown",
      },
      {
        id: "TASK-003",
        title: "Database Schema Design",
        points: 3,
        status: "Completed",
        assignee: "Sarah Johnson",
      },
      {
        id: "TASK-004",
        title: "API Documentation",
        points: 8,
        status: "To Do",
        assignee: "John Smith",
      },
    ],
  },
  {
    id: "SPRINT-002",
    name: "Sprint 2",
    project: "Mobile App Development",
    status: "Planning",
    startDate: "2024-04-01",
    endDate: "2024-04-14",
    team: ["Emily Davis", "Alex Wilson", "Lisa Chen"],
    velocity: 30,
    completedPoints: 0,
    remainingPoints: 30,
    burndown: [],
    tasks: [
      {
        id: "TASK-005",
        title: "Set Up Development Environment",
        points: 5,
        status: "To Do",
        assignee: "Emily Davis",
      },
      {
        id: "TASK-006",
        title: "Design Mobile UI",
        points: 8,
        status: "To Do",
        assignee: "Lisa Chen",
      },
      {
        id: "TASK-007",
        title: "Implement Core Features",
        points: 13,
        status: "To Do",
        assignee: "Alex Wilson",
      },
      {
        id: "TASK-008",
        title: "Testing Setup",
        points: 4,
        status: "To Do",
        assignee: "Emily Davis",
      },
    ],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Planning":
      return "bg-yellow-100 text-yellow-800";
    case "Completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Sprints() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sprints</h1>
          <p className="text-muted-foreground">Manage your agile sprints</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Sprint
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sprint</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sprint 1</div>
            <p className="text-xs text-muted-foreground">Website Redesign</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sprint Velocity
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Story points</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Points
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Of 24 total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Sprint</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sprint 2</div>
            <p className="text-xs text-muted-foreground">Starts Apr 1</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {sprints.map((sprint) => (
          <Card key={sprint.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{sprint.name}</CardTitle>
                  <CardDescription>{sprint.project}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(sprint.status)}>
                    {sprint.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" />
                        Manage Team
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Update Timeline
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Sprint Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Timeline</span>
                      <span>
                        {sprint.startDate} - {sprint.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Velocity</span>
                      <span>{sprint.velocity} points</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>
                        {sprint.completedPoints}/{sprint.velocity} points
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (sprint.completedPoints / sprint.velocity) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Team Members</h3>
                  <div className="flex -space-x-2">
                    {sprint.team.map((member, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                      >
                        {member
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Sprint Tasks</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assignee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sprint.tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          {task.title}
                        </TableCell>
                        <TableCell>{task.points}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.status === "Completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.assignee}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
