-- The Paint Reverie : schéma initial
create extension if not exists pgcrypto;

create table workshops (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  location text not null,
  price_fcfa int not null check (price_fcfa >= 0),
  capacity int not null check (capacity > 0),
  image_url text,
  status text not null default 'draft' check (status in ('draft','open','closed')),
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references workshops(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  seats int not null check (seats between 1 and 10),
  notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  created_at timestamptz not null default now()
);
create index on bookings (workshop_id, status);

create table private_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  event_type text not null,
  desired_date date,
  participants int,
  location text,
  message text,
  status text not null default 'new' check (status in ('new','contacted','quoted','done','declined')),
  created_at timestamptz not null default now()
);

create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  category text,
  orientation text not null default 'portrait' check (orientation in ('portrait','landscape')),
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table site_settings (key text primary key, value jsonb not null);

-- Places restantes (vue exécutée avec les droits du propriétaire : le public ne lit jamais la table bookings)
create view workshops_availability as
select w.id, w.slug, w.title, w.description, w.starts_at, w.location, w.price_fcfa,
       w.capacity, w.image_url, w.status,
       greatest(w.capacity - coalesce(sum(b.seats) filter (where b.status <> 'cancelled'), 0), 0)::int as seats_left
from workshops w
left join bookings b on b.workshop_id = w.id
where w.status in ('open','closed')
group by w.id;

-- Réservation atomique : verrouille l'atelier, vérifie les places, insère
create or replace function book_seats(
  p_workshop_id uuid, p_first text, p_last text, p_phone text,
  p_email text, p_seats int, p_notes text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  w workshops%rowtype;
  taken int;
  new_id uuid;
begin
  select * into w from workshops where id = p_workshop_id for update;
  if not found or w.status <> 'open' then raise exception 'workshop_closed'; end if;
  if w.starts_at < now() then raise exception 'workshop_past'; end if;

  select coalesce(sum(seats), 0) into taken
  from bookings where workshop_id = p_workshop_id and status <> 'cancelled';
  if taken + p_seats > w.capacity then raise exception 'not_enough_seats'; end if;

  insert into bookings (workshop_id, first_name, last_name, phone, email, seats, notes)
  values (p_workshop_id, p_first, p_last, p_phone, p_email, p_seats, p_notes)
  returning id into new_id;
  return new_id;
end $$;

revoke all on function book_seats(uuid,text,text,text,text,int,text) from public, anon, authenticated;
grant execute on function book_seats(uuid,text,text,text,text,int,text) to service_role;

-- RLS : tout est fermé par défaut, seule la lecture publique utile est ouverte
alter table workshops enable row level security;
alter table bookings enable row level security;
alter table private_requests enable row level security;
alter table gallery_items enable row level security;
alter table site_settings enable row level security;

create policy "public read workshops" on workshops for select using (status in ('open','closed'));
create policy "public read gallery" on gallery_items for select using (published);
create policy "public read settings" on site_settings for select using (true);
grant select on workshops_availability to anon, authenticated;
-- bookings / private_requests : aucune policy = accessibles uniquement via la service role (routes serveur)

-- Stockage des photos (lecture publique, écriture via l'admin)
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict do nothing;

-- Réglages par défaut modifiables depuis l'admin
insert into site_settings (key, value) values
 ('contact', '{"whatsapp":"+221763966507","instagram":"thepaintreverie_","tiktok":"thepaintreverie_","snapchat":"paintreverie"}')
on conflict do nothing;
