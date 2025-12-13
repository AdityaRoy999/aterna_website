-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table if not exists public.profiles (
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

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies for Profiles
drop policy if exists "Users can view their own profile" on profiles;
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ORDERS TABLE
-- Create table if it doesn't exist (basic structure)
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add columns if they don't exist (Migration for existing table)
alter table public.orders add column if not exists user_id uuid references auth.users;
alter table public.orders add column if not exists email text;
alter table public.orders add column if not exists total_amount numeric;
alter table public.orders add column if not exists status text default 'pending';
alter table public.orders add column if not exists shipping_address jsonb;

-- Enable RLS
alter table public.orders enable row level security;

-- Policies for Orders
drop policy if exists "Users can view their own orders" on orders;
create policy "Users can view their own orders" on orders
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own orders" on orders;
create policy "Users can insert their own orders" on orders
  for insert with check (auth.uid() = user_id);


-- ORDER ITEMS TABLE
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders not null,
  product_id text not null,
  product_name text not null,
  quantity integer not null,
  price numeric not null,
  variant_name text,
  image_url text
);

alter table public.order_items enable row level security;

drop policy if exists "Users can view their own order items" on order_items;
create policy "Users can view their own order items" on order_items
  for select using (
    exists ( select 1 from public.orders where orders.id = order_items.order_id )
  );

drop policy if exists "Users can insert their own order items" on order_items;
create policy "Users can insert their own order items" on order_items
  for insert with check (
    exists ( select 1 from public.orders where orders.id = order_items.order_id )
  );


-- CART ITEMS TABLE (For persistence)
create table if not exists public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id text not null,
  quantity integer default 1,
  variant_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id, variant_name)
);

alter table public.cart_items enable row level security;

drop policy if exists "Users can view their own cart" on cart_items;
create policy "Users can view their own cart" on cart_items
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert/update their own cart" on cart_items;
create policy "Users can insert/update their own cart" on cart_items
  for all using (auth.uid() = user_id);


-- REVIEWS TABLE
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id text not null,
  user_id uuid references auth.users not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies for Reviews
drop policy if exists "Reviews are viewable by everyone" on reviews;
create policy "Reviews are viewable by everyone" on reviews
  for select using (true);

drop policy if exists "Authenticated users can insert reviews" on reviews;
create policy "Authenticated users can insert reviews" on reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own reviews" on reviews;
create policy "Users can update their own reviews" on reviews
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete their own reviews" on reviews;
create policy "Users can delete their own reviews" on reviews
  for delete using (auth.uid() = user_id);
