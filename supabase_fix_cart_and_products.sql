-- ==========================================
-- FIX CART, PRODUCTS, AND REVIEWS
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. FIX CART ITEMS (Allow Insert/Update)
-- The previous policy might have been too restrictive or missing
DROP POLICY IF EXISTS "Users can insert/update their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can view their own cart" ON cart_items;

CREATE POLICY "Users can view their own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cart" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cart" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cart" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- 2. FIX PRODUCTS (Ensure ID generation works)
-- We need to make sure the ID column is TEXT but has a default value of a UUID string
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 3. FIX REVIEWS REALTIME
-- Sometimes the filter `product_id=eq.ID` fails if the ID is text but treated as UUID or vice versa in the filter.
-- We will drop the filter in the frontend code (next step), but here we ensure the publication is correct.
ALTER PUBLICATION supabase_realtime SET TABLE public.reviews, public.products, public.orders, public.cart_items;

-- 4. FIX PRODUCT INSERTION PERMISSIONS (Explicitly)
-- Ensure authenticated users can insert into products
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');

