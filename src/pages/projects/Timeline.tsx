
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Download, Filter, MoreHorizontal, Plus, Search } from 'lucide-react';

// Mock data for timeline
const timelineData = [
  {
    id: 1,
    project: 'Website Redesign',
    milestone: 'Project Kickoff',
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    status: 'Completed',
    dependencies: [],
    progress: 100,
    owner: 'John Doe',
  },
  {
    id: 2,
    project: 'Website Redesign',
    milestone: 'Design Phase',
    startDate: '2024-03-16',
    endDate: '2024-04-15',
    status: 'In Progress',
    dependencies: ['Project Kickoff'],
    progress: 60,
    owner: 'Jane Smith',
  },
  {
    id: 3,
    project: 'Website Redesign',
    milestone: 'Development Phase',
    startDate: '2024-04-16',
    endDate: '2024-05-15',
    status: 'Not Started',
    dependencies: ['Design Phase'],
    progress: 0,
    owner: 'Mike Johnson',
  },
  {
    id: 4,
    project: 'Website Redesign',
    milestone: 'Testing & QA',
    startDate: '2024-05-16',
    endDate: '2024-05-31',
    status: 'Not Started',
    dependencies: ['Development Phase'],
    progress: 0,
    owner: 'Sarah Wilson',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Not Started':
      return 'bg-gray-100 text-gray-800';
    case 'Delayed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Timeline() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Timeline</h1>
          <p className="text-gray-500">Track project milestones and dependencies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Active milestones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Finished milestones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Behind schedule</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Timeline</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search milestones..."
                className="w-64"
              />
              <Search className="w-4 h-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Milestone</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dependencies</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timelineData.map((milestone) => (
                <TableRow key={milestone.id}>
                  <TableCell>{milestone.project}</TableCell>
                  <TableCell>{milestone.milestone}</TableCell>
                  <TableCell>{milestone.startDate}</TableCell>
                  <TableCell>{milestone.endDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(milestone.status)}>
                      {milestone.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {milestone.dependencies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {milestone.dependencies.map((dep, index) => (
                          <Badge key={index} variant="outline">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{milestone.progress}%</span>
                  </TableCell>
                  <TableCell>{milestone.owner}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Milestone</DropdownMenuItem>
                        <DropdownMenuItem>Update Progress</DropdownMenuItem>
                        <DropdownMenuItem>Manage Dependencies</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 