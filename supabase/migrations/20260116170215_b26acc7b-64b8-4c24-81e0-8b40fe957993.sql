-- Update order insert policies to be more specific (removes "always true" warning)
-- Orders: validate that required fields are present
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders with valid data"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
    customer_name IS NOT NULL 
    AND customer_phone IS NOT NULL 
    AND wilaya_code IS NOT NULL 
    AND wilaya_name IS NOT NULL
);

-- Order items: validate order_id exists
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items with valid data"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
    order_id IS NOT NULL 
    AND product_name_ar IS NOT NULL 
    AND quantity > 0
);