import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth, PERMISSIONS } from "./contexts/AuthContext";
import PermissionGuard from "@/components/PermissionGuard";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/hiring/JobsList";
import Candidates from "./pages/hiring/CandidatesList";
import Interviews from "./pages/hiring/InterviewsList";
import Onboarding from "./pages/hiring/Onboarding";

import Employees from "./pages/employees/Employees";
import Departments from "./pages/employees/Departments";
import Attendance from "./pages/employees/Attendance";
import Performance from "./pages/employees/Performance";
import LeaveManagement from "@/pages/employees/LeaveManagement";
import CompanyProfile from "./pages/settings/CompanyProfile";
import UserProfile from "./pages/UserProfile";
import RolesPermissions from "@/pages/settings/RolesPermissions";
import SystemSettings from "@/pages/settings/SystemSettings";
import Invoices from '@/pages/finance/Invoices';
import Expenses from '@/pages/finance/Expenses';
import Payroll from '@/pages/finance/Payroll';
import Reports from '@/pages/finance/Reports';
import Clients from '@/pages/sales/Clients';
import Proposals from '@/pages/sales/Proposals';
import Contracts from '@/pages/sales/Contracts';
import Revenue from '@/pages/sales/Revenue';
import Projects from '@/pages/projects/Projects';
import Tasks from '@/pages/projects/Tasks';
import Sprints from '@/pages/projects/Sprints';
import Timeline from '@/pages/projects/Timeline';
import Resources from '@/pages/projects/Resources';
import Deliverables from '@/pages/projects/Deliverables';
import Assets from '@/pages/assets/Assets';
import Licenses from '@/pages/assets/Licenses';
import Maintenance from '@/pages/assets/Maintenance';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={
          <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
            <Dashboard />
          </PermissionGuard>
        } />
        
        {/* Employee Management Routes */}
        <Route path="employees">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Employees />
            </PermissionGuard>
          } />
          <Route path="departments" element={
            <PermissionGuard requiredPermission={PERMISSIONS.DEPARTMENT_VIEW}>
              <Departments />
            </PermissionGuard>
          } />
          <Route path="attendance" element={
            <PermissionGuard requiredPermission={PERMISSIONS.ATTENDENCE_VIEW}>
              <Attendance />
            </PermissionGuard>
          } />
          <Route path="performance" element={
            <PermissionGuard requiredPermission={PERMISSIONS.PERFORMANCE_VIEW}>
              <Performance />
            </PermissionGuard>
          } />
          <Route path="leaves" element={
            <PermissionGuard requiredPermission={PERMISSIONS.LEAVE_VIEW}>
              <LeaveManagement />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Hiring Management Routes */}
        <Route path="hiring">
          <Route path="candidates" element={
            <PermissionGuard requiredPermission={PERMISSIONS.CANDIDATE_VIEW}>
              <Candidates />
            </PermissionGuard>
          } />
          <Route path="jobs" element={
            <PermissionGuard requiredPermission={PERMISSIONS.JOB_VIEW}>
              <Jobs />
            </PermissionGuard>
          } />
          <Route path="interviews" element={
            <PermissionGuard requiredPermission={PERMISSIONS.INTERVIEW_VIEW}>
              <Interviews />
            </PermissionGuard>
          } />
          <Route path="onboarding" element={
            <PermissionGuard requiredPermission={PERMISSIONS.ONBOARDING_VIEW}>
              <Onboarding />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Project Management Routes */}
        <Route path="projects">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Projects />
            </PermissionGuard>
          } />
          <Route path="tasks" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Tasks />
            </PermissionGuard>
          } />
          <Route path="sprints" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Sprints />
            </PermissionGuard>
          } />
          <Route path="timeline" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Timeline />
            </PermissionGuard>
          } />
          <Route path="resources" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Resources />
            </PermissionGuard>
          } />
          <Route path="deliverables" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Deliverables />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Sales & Clients Routes */}
        <Route path="sales">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Clients />
            </PermissionGuard>
          } />
          <Route path="clients" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Clients />
            </PermissionGuard>
          } />
          <Route path="proposals" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Proposals />
            </PermissionGuard>
          } />
          <Route path="contracts" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Contracts />
            </PermissionGuard>
          } />
          <Route path="revenue" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Revenue />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Asset Management Routes */}
        <Route path="assets">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.SYSTEMSETTINGS_VIEW}>
              <Assets />
            </PermissionGuard>
          } />
          <Route path="licenses" element={
            <PermissionGuard requiredPermission={PERMISSIONS.SYSTEMSETTINGS_VIEW}>
              <Licenses />
            </PermissionGuard>
          } />
          <Route path="maintenance" element={
            <PermissionGuard requiredPermission={PERMISSIONS.SYSTEMSETTINGS_VIEW}>
              <Maintenance />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Finance Routes */}
        <Route path="finance">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Invoices />
            </PermissionGuard>
          } />
          <Route path="invoices" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Invoices />
            </PermissionGuard>
          } />
          <Route path="expenses" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Expenses />
            </PermissionGuard>
          } />
          <Route path="payroll" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Payroll />
            </PermissionGuard>
          } />
          <Route path="reports" element={
            <PermissionGuard requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}>
              <Reports />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Settings Routes */}
        <Route path="settings">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.COMPANYPROFILE_VIEW}>
              <CompanyProfile />
            </PermissionGuard>
          } />
          <Route path="company" element={
            <PermissionGuard requiredPermission={PERMISSIONS.COMPANYPROFILE_VIEW}>
              <CompanyProfile />
            </PermissionGuard>
          } />
          <Route path="roles" element={
            <PermissionGuard requiredPermission={PERMISSIONS.ROLESPERMISIONS_VIEW}>
              <RolesPermissions />
            </PermissionGuard>
          } />
          <Route path="system" element={
            <PermissionGuard requiredPermission={PERMISSIONS.SYSTEMSETTINGS_VIEW}>
              <SystemSettings />
            </PermissionGuard>
          } />
        </Route>
      </Route>

      {/* User Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <UserProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </Router>
  );
}
