import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type Category = Database['public']['Tables']['categories']['Row'] & {
  products: { count: number }[];
};
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*, products(count)')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export function useCategories() {
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const addCategoryMutation = useMutation<Category, Error, CategoryInsert>({
    mutationFn: async (newCategory) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategoryMutation = useMutation<Category, Error, { id: string; updatedFields: CategoryUpdate }>({
    mutationFn: async ({ id, updatedFields }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updatedFields)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategoryMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    categories,
    isLoading,
    error,
    addCategory: addCategoryMutation.mutateAsync,
    updateCategory: updateCategoryMutation.mutateAsync,
    deleteCategory: deleteCategoryMutation.mutateAsync,
  };
}