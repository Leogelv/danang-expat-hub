create extension if not exists "pgcrypto";

create table if not exists public.tg_users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  first_name text,
  last_name text,
  photo_url text,
  timezone text default 'UTC',
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  tg_user_id uuid references public.tg_users(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info',
  metadata jsonb default '{}'::jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  description text,
  price numeric,
  currency text default 'USD',
  location text,
  amenities text[],
  contact text,
  contact_type text,
  images text[],
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.market_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric,
  currency text default 'USD',
  category text,
  condition text,
  contact text,
  images text[],
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  price_level text,
  tags text[],
  wifi boolean default false,
  vegan boolean default false,
  address text,
  contact text,
  rating numeric,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz,
  location text,
  category text,
  max_participants integer,
  organizer_contact text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  author_name text,
  tags text[],
  created_at timestamptz default now()
);

create or replace view public.search_items as
  select
    listings.id,
    'listing'::text as source,
    listings.category,
    listings.title,
    listings.description,
    listings.price,
    listings.location,
    listings.contact,
    jsonb_build_object(
      'currency', listings.currency,
      'amenities', listings.amenities,
      'contact_type', listings.contact_type
    ) as metadata,
    listings.created_at
  from public.listings
  where listings.is_active = true
  union all
  select
    market_items.id,
    'market'::text as source,
    market_items.category,
    market_items.title,
    market_items.description,
    market_items.price,
    null::text as location,
    market_items.contact,
    jsonb_build_object(
      'currency', market_items.currency,
      'condition', market_items.condition
    ) as metadata,
    market_items.created_at
  from public.market_items
  where market_items.is_active = true
  union all
  select
    places.id,
    'place'::text as source,
    places.category,
    places.name as title,
    places.description,
    null::numeric as price,
    places.address as location,
    places.contact,
    jsonb_build_object(
      'tags', places.tags,
      'wifi', places.wifi,
      'vegan', places.vegan,
      'rating', places.rating,
      'price_level', places.price_level
    ) as metadata,
    places.created_at
  from public.places
  where places.is_active = true
  union all
  select
    events.id,
    'event'::text as source,
    events.category,
    events.title,
    events.description,
    null::numeric as price,
    events.location,
    events.organizer_contact as contact,
    jsonb_build_object(
      'starts_at', events.starts_at,
      'max_participants', events.max_participants
    ) as metadata,
    events.created_at
  from public.events
  where events.is_active = true
  union all
  select
    community_posts.id,
    'post'::text as source,
    null::text as category,
    community_posts.title,
    community_posts.body as description,
    null::numeric as price,
    null::text as location,
    community_posts.author_name as contact,
    jsonb_build_object('tags', community_posts.tags) as metadata,
    community_posts.created_at
  from public.community_posts;

create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_location_idx on public.listings (location);
create index if not exists market_items_category_idx on public.market_items (category);
create index if not exists places_category_idx on public.places (category);
create index if not exists events_category_idx on public.events (category);
