import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NavigationIcons from './Navigation';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50">
        <NavigationIcons />
      </div>
      <div className="flex pt-16">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <Sidebar />
        </div>
        <div className="flex-1">
          <main className="p-6">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
} 