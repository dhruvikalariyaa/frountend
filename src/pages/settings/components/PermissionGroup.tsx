import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UserPermissions } from '@/services/permission.service';

// ================================
// PERMISSION CHECKBOX COMPONENT
// ================================
interface PermissionCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

// 🚀 PERFORMANCE: Memoized Components for Heavy Renders
const MemoizedPermissionCheckbox = memo(({ 
  id, 
  checked, 
  onCheckedChange, 
  label, 
  disabled = false 
}: PermissionCheckboxProps) => {
  // 🔥 BOOLEAN VALIDATION: Ensure checked is strictly boolean
  const isCheckedBoolean = checked === true;
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={isCheckedBoolean}
        onCheckedChange={(checkedValue) => {
          // 🔥 BOOLEAN CONVERSION: Ensure the callback receives strict boolean
          const booleanValue = checkedValue === true;
          onCheckedChange(booleanValue);
        }}
        disabled={disabled}
      />
      <Label htmlFor={id} className="capitalize text-sm">
        {label}
      </Label>
    </div>
  );
});

MemoizedPermissionCheckbox.displayName = 'MemoizedPermissionCheckbox';

// ================================
// PERMISSION GROUP COMPONENT (MAIN)
// ================================

interface PermissionGroupProps {
  groupKey: string;
  group: any;
  permissions: any;
  onPermissionChange: (module: string, submodule: string, action: string, checked: boolean) => void;
  onSelectAll: (module: string, shouldSelect: boolean) => void;
  areAllSelected: boolean;
  assignedCount: number;
  totalCount: number;
  isEditing?: boolean;
}

// 🚀 PERFORMANCE: Memoized Permission Group Component
export const MemoizedPermissionGroup = memo(({ 
  groupKey, 
  group, 
  permissions, 
  onPermissionChange, 
  onSelectAll,
  areAllSelected,
  assignedCount,
  totalCount,
  isEditing = false
}: PermissionGroupProps) => {
  return (
    <AccordionItem value={groupKey} className="border rounded-lg">
      <AccordionTrigger className="p-4 hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="font-semibold">{group.description}</span>
            <Badge variant="secondary">
              {assignedCount} / {totalCount} permissions
            </Badge>
          </div>
          <div className="flex items-center gap-2 pr-2">
            <Checkbox
              id={`select-all-${isEditing ? 'edit-' : ''}${groupKey}`}
              checked={areAllSelected === true}
              onCheckedChange={(checked) => {
                // 🔥 BOOLEAN CONVERSION: Ensure strict boolean value
                const booleanValue = checked === true;
                onSelectAll(groupKey, booleanValue);
              }}
            />
            <Label htmlFor={`select-all-${isEditing ? 'edit-' : ''}${groupKey}`} className="text-sm">
              Select All
            </Label>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 pt-0">
        <div className="space-y-4 pt-4 border-t">
          {Object.entries(group.modules).map(([moduleKey, moduleName]) => (
            <Card key={moduleKey}>
              <CardHeader>
                <CardTitle className="text-base">{String(moduleName)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(permissions?.[groupKey]?.[moduleKey] || {}).map((action) => {
                    const permissionValue = permissions?.[groupKey]?.[moduleKey]?.[action];
                    // 🔥 BOOLEAN VALIDATION: Ensure strict boolean check
                    const isChecked = permissionValue === true;
                    
                    return (
                      <MemoizedPermissionCheckbox
                        key={`${groupKey}-${moduleKey}-${action}`}
                        id={`${isEditing ? 'edit-' : ''}${groupKey}-${moduleKey}-${action}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          // 🔥 BOOLEAN CONVERSION: Ensure strict boolean value
                          const booleanValue = checked === true;
                          onPermissionChange(groupKey, moduleKey, action, booleanValue);
                        }}
                        label={action}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

MemoizedPermissionGroup.displayName = 'MemoizedPermissionGroup'; 