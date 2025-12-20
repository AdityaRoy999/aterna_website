-- ==========================================
-- FIX ADMIN ACTIONS, RLS, AND REVIEWS
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. FIX PRODUCTS TABLE (Allow ID generation and Admin Access)
-- Make ID default to a random UUID (cast to text) so 'Add Product' works without sending an ID
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Add RLS Policies for Products (Admin Access)
-- We assume 'authenticated' users are admins for this simple app, 
-- or we can check specific email if needed. For now, we'll allow all authenticated users to edit.
-- Ideally, you'd have an 'is_admin' column in profiles, but we'll stick to 'authenticated' for simplicity as per your dashboard code.

CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');


-- 2. FIX CONTACT MESSAGES (Allow Delete)
CREATE POLICY "Authenticated users can delete contact messages" ON contact_messages FOR DELETE USING (auth.role() = 'authenticated');


-- 3. FIX ORDERS (Allow Status Update)
CREATE POLICY "Authenticated users can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');


-- 4. FIX REVIEWS & PROFILES (Allow seeing reviewer names)
-- Currently, profiles are only viewable by the owner. We need to allow public to read names.
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT USING (true);

-- Ensure Reviews are publicly viewable (already done, but good to double check)
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);


-- 5. FIX REALTIME FOR REVIEWS
-- Sometimes realtime needs explicit enabling for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;

