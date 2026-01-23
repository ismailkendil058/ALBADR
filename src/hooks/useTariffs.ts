import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesUpdate, TablesInsert } from '@/integrations/supabase/types';

export type Tariff = Tables<'tariffs'>;

export function useTariffs(options?: { store?: 'laghouat' | 'aflou'; isActive?: boolean }) {
  return useQuery({
    queryKey: ['tariffs', options?.store, options?.isActive],
    queryFn: async () => {
      let query = supabase
        .from('tariffs')
        .select('*')
        .order('wilaya_code', { ascending: true });

      if (options?.store) {
        query = query.eq('store', options.store);
      }
      if (options?.isActive !== undefined) {
        query = query.eq('is_active', options.isActive);
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
    mutationFn: async (updates: { id: string; home_price?: number; bureau_price?: number; retour?: number; is_active?: boolean }[]) => {
      for (const update of updates) {
        const payload: TablesUpdate<'tariffs'> = {};
        if (update.home_price !== undefined) payload.home_price = update.home_price;
        if (update.bureau_price !== undefined) payload.bureau_price = update.bureau_price;
        if (update.retour !== undefined) payload.retour = update.retour;
        if (update.is_active !== undefined) payload.is_active = update.is_active;

        const { error } = await supabase
          .from('tariffs')
          .update(payload)
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

export function useBulkImportTariffs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importedTariffs: {
      wilaya_code: number;
      wilaya_name: string;
      home_price: number;
      bureau_price: number;
      retour: number;
      store: 'laghouat' | 'aflou';
    }[]) => {
      const { data: existingTariffs, error: fetchError } = await supabase
        .from('tariffs')
        .select('id, wilaya_code, store'); // Only need these fields to identify existing tariffs

      if (fetchError) throw fetchError;

      const results = {
        successfulInserts: 0,
        successfulUpdates: 0,
        failedImports: [] as { tariff: any; error: string }[],
      };

      for (const importedTariff of importedTariffs) {
        const existingTariff = existingTariffs.find(
          t => t.wilaya_code === importedTariff.wilaya_code && t.store === importedTariff.store
        );

        const payload: TablesInsert<'tariffs'> | TablesUpdate<'tariffs'> = {
          wilaya_code: importedTariff.wilaya_code,
          wilaya_name: importedTariff.wilaya_name,
          home_price: importedTariff.home_price,
          bureau_price: importedTariff.bureau_price,
          retour: importedTariff.retour,
          store: importedTariff.store,
        };

        let operationError = null;
        if (existingTariff) {
          // Update existing tariff
          const { error } = await supabase
            .from('tariffs')
            .update(payload)
            .eq('id', existingTariff.id);
          operationError = error;
          if (!error) {
            results.successfulUpdates++;
          }
        } else {
          // Insert new tariff
          const { error } = await supabase
            .from('tariffs')
            .insert(payload);
          operationError = error;
          if (!error) {
            results.successfulInserts++;
          }
        }

        if (operationError) {
          results.failedImports.push({ tariff: importedTariff, error: operationError.message });
        }
      }
      return results;
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
        .eq('wilaya_code', wilayaCode)
        .eq('is_active', true);
      
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

export function useActiveWilayas() {
  const { data: allTariffs = [], isLoading, error } = useTariffs({ isActive: true });

  const activeWilayas = React.useMemo(() => {
    const uniqueWilayas = new Map<number, string>(); // Map to store unique wilayas by code
    allTariffs.forEach(tariff => {
      // Prioritize wilaya names for uniqueness, but ensure code is present
      if (!uniqueWilayas.has(tariff.wilaya_code) && tariff.wilaya_name) {
        uniqueWilayas.set(tariff.wilaya_code, `${tariff.wilaya_code.toString().padStart(2, '0')} - ${tariff.wilaya_name}`);
      }
    });

    // Convert map values to array and sort by wilaya code
    return Array.from(uniqueWilayas.values()).sort((a, b) => {
      const codeA = parseInt(a.split(' - ')[0], 10);
      const codeB = parseInt(b.split(' - ')[0], 10);
      return codeA - codeB;
    });
  }, [allTariffs]);

  return { data: activeWilayas, isLoading, error };
}

