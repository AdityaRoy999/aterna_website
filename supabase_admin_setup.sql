-- ==========================================
-- ADMIN DASHBOARD & DATABASE SETUP
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. UPDATE PRODUCTS TABLE
-- Add new columns for rich product details
alter table public.products add column if not exists description text;
alter table public.products add column if not exists color text;

-- 2. STORAGE SETUP
-- Create a storage bucket for product images
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Storage Policies (Allow public read, authenticated upload/manage)
drop policy if exists "Product images are publicly accessible" on storage.objects;
create policy "Product images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'products' );

drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

drop policy if exists "Authenticated users can update product images" on storage.objects;
create policy "Authenticated users can update product images"
  on storage.objects for update
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

drop policy if exists "Authenticated users can delete product images" on storage.objects;
create policy "Authenticated users can delete product images"
  on storage.objects for delete
  using ( bucket_id = 'products' and auth.role() = 'authenticated' );

-- 3. ADMIN PERMISSIONS (PRODUCTS)
-- Allow authenticated users to Create, Update, and Delete products
drop policy if exists "Enable insert for authenticated users only" on products;
create policy "Enable insert for authenticated users only"
  on products for insert
  with check ( auth.role() = 'authenticated' );

drop policy if exists "Enable update for authenticated users only" on products;
create policy "Enable update for authenticated users only"
  on products for update
  using ( auth.role() = 'authenticated' );

drop policy if exists "Enable delete for authenticated users only" on products;
create policy "Enable delete for authenticated users only"
  on products for delete
  using ( auth.role() = 'authenticated' );

-- 4. ADMIN PERMISSIONS (ORDERS)
-- Allow authenticated users to view all orders and update their status
-- Note: In a production app, you should restrict this to specific admin emails
drop policy if exists "Enable read access for all authenticated users" on orders;
create policy "Enable read access for all authenticated users"
  on orders for select
  using ( auth.role() = 'authenticated' );

drop policy if exists "Enable update for authenticated users only" on orders;
create policy "Enable update for authenticated users only"
  on orders for update
  using ( auth.role() = 'authenticated' );
