import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Manager {
    id: string;
    name: string;
    phone: string;
    password?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export function useManagers() {
    const queryClient = useQueryClient();

    const managersQuery = useQuery({
        queryKey: ['managers'],
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from('managers' as any)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching managers:', error);
                    throw error;
                }
                console.log('Managers fetched successfully:', data);
                return (data as unknown) as Manager[];
            } catch (err) {
                console.error('useManagers error:', err);
                throw err;
            }
        },
    });

    const createManager = useMutation({
        mutationFn: async (newManager: Omit<Manager, 'id' | 'created_at' | 'updated_at'>) => {
            const { data, error } = await supabase
                .from('managers' as any)
                .insert([newManager])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['managers'] });
        },
    });

    const updateManager = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Manager> & { id: string }) => {
            const { data, error } = await supabase
                .from('managers' as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['managers'] });
        },
    });

    const deleteManager = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('managers' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['managers'] });
        },
    });

    return {
        managers: managersQuery.data ?? [],
        isLoading: managersQuery.isLoading,
        error: managersQuery.error,
        createManager,
        updateManager,
        deleteManager,
    };
}
