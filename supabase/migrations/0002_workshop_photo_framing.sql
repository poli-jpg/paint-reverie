-- The Paint Reverie : réglage de la photo des ateliers (cadrage, zoom, taille)
alter table workshops
  add column if not exists image_pos_x int not null default 50,
  add column if not exists image_pos_y int not null default 50,
  add column if not exists image_zoom numeric(3,2) not null default 1,
  add column if not exists image_size text not null default 'md';

alter table workshops drop constraint if exists workshops_image_size_check;
alter table workshops add constraint workshops_image_size_check check (image_size in ('sm','md','lg'));

-- La vue publique doit aussi exposer ces réglages (nouvelles colonnes ajoutées à la fin)
create or replace view workshops_availability as
select w.id, w.slug, w.title, w.description, w.starts_at, w.location, w.price_fcfa,
       w.capacity, w.image_url, w.status,
       greatest(w.capacity - coalesce(sum(b.seats) filter (where b.status <> 'cancelled'), 0), 0)::int as seats_left,
       w.image_pos_x, w.image_pos_y, w.image_zoom, w.image_size
from workshops w
left join bookings b on b.workshop_id = w.id
where w.status in ('open','closed')
group by w.id;

grant select on workshops_availability to anon, authenticated;
