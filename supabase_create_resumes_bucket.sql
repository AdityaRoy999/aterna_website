-- ==========================================
-- CREATE RESUMES BUCKET
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Create the 'resumes' bucket (Private)
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- 2. Allow anyone to upload resumes (for job applicants)
drop policy if exists "Anyone can upload resumes" on storage.objects;
create policy "Anyone can upload resumes"
  on storage.objects for insert
  with check ( bucket_id = 'resumes' );

-- 3. Allow authenticated users (Admins) to view/download resumes
drop policy if exists "Authenticated users can view resumes" on storage.objects;
create policy "Authenticated users can view resumes"
  on storage.objects for select
  using ( bucket_id = 'resumes' and auth.role() = 'authenticated' );
