import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { Spinner } from '../ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, adminUser, initialized, initialize } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !adminUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!adminUser.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-destructive mb-2">Account Inactive</h2>
          <p className="text-muted-foreground mb-4">
            Your admin account has been deactivated. Please contact a superadmin.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
