import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];

export interface Employee extends Profile {
    role: 'admin' | 'employee';
}

export function useEmployees() {
    const queryClient = useQueryClient();

    // Fetch all users who have a record in the profiles table, 
    // and join their role from user_roles
    const { data: employees, isLoading, error } = useQuery({
        queryKey: ['employees'],
        staleTime: 1000 * 60 * 10, // Keep employee list cached for 10 minutes
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    user_roles(role)
                `);

            if (error) throw error;

            // Flatten the data for easier use in the UI
            return data.map((item: any) => ({
                ...item,
                role: (item.user_roles && item.user_roles[0]?.role) || 'employee'
            })) as Employee[];
        },
    });

    // Create Employee Metadata
    // To create a new AUTH user from the dashboard, use a Supabase Edge Function 
    // with the service_role key. This hook handles the database side.
    const updatePermissionsMutation = useMutation({
        mutationFn: async ({ userId, role, store }: { userId: string, role: 'admin' | 'employee', store: string }) => {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ assigned_store: store })
                .eq('id', userId);

            if (profileError) throw profileError;

            const { error: roleError } = await supabase
                .from('user_roles')
                .upsert({ user_id: userId, role });

            if (roleError) throw roleError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });

    const deleteEmployeeMutation = useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
            return userId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });

    return {
        employees,
        isLoading,
        error,
        updatePermissions: updatePermissionsMutation,
        deleteEmployee: deleteEmployeeMutation,
    };
}
