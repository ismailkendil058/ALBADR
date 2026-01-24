import React from 'react';
import { useEmployeeAuth } from '@/context/EmployeeAuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface EmployeeProtectedRouteProps {
  children: React.ReactNode;
}

const EmployeeProtectedRoute: React.FC<EmployeeProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useEmployeeAuth();

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/employee/login" replace />;
  }

  return <>{children}</>;
};

export default EmployeeProtectedRoute;
