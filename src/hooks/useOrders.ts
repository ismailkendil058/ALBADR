import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate, Enums } from '@/integrations/supabase/types';

export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type OrderStatus = Enums<'order_status'>;
export type DeliveryType = Enums<'delivery_type'>;

export type OrderWithItems = Tables<'orders'> & { items: OrderItem[]; is_manual?: boolean; tariff_retour_price?: number; };

export function useOrders({
  page,
  pageSize = 20,
  searchQuery,
  status,
  deliveryType,
  wilaya,
  store,
  fromDate,
  toDate,
}: {
  page: number,
  pageSize?: number,
  searchQuery?: string,
  status?: string,
  deliveryType?: string,
  wilaya?: string,
  store?: string,
  fromDate?: string,
  toDate?: string,
}) {
  return useQuery({
    queryKey: ['orders', { page, pageSize, searchQuery, status, deliveryType, wilaya, store, fromDate, toDate }],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            products(name_ar, name_fr)
          )
        `);

      if (searchQuery) {
        query = query.or(`order_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`);
      }
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (deliveryType && deliveryType !== 'all') {
        query = query.eq('delivery_type', deliveryType);
      }
      if (wilaya && wilaya !== 'all') {
        query = query.eq('wilaya_name', wilaya);
      }
      if (store && store !== 'all') {
        query = query.eq('send_from_store', store);
      }
      if (fromDate) {
        query = query.gte('created_at', fromDate);
      }
      if (toDate) {
        query = query.lte('created_at', toDate);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return { data: data as OrderWithItems[], count };
    },
  });
}

export function useAllOrders({
  searchQuery,
  status,
  deliveryType,
  wilaya,
  store,
  fromDate,
  toDate,
}: {
  searchQuery?: string,
  status?: string,
  deliveryType?: string,
  wilaya?: string,
  store?: string,
  fromDate?: string,
  toDate?: string,
}) {
  return useQuery({
    queryKey: ['orders', { searchQuery, status, deliveryType, wilaya, store, fromDate, toDate }],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            products(name_ar, name_fr)
          )
        `);

      if (searchQuery) {
        query = query.or(`order_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`);
      }
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (deliveryType && deliveryType !== 'all') {
        query = query.eq('delivery_type', deliveryType);
      }
      if (wilaya && wilaya !== 'all') {
        query = query.eq('wilaya_name', wilaya);
      }
      if (store && store !== 'all') {
        query = query.eq('send_from_store', store);
      }
      if (fromDate) {
        query = query.gte('created_at', fromDate);
      }
      if (toDate) {
        query = query.lte('created_at', toDate);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as OrderWithItems[];
    },
    enabled: false, // Only run when manually triggered
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as OrderWithItems | null;
    },
    enabled: !!id,
  });
}

export function useOrdersByDateRange(from: Date, to: Date) {
  return useQuery({
    queryKey: ['orders', { from, to }],
    queryFn: async () => {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Extract unique wilaya_code and store combinations from orders
      const uniqueTariffKeys = new Set(
        ordersData.map(order => `${order.wilaya_code}-${order.send_from_store}`)
      );

      // Fetch tariffs for these combinations
      const tariffPromises = Array.from(uniqueTariffKeys).map(key => {
        const [wilaya_code, store] = key.split('-');
        return supabase
          .from('tariffs')
          .select('retour') // Changed from 'return_price' to 'retour'
          .eq('wilaya_code', parseInt(wilaya_code))
          .eq('store', store)
          .maybeSingle();
      });

      const tariffResults = await Promise.all(tariffPromises);

      // Create a map for quick lookup of retour
      const tariffMap = new Map<string, number>(
        tariffResults.map((result, index) => {
          const key = Array.from(uniqueTariffKeys)[index];
          return [key, result.data?.retour || 0]; // Changed from 'return_price' to 'retour'
        })
      );

      // Merge retour into each order
      const ordersWithRetourPrice = ordersData.map(order => ({
        ...order,
        tariff_retour_price: tariffMap.get(`${order.wilaya_code}-${order.send_from_store}`) || 0, // Changed from 'tariff_return_price' to 'tariff_retour_price'
      }));

      return ordersWithRetourPrice as OrderWithItems[];
    },
  });
}



export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useBulkUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .in('id', ids);

      if (error) throw error;
      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Order items are deleted via CASCADE
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useBulkDeleteOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .in('id', ids);

      if (error) throw error;
      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TablesUpdate<'orders'> }) => {
      const { error } = await supabase
        .from('orders')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] }); // Invalidate all-orders for export too
    },
  });
}

export type NewOrderItem = Omit<TablesInsert<'order_items'>, 'order_id' | 'id'>;
export type NewOrderWithItems = Omit<TablesInsert<'orders'>, 'order_number'> & {
  order_number?: string;
  items: NewOrderItem[];
};


export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOrderData: NewOrderWithItems) => {
      const { items, ...orderData } = newOrderData;

      // 1. Insert the order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Prepare and insert order items
      if (items && items.length > 0) {
        const orderItems = items.map(item => ({
          ...item,
          order_id: newOrder.id,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          // If items fail, delete the order we just created for consistency.
          await supabase.from('orders').delete().eq('id', newOrder.id);
          throw itemsError;
        }
      }

      return newOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
  });
}
