
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, Filter, MoreHorizontal, Plus, Download } from 'lucide-react';

// Mock data for deliverables
const deliverablesData = [
  {
    id: 1,
    name: 'Website Design Mockups',
    project: 'Website Redesign',
    type: 'Design',
    status: 'Completed',
    dueDate: '2024-03-15',
    owner: 'Jane Smith',
    version: '1.0',
    size: '2.5 MB',
    lastUpdated: '2024-03-14',
  },
  {
    id: 2,
    name: 'Frontend Implementation',
    project: 'Website Redesign',
    type: 'Development',
    status: 'In Progress',
    dueDate: '2024-04-15',
    owner: 'John Doe',
    version: '0.8',
    size: '15 MB',
    lastUpdated: '2024-03-20',
  },
  {
    id: 3,
    name: 'API Documentation',
    project: 'Mobile App',
    type: 'Documentation',
    status: 'In Review',
    dueDate: '2024-03-25',
    owner: 'Mike Johnson',
    version: '1.2',
    size: '1.8 MB',
    lastUpdated: '2024-03-22',
  },
  {
    id: 4,
    name: 'Test Cases',
    project: 'Mobile App',
    type: 'Testing',
    status: 'Not Started',
    dueDate: '2024-04-01',
    owner: 'Sarah Wilson',
    version: '0.0',
    size: '0 MB',
    lastUpdated: 'N/A',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'In Review':
      return 'bg-yellow-100 text-yellow-800';
    case 'Not Started':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Design':
      return 'bg-purple-100 text-purple-800';
    case 'Development':
      return 'bg-blue-100 text-blue-800';
    case 'Documentation':
      return 'bg-green-100 text-green-800';
    case 'Testing':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Deliverables() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deliverables</h1>
          <p className="text-gray-500">Track project deliverables and their status</p>
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
            Add Deliverable
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliverables</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Finished deliverables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Active deliverables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Upcoming deadlines</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Deliverables List</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search deliverables..."
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliverablesData.map((deliverable) => (
                <TableRow key={deliverable.id}>
                  <TableCell>{deliverable.name}</TableCell>
                  <TableCell>{deliverable.project}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(deliverable.type)}>
                      {deliverable.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(deliverable.status)}>
                      {deliverable.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{deliverable.dueDate}</TableCell>
                  <TableCell>{deliverable.owner}</TableCell>
                  <TableCell>{deliverable.version}</TableCell>
                  <TableCell>{deliverable.lastUpdated}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
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