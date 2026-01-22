-- =============================================
-- DANANG EXPAT HUB - FULL UPGRADE MIGRATION
-- Добавляет: языки, геолокацию, комментарии, переводы
-- =============================================

-- 1. Язык пользователя
ALTER TABLE public.tg_users
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en'
CHECK (language IN ('en', 'ru', 'uk', 'vi'));

CREATE INDEX IF NOT EXISTS tg_users_language_idx ON public.tg_users (language);

-- 2. Геолокация постов + связь с автором
ALTER TABLE public.community_posts
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision,
ADD COLUMN IF NOT EXISTS author_tg_id bigint;

-- Добавляем FK отдельно (если колонка уже существует, ALTER не упадёт)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'community_posts_author_tg_id_fkey'
  ) THEN
    ALTER TABLE public.community_posts
    ADD CONSTRAINT community_posts_author_tg_id_fkey
    FOREIGN KEY (author_tg_id) REFERENCES public.tg_users(telegram_id);
  END IF;
END $$;

-- 3. Комментарии к постам
CREATE TABLE IF NOT EXISTS public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_name text,
  author_tg_id bigint,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- FK для author_tg_id в комментариях
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'community_comments_author_tg_id_fkey'
  ) THEN
    ALTER TABLE public.community_comments
    ADD CONSTRAINT community_comments_author_tg_id_fkey
    FOREIGN KEY (author_tg_id) REFERENCES public.tg_users(telegram_id);
  END IF;
END $$;

-- 4. Кэш AI-переводов контента
CREATE TABLE IF NOT EXISTS public.content_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table text NOT NULL CHECK (source_table IN ('listings', 'market_items', 'places', 'events', 'community_posts')),
  source_id uuid NOT NULL,
  field_name text NOT NULL CHECK (field_name IN ('title', 'description', 'body', 'name')),
  source_language text NOT NULL DEFAULT 'en',
  target_language text NOT NULL CHECK (target_language IN ('en', 'ru', 'uk', 'vi')),
  translated_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid,
  UNIQUE(source_table, source_id, field_name, target_language)
);

-- FK для created_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'content_translations_created_by_fkey'
  ) THEN
    ALTER TABLE public.content_translations
    ADD CONSTRAINT content_translations_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.tg_users(id);
  END IF;
END $$;

-- 5. Индексы
CREATE INDEX IF NOT EXISTS community_posts_geo_idx
  ON public.community_posts (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS community_posts_tags_idx
  ON public.community_posts USING GIN (tags);

CREATE INDEX IF NOT EXISTS community_comments_post_idx
  ON public.community_comments (post_id);

CREATE INDEX IF NOT EXISTS community_comments_created_idx
  ON public.community_comments (created_at);

CREATE INDEX IF NOT EXISTS translations_source_idx
  ON public.content_translations (source_table, source_id);

CREATE INDEX IF NOT EXISTS translations_lookup_idx
  ON public.content_translations (source_table, source_id, target_language);

-- 6. Добавляем images в places (если нет)
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS images text[];

-- 7. RLS политики для новых таблиц
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;

-- Политики для комментариев (все могут читать, авторизованные - писать)
DROP POLICY IF EXISTS "Anyone can read comments" ON public.community_comments;
CREATE POLICY "Anyone can read comments" ON public.community_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert comments" ON public.community_comments;
CREATE POLICY "Anyone can insert comments" ON public.community_comments
  FOR INSERT WITH CHECK (true);

-- Политики для переводов (все могут читать и добавлять)
DROP POLICY IF EXISTS "Anyone can read translations" ON public.content_translations;
CREATE POLICY "Anyone can read translations" ON public.content_translations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert translations" ON public.content_translations;
CREATE POLICY "Anyone can insert translations" ON public.content_translations
  FOR INSERT WITH CHECK (true);
