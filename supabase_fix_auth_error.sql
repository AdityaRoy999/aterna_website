-- ==========================================
-- FIX AUTH "DATABASE ERROR SAVING NEW USER"
-- Run this script in the Supabase SQL Editor
-- ==========================================

-- 1. Drop the trigger first to avoid conflicts during function update
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Ensure profiles table exists (Idempotent)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Ensure Telegram columns exist (Idempotent)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_secret_code text UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_chat_id bigint UNIQUE;

-- 4. Recreate the code generation function
-- We use a different variable name for 'exists' to avoid keyword conflicts
CREATE OR REPLACE FUNCTION public.generate_telegram_code()
RETURNS text AS $$
DECLARE
  code text;
  code_exists boolean;
BEGIN
  LOOP
    code := floor(random() * (999999 - 100000 + 1) + 100000)::text;
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE telegram_secret_code = code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 5. Recreate the handle_new_user function
-- IMPORTANT: Added 'SECURITY DEFINER' and 'SET search_path' to fix permission issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, telegram_secret_code)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    public.generate_telegram_code()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- 6. Re-enable the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Verify RLS on profiles (Just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Ensure policies exist (Idempotent-ish, dropping first to be safe)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
