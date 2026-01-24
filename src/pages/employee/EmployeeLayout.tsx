import React from 'react';
import { Outlet } from 'react-router-dom';
import { useEmployeeAuth } from '@/context/EmployeeAuthContext';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmployeeLayout: React.FC = () => {
  const { logout } = useEmployeeAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div>
                <h1 className="text-xl font-bold text-primary">طاحونة البدر</h1>
                <p className="text-xs text-muted-foreground">Employee Dashboard</p>
            </div>
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </Button>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
