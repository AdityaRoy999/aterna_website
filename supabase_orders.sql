-- Create orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  email text,
  total_amount numeric not null,
  status text default 'processing', -- processing, shipped, delivered, cancelled
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null, -- Store name in case product is deleted
  quantity integer not null,
  price numeric not null,
  variant_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies for orders
drop policy if exists "Users can view their own orders" on orders;
create policy "Users can view their own orders" on orders
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own orders" on orders;
create policy "Users can insert their own orders" on orders
  for insert with check (auth.uid() = user_id);

-- Policies for order_items
drop policy if exists "Users can view their own order items" on order_items;
create policy "Users can view their own order items" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert their own order items" on order_items;
create policy "Users can insert their own order items" on order_items
  for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );
