-- ==========================================
-- FIX ADMIN PERMISSIONS
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. JOB APPLICATIONS PERMISSIONS
-- Allow authenticated users (Admins) to view all job applications
drop policy if exists "Authenticated users can view job applications" on job_applications;
create policy "Authenticated users can view job applications"
  on job_applications for select
  using ( auth.role() = 'authenticated' );

-- 2. RESUMES STORAGE PERMISSIONS
-- Allow authenticated users (Admins) to download/view resumes
drop policy if exists "Authenticated users can view resumes" on storage.objects;
create policy "Authenticated users can view resumes"
  on storage.objects for select
  using ( bucket_id = 'resumes' and auth.role() = 'authenticated' );

-- 3. CONTACT MESSAGES PERMISSIONS
-- Ensure Admins can view ALL contact messages, not just their own
drop policy if exists "Authenticated users can view all contact messages" on contact_messages;
create policy "Authenticated users can view all contact messages"
  on contact_messages for select
  using ( auth.role() = 'authenticated' );

-- 4. APPOINTMENTS PERMISSIONS
-- Ensure Admins can view ALL appointments
drop policy if exists "Authenticated users can view all appointments" on appointments;
create policy "Authenticated users can view all appointments"
  on appointments for select
  using ( auth.role() = 'authenticated' );
