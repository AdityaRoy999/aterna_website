-- Add Telegram Auth columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_secret_code text UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_chat_id bigint UNIQUE;

-- Function to generate a random 6-digit code
CREATE OR REPLACE FUNCTION generate_telegram_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := floor(random() * (999999 - 100000 + 1) + 100000)::text;
    SELECT INTO exists (COUNT(*) > 0) FROM public.profiles WHERE telegram_secret_code = code;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles with a code if they don't have one
UPDATE public.profiles 
SET telegram_secret_code = generate_telegram_code() 
WHERE telegram_secret_code IS NULL;

-- Update the handle_new_user trigger to include the code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, telegram_secret_code)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    generate_telegram_code()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
