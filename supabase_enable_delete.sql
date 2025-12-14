-- ==========================================
-- ENABLE DELETE PERMISSIONS FOR ADMIN
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. CONTACT MESSAGES
drop policy if exists "Authenticated users can delete contact messages" on contact_messages;
create policy "Authenticated users can delete contact messages"
  on contact_messages for delete
  using ( auth.role() = 'authenticated' );

-- 2. APPOINTMENTS
drop policy if exists "Authenticated users can delete appointments" on appointments;
create policy "Authenticated users can delete appointments"
  on appointments for delete
  using ( auth.role() = 'authenticated' );

-- 3. PRODUCTS
-- Allow Delete
drop policy if exists "Authenticated users can delete products" on products;
create policy "Authenticated users can delete products"
  on products for delete
  using ( auth.role() = 'authenticated' );

-- Allow Insert (for Add Product)
drop policy if exists "Authenticated users can insert products" on products;
create policy "Authenticated users can insert products"
  on products for insert
  with check ( auth.role() = 'authenticated' );

-- Allow Update (for Edit Product)
drop policy if exists "Authenticated users can update products" on products;
create policy "Authenticated users can update products"
  on products for update
  using ( auth.role() = 'authenticated' );

-- 4. JOB APPLICATIONS
drop policy if exists "Authenticated users can delete job applications" on job_applications;
create policy "Authenticated users can delete job applications"
  on job_applications for delete
  using ( auth.role() = 'authenticated' );

-- 5. STORAGE (Images & Resumes)
-- Allow authenticated users to delete files from storage
drop policy if exists "Authenticated users can delete files" on storage.objects;
create policy "Authenticated users can delete files"
  on storage.objects for delete
  using ( auth.role() = 'authenticated' );

-- Allow authenticated users to upload files (for Product Images)
drop policy if exists "Authenticated users can upload files" on storage.objects;
create policy "Authenticated users can upload files"
  on storage.objects for insert
  with check ( auth.role() = 'authenticated' );
