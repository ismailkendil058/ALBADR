-- =============================================
-- طاحونة البدر E-COMMERCE DATABASE SCHEMA
-- =============================================

-- 1. Create Enum Types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.order_status AS ENUM ('new', 'confirmed', 'delivered', 'canceled');
CREATE TYPE public.delivery_type AS ENUM ('home', 'bureau', 'pickup');

-- =============================================
-- 2. User Roles Table (Security Critical)
-- =============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security Definer Function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 3. Categories Table
-- =============================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    image TEXT,
    is_special BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are publicly readable
CREATE POLICY "Categories are publicly readable"
ON public.categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 4. Products Table
-- =============================================
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    description_ar TEXT,
    description_fr TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    original_price DECIMAL(10,2),
    image TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_new BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    is_promo BOOLEAN DEFAULT false,
    stock INTEGER NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'piece',
    has_weight_options BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
CREATE POLICY "Products are publicly readable"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 5. Product Weights Table
-- =============================================
CREATE TABLE public.product_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    weight TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_weights ENABLE ROW LEVEL SECURITY;

-- Product weights are publicly readable
CREATE POLICY "Product weights are publicly readable"
ON public.product_weights
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage product weights"
ON public.product_weights
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 6. Tariffs Table (Laghouat & Aflou)
-- =============================================
CREATE TABLE public.tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wilaya_code INTEGER NOT NULL CHECK (wilaya_code >= 1 AND wilaya_code <= 58),
    wilaya_name TEXT NOT NULL,
    store TEXT NOT NULL CHECK (store IN ('laghouat', 'aflou')),
    home_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    bureau_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (wilaya_code, store)
);

ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;

-- Tariffs are publicly readable (needed for checkout)
CREATE POLICY "Tariffs are publicly readable"
ON public.tariffs
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage tariffs"
ON public.tariffs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 7. Orders Table
-- =============================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    wilaya_code INTEGER NOT NULL,
    wilaya_name TEXT NOT NULL,
    address TEXT,
    delivery_type delivery_type NOT NULL DEFAULT 'home',
    delivery_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status order_status NOT NULL DEFAULT 'new',
    send_from_store TEXT NOT NULL CHECK (send_from_store IN ('laghouat', 'aflou')),
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Anon users can create orders
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage all orders"
ON public.orders
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 8. Order Items Table
-- =============================================
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name_ar TEXT NOT NULL,
    product_name_fr TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    weight TEXT,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items follow order visibility
CREATE POLICY "Users can view their order items"
ON public.order_items
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
);

CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage all order items"
ON public.order_items
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 9. Helper Functions
-- =============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating order number
CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION public.generate_order_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tariffs_updated_at
    BEFORE UPDATE ON public.tariffs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Function to get cheapest delivery store
CREATE OR REPLACE FUNCTION public.get_cheapest_store(
    _wilaya_code INTEGER,
    _delivery_type TEXT
)
RETURNS TABLE (
    store TEXT,
    price DECIMAL(10,2)
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    laghouat_price DECIMAL(10,2);
    aflou_price DECIMAL(10,2);
BEGIN
    -- Get Laghouat price
    SELECT
        CASE WHEN _delivery_type = 'home' THEN home_price ELSE bureau_price END
    INTO laghouat_price
    FROM public.tariffs
    WHERE wilaya_code = _wilaya_code AND tariffs.store = 'laghouat';

    -- Get Aflou price
    SELECT
        CASE WHEN _delivery_type = 'home' THEN home_price ELSE bureau_price END
    INTO aflou_price
    FROM public.tariffs
    WHERE wilaya_code = _wilaya_code AND tariffs.store = 'aflou';

    -- Return cheapest (Laghouat wins on tie)
    IF laghouat_price IS NULL AND aflou_price IS NULL THEN
        RETURN QUERY SELECT 'laghouat'::TEXT, 0::DECIMAL(10,2);
    ELSIF aflou_price IS NULL OR laghouat_price <= aflou_price THEN
        RETURN QUERY SELECT 'laghouat'::TEXT, COALESCE(laghouat_price, 0::DECIMAL(10,2));
    ELSE
        RETURN QUERY SELECT 'aflou'::TEXT, aflou_price;
    END IF;
END;
$$;
-- =============================================
-- 10. Insert All 58 Wilayas with Default Tariffs
-- =============================================
INSERT INTO public.tariffs (wilaya_code, wilaya_name, store, home_price, bureau_price) VALUES
-- Laghouat Store
(1, 'Adrar', 'laghouat', 1200, 1000),
(2, 'Chlef', 'laghouat', 600, 400),
(3, 'Laghouat', 'laghouat', 300, 200),
(4, 'Oum El Bouaghi', 'laghouat', 700, 500),
(5, 'Batna', 'laghouat', 700, 500),
(6, 'Béjaïa', 'laghouat', 700, 500),
(7, 'Biskra', 'laghouat', 600, 400),
(8, 'Béchar', 'laghouat', 1000, 800),
(9, 'Blida', 'laghouat', 500, 350),
(10, 'Bouira', 'laghouat', 600, 400),
(11, 'Tamanrasset', 'laghouat', 1500, 1200),
(12, 'Tébessa', 'laghouat', 800, 600),
(13, 'Tlemcen', 'laghouat', 700, 500),
(14, 'Tiaret', 'laghouat', 500, 350),
(15, 'Tizi Ouzou', 'laghouat', 700, 500),
(16, 'Alger', 'laghouat', 500, 350),
(17, 'Djelfa', 'laghouat', 400, 300),
(18, 'Jijel', 'laghouat', 750, 550),
(19, 'Sétif', 'laghouat', 650, 450),
(20, 'Saïda', 'laghouat', 600, 400),
(21, 'Skikda', 'laghouat', 750, 550),
(22, 'Sidi Bel Abbès', 'laghouat', 650, 450),
(23, 'Annaba', 'laghouat', 800, 600),
(24, 'Guelma', 'laghouat', 750, 550),
(25, 'Constantine', 'laghouat', 700, 500),
(26, 'Médéa', 'laghouat', 450, 300),
(27, 'Mostaganem', 'laghouat', 600, 400),
(28, 'M''Sila', 'laghouat', 500, 350),
(29, 'Mascara', 'laghouat', 600, 400),
(30, 'Ouargla', 'laghouat', 800, 600),
(31, 'Oran', 'laghouat', 650, 450),
(32, 'El Bayadh', 'laghouat', 500, 350),
(33, 'Illizi', 'laghouat', 1500, 1200),
(34, 'Bordj Bou Arréridj', 'laghouat', 600, 400),
(35, 'Boumerdès', 'laghouat', 550, 400),
(36, 'El Tarf', 'laghouat', 850, 650),
(37, 'Tindouf', 'laghouat', 1500, 1200),
(38, 'Tissemsilt', 'laghouat', 550, 400),
(39, 'El Oued', 'laghouat', 800, 600),
(40, 'Khenchela', 'laghouat', 750, 550),
(41, 'Souk Ahras', 'laghouat', 800, 600),
(42, 'Tipaza', 'laghouat', 500, 350),
(43, 'Mila', 'laghouat', 700, 500),
(44, 'Aïn Defla', 'laghouat', 500, 350),
(45, 'Naâma', 'laghouat', 700, 500),
(46, 'Aïn Témouchent', 'laghouat', 650, 450),
(47, 'Ghardaïa', 'laghouat', 600, 400),
(48, 'Relizane', 'laghouat', 600, 400),
(49, 'Timimoun', 'laghouat', 1200, 1000),
(50, 'Bordj Badji Mokhtar', 'laghouat', 1800, 1500),
(51, 'Ouled Djellal', 'laghouat', 650, 450),
(52, 'Béni Abbès', 'laghouat', 1200, 1000),
(53, 'In Salah', 'laghouat', 1400, 1100),
(54, 'In Guezzam', 'laghouat', 1800, 1500),
(55, 'Touggourt', 'laghouat', 750, 550),
(56, 'Djanet', 'laghouat', 1600, 1300),
(57, 'El M''Ghair', 'laghouat', 750, 550),
(58, 'El Meniaa', 'laghouat', 900, 700),
-- Aflou Store
(1, 'Adrar', 'aflou', 1250, 1050),
(2, 'Chlef', 'aflou', 650, 450),
(3, 'Laghouat', 'aflou', 350, 250),
(4, 'Oum El Bouaghi', 'aflou', 750, 550),
(5, 'Batna', 'aflou', 750, 550),
(6, 'Béjaïa', 'aflou', 750, 550),
(7, 'Biskra', 'aflou', 550, 350),
(8, 'Béchar', 'aflou', 950, 750),
(9, 'Blida', 'aflou', 550, 400),
(10, 'Bouira', 'aflou', 650, 450),
(11, 'Tamanrasset', 'aflou', 1450, 1150),
(12, 'Tébessa', 'aflou', 850, 650),
(13, 'Tlemcen', 'aflou', 750, 550),
(14, 'Tiaret', 'aflou', 450, 300),
(15, 'Tizi Ouzou', 'aflou', 750, 550),
(16, 'Alger', 'aflou', 550, 400),
(17, 'Djelfa', 'aflou', 350, 250),
(18, 'Jijel', 'aflou', 800, 600),
(19, 'Sétif', 'aflou', 700, 500),
(20, 'Saïda', 'aflou', 550, 350),
(21, 'Skikda', 'aflou', 800, 600),
(22, 'Sidi Bel Abbès', 'aflou', 700, 500),
(23, 'Annaba', 'aflou', 850, 650),
(24, 'Guelma', 'aflou', 800, 600),
(25, 'Constantine', 'aflou', 750, 550),
(26, 'Médéa', 'aflou', 400, 250),
(27, 'Mostaganem', 'aflou', 650, 450),
(28, 'M''Sila', 'aflou', 450, 300),
(29, 'Mascara', 'aflou', 550, 350),
(30, 'Ouargla', 'aflou', 750, 550),
(31, 'Oran', 'aflou', 700, 500),
(32, 'El Bayadh', 'aflou', 400, 250),
(33, 'Illizi', 'aflou', 1450, 1150),
(34, 'Bordj Bou Arréridj', 'aflou', 650, 450),
(35, 'Boumerdès', 'aflou', 600, 450),
(36, 'El Tarf', 'aflou', 900, 700),
(37, 'Tindouf', 'aflou', 1450, 1150),
(38, 'Tissemsilt', 'aflou', 500, 350),
(39, 'El Oued', 'aflou', 750, 550),
(40, 'Khenchela', 'aflou', 800, 600),
(41, 'Souk Ahras', 'aflou', 850, 650),
(42, 'Tipaza', 'aflou', 550, 400),
(43, 'Mila', 'aflou', 750, 550),
(44, 'Aïn Defla', 'aflou', 550, 400),
(45, 'Naâma', 'aflou', 600, 400),
(46, 'Aïn Témouchent', 'aflou', 700, 500),
(47, 'Ghardaïa', 'aflou', 550, 350),
(48, 'Relizane', 'aflou', 650, 450),
(49, 'Timimoun', 'aflou', 1150, 950),
(50, 'Bordj Badji Mokhtar', 'aflou', 1750, 1450),
(51, 'Ouled Djellal', 'aflou', 600, 400),
(52, 'Béni Abbès', 'aflou', 1150, 950),
(53, 'In Salah', 'aflou', 1350, 1050),
(54, 'In Guezzam', 'aflou', 1750, 1450),
(55, 'Touggourt', 'aflou', 700, 500),
(56, 'Djanet', 'aflou', 1550, 1250),
(57, 'El M''Ghair', 'aflou', 700, 500),
(58, 'El Meniaa', 'aflou', 850, 650);

-- =============================================
-- 11. Create Indexes for Performance
-- =============================================
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_best_seller ON public.products(is_best_seller) WHERE is_best_seller = true;
CREATE INDEX idx_product_weights_product ON public.product_weights(product_id);
CREATE INDEX idx_tariffs_wilaya ON public.tariffs(wilaya_code);
CREATE INDEX idx_tariffs_store ON public.tariffs(store);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_orders_wilaya ON public.orders(wilaya_code);
CREATE INDEX idx_orders_store ON public.orders(send_from_store);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);