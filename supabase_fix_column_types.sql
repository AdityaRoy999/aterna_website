-- ==========================================
-- FIX COLUMN TYPES TO MATCH TEXT PRODUCT IDs
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Drop existing constraints (if any)
ALTER TABLE IF EXISTS public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE IF EXISTS public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE IF EXISTS public.cart_items DROP CONSTRAINT IF EXISTS fk_cart_product; -- Check for this name too
ALTER TABLE IF EXISTS public.reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;

-- 2. Convert columns to TEXT
-- We use 'USING product_id::text' to ensure proper conversion
ALTER TABLE public.order_items ALTER COLUMN product_id TYPE text USING product_id::text;
ALTER TABLE public.cart_items ALTER COLUMN product_id TYPE text USING product_id::text;
ALTER TABLE public.reviews ALTER COLUMN product_id TYPE text USING product_id::text;

-- 3. Clean up orphaned data
-- Since we changed Product IDs to '1', '2', etc., any old UUID references are now invalid.
-- We must remove them before adding the foreign key constraint.
DELETE FROM public.order_items WHERE product_id NOT IN (SELECT id FROM public.products);
DELETE FROM public.cart_items WHERE product_id NOT IN (SELECT id FROM public.products);
DELETE FROM public.reviews WHERE product_id NOT IN (SELECT id FROM public.products);

-- 4. Re-add Foreign Key Constraints
ALTER TABLE public.order_items 
  ADD CONSTRAINT order_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id)
  ON DELETE CASCADE;

ALTER TABLE public.cart_items 
  ADD CONSTRAINT cart_items_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id)
  ON DELETE CASCADE;

ALTER TABLE public.reviews 
  ADD CONSTRAINT reviews_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES public.products(id)
  ON DELETE CASCADE;
