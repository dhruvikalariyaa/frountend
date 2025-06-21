import { MODULE_PERMISSIONS, PERMISSIONS } from '../contexts/AuthContext';

// Helper function to check if user has permission for a specific module action
export const hasModulePermission = (
  userPermissions: string[],
  module: keyof typeof MODULE_PERMISSIONS,
  action: string
): boolean => {
  const modulePermissions = MODULE_PERMISSIONS[module];
  if (!modulePermissions) return false;

  // Handle nested modules (like hiring.jobs)
  if (typeof modulePermissions === 'object' && 'view' in modulePermissions) {
    const permissionKey = modulePermissions[action as keyof typeof modulePermissions];
    return permissionKey ? userPermissions.includes(permissionKey) : false;
  }

  // Handle sub-modules (like hiring.jobs.view)
  const modulePath = module.split('.');
  let currentLevel: any = MODULE_PERMISSIONS;
  
  for (const path of modulePath) {
    if (currentLevel[path]) {
      currentLevel = currentLevel[path];
    } else {
      return false;
    }
  }

  const permissionKey = currentLevel[action];
  return permissionKey ? userPermissions.includes(permissionKey) : false;
};

// Helper function to check if user can view a module
export const canViewModule = (
  userPermissions: string[],
  module: keyof typeof MODULE_PERMISSIONS
): boolean => {
  return hasModulePermission(userPermissions, module, 'view');
};

// Helper function to check if user can create in a module
export const canCreateInModule = (
  userPermissions: string[],
  module: keyof typeof MODULE_PERMISSIONS
): boolean => {
  return hasModulePermission(userPermissions, module, 'create');
};

// Helper function to check if user can edit in a module
export const canEditInModule = (
  userPermissions: string[],
  module: keyof typeof MODULE_PERMISSIONS
): boolean => {
  return hasModulePermission(userPermissions, module, 'edit');
};

// Helper function to check if user can delete in a module
export const canDeleteInModule = (
  userPermissions: string[],
  module: keyof typeof MODULE_PERMISSIONS
): boolean => {
  return hasModulePermission(userPermissions, module, 'delete');
};

// Helper function to get all permissions for a module
export const getModulePermissions = (module: keyof typeof MODULE_PERMISSIONS): string[] => {
  const modulePermissions = MODULE_PERMISSIONS[module];
  if (!modulePermissions) return [];

  const permissions: string[] = [];
  
  const extractPermissions = (obj: any) => {
    Object.values(obj).forEach(value => {
      if (typeof value === 'string') {
        permissions.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractPermissions(value);
      }
    });
  };

  extractPermissions(modulePermissions);
  return permissions;
};

// Helper function to check if user has any permission for a module
export const hasAnyModulePermission = (
  userPermissions: string[],
  module: keyof typeof MODULE_PERMISSIONS
): boolean => {
  const modulePerms = getModulePermissions(module);
  return modulePerms.some(perm => userPermissions.includes(perm));
};

// Helper function to get user's accessible modules
export const getAccessibleModules = (userPermissions: string[]): string[] => {
  const accessibleModules: string[] = [];
  
  Object.keys(MODULE_PERMISSIONS).forEach(moduleKey => {
    if (hasAnyModulePermission(userPermissions, moduleKey as keyof typeof MODULE_PERMISSIONS)) {
      accessibleModules.push(moduleKey);
    }
  });
  
  return accessibleModules;
};

// Helper function to format permissions for backend API
export const formatPermissionsForAPI = (userPermissions: string[]) => {
  const formattedPermissions: any = {};
  
  Object.keys(MODULE_PERMISSIONS).forEach(moduleKey => {
    const module = moduleKey as keyof typeof MODULE_PERMISSIONS;
    const modulePermissions = MODULE_PERMISSIONS[module];
    
    if (typeof modulePermissions === 'object' && 'view' in modulePermissions) {
      // Simple module
      const modulePerms: any = {};
      Object.keys(modulePermissions).forEach(action => {
        const permissionKey = modulePermissions[action as keyof typeof modulePermissions];
        modulePerms[action] = permissionKey ? userPermissions.includes(permissionKey) : false;
      });
      formattedPermissions[moduleKey] = modulePerms;
    } else {
      // Complex module with sub-modules
      const modulePerms: any = {};
      Object.keys(modulePermissions).forEach(subModuleKey => {
        const subModule = modulePermissions[subModuleKey as keyof typeof modulePermissions];
        if (typeof subModule === 'object') {
          const subModulePerms: any = {};
          Object.keys(subModule).forEach(action => {
            const permissionKey = subModule[action as keyof typeof subModule];
            subModulePerms[action] = permissionKey ? userPermissions.includes(permissionKey) : false;
          });
          modulePerms[subModuleKey] = subModulePerms;
        }
      });
      formattedPermissions[moduleKey] = modulePerms;
    }
  });
  
  return formattedPermissions;
};

// Example usage:
// const userPermissions = ['VIEW_EMPLOYEES', 'MANAGE_EMPLOYEES'];
// const canViewEmployees = canViewModule(userPermissions, 'employees'); // true
// const canCreateEmployees = canCreateInModule(userPermissions, 'employees'); // true
// const canViewHiringJobs = hasModulePermission(userPermissions, 'hiring.jobs', 'view'); // false 