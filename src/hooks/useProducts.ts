import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Product = Tables<'products'> & {
  weights?: Tables<'product_weights'>[];
  category?: Tables<'categories'>;
};

export type ProductWeight = Tables<'product_weights'>;

export function useProducts({ page = 1, pageSize = 12, searchQuery }: { page?: number, pageSize?: number, searchQuery?: string } = {}) {
  return useQuery({
    queryKey: ['products', { page, pageSize, searchQuery }],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          weights:product_weights(*)
        `, { count: 'exact' });

      if (searchQuery) {
        query = query.or(`name_fr.ilike.%${searchQuery}%,name_ar.ilike.%${searchQuery}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      return { data: data as Product[], count };
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('products')
        .select(`
          name_ar,
          name_fr,
          *,
          category:categories(*),
          weights:product_weights(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!id,
  });
}

export function useProductsByCategory({ categoryId, page, pageSize = 12 }: { categoryId: string | undefined, page: number, pageSize?: number }) {
  return useQuery({
    queryKey: ['products', 'category', categoryId, { page, pageSize }],
    queryFn: async () => {
      if (!categoryId) return { data: [], count: 0 };

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          weights:product_weights(*)
        `, { count: 'exact' })
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return { data: data as Product[], count };
    },
    enabled: !!categoryId,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          weights:product_weights(*)
        `)
        .eq('is_featured', true)
        .limit(8);

      if (error) throw error;
      return data as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useBestSellerProducts() {
  return useQuery({
    queryKey: ['products', 'bestseller'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          weights:product_weights(*)
        `)
        .eq('is_best_seller', true)
        .limit(8);

      if (error) throw error;
      return data as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      product: TablesInsert<'products'>;
      weights?: { weight: string; price: number; sort_order?: number }[];
    }) => {
      const { data: product, error } = await supabase
        .from('products')
        .insert(data.product)
        .select()
        .single();

      if (error) throw error;

      // Insert weights if provided
      if (data.weights && data.weights.length > 0) {
        const weightsToInsert = data.weights.map((w, index) => ({
          product_id: product.id,
          weight: w.weight,
          price: w.price,
          sort_order: w.sort_order ?? index,
        }));

        const { error: weightsError } = await supabase
          .from('product_weights')
          .insert(weightsToInsert);

        if (weightsError) throw weightsError;
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      product: TablesUpdate<'products'>;
      weights?: { id?: string; weight: string; price: number; sort_order?: number }[];
    }) => {
      const { error } = await supabase
        .from('products')
        .update(data.product)
        .eq('id', data.id);

      if (error) throw error;

      // Handle weights - delete all and re-insert
      if (data.weights !== undefined) {
        await supabase.from('product_weights').delete().eq('product_id', data.id);

        if (data.weights.length > 0) {
          const weightsToInsert = data.weights.map((w, index) => ({
            product_id: data.id,
            weight: w.weight,
            price: w.price,
            sort_order: w.sort_order ?? index,
          }));

          const { error: weightsError } = await supabase
            .from('product_weights')
            .insert(weightsToInsert);

          if (weightsError) throw weightsError;
        }
      }

      return data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Weights are deleted automatically via CASCADE
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function usePromoProducts() {
  return useQuery({
    queryKey: ['products', 'promo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          weights:product_weights(*)
        `)
        .eq('is_promo', true)
        .limit(8);

      if (error) throw error;
      return data as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
