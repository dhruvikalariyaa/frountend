import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requiredModulePermission?: { module: string; action: string };
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  children, 
  requiredPermission,
  requiredPermissions,
  requiredModulePermission,
  fallback 
}: PermissionGuardProps) {
  const { hasPermission, hasModulePermission, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkPermissions = React.useCallback(() => {
    // Super Admin role has full access to everything (system role)
    if (user?.role === 'Super Admin' || user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin') {
      return true;
    }
    
    // Check module permission first
    if (requiredModulePermission) {
      return hasModulePermission(requiredModulePermission.module, requiredModulePermission.action);
    }
    
    // Check single permission
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return false;
    }
    
    // Check multiple permissions
    if (requiredPermissions && !requiredPermissions.some(permission => hasPermission(permission))) {
      return false;
    }
    
    return true;
  }, [requiredPermission, requiredPermissions, requiredModulePermission, hasPermission, hasModulePermission, user]);

  React.useEffect(() => {
    if (!checkPermissions()) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [checkPermissions, navigate, toast]);

  if (!checkPermissions()) {
    return fallback || null;
  }

  return <>{children}</>;
}

// HOC to wrap components with permission check
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission?: string,
  requiredPermissions?: string[],
  requiredModulePermission?: { module: string; action: string }
) {
  return function WithPermissionComponent(props: P) {
    return (
      <PermissionGuard 
        requiredPermission={requiredPermission}
        requiredPermissions={requiredPermissions}
        requiredModulePermission={requiredModulePermission}
      >
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}

// Add default export
export default PermissionGuard; 
