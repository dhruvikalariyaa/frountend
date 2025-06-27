import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Role } from '@/types/models';
import { Employee } from '@/services/employee.service';
import { Loader2 } from 'lucide-react';

// Extended interface to handle role object with more properties
interface ExtendedRole {
  name?: string;
  _id?: string;
  id?: string;
}

interface AssignUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  users: Employee[];
  userSearchTerm: string;
  onUserSearchChange: (term: string) => void;
  onAssignUser: (userId: string) => void;
  onUnassignUser: (userId: string) => void;
  isLoading: boolean;
  error: string | null;
  isProcessing?: boolean;
}

export const AssignUserDialog: React.FC<AssignUserDialogProps> = ({
  isOpen,
  onOpenChange,
  role,
  users,
  userSearchTerm,
  onUserSearchChange,
  onAssignUser,
  onUnassignUser,
  isLoading,
  error,
  isProcessing = false
}) => {
  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Role: {role.name}</DialogTitle>
          <DialogDescription>
            Select a user to assign the "{role.name}" role to.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Search users..."
            value={userSearchTerm}
            onChange={(e) => onUserSearchChange(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading users...</span>
              </div>
            )}
            {error && <div className="text-red-500">{error}</div>}
            {!isLoading && !error && users
              .filter(emp => {
                const name = emp.user
                  ? `${emp.user.firstName || ''} ${emp.user.lastName || ''}`.trim()
                  : emp.firstName || emp.lastName || '';
                const email = emp.user?.email || emp.email || '';
                return (
                  (name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                    email.toLowerCase().includes(userSearchTerm.toLowerCase()))
                );
              })
              .map(emp => {
                const name = emp.user
                  ? `${emp.user.firstName || ''} ${emp.user.lastName || ''}`.trim()
                  : emp.firstName || emp.lastName || 'No Name';
                const email = emp.user?.email || emp.email || 'No Email';
                
                // Enhanced role assignment check with better logic
                const userRoles = emp.user?.roles || [];
                const empRole = emp.role;
                
                // Debug logging to see the actual data structure
                if (process.env.NODE_ENV === 'development') {
                  console.log('🔍 Role check for user:', {
                    empId: (emp as any).id,
                    empName: name,
                    userRoles: userRoles,
                    empRole: empRole,
                    checkingRole: { name: role.name, id: role.id, _id: role._id }
                  });
                }
                
                // Improved role checking logic
                let isAssigned = false;
                
                // Check if userRoles is an array of strings
                if (Array.isArray(userRoles)) {
                  isAssigned = userRoles.some(userRole => {
                    if (typeof userRole === 'string') {
                      return userRole === role.name || userRole === role._id || userRole === role.id;
                    } else if (typeof userRole === 'object' && userRole) {
                      return (userRole as any).name === role.name || 
                             (userRole as any)._id === role._id || 
                             (userRole as any).id === role.id;
                    }
                    return false;
                  });
                }
                
                // Check empRole if not already assigned
                if (!isAssigned && empRole) {
                  if (typeof empRole === 'string') {
                    isAssigned = empRole === role.name || empRole === role._id || empRole === role.id;
                  } else if (typeof empRole === 'object') {
                    isAssigned = empRole.name === role.name || 
                                (empRole as any)._id === role._id || 
                                (empRole as any).id === role.id;
                  }
                }
                
                // Additional check for direct role assignment
                if (!isAssigned && (emp as any).roleId) {
                  isAssigned = (emp as any).roleId === role._id || (emp as any).roleId === role.id;
                }
                
                // Check if user has this role in their roles array (different format)
                if (!isAssigned && (emp as any).roles && Array.isArray((emp as any).roles)) {
                  isAssigned = (emp as any).roles.some((r: any) => {
                    if (typeof r === 'string') {
                      return r === role.name || r === role._id || r === role.id;
                    } else if (typeof r === 'object' && r) {
                      return r.name === role.name || r._id === role._id || r.id === role.id;
                    }
                    return false;
                  });
                }
                
                // Show current role if user has one
                const currentRole = typeof empRole === 'object' ? empRole?.name : empRole;
                const hasOtherRole = currentRole && currentRole !== role.name && !isAssigned;
                
                const userId = emp.user?._id || emp.user?.id || (emp as any)._id || (emp as any).id;
                
                // Additional debug for assigned state
                if (process.env.NODE_ENV === 'development') {
                  console.log('📋 Assignment check result:', {
                    empName: name,
                    isAssigned: isAssigned,
                    currentRole: currentRole,
                    hasOtherRole: hasOtherRole,
                    userId: userId
                  });
                }
                
                return (
                  <div key={(emp as any).id || (emp as any)._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-gray-500">{email}</p>
                      {hasOtherRole && (
                        <p className="text-xs text-blue-600 mt-1">Current Role: {currentRole}</p>
                      )}
                      {isAssigned && (
                        <p className="text-xs text-green-600 mt-1">✅ Assigned to {role.name}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isAssigned ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            console.log('🔥 Unassigning user:', userId);
                            userId && onUnassignUser(userId);
                          }} 
                          disabled={!userId || isProcessing}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Unassigning...
                            </>
                          ) : (
                            'Unassign'
                          )}
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            console.log('✅ Assigning user:', userId);
                            userId && onAssignUser(userId);
                          }} 
                          disabled={!userId || isProcessing}
                          className="bg-black hover:bg-black"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Assigning...
                            </>
                          ) : (
                            hasOtherRole ? 'Reassign' : 'Assign'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            {!isLoading && !error && users.length === 0 && (
              <div className="text-gray-500">No users found.</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 