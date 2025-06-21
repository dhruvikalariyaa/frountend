import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth, PERMISSIONS } from "@/contexts/AuthContext";
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
          <PermissionGuard requiredPermission={PERMISSIONS.VIEW_DASHBOARD}>
            <Dashboard />
          </PermissionGuard>
        } />
        
        {/* Employee Management Routes */}
        <Route path="employees">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_EMPLOYEES}>
              <Employees />
            </PermissionGuard>
          } />
          <Route path="departments" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_DEPARTMENTS}>
              <Departments />
            </PermissionGuard>
          } />
          <Route path="attendance" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_ATTENDANCE}>
              <Attendance />
            </PermissionGuard>
          } />
          <Route path="performance" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_PERFORMANCE}>
              <Performance />
            </PermissionGuard>
          } />
          <Route path="leaves" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_ATTENDANCE}>
              <LeaveManagement />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Hiring Management Routes */}
        <Route path="hiring">
          <Route path="candidates" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_CANDIDATES}>
              <Candidates />
            </PermissionGuard>
          } />
          <Route path="jobs" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_JOBS}>
              <Jobs />
            </PermissionGuard>
          } />
          <Route path="interviews" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_INTERVIEWS}>
              <Interviews />
            </PermissionGuard>
          } />
          <Route path="onboarding" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_ONBOARDING}>
              <Onboarding />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Project Management Routes */}
        <Route path="projects">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_PROJECTS}>
              <Projects />
            </PermissionGuard>
          } />
          <Route path="tasks" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_PROJECTS}>
              <Tasks />
            </PermissionGuard>
          } />
          <Route path="sprints" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_PROJECTS}>
              <Sprints />
            </PermissionGuard>
          } />
          <Route path="timeline" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_PROJECTS}>
              <Timeline />
            </PermissionGuard>
          } />
          <Route path="resources" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_PROJECTS}>
              <Resources />
            </PermissionGuard>
          } />
          <Route path="deliverables" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_PROJECTS}>
              <Deliverables />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Sales & Clients Routes */}
        <Route path="sales">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_CLIENTS}>
              <Clients />
            </PermissionGuard>
          } />
          <Route path="clients" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_CLIENTS}>
              <Clients />
            </PermissionGuard>
          } />
          <Route path="proposals" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_PROPOSALS}>
              <Proposals />
            </PermissionGuard>
          } />
          <Route path="contracts" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_CONTRACTS}>
              <Contracts />
            </PermissionGuard>
          } />
          <Route path="revenue" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_REPORTS}>
              <Revenue />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Asset Management Routes */}
        <Route path="assets">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_SETTINGS}>
              <Assets />
            </PermissionGuard>
          } />
          <Route path="licenses" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_SETTINGS}>
              <Licenses />
            </PermissionGuard>
          } />
          <Route path="maintenance" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_SETTINGS}>
              <Maintenance />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Finance Routes */}
        <Route path="finance">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_INVOICES}>
              <Invoices />
            </PermissionGuard>
          } />
          <Route path="invoices" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_INVOICES}>
              <Invoices />
            </PermissionGuard>
          } />
          <Route path="expenses" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_EXPENSES}>
              <Expenses />
            </PermissionGuard>
          } />
          <Route path="payroll" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_PAYROLL}>
              <Payroll />
            </PermissionGuard>
          } />
          <Route path="reports" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_REPORTS}>
              <Reports />
            </PermissionGuard>
          } />
        </Route>
        
        {/* Settings Routes */}
        <Route path="settings">
          <Route index element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_SETTINGS}>
              <CompanyProfile />
            </PermissionGuard>
          } />
          <Route path="company" element={
            <PermissionGuard requiredPermission={PERMISSIONS.VIEW_SETTINGS}>
              <CompanyProfile />
            </PermissionGuard>
          } />
          <Route path="roles" element={
            <PermissionGuard requiredPermission={PERMISSIONS.MANAGE_ROLES}>
              <RolesPermissions />
            </PermissionGuard>
          } />
          <Route path="system" element={
            <PermissionGuard requiredPermission={PERMISSIONS.MANAGE_SETTINGS}>
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
