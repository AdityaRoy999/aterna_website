
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
