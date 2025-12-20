-- JOURNAL POSTS
create table if not exists public.journal_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subtitle text,
  category text,
  image_url text,
  excerpt text,
  author text,
  read_time text,
  content text, -- HTML or Markdown
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Journal
alter table public.journal_posts enable row level security;
drop policy if exists "Public can view journal posts" on journal_posts;
create policy "Public can view journal posts" on journal_posts for select using (true);

drop policy if exists "Allow all authenticated users to insert journal posts" on journal_posts;
create policy "Allow all authenticated users to insert journal posts" on journal_posts for insert with check (auth.uid() is not null);

drop policy if exists "Allow all authenticated users to update journal posts" on journal_posts;
create policy "Allow all authenticated users to update journal posts" on journal_posts for update using (auth.uid() is not null);

drop policy if exists "Allow all authenticated users to delete journal posts" on journal_posts;
create policy "Allow all authenticated users to delete journal posts" on journal_posts for delete using (auth.uid() is not null);

-- WISHLIST / BOOKMARKS
create table if not exists public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id text not null, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

alter table public.wishlist enable row level security;
drop policy if exists "Users can view their own wishlist" on wishlist;
create policy "Users can view their own wishlist" on wishlist for select using (auth.uid() = user_id);

drop policy if exists "Users can insert into their own wishlist" on wishlist;
create policy "Users can insert into their own wishlist" on wishlist for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete from their own wishlist" on wishlist;
create policy "Users can delete from their own wishlist" on wishlist for delete using (auth.uid() = user_id);

-- CART ITEMS (Ensure it exists)
create table if not exists public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id text not null,
  variant_name text,
  quantity integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id, variant_name)
);

alter table public.cart_items enable row level security;
drop policy if exists "Users can view their own cart" on cart_items;
create policy "Users can view their own cart" on cart_items for select using (auth.uid() = user_id);

drop policy if exists "Users can insert into their own cart" on cart_items;
create policy "Users can insert into their own cart" on cart_items for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own cart" on cart_items;
create policy "Users can update their own cart" on cart_items for update using (auth.uid() = user_id);

drop policy if exists "Users can delete from their own cart" on cart_items;
create policy "Users can delete from their own cart" on cart_items for delete using (auth.uid() = user_id);
