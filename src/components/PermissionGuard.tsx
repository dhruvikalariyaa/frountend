import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  children, 
  requiredPermission,
  requiredPermissions,
  fallback 
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkPermissions = React.useCallback(() => {
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return false;
    }
    if (requiredPermissions && !requiredPermissions.some(permission => hasPermission(permission))) {
      return false;
    }
    return true;
  }, [requiredPermission, requiredPermissions, hasPermission]);

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
  requiredPermissions?: string[]
) {
  return function WithPermissionComponent(props: P) {
    return (
      <PermissionGuard 
        requiredPermission={requiredPermission}
        requiredPermissions={requiredPermissions}
      >
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}

// Add default export
export default PermissionGuard; 
