-- Create contact_messages table if it doesn't exist
create table if not exists public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add columns if they don't exist (Migration safe)
alter table public.contact_messages add column if not exists user_id uuid references auth.users;
alter table public.contact_messages add column if not exists name text;
alter table public.contact_messages add column if not exists email text;
alter table public.contact_messages add column if not exists subject text;
alter table public.contact_messages add column if not exists message text;

-- Enable RLS for contact_messages
alter table public.contact_messages enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Anyone can insert contact messages" on contact_messages;
drop policy if exists "Users can view their own contact messages" on contact_messages;

-- Allow anyone to insert contact messages (public or authenticated)
create policy "Anyone can insert contact messages" on contact_messages
  for insert with check (true);

-- Allow users to view their own messages
create policy "Users can view their own contact messages" on contact_messages
  for select using (auth.uid() = user_id);


-- Create appointments table if it doesn't exist
create table if not exists public.appointments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add columns if they don't exist (Migration safe)
alter table public.appointments add column if not exists user_id uuid references auth.users;
alter table public.appointments add column if not exists name text;
alter table public.appointments add column if not exists email text;
alter table public.appointments add column if not exists phone text;
alter table public.appointments add column if not exists location text;
alter table public.appointments add column if not exists preferred_date date;
alter table public.appointments add column if not exists preferred_time time;
alter table public.appointments add column if not exists interest text;
alter table public.appointments add column if not exists message text;
alter table public.appointments add column if not exists status text default 'Pending';

-- Enable RLS for appointments
alter table public.appointments enable row level security;

-- Drop existing policies
drop policy if exists "Authenticated users can insert appointments" on appointments;
drop policy if exists "Users can view their own appointments" on appointments;

-- Allow authenticated users to insert appointments
create policy "Authenticated users can insert appointments" on appointments
  for insert with check (auth.role() = 'authenticated');

-- Allow users to view their own appointments
create policy "Users can view their own appointments" on appointments
  for select using (auth.uid() = user_id);
