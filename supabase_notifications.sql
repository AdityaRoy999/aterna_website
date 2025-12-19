-- Create notifications table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('order', 'stock', 'message')),
  title text not null,
  message text not null,
  is_read boolean default false,
  related_id uuid, -- Can be order_id, product_id, or message_id
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table notifications enable row level security;

-- Create policy to allow public insert (for contact form/checkout) and admin read
create policy "Allow public insert" on notifications for insert with check (true);
create policy "Allow authenticated read" on notifications for select using (auth.role() = 'authenticated');
create policy "Allow authenticated update" on notifications for update using (auth.role() = 'authenticated');
