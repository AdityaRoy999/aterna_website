-- ==========================================
-- MASTER FIX: PRODUCTS SCHEMA & TYPES
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Drop ALL Foreign Key Constraints first to allow type changes
ALTER TABLE IF EXISTS public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE IF EXISTS public.cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE IF EXISTS public.cart_items DROP CONSTRAINT IF EXISTS fk_cart_product;
ALTER TABLE IF EXISTS public.reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;

-- 2. Convert dependent columns to TEXT (Safe operation: UUID -> TEXT always works)
ALTER TABLE public.order_items ALTER COLUMN product_id TYPE text USING product_id::text;
ALTER TABLE public.cart_items ALTER COLUMN product_id TYPE text USING product_id::text;
ALTER TABLE public.reviews ALTER COLUMN product_id TYPE text USING product_id::text;

-- 3. Recreate the Products table to ensure it uses TEXT IDs
DROP TABLE IF EXISTS public.products;

CREATE TABLE public.products (
  id text PRIMARY KEY, -- Explicitly TEXT to match '1', '2', etc.
  name text NOT NULL,
  price numeric NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  is_new boolean DEFAULT false,
  variant_type text,
  variants jsonb,
  description text,
  color text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS on Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access" ON products;
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);

-- 5. Insert the Product Data (IDs '1' through '8')
INSERT INTO public.products (id, name, price, category, image_url, is_new, variant_type, variants) VALUES
('1', 'Ulania Watch', 18100.00, 'Timepieces', '/images/clock_gold.png', true, 'Finish', '[
  {"name": "Gold", "imageUrl": "/images/clock_gold.png", "colorCode": "#E8CFA0"},
  {"name": "Silver", "imageUrl": "/images/clock_silver.png", "colorCode": "#C0C0C0"},
  {"name": "Onyx", "imageUrl": "/images/clock_oynx.png", "colorCode": "#1A1A1A"}
]'),
('2', 'Chanel No. 5', 259.00, 'Fragrance', '/images/channel_50.png', false, 'Size', '[
  {"name": "50ml", "imageUrl": "/images/channel_50.png"},
  {"name": "100ml", "imageUrl": "/images/channel_100.png"},
  {"name": "200ml", "imageUrl": "/images/channel_200.png"}
]'),
('3', 'Gold Abstract', 1250.50, 'Jewelry', '/images/gold_abstract.png', false, 'Finish', '[
  {"name": "Gold", "imageUrl": "/images/gold_abstract.png", "colorCode": "#E8CFA0"},
  {"name": "Silver", "imageUrl": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1887&auto=format&fit=crop", "colorCode": "#C0C0C0"}
]'),
('4', 'Noir Elegance', 450.00, 'Accessories', '/images/noir_stan.png', false, 'Style', '[
  {"name": "Standard", "imageUrl": "/images/noir_stan.png", "colorCode": "#1A1A1A"},
  {"name": "Textured", "imageUrl": "/images/noir_matte.png", "colorCode": "#333333"}
]'),
('5', 'Royal Chrono', 24500.00, 'Timepieces', '/images/gold_chrono.png', false, 'Finish', '[
  {"name": "Gold", "imageUrl": "/images/gold_chrono.png", "colorCode": "#E8CFA0"},
  {"name": "Silver", "imageUrl": "/images/silver_chrono.png", "colorCode": "#C0C0C0"},
  {"name": "Onyx", "imageUrl": "/images/oynx_chrono.png", "colorCode": "#1A1A1A"}
]'),
('6', 'Amber Essence', 310.00, 'Fragrance', '/images/amb50.png', true, 'Size', '[
  {"name": "50ml", "imageUrl": "/images/amb50.png"},
  {"name": "100ml", "imageUrl": "/images/amb100.png"},
  {"name": "200ml", "imageUrl": "/images/amb200.png"}
]'),
('7', 'Pearl Drop', 890.00, 'Jewelry', '/images/pearl_white.png', false, 'Finish', '[
  {"name": "Gold", "imageUrl": "/images/pearl_gold.png", "colorCode": "#E8CFA0"},
  {"name": "White", "imageUrl": "/images/pearl_white.png", "colorCode": "#eeeae3ff"}
]'),
('8', 'Pink Glow', 1200.00, 'Accessories', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop', false, 'Style', '[
  {"name": "Standard", "imageUrl": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop", "colorCode": "#b614b3ff"},
  {"name": "Matte", "imageUrl": "/images/pink.png", "colorCode": "#a40c9aff"}
]');

-- 6. Clean up orphaned data (Now safe because everything is TEXT)
DELETE FROM public.order_items WHERE product_id NOT IN (SELECT id FROM public.products);
DELETE FROM public.cart_items WHERE product_id NOT IN (SELECT id FROM public.products);
DELETE FROM public.reviews WHERE product_id NOT IN (SELECT id FROM public.products);

-- 7. Re-establish Foreign Key Constraints
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
