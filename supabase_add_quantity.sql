-- Add quantity column to products table
alter table products add column if not exists quantity integer default 0;

-- Function to decrement stock
create or replace function decrement_stock(product_id uuid, quantity_to_decrement int)
returns void
language plpgsql
security definer
as $$
begin
  update products
  set quantity = quantity - quantity_to_decrement
  where id = product_id;
end;
$$;
