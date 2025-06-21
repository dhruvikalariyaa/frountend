import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Settings, FileText, Workflow, Bell, Shield } from 'lucide-react';

// Mock data for demonstration
const mockRoles = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access',
    permissions: ['all'],
    isSystem: true,
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Department management access',
    permissions: ['read:all', 'create:all', 'update:all'],
    isSystem: false,
  },
];

const mockCustomFields = [
  {
    id: '1',
    name: 'Priority Level',
    type: 'select',
    entity: 'task',
    isRequired: true,
    options: ['Low', 'Medium', 'High'],
  },
  {
    id: '2',
    name: 'Project Category',
    type: 'select',
    entity: 'project',
    isRequired: true,
    options: ['Internal', 'Client', 'Maintenance'],
  },
];

const mockStatuses = [
  {
    id: '1',
    name: 'Active',
    type: 'client',
    color: '#22c55e',
    order: 1,
    isDefault: true,
    isActive: true,
  },
  {
    id: '2',
    name: 'Inactive',
    type: 'client',
    color: '#ef4444',
    order: 2,
    isDefault: false,
    isActive: true,
  },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('roles');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          System Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">
            <Shield className="w-4 h-4 mr-2" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="fields">
            <FileText className="w-4 h-4 mr-2" />
            Custom Fields
          </TabsTrigger>
          <TabsTrigger value="statuses">
            <Workflow className="w-4 h-4 mr-2" />
            Statuses
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Workflow className="w-4 h-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Roles & Permissions</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Role</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                  </DialogHeader>
                  {/* Role creation form will go here */}
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>System Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {role.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {role.isSystem ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Custom Fields</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Field</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Custom Field</DialogTitle>
                  </DialogHeader>
                  {/* Custom field creation form will go here */}
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCustomFields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{field.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{field.entity}</Badge>
                    </TableCell>
                    <TableCell>
                      {field.isRequired ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="statuses" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Statuses</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Status</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Status</DialogTitle>
                  </DialogHeader>
                  {/* Status creation form will go here */}
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStatuses.map((status) => (
                  <TableRow key={status.id}>
                    <TableCell>{status.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{status.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                    </TableCell>
                    <TableCell>
                      {status.isDefault ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {status.isActive ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Workflows</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Workflow</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Workflow</DialogTitle>
                  </DialogHeader>
                  {/* Workflow creation form will go here */}
                </DialogContent>
              </Dialog>
            </div>
            {/* Workflow management interface will go here */}
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Notification Templates</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Template</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Notification Template</DialogTitle>
                  </DialogHeader>
                  {/* Template creation form will go here */}
                </DialogContent>
              </Dialog>
            </div>
            {/* Notification template management interface will go here */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 