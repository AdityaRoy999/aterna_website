-- ==========================================
-- FIX: Add foreign key between reviews.user_id and profiles.id
-- This makes PostgREST able to embed `profiles` when selecting reviews
-- Run in Supabase SQL Editor
-- ==========================================

-- Ensure profiles table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  full_name text
);

DO $$
BEGIN
  -- add constraint only if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_profiles_fkey'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_user_profiles_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id);
  END IF;
END$$;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
