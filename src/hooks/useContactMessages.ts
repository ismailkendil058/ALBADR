import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
export type ContactMessageInsert = Database['public']['Tables']['contact_messages']['Insert'];
export type ContactMessageUpdate = Database['public']['Tables']['contact_messages']['Update'];

export function useContactMessages() {
    const queryClient = useQueryClient();

    const { data: messages, isLoading, error } = useQuery<ContactMessage[], Error>({
        queryKey: ['contact-messages'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return data || [];
        },
    });

    const sendMessageMutation = useMutation<ContactMessage, Error, ContactMessageInsert>({
        mutationFn: async (newMessage) => {
            const { data, error } = await supabase
                .from('contact_messages')
                .insert(newMessage)
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
        },
    });

    const updateMessageMutation = useMutation<ContactMessage, Error, { id: string; updatedFields: ContactMessageUpdate }>({
        mutationFn: async ({ id, updatedFields }) => {
            const { data, error } = await supabase
                .from('contact_messages')
                .update(updatedFields)
                .eq('id', id)
                .select()
                .single();
            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
        },
    });

    const deleteMessageMutation = useMutation<void, Error, string>({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', id);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
        },
    });

    return {
        messages,
        isLoading,
        error,
        sendMessage: sendMessageMutation.mutateAsync,
        updateMessage: updateMessageMutation.mutateAsync,
        deleteMessage: deleteMessageMutation.mutateAsync,
    };
}
