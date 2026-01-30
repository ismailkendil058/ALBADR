import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Employee {
    id: string;
    name: string;
    phone: string;
    password?: string;
    created_at: string;
}

export function useEmployees() {
    const queryClient = useQueryClient();

    const employeesQuery = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('employees' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data as unknown) as Employee[];
        },
    });

    const createEmployee = useMutation({
        mutationFn: async (newEmployee: Omit<Employee, 'id' | 'created_at'>) => {
            const { data, error } = await supabase
                .from('employees' as any)
                .insert([newEmployee])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });

    const updateEmployee = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
            const { data, error } = await supabase
                .from('employees' as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });

    const deleteEmployee = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('employees' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });

    return {
        employees: employeesQuery.data ?? [],
        isLoading: employeesQuery.isLoading,
        error: employeesQuery.error,
        createEmployee,
        updateEmployee,
        deleteEmployee,
    };
}
