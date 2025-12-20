-- ==========================================
-- FIX MISSING QUANTITY COLUMN & STOCK FUNCTION
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Add quantity column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 0;

-- 2. Update existing products to have some stock (optional, but helpful)
UPDATE public.products SET quantity = 100 WHERE quantity = 0;

-- 3. Create/Update the decrement_stock function with TEXT ID
CREATE OR REPLACE FUNCTION public.decrement_stock(p_id text, q_count int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.products
  SET quantity = quantity - q_count
  WHERE id = p_id;
END;
$$;

-- 4. Refresh the schema cache
NOTIFY pgrst, 'reload schema';
