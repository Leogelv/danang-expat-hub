-- Добавляем координаты для отображения на карте
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;

CREATE INDEX IF NOT EXISTS idx_listings_coords ON public.listings (lat, lng);
