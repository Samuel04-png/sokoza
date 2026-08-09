update public.categories set name = 'Sneakers', slug = 'sneakers' where slug = 'footwear';
update public.categories set name = 'Shirts', slug = 'shirts' where slug = 'tops';
update public.categories set name = 'Trousers', slug = 'trousers' where slug = 'bottoms';
update public.categories set name = 'Jewelry', slug = 'jewelry' where slug = 'accessories';

insert into public.categories (name, slug, sort_order, active)
values ('Thrift', 'thrift', 90, true)
on conflict (slug) do update set name = excluded.name, active = true;
