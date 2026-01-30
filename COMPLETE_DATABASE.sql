-- ============================================================
-- ALBADR E-COMMERCE SUPABASE DATABASE
-- Complete Schema + Sample Data
-- Execute this entire file in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE app_role AS ENUM ('admin', 'user');
CREATE TYPE delivery_type AS ENUM ('home', 'bureau', 'pickup');
CREATE TYPE order_status AS ENUM ('new', 'confirmed', 'delivered', 'canceled', 'returned');

-- ============================================================
-- TABLES
-- ============================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  image TEXT,
  is_special BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_ar TEXT,
  description_fr TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT,
  is_new BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  is_promo BOOLEAN DEFAULT FALSE,
  has_weight_options BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Weights Table
CREATE TABLE IF NOT EXISTS product_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight TEXT NOT NULL,
  price NUMERIC NOT NULL,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  wilaya_code INTEGER NOT NULL,
  wilaya_name TEXT NOT NULL,
  address TEXT,
  delivery_type delivery_type DEFAULT 'home',
  send_from_store TEXT NOT NULL,
  delivery_price NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status order_status DEFAULT 'new',
  notes TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name_ar TEXT NOT NULL,
  product_name_fr TEXT NOT NULL,
  weight TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tariffs Table
CREATE TABLE IF NOT EXISTS tariffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wilaya_code INTEGER NOT NULL,
  wilaya_name TEXT NOT NULL,
  store TEXT NOT NULL,
  home_price NUMERIC NOT NULL,
  bureau_price NUMERIC NOT NULL,
  retour NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(wilaya_code, store)
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  role app_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_best_seller ON products(is_best_seller);
CREATE INDEX idx_products_is_promo ON products(is_promo);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_product_weights_product_id ON product_weights(product_id);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_wilaya_code ON orders(wilaya_code);
CREATE INDEX idx_orders_send_from_store ON orders(send_from_store);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_tariffs_store ON tariffs(store);
CREATE INDEX idx_tariffs_wilaya_code ON tariffs(wilaya_code);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Get cheapest store function
CREATE OR REPLACE FUNCTION get_cheapest_store(
  _delivery_type TEXT,
  _wilaya_code INTEGER
)
RETURNS TABLE(price NUMERIC, store TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN _delivery_type = 'home' THEN home_price
      WHEN _delivery_type = 'bureau' THEN bureau_price
      ELSE 0
    END as price,
    store
  FROM tariffs
  WHERE wilaya_code = _wilaya_code AND is_active = TRUE
  ORDER BY price ASC;
END;
$$ LANGUAGE plpgsql;

-- Check user role function
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tariffs_updated_at
BEFORE UPDATE ON tariffs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Public access to categories
CREATE POLICY "Public can read categories" ON categories
FOR SELECT USING (true);

-- Public access to products
CREATE POLICY "Public can read products" ON products
FOR SELECT USING (true);

-- Public access to product weights
CREATE POLICY "Public can read product weights" ON product_weights
FOR SELECT USING (true);

-- Orders: Users can read their own, admins can read all
CREATE POLICY "Users can read their own orders" ON orders
FOR SELECT USING (
  auth.uid()::text = user_id::text OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admin can insert orders" ON orders
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update orders" ON orders
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete orders" ON orders
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Order items: Users can read items from their orders
CREATE POLICY "Users can read order items from their orders" ON order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      auth.uid()::text = orders.user_id::text OR 
      has_role(auth.uid(), 'admin'::app_role)
    )
  )
);

-- Tariffs: Public read, admin write
CREATE POLICY "Public can read tariffs" ON tariffs
FOR SELECT USING (true);

CREATE POLICY "Admin can insert tariffs" ON tariffs
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update tariffs" ON tariffs
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete tariffs" ON tariffs
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- User roles: Admin only
CREATE POLICY "Admin can read user roles" ON user_roles
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can insert user roles" ON user_roles
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update user roles" ON user_roles
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete user roles" ON user_roles
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- SAMPLE DATA - TARIFFS FOR ALL 58 ALGERIAN WILAYAS
-- ============================================================

INSERT INTO tariffs (wilaya_code, wilaya_name, store, home_price, bureau_price, retour, is_active)
VALUES
  (1, 'أدرار', 'laghouat', 800, 600, 150, true),
  (1, 'أدرار', 'aflou', 850, 650, 150, true),
  (2, 'الشلف', 'laghouat', 650, 500, 130, true),
  (2, 'الشلف', 'aflou', 700, 550, 130, true),
  (3, 'الأغواط', 'laghouat', 400, 300, 100, true),
  (3, 'الأغواط', 'aflou', 450, 350, 100, true),
  (4, 'أم البواقي', 'laghouat', 1200, 900, 250, true),
  (4, 'أم البواقي', 'aflou', 1300, 1000, 250, true),
  (5, 'باتنة', 'laghouat', 1000, 800, 200, true),
  (5, 'باتنة', 'aflou', 1100, 900, 200, true),
  (6, 'بجاية', 'laghouat', 1100, 900, 220, true),
  (6, 'بجاية', 'aflou', 1200, 1000, 220, true),
  (7, 'بسكرة', 'laghouat', 700, 550, 140, true),
  (7, 'بسكرة', 'aflou', 750, 600, 140, true),
  (8, 'بشار', 'laghouat', 1400, 1100, 280, true),
  (8, 'بشار', 'aflou', 1500, 1200, 280, true),
  (9, 'البليدة', 'laghouat', 500, 400, 120, true),
  (9, 'البليدة', 'aflou', 550, 450, 120, true),
  (10, 'البويرة', 'laghouat', 600, 450, 125, true),
  (10, 'البويرة', 'aflou', 650, 500, 125, true),
  (11, 'تمنراست', 'laghouat', 2000, 1500, 400, true),
  (11, 'تمنراست', 'aflou', 2100, 1600, 400, true),
  (12, 'تبسة', 'laghouat', 1300, 1000, 260, true),
  (12, 'تبسة', 'aflou', 1400, 1100, 260, true),
  (13, 'تلمسان', 'laghouat', 1100, 850, 220, true),
  (13, 'تلمسان', 'aflou', 1200, 950, 220, true),
  (14, 'تيارت', 'laghouat', 750, 550, 150, true),
  (14, 'تيارت', 'aflou', 800, 600, 150, true),
  (15, 'تيزي وزو', 'laghouat', 900, 700, 180, true),
  (15, 'تيزي وزو', 'aflou', 950, 750, 180, true),
  (16, 'الجزائر', 'laghouat', 550, 400, 125, true),
  (16, 'الجزائر', 'aflou', 600, 450, 125, true),
  (17, 'الجلفة', 'laghouat', 350, 250, 80, true),
  (17, 'الجلفة', 'aflou', 400, 300, 80, true),
  (18, 'جيجل', 'laghouat', 1250, 950, 250, true),
  (18, 'جيجل', 'aflou', 1350, 1050, 250, true),
  (19, 'سطيف', 'laghouat', 1100, 850, 220, true),
  (19, 'سطيف', 'aflou', 1200, 950, 220, true),
  (20, 'سعيدة', 'laghouat', 900, 650, 180, true),
  (20, 'سعيدة', 'aflou', 950, 700, 180, true),
  (21, 'سكيكدة', 'laghouat', 1200, 900, 240, true),
  (21, 'سكيكدة', 'aflou', 1300, 1000, 240, true),
  (22, 'سيدي بلعباس', 'laghouat', 950, 700, 190, true),
  (22, 'سيدي بلعباس', 'aflou', 1000, 750, 190, true),
  (23, 'عنابة', 'laghouat', 1400, 1100, 280, true),
  (23, 'عنابة', 'aflou', 1500, 1200, 280, true),
  (24, 'قالمة', 'laghouat', 1250, 950, 250, true),
  (24, 'قالمة', 'aflou', 1350, 1050, 250, true),
  (25, 'قسنطينة', 'laghouat', 1100, 850, 220, true),
  (25, 'قسنطينة', 'aflou', 1200, 950, 220, true),
  (26, 'المدية', 'laghouat', 450, 350, 110, true),
  (26, 'المدية', 'aflou', 500, 400, 110, true),
  (27, 'مستغانم', 'laghouat', 850, 650, 170, true),
  (27, 'مستغانم', 'aflou', 900, 700, 170, true),
  (28, 'المسيلة', 'laghouat', 650, 500, 130, true),
  (28, 'المسيلة', 'aflou', 700, 550, 130, true),
  (29, 'معسكر', 'laghouat', 1000, 750, 200, true),
  (29, 'معسكر', 'aflou', 1100, 850, 200, true),
  (30, 'ورقلة', 'laghouat', 1000, 800, 200, true),
  (30, 'ورقلة', 'aflou', 1100, 900, 200, true),
  (31, 'وهران', 'laghouat', 1050, 800, 210, true),
  (31, 'وهران', 'aflou', 1100, 850, 210, true),
  (32, 'البيض', 'laghouat', 1200, 900, 240, true),
  (32, 'البيض', 'aflou', 1300, 1000, 240, true),
  (33, 'إليزي', 'laghouat', 1600, 1200, 320, true),
  (33, 'إليزي', 'aflou', 1700, 1300, 320, true),
  (34, 'برج بوعريريج', 'laghouat', 700, 550, 140, true),
  (34, 'برج بوعريريج', 'aflou', 750, 600, 140, true),
  (35, 'بومرداس', 'laghouat', 500, 400, 120, true),
  (35, 'بومرداس', 'aflou', 550, 450, 120, true),
  (36, 'الطارف', 'laghouat', 1350, 1050, 270, true),
  (36, 'الطارف', 'aflou', 1450, 1150, 270, true),
  (37, 'تندوف', 'laghouat', 1700, 1300, 340, true),
  (37, 'تندوف', 'aflou', 1800, 1400, 340, true),
  (38, 'تيسمسيلت', 'laghouat', 850, 650, 170, true),
  (38, 'تيسمسيلت', 'aflou', 900, 700, 170, true),
  (39, 'الوادي', 'laghouat', 900, 700, 180, true),
  (39, 'الوادي', 'aflou', 950, 750, 180, true),
  (40, 'خنشلة', 'laghouat', 1150, 900, 230, true),
  (40, 'خنشلة', 'aflou', 1250, 1000, 230, true),
  (41, 'سوق أهراس', 'laghouat', 1250, 950, 250, true),
  (41, 'سوق أهراس', 'aflou', 1350, 1050, 250, true),
  (42, 'تيبازة', 'laghouat', 550, 400, 125, true),
  (42, 'تيبازة', 'aflou', 600, 450, 125, true),
  (43, 'ميلة', 'laghouat', 1100, 850, 220, true),
  (43, 'ميلة', 'aflou', 1200, 950, 220, true),
  (44, 'عين الدفلى', 'laghouat', 600, 450, 125, true),
  (44, 'عين الدفلى', 'aflou', 650, 500, 125, true),
  (45, 'النعامة', 'laghouat', 1300, 1000, 260, true),
  (45, 'النعامة', 'aflou', 1400, 1100, 260, true),
  (46, 'عين تموشنت', 'laghouat', 1000, 750, 200, true),
  (46, 'عين تموشنت', 'aflou', 1100, 850, 200, true),
  (47, 'غرداية', 'laghouat', 600, 500, 125, true),
  (47, 'غرداية', 'aflou', 650, 550, 125, true),
  (48, 'غليزان', 'laghouat', 950, 700, 190, true),
  (48, 'غليزان', 'aflou', 1000, 750, 190, true),
  (49, 'المنيعة', 'laghouat', 1200, 900, 240, true),
  (49, 'المنيعة', 'aflou', 1300, 1000, 240, true),
  (50, 'المغير', 'laghouat', 750, 600, 150, true),
  (50, 'المغير', 'aflou', 800, 650, 150, true),
  (51, 'أولاد جلال', 'laghouat', 800, 650, 160, true),
  (51, 'أولاد جلال', 'aflou', 850, 700, 160, true),
  (52, 'برج باجي مختار', 'laghouat', 900, 700, 180, true),
  (52, 'برج باجي مختار', 'aflou', 950, 750, 180, true),
  (53, 'بني عباس', 'laghouat', 1100, 850, 220, true),
  (53, 'بني عباس', 'aflou', 1200, 950, 220, true),
  (54, 'تيميمون', 'laghouat', 1300, 1000, 260, true),
  (54, 'تيميمون', 'aflou', 1400, 1100, 260, true),
  (55, 'توقرت', 'laghouat', 900, 700, 180, true),
  (55, 'توقرت', 'aflou', 950, 750, 180, true),
  (56, 'جانت', 'laghouat', 1500, 1150, 300, true),
  (56, 'جانت', 'aflou', 1600, 1250, 300, true),
  (57, 'عين صالح', 'laghouat', 1200, 900, 240, true),
  (57, 'عين صالح', 'aflou', 1300, 1000, 240, true),
  (58, 'عين قزام', 'laghouat', 1100, 850, 220, true),
  (58, 'عين قزام', 'aflou', 1200, 950, 220, true);

-- ============================================================
-- SAMPLE CATEGORIES
-- ============================================================

INSERT INTO categories (name_ar, name_fr, is_special)
VALUES
  ('الفواكه', 'Fruits', false),
  ('الخضروات', 'Légumes', false),
  ('الألبان والجبن', 'Produits Laitiers', false),
  ('العسل والمربيات', 'Miel et Confitures', true),
  ('المعجنات', 'Pâtisseries', false),
  ('اللحوم المجمدة', 'Viande Surgelée', false),
  ('المشروبات', 'Boissons', false),
  ('الحبوب والبقوليات', 'Céréales et Légumineuses', false);

-- ============================================================
-- NOTES FOR SETUP
-- ============================================================
-- After running this script:
-- 1. Create storage bucket 'products' via Supabase dashboard
-- 2. Set up authentication providers
-- 3. Add admin user using: INSERT INTO user_roles (user_id, role) VALUES ('uuid', 'admin')
-- 4. Configure storage policies for product images
-- 5. Set up automated backups
