import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Plus, Search, Pencil, Trash2, UserPlus, UserCheck, Shield, History } from 'lucide-react';
import { Role } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';

// ================================
// ROLE STATS COMPONENT
// ================================
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

// 🚀 PERFORMANCE: Optimized Stats Card Component
const MemoizedStatsCard = memo(({ title, value, icon }: StatCardProps) => (
  <Card>
    <CardContent className="flex items-center justify-between p-6">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="p-3 bg-gray-100 rounded-lg">
        {icon}
      </div>
    </CardContent>
  </Card>
));

MemoizedStatsCard.displayName = 'MemoizedStatsCard';

interface RoleStatsProps {
  rolesCount: number;
  usersCount: number;
  permissionGroupsCount: number;
}

export const RoleStats: React.FC<RoleStatsProps> = ({ 
  rolesCount, 
  usersCount, 
  permissionGroupsCount 
}) => {
  // 🚀 PERFORMANCE: Memoized stats cards data
  const statCards = [
    { title: 'Total Roles', value: rolesCount, icon: <Users className="h-6 w-6 text-blue-500" /> },
    { title: 'Active Users', value: usersCount, icon: <UserCheck className="h-6 w-6 text-green-500" /> },
    { title: 'Permission Groups', value: permissionGroupsCount, icon: <Shield className="h-6 w-6 text-purple-500" /> },
    { title: 'Recent Changes', value: 3, icon: <History className="h-6 w-6 text-orange-500" /> }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map(card => (
        <MemoizedStatsCard key={card.title} {...card} />
      ))}
    </div>
  );
};

// ================================
// ROLE ROW COMPONENT
// ================================
interface RoleRowProps {
  role: Role;
  userCount: number;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onAssignUser: (role: Role) => void;
  onViewUsers: (role: Role) => void;
}

// 🚀 PERFORMANCE: Optimized Role Row Component
const MemoizedRoleRow = memo(({ 
  role, 
  userCount, 
  onEdit, 
  onDelete, 
  onAssignUser, 
  onViewUsers 
}: RoleRowProps) => {
  const { hasPermission } = useAuth();
  const isSystemRole = role.name.toLowerCase() === 'super_admin' || role.name.toLowerCase() === 'super admin';
  
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <span className="inline-block px-3 py-1 border border-gray-300 rounded-full text-gray-500 text-xs font-semibold">
          {role.name}
        </span>
      </TableCell>
      <TableCell className="text-gray-600 text-sm">
        {role.description || `Custom role: ${role.name}`}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{userCount || 0}</span>
          {userCount > 0 && hasPermission('settings.user.view') && (
            <Button 
              variant="link" 
              size="sm" 
              className="text-gray-600 hover:text-black p-0 h-auto font-samll text-xs"
              onClick={() => onViewUsers(role)}
            >
              View Users
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {hasPermission('settings.role.edit') && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center gap-1 text-xs px-2 py-1 h-7" 
              onClick={() => onEdit(role)}
              disabled={isSystemRole}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
          )}
          {hasPermission('settings.role.delete') && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 text-xs px-2 py-1 h-7" 
              onClick={() => onDelete(role)}
              disabled={isSystemRole}
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          )}
          {hasPermission('settings.user.edit') && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center gap-1 text-xs px-2 py-1 h-7"
              onClick={() => onAssignUser(role)}
              disabled={isSystemRole}
            >
              <UserPlus className="h-3 w-3" />
              Add User
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

MemoizedRoleRow.displayName = 'MemoizedRoleRow';

// ================================
// ROLES TABLE COMPONENT (MAIN)
// ================================
interface RolesTableProps {
  roles: Role[];
  userCountsByRole: { [roleName: string]: number };
  roleSearchTerm: string;
  onRoleSearchChange: (term: string) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onAssignUser: (role: Role) => void;
  onViewUsers: (role: Role) => void;
  onCreateFirstRole: () => void;
}

export const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  userCountsByRole,
  roleSearchTerm,
  onRoleSearchChange,
  onEdit,
  onDelete,
  onAssignUser,
  onViewUsers,
  onCreateFirstRole
}) => {
  const filteredRoles = roles.filter((role: Role) =>
    role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(roleSearchTerm.toLowerCase()))
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Existing Roles
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1 text-sm">
              Manage permissions for existing roles
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              <Input
                placeholder="Search roles..."
                value={roleSearchTerm}
                onChange={(e) => onRoleSearchChange(e.target.value)}
              className="pl-9 text-sm h-8"
              />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredRoles.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {roleSearchTerm ? 'No roles found' : 'No roles available'}
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              {roleSearchTerm 
                ? `No roles match "${roleSearchTerm}". Try a different search term.`
                : 'No roles have been created yet. Create your first role to get started.'
              }
            </p>
            {!roleSearchTerm && (
              <Button onClick={onCreateFirstRole} className="bg-blue-600 hover:bg-blue-700 text-sm">
                <Plus className="mr-2 h-3 w-3" /> Create First Role
              </Button>
            )}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900 text-xs">Role Name</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs">Description</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs">Assigned Users</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role: Role) => (
                <MemoizedRoleRow
                  key={role.id || role._id}
                  role={role}
                  userCount={userCountsByRole[role.name] || 0}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAssignUser={onAssignUser}
                  onViewUsers={onViewUsers}
                />
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 