export const MODULE_PERMISSIONS = {
  hiring: {
    candidate: {
      view: 'candidate.view',
      create: 'candidate.create',
      edit: 'candidate.edit',
      delete: 'candidate.delete',
    },
    interview: {
      view: 'interview.view',
      create: 'interview.create',
      edit: 'interview.edit',
      delete: 'interview.delete',
    },
    job: {
      view: 'job.view',
      create: 'job.create',
      edit: 'job.edit',
      delete: 'job.delete',
    },
    onboarding: {
      view: 'onboarding.view',
      create: 'onboarding.create',
      edit: 'onboarding.edit',
      delete: 'onboarding.delete',
    },
  },
  employee: {
    view: 'employee.view',
    create: 'employee.create',
    edit: 'employee.edit',
    delete: 'employee.delete',
  },
  department: {
    view: 'department.view',
    create: 'department.create',
    edit: 'department.edit',
    delete: 'department.delete',
  },
  attendance: {
    view: 'attendance.view',
    create: 'attendance.create',
    edit: 'attendance.edit',
    delete: 'attendance.delete',
  },
  leave: {
    view: 'leave.view',
    create: 'leave.create',
    edit: 'leave.edit',
    delete: 'leave.delete',
  },
  performance: {
    view: 'performance.view',
    create: 'performance.create',
    edit: 'performance.edit',
    delete: 'performance.delete',
  },
};

export type ModulePermissions = typeof MODULE_PERMISSIONS; 