export const COMPONENT_PERMISSIONS = {
  // Dashboard Components - using dashboard view permission
  Dashboard: 'dashboard.dashboard.view',
  
  // Employee Management Components
  EmployeeList: 'employeemanagement.employee.view',
  EmployeeDetails: 'employeemanagement.employee.view',
  EmployeeForm: 'employeemanagement.employee.create',
  DepartmentList: 'employeemanagement.department.view',
  DepartmentForm: 'employeemanagement.department.create',
  AttendanceList: 'employeemanagement.attendence.view',
  AttendanceForm: 'employeemanagement.attendence.create',
  PerformanceList: 'employeemanagement.performance.view',
  PerformanceForm: 'employeemanagement.performance.create',
  LeaveList: 'employeemanagement.leave.view',
  LeaveForm: 'employeemanagement.leave.create',
  
  // Hiring Components
  JobList: 'hiring.job.view',
  JobForm: 'hiring.job.create',
  CandidateList: 'hiring.candidate.view',
  CandidateForm: 'hiring.candidate.create',
  InterviewList: 'hiring.interview.view',
  InterviewForm: 'hiring.interview.create',
  OnboardingList: 'hiring.onboarding.view',
  OnboardingForm: 'hiring.onboarding.create',
  
  // Settings Components
  CompanyProfile: 'settings.companyprofile.view',
  CompanyProfileForm: 'settings.companyprofile.edit',
  RolesPermissions: 'settings.rolespermisions.view',
  SystemSettings: 'settings.systemsettings.view',
  SystemSettingsForm: 'settings.systemsettings.edit',
} as const; 