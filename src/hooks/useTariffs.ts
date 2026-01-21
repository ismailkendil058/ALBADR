import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type Tariff = Tables<'tariffs'>;

export function useTariffs(store?: 'laghouat' | 'aflou') {
  return useQuery({
    queryKey: ['tariffs', store],
    queryFn: async () => {
      let query = supabase
        .from('tariffs')
        .select('*')
        .order('wilaya_code', { ascending: true });

      if (store) {
        query = query.eq('store', store);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Tariff[];
    },
  });
}

export function useUpdateTariff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TablesUpdate<'tariffs'> }) => {
      const { error } = await supabase
        .from('tariffs')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
    },
  });
}

export function useBulkUpdateTariffs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; home_price: number; bureau_price: number; retour: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('tariffs')
          .update({ 
            home_price: update.home_price, 
            bureau_price: update.bureau_price,
            retour: update.retour
          })
          .eq('id', update.id);

        if (error) throw error;
      }
      return updates.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
    },
  });
}

export function useGetCheapestStore() {
  return useMutation({
    mutationFn: async ({ 
      wilayaCode, 
      deliveryType 
    }: { 
      wilayaCode: number; 
      deliveryType: 'home' | 'bureau' 
    }) => {
      const { data, error } = await supabase
        .rpc('get_cheapest_store', {
          _wilaya_code: wilayaCode,
          _delivery_type: deliveryType,
        });

      if (error) throw error;
      return data?.[0] as { store: string; price: number } | undefined;
    },
  });
}


export function useWilayaTariffs(wilayaCode: number | undefined) {
  return useQuery({
    queryKey: ['tariffs', wilayaCode],
    queryFn: async () => {
      if (!wilayaCode) return null;

      const { data, error } = await supabase
        .from('tariffs')
        .select('store, home_price, bureau_price')
        .eq('wilaya_code', wilayaCode);
      
      if (error) throw error;
      return data;
    },
    enabled: !!wilayaCode,
  });
}

export function useCheapestDelivery(wilayaCode: number | undefined, deliveryType: 'home' | 'bureau' | 'pickup') {
  return useQuery({
    queryKey: ['cheapest-delivery', wilayaCode, deliveryType],
    queryFn: async () => {
      if (!wilayaCode || deliveryType === 'pickup') {
        return { store: 'laghouat', price: 0 };
      }

      const { data, error } = await supabase
        .rpc('get_cheapest_store', {
          _wilaya_code: wilayaCode,
          _delivery_type: deliveryType,
        });

      if (error) throw error;
      return data?.[0] as { store: string; price: number } | null;
    },
    enabled: !!wilayaCode && deliveryType !== 'pickup',
  });
}
