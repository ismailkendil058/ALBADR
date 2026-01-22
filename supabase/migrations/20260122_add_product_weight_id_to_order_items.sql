ALTER TABLE public.order_items
ADD COLUMN product_weight_id UUID REFERENCES public.product_weights(id) ON DELETE SET NULL;
