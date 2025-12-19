-- 1. Delete cart items that have invalid product IDs (not UUIDs)
-- This cleans up any old test data like '1', '2' etc.
DELETE FROM public.cart_items 
WHERE product_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 2. Delete cart items that reference non-existent products
DELETE FROM public.cart_items
WHERE product_id::uuid NOT IN (SELECT id FROM public.products);

-- 3. Alter the column to be UUID type
ALTER TABLE public.cart_items 
ALTER COLUMN product_id TYPE uuid USING product_id::uuid;

-- 4. Add the Foreign Key constraint
ALTER TABLE public.cart_items
ADD CONSTRAINT fk_cart_product
FOREIGN KEY (product_id) 
REFERENCES public.products (id)
ON DELETE CASCADE;

-- 5. Refresh the schema cache (optional but good practice)
NOTIFY pgrst, 'reload schema';
