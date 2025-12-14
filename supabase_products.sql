-- Create products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  category text not null,
  image_url text not null,
  is_new boolean default false,
  variant_type text,
  variants jsonb, -- Array of { name, imageUrl, colorCode }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table products enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access" on products for select using (true);

-- Insert data
insert into products (name, price, category, image_url, is_new, variant_type, variants) values
('Ulania Watch', 18100.00, 'Timepieces', '/images/clock_gold.png', true, 'Finish', '[
  {"name": "Gold", "imageUrl": "/images/clock_gold.png", "colorCode": "#E8CFA0"},
  {"name": "Silver", "imageUrl": "/images/clock_silver.png", "colorCode": "#C0C0C0"},
  {"name": "Onyx", "imageUrl": "/images/clock_oynx.png", "colorCode": "#1A1A1A"}
]'),
('Chanel No. 5', 259.00, 'Fragrance', '/images/channel_50.png', false, 'Size', '[
  {"name": "50ml", "imageUrl": "/images/channel_50.png"},
  {"name": "100ml", "imageUrl": "/images/channel_100.png"},
  {"name": "200ml", "imageUrl": "/images/channel_200.png"}
]'),
('Gold Abstract', 1250.50, 'Jewelry', '/images/gold_abstract.png', false, 'Finish', '[
  {"name": "Gold", "imageUrl": "/images/gold_abstract.png", "colorCode": "#E8CFA0"},
  {"name": "Silver", "imageUrl": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1887&auto=format&fit=crop", "colorCode": "#C0C0C0"}
]'),
('Noir Elegance', 450.00, 'Accessories', '/images/noir_stan.png', false, 'Style', '[
  {"name": "Standard", "imageUrl": "/images/noir_stan.png", "colorCode": "#1A1A1A"},
  {"name": "Textured", "imageUrl": "/images/noir_matte.png", "colorCode": "#333333"}
]'),
('Royal Chrono', 24500.00, 'Timepieces', '/images/gold_chrono.png', false, 'Finish', '[
  {"name": "Gold", "imageUrl": "/images/gold_chrono.png", "colorCode": "#E8CFA0"},
  {"name": "Silver", "imageUrl": "/images/silver_chrono.png", "colorCode": "#C0C0C0"},
  {"name": "Onyx", "imageUrl": "/images/oynx_chrono.png", "colorCode": "#1A1A1A"}
]'),
('Amber Essence', 310.00, 'Fragrance', '/images/amb50.png', true, 'Size', '[
  {"name": "50ml", "imageUrl": "/images/amb50.png"},
  {"name": "100ml", "imageUrl": "/images/amb100.png"},
  {"name": "200ml", "imageUrl": "/images/amb200.png"}
]'),
('Pearl Drop', 890.00, 'Jewelry', '/images/pearl_white.png', false, 'Finish', '[
  {"name": "Gold", "imageUrl": "/images/pearl_gold.png", "colorCode": "#E8CFA0"},
  {"name": "White", "imageUrl": "/images/pearl_white.png", "colorCode": "#eeeae3ff"}
]'),
('Pink Glow', 1200.00, 'Accessories', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop', false, 'Style', '[
  {"name": "Standard", "imageUrl": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop", "colorCode": "#b614b3ff"},
  {"name": "Matte", "imageUrl": "/images/pink.png", "colorCode": "#a40c9aff"}
]');
