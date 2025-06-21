import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
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
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";

// Mock data for tasks
const tasks = {
  "To Do": [
    {
      id: "TASK-001",
      title: "Design Homepage Layout",
      description: "Create wireframes and mockups for the new homepage",
      priority: "High",
      assignee: "John Smith",
      dueDate: "2024-03-25",
      project: "Website Redesign",
      labels: ["Design", "Frontend"],
    },
    {
      id: "TASK-002",
      title: "Set Up Development Environment",
      description: "Configure local development environment for the team",
      priority: "Medium",
      assignee: "Sarah Johnson",
      dueDate: "2024-03-20",
      project: "Mobile App Development",
      labels: ["Development", "Setup"],
    },
  ],
  "In Progress": [
    {
      id: "TASK-003",
      title: "Implement User Authentication",
      description: "Set up JWT authentication and user management",
      priority: "High",
      assignee: "Mike Brown",
      dueDate: "2024-03-28",
      project: "Website Redesign",
      labels: ["Backend", "Security"],
    },
    {
      id: "TASK-004",
      title: "Database Schema Design",
      description: "Design and implement the database schema",
      priority: "Medium",
      assignee: "Emily Davis",
      dueDate: "2024-03-22",
      project: "Mobile App Development",
      labels: ["Database", "Backend"],
    },
  ],
  "In Review": [
    {
      id: "TASK-005",
      title: "API Documentation",
      description: "Create comprehensive API documentation",
      priority: "Low",
      assignee: "Alex Wilson",
      dueDate: "2024-03-21",
      project: "Website Redesign",
      labels: ["Documentation"],
    },
  ],
  Done: [
    {
      id: "TASK-006",
      title: "Project Setup",
      description: "Initialize project repository and basic structure",
      priority: "Medium",
      assignee: "Lisa Chen",
      dueDate: "2024-03-15",
      project: "Mobile App Development",
      labels: ["Setup"],
    },
    {
      id: "TASK-007",
      title: "Requirements Gathering",
      description: "Document project requirements and specifications",
      priority: "High",
      assignee: "David Lee",
      dueDate: "2024-03-10",
      project: "Website Redesign",
      labels: ["Planning"],
    },
  ],
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Tasks() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(tasks).map(([status, statusTasks]) => (
          <Card key={status}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{status}</CardTitle>
                <Badge variant="secondary">{statusTasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusTasks.map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium">{task.title}</h3>
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
                              Assign
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="h-4 w-4 mr-2" />
                              Set Due Date
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">{task.project}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-2">
                            {task.assignee
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          {task.assignee}
                        </div>
                        <div className="text-muted-foreground">
                          Due {task.dueDate}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {task.labels.map((label) => (
                          <Badge
                            key={label}
                            variant="secondary"
                            className="text-xs"
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
