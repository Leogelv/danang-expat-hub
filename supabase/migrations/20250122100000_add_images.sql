-- Добавляем поле images (массив URL) во все таблицы с листингами

-- Listings (housing, bikes)
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Market items
ALTER TABLE public.market_items
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Places
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Community posts
ALTER TABLE public.community_posts
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Создаём индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_listings_images ON public.listings USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_market_items_images ON public.market_items USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_places_images ON public.places USING GIN (images);
