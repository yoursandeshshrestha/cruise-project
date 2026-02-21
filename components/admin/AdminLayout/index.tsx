import React, { useState } from 'react';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { MaintenanceBanner } from '../MaintenanceBanner';
import { AdminSidebarProvider, useAdminSidebar } from '../../../contexts/AdminSidebarContext';
import { useSystemSettingsStore } from '../../../stores/systemSettingsStore';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  breadcrumbs?: BreadcrumbItem[];
}

function AdminLayoutContent({
  children,
  showSidebar = false,
  showHeader = false,
  breadcrumbs = [{ label: 'Dashboard' }]
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCollapsed, toggleSidebar } = useAdminSidebar();
  const isMaintenanceMode = useSystemSettingsStore((state) => state.isMaintenanceMode());

  if (!showSidebar && !showHeader) {
    // Simple layout for login page
    return (
      <div data-admin-page className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div data-admin-page className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      {showSidebar && (
        <aside
          className={`hidden lg:block shrink-0 transition-all duration-300 ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <Sidebar />
        </aside>
      )}

      {/* Mobile Sidebar Overlay */}
      {showSidebar && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-full lg:hidden w-64">
            <Sidebar />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Maintenance Mode Banner - Only visible to admins */}
        {isMaintenanceMode && <MaintenanceBanner />}

        {showHeader && (
          <Header
            onMenuClick={() => {
              // On desktop, toggle collapse
              if (window.innerWidth >= 1024) {
                toggleSidebar();
              } else {
                // On mobile, toggle mobile sidebar
                setSidebarOpen(!sidebarOpen);
              }
            }}
            breadcrumbs={breadcrumbs}
          />
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          {children}
        </div>
      </main>
    </div>
  );
}

export const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  return (
    <AdminSidebarProvider>
      <AdminLayoutContent {...props} />
    </AdminSidebarProvider>
  );
};
