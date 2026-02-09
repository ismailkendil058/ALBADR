import React from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useEmployeeAuth } from '@/context/EmployeeAuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  type?: 'admin' | 'employee' | 'manager';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, type = 'admin' }) => {
  const adminAuth = useAdminAuth();
  const employeeAuth = useEmployeeAuth();
  const location = useLocation();

  // For manager, check if manager is logged in (stored in localStorage)
  const isManagerLoggedIn = type === 'manager' && localStorage.getItem('manager_id');
  const isManagerLoading = false;
  
  const { isAuthenticated, isLoading } = type === 'manager' ? { isAuthenticated: !!isManagerLoggedIn, isLoading: isManagerLoading } : (type === 'admin' ? adminAuth : employeeAuth);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = type === 'admin' ? '/admin/login' : type === 'manager' ? '/manager/login' : '/employee/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
