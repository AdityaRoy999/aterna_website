-- ==========================================
-- FINAL FIX: CART POLICIES & PERMISSIONS
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. CLEANUP CART POLICIES (Drop ALL variations to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can insert/update their own cart" ON cart_items; -- Old combined policy

-- 2. RECREATE CART POLICIES
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart" ON cart_items 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart" ON cart_items 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" ON cart_items 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart" ON cart_items 
  FOR DELETE USING (auth.uid() = user_id);


-- 3. FIX PRODUCTS ID DEFAULT (Idempotent)
-- Ensure ID is TEXT and defaults to a UUID string
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;


-- 4. FIX PRODUCT PERMISSIONS (Drop before create)
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

CREATE POLICY "Authenticated users can insert products" ON products 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products" ON products 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products" ON products 
  FOR DELETE USING (auth.role() = 'authenticated');


-- 5. FIX REALTIME PUBLICATION
-- Re-run this to ensure it wasn't skipped
ALTER PUBLICATION supabase_realtime SET TABLE public.reviews, public.products, public.orders, public.cart_items;
