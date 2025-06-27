import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Accordion } from "@/components/ui/accordion";
import { Role } from '@/types/models';
import { UserPermissions } from '@/services/permission.service';
import { MemoizedPermissionGroup } from './PermissionGroup';

interface EditRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  roleName: string;
  roleDescription: string;
  permissions: UserPermissions | null;
  permissionGroups: any;
  onRoleNameChange: (name: string) => void;
  onRoleDescriptionChange: (description: string) => void;
  onPermissionChange: (module: string, submodule: string, action: string, checked: boolean) => void;
  onSelectAllPermissions: (module: string, shouldSelect: boolean) => void;
  areAllModulePermissionsSelected: (moduleKey: string) => boolean;
  countAssignedPermissions: (modulePermissions: any) => number;
  countTotalPermissionsInGroup: (modulePermissions: any) => number;
  onSave: () => void;
  onCancel: () => void;
}

export const EditRoleDialog: React.FC<EditRoleDialogProps> = ({
  isOpen,
  onOpenChange,
  role,
  roleName,
  roleDescription,
  permissions,
  permissionGroups,
  onRoleNameChange,
  onRoleDescriptionChange,
  onPermissionChange,
  onSelectAllPermissions,
  areAllModulePermissionsSelected,
  countAssignedPermissions,
  countTotalPermissionsInGroup,
  onSave,
  onCancel
}) => {
  if (!role || !permissions) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Role: {role.name || 'Unknown'}</DialogTitle>
          <DialogDescription>
            Modify the name, description, and permissions for the "{role.name || 'Unknown'}" role.
            <span className="text-sm text-blue-600 ml-2">
              Changes are automatically saved to the backend.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto space-y-6">
          {/* Role Name and Description Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="editRoleName" className="text-sm font-semibold">Role Name</Label>
              <Input
                id="editRoleName"
                value={roleName}
                onChange={(e) => onRoleNameChange(e.target.value)}
                placeholder="Enter role name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRoleDescription" className="text-sm font-semibold">Role Description</Label>
              <Input
                id="editRoleDescription"
                value={roleDescription}
                onChange={(e) => onRoleDescriptionChange(e.target.value)}
                placeholder="Enter role description"
              />
            </div>
          </div>
          
          {/* Permissions Content */}
          <Accordion type="multiple" className="w-full mt-2 space-y-3">
            {Object.entries(permissionGroups).map(([groupKey, group]) => (
              <MemoizedPermissionGroup
                key={groupKey}
                groupKey={groupKey}
                group={group}
                permissions={permissions}
                onPermissionChange={onPermissionChange}
                onSelectAll={onSelectAllPermissions}
                areAllSelected={areAllModulePermissionsSelected(groupKey)}
                assignedCount={countAssignedPermissions((permissions as any)?.[groupKey])}
                totalCount={countTotalPermissionsInGroup((permissions as any)?.[groupKey])}
                isEditing={true}
              />
            ))}
          </Accordion>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={!permissions}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 