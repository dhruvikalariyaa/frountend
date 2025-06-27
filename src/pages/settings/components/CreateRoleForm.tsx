import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion } from "@/components/ui/accordion";
import { Plus, Check } from 'lucide-react';
import { UserPermissions } from '@/services/permission.service';
import { MemoizedPermissionGroup } from './PermissionGroup';

// ================================
// ROLE TEMPLATES COMPONENT
// ================================
interface RoleTemplatesProps {
  templates: RoleTemplate[];
  selectedTemplate: RoleTemplate | null;
  onTemplateSelect: (template: RoleTemplate) => void;
}

const RoleTemplates: React.FC<RoleTemplatesProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect
}) => {
  return (
    <div>
      <Label className="text-base font-semibold">Role Templates</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer hover:shadow-lg transition-all border-2 ${
              selectedTemplate?.id === template.id ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <CardContent className="p-4 relative">
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-gray-500">{template.description}</p>
              {selectedTemplate?.id === template.id && (
                <div className="absolute top-2 right-2 h-5 w-5 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ================================
// CREATE ROLE FORM COMPONENT (MAIN)
// ================================

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: UserPermissions;
  category: string;
}

interface CreateRoleFormProps {
  roleName: string;
  roleDescription: string;
  permissions: UserPermissions;
  templates: RoleTemplate[];
  selectedTemplate: RoleTemplate | null;
  permissionGroups: any;
  onRoleNameChange: (name: string) => void;
  onRoleDescriptionChange: (description: string) => void;
  onPermissionChange: (module: string, submodule: string, action: string, checked: boolean) => void;
  onSelectAllPermissions: (module: string, shouldSelect: boolean) => void;
  onTemplateSelect: (template: RoleTemplate) => void;
  onCreateRole: () => void;
  areAllModulePermissionsSelected: (moduleKey: string) => boolean;
  countAssignedPermissions: (modulePermissions: any) => number;
  countTotalPermissionsInGroup: (modulePermissions: any) => number;
}

export const CreateRoleForm: React.FC<CreateRoleFormProps> = ({
  roleName,
  roleDescription,
  permissions,
  templates,
  selectedTemplate,
  permissionGroups,
  onRoleNameChange,
  onRoleDescriptionChange,
  onPermissionChange,
  onSelectAllPermissions,
  onTemplateSelect,
  onCreateRole,
  areAllModulePermissionsSelected,
  countAssignedPermissions,
  countTotalPermissionsInGroup
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Create New Role</CardTitle>
        <CardDescription>Define a new role and assign its permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Role Templates */}
        <RoleTemplates
          templates={templates}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={onTemplateSelect}
        />

        {/* Role Name */}
        <div className="space-y-2">
          <Label htmlFor="roleName" className="text-base font-semibold">
            Role Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="roleName"
            value={roleName}
            onChange={(e) => onRoleNameChange(e.target.value)}
            placeholder="e.g., Team Lead"
            required
            className={!roleName.trim() ? "border-red-300 focus:border-red-500" : ""}
          />
          {!roleName.trim() && (
            <p className="text-red-500 text-sm">Role name is required</p>
          )}
        </div>

        {/* Role Description */}
        <div className="space-y-2">
          <Label htmlFor="roleDescription" className="text-base font-semibold">
            Role Description <span className="text-red-500">*</span>
          </Label>
          <Input
            id="roleDescription"
            value={roleDescription}
            onChange={(e) => onRoleDescriptionChange(e.target.value)}
            placeholder="Enter a description for the role"
            required
            className={!roleDescription.trim() ? "border-red-300 focus:border-red-500" : ""}
          />
          {!roleDescription.trim() && (
            <p className="text-red-500 text-sm">Role description is required</p>
          )}
        </div>

        {/* Assign Permissions */}
        <div>
          <Label className="text-base font-semibold">Assign Permissions</Label>
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
                assignedCount={countAssignedPermissions((permissions as any)[groupKey])}
                totalCount={countTotalPermissionsInGroup((permissions as any)[groupKey])}
              />
            ))}
          </Accordion>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={onCreateRole} 
            disabled={!roleName.trim() || !roleDescription.trim()} 
            className="bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Role
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 