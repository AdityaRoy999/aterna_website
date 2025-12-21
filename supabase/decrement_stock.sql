-- Drop the function first to allow parameter name changes
drop function if exists decrement_stock(uuid, int);
drop function if exists decrement_stock(text, int);

create or replace function decrement_stock(product_id text, quantity_to_decrement int)
returns void
language plpgsql
security definer
as $$
begin
  update products
  set quantity = quantity - quantity_to_decrement
  where id::text = product_id
  and quantity >= quantity_to_decrement;

  if not found then
    raise exception 'Insufficient stock or product not found';
  end if;
end;
$$;
