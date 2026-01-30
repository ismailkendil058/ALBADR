import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeAuthContextType {
    employee: any | null;
    isAuthenticated: boolean;
    login: (phone: string, password: string) => Promise<{ error: string | null }>;
    logout: () => void;
    isLoading: boolean;
}

const EmployeeAuthContext = createContext<EmployeeAuthContextType | undefined>(undefined);

export const EmployeeAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [employee, setEmployee] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedEmployee = localStorage.getItem('employee_session');
        if (savedEmployee) {
            setEmployee(JSON.parse(savedEmployee));
        }
        setIsLoading(false);
    }, []);

    const login = async (phone: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('employees' as any)
                .select('*')
                .eq('phone', phone)
                .eq('password', password)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setEmployee(data);
                localStorage.setItem('employee_session', JSON.stringify(data));
                return { error: null };
            } else {
                return { error: 'Invalid phone number or password.' };
            }
        } catch (err: any) {
            console.error('Login error:', err.message);
            return { error: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setEmployee(null);
        localStorage.removeItem('employee_session');
    };

    const isAuthenticated = !!employee;

    return (
        <EmployeeAuthContext.Provider value={{ employee, isAuthenticated, login, logout, isLoading }}>
            {children}
        </EmployeeAuthContext.Provider>
    );
};

export const useEmployeeAuth = () => {
    const context = useContext(EmployeeAuthContext);
    if (!context) {
        throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
    }
    return context;
};
