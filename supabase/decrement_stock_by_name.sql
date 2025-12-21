-- Drop the function first to allow parameter name changes
drop function if exists decrement_stock_by_name(text, int);

create or replace function decrement_stock_by_name(p_name text, q_decrement int)
returns void
language plpgsql
security definer
as $$
declare
  target_id text;
begin
  -- Find product by name (case insensitive, or exact)
  -- Cast id to text to ensure compatibility
  select id::text into target_id from products where name = p_name limit 1;
  
  if target_id is null then
     raise exception 'Product not found by name: %', p_name;
  end if;

  update products
  set quantity = quantity - q_decrement
  where id::text = target_id
  and quantity >= q_decrement;

  if not found then
    raise exception 'Insufficient stock for product: %', p_name;
  end if;
end;
$$;
