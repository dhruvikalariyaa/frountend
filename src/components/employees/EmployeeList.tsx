//this is for the roles and permissions for the employees
import { withPermission } from '@/components/PermissionGuard';
import { COMPONENT_PERMISSIONS } from '@/constants/componentPermissions';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

interface EmployeeListProps {
  // Add your props here
}

function EmployeeList({}: EmployeeListProps) {
  const { hasPermission } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employees</h1>
        {hasPermission(COMPONENT_PERMISSIONS.EmployeeForm) && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>
      
      {/* Employee list content */}
      <div className="grid gap-4">
        {/* Your employee list implementation */}
      </div>
    </div>
  );
}

// Export the component wrapped with permission check
export default withPermission(EmployeeList, COMPONENT_PERMISSIONS.EmployeeList); 