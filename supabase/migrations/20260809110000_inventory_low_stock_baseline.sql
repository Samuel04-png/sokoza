alter table public.product_variants
  add column if not exists stock_reference_quantity integer not null default 0
  check (stock_reference_quantity >= 0);

update public.product_variants
set stock_reference_quantity = stock_quantity
where stock_reference_quantity < stock_quantity;

create or replace function public.preserve_variant_stock_reference()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.stock_reference_quantity := greatest(new.stock_reference_quantity, new.stock_quantity);
  else
    new.stock_reference_quantity := greatest(old.stock_reference_quantity, new.stock_quantity);
  end if;
  return new;
end;
$$;

drop trigger if exists product_variants_stock_reference on public.product_variants;
create trigger product_variants_stock_reference
before insert or update of stock_quantity on public.product_variants
for each row execute function public.preserve_variant_stock_reference();

comment on column public.product_variants.stock_reference_quantity is
  'Highest quantity held for this option. Automatic low stock activates after a reference of at least 3 later falls to 3 or fewer.';
