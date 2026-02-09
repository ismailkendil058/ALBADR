import React from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useEmployeeAuth } from '@/context/EmployeeAuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  type?: 'superadmin' | 'admin' | 'employee';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, type = 'superadmin' }) => {
  const adminAuth = useAdminAuth();
  const employeeAuth = useEmployeeAuth();
  const location = useLocation();

  // For admin, check if admin is logged in (stored in localStorage - formerly manager)
  const isAdminLoggedIn = type === 'admin' && localStorage.getItem('manager_id');
  const isAdminLoading = false;
  
  const { isAuthenticated, isLoading } = type === 'admin' ? { isAuthenticated: !!isAdminLoggedIn, isLoading: isAdminLoading } : (type === 'superadmin' ? adminAuth : employeeAuth);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = type === 'superadmin' ? '/superadmin/login' : type === 'admin' ? '/admin/login' : '/employee/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
