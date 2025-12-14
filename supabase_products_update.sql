-- Add new columns to products table
alter table public.products add column if not exists description text;
alter table public.products add column if not exists color text;

-- STORAGE BUCKET FOR PRODUCT IMAGES
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Product images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'products' );

create policy "Authenticated users can upload product images"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

create policy "Authenticated users can update product images"
  on storage.objects for update
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

create policy "Authenticated users can delete product images"
  on storage.objects for delete
  using ( bucket_id = 'products' and auth.role() = 'authenticated' );
