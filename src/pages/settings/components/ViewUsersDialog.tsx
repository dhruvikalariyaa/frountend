import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Role } from '@/types/models';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  [key: string]: any; // Allow additional properties like roles array
}

interface ViewUsersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  users: User[];
  onUnassignUser: (userId: string) => void;
  onUnassignAllUsers: () => void;
  isProcessing?: boolean;
}

export const ViewUsersDialog: React.FC<ViewUsersDialogProps> = ({
  isOpen,
  onOpenChange,
  role,
  users,
  onUnassignUser,
  onUnassignAllUsers,
  isProcessing = false
}) => {
  if (!role) return null;

  // Better filtering for assigned users - handle different role formats
  const assignedUsers = users.filter(u => {
    // Check traditional role field
    if (u.role && (u.role === role.name || u.role === role._id || u.role === role.id)) {
      return true;
    }
    
    // Check roles array (new structure)
    if (u.roles && Array.isArray(u.roles)) {
      return u.roles.includes(role.name) || u.roles.includes(role._id) || u.roles.includes(role.id);
    }
    
    return false;
  });
  
  // Debug logging
  console.log('🔍 ViewUsersDialog filtering:', {
    role: { name: role.name, id: role.id, _id: role._id },
    totalUsers: users.length,
    assignedUsers: assignedUsers.length,
    userSample: users[0]
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Users with Role: {role.name}</DialogTitle>
          <DialogDescription>
            Manage users assigned to the "{role.name}" role.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {isProcessing && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Updating user assignments...</span>
            </div>
          )}
          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {assignedUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  <p className="text-xs text-green-600 mt-1">✅ Assigned to {role.name}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onUnassignUser(u.id)}
                  disabled={isProcessing}
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
              </div>
            ))}
            {assignedUsers.length === 0 && !isProcessing && (
              <p className="text-center text-gray-500 py-4">No users are assigned to this role.</p>
            )}
          </div>
          {assignedUsers.length > 0 && (
            <DialogFooter className="!justify-between mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button variant="destructive" onClick={onUnassignAllUsers}>
                <X className="mr-2 h-4 w-4" /> Unassign All
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 