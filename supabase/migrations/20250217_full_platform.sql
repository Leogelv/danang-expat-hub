-- =============================================
-- DANANG EXPAT HUB - FULL PLATFORM MIGRATION
-- Дата: 2026-02-17
-- Описание: Расширение платформы — авторство, модерация,
-- реакции (лайки), участие в событиях, P2P чат с переводами
-- =============================================

-- =============================================
-- 1. ФУНКЦИЯ update_updated_at — триггер для автообновления
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================
-- 2. ALTER TABLE listings — автор, модерация, updated_at
-- =============================================
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.tg_users(id),
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Триггер updated_at для listings
DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Индекс на author_id
CREATE INDEX IF NOT EXISTS idx_listings_author_id ON public.listings (author_id);
-- Индекс на moderation_status
CREATE INDEX IF NOT EXISTS idx_listings_moderation_status ON public.listings (moderation_status);

-- =============================================
-- 3. ALTER TABLE market_items — автор, модерация, updated_at
-- =============================================
ALTER TABLE public.market_items
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.tg_users(id),
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Триггер updated_at для market_items
DROP TRIGGER IF EXISTS trg_market_items_updated_at ON public.market_items;
CREATE TRIGGER trg_market_items_updated_at
  BEFORE UPDATE ON public.market_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Индекс на author_id
CREATE INDEX IF NOT EXISTS idx_market_items_author_id ON public.market_items (author_id);
-- Индекс на moderation_status
CREATE INDEX IF NOT EXISTS idx_market_items_moderation_status ON public.market_items (moderation_status);

-- =============================================
-- 4. ALTER TABLE places — автор, модерация, updated_at, координаты
-- =============================================
ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.tg_users(id),
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

-- Триггер updated_at для places
DROP TRIGGER IF EXISTS trg_places_updated_at ON public.places;
CREATE TRIGGER trg_places_updated_at
  BEFORE UPDATE ON public.places
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Индексы
CREATE INDEX IF NOT EXISTS idx_places_author_id ON public.places (author_id);
CREATE INDEX IF NOT EXISTS idx_places_moderation_status ON public.places (moderation_status);
CREATE INDEX IF NOT EXISTS idx_places_coords ON public.places (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- =============================================
-- 5. ALTER TABLE events — автор, модерация, updated_at, ends_at
-- =============================================
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.tg_users(id),
  ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS ends_at timestamptz;

-- Триггер updated_at для events
DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Индексы
CREATE INDEX IF NOT EXISTS idx_events_author_id ON public.events (author_id);
CREATE INDEX IF NOT EXISTS idx_events_moderation_status ON public.events (moderation_status);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON public.events (starts_at);
CREATE INDEX IF NOT EXISTS idx_events_ends_at ON public.events (ends_at);

-- =============================================
-- 6. Триггер updated_at для chat_rooms (создание ниже)
-- Тут также добавляем триггер для ai_agent_config (уже есть updated_at)
-- =============================================

-- Триггер для ai_agent_config (таблица уже есть, updated_at тоже)
DROP TRIGGER IF EXISTS trg_ai_agent_config_updated_at ON public.ai_agent_config;
CREATE TRIGGER trg_ai_agent_config_updated_at
  BEFORE UPDATE ON public.ai_agent_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Триггер для ai_conversations (таблица уже есть, updated_at тоже)
DROP TRIGGER IF EXISTS trg_ai_conversations_updated_at ON public.ai_conversations;
CREATE TRIGGER trg_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- 7. TABLE event_attendees — участники событий
-- =============================================
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.tg_users(id),
  status text NOT NULL DEFAULT 'going',
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees (event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees (user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON public.event_attendees (status);

-- =============================================
-- 8. TABLE likes — универсальные лайки (любая таблица)
-- =============================================
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.tg_users(id),
  source_table text NOT NULL,
  source_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, source_table, source_id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes (user_id);
CREATE INDEX IF NOT EXISTS idx_likes_source ON public.likes (source_table, source_id);

-- =============================================
-- 9. TABLE chat_rooms — комнаты чата (P2P, групповые, контекстные)
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'direct',
  context_type text,
  context_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Триггер updated_at для chat_rooms
DROP TRIGGER IF EXISTS trg_chat_rooms_updated_at ON public.chat_rooms;
CREATE TRIGGER trg_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Индексы
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON public.chat_rooms (type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_context ON public.chat_rooms (context_type, context_id)
  WHERE context_type IS NOT NULL;

-- =============================================
-- 10. TABLE chat_participants — участники комнат чата
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.tg_users(id),
  preferred_language text DEFAULT 'en',
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON public.chat_participants (room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON public.chat_participants (user_id);

-- =============================================
-- 11. TABLE chat_messages — сообщения в чате
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.tg_users(id),
  type text NOT NULL DEFAULT 'text',
  content text NOT NULL,
  original_language text DEFAULT 'en',
  media_url text,
  reply_to_id uuid REFERENCES public.chat_messages(id),
  created_at timestamptz DEFAULT now()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages (room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages (created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to ON public.chat_messages (reply_to_id)
  WHERE reply_to_id IS NOT NULL;

-- =============================================
-- 12. TABLE chat_message_translations — переводы сообщений
-- =============================================
CREATE TABLE IF NOT EXISTS public.chat_message_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  target_language text NOT NULL,
  translated_text text NOT NULL,
  UNIQUE(message_id, target_language)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_chat_msg_translations_message_id ON public.chat_message_translations (message_id);
CREATE INDEX IF NOT EXISTS idx_chat_msg_translations_lang ON public.chat_message_translations (message_id, target_language);

-- =============================================
-- 13. RLS — включение для существующих таблиц без RLS
-- =============================================

-- Listings — включаем RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Политики для listings
DROP POLICY IF EXISTS "listings_select_all" ON public.listings;
CREATE POLICY "listings_select_all" ON public.listings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "listings_insert_auth" ON public.listings;
CREATE POLICY "listings_insert_auth" ON public.listings
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "listings_update_own" ON public.listings;
CREATE POLICY "listings_update_own" ON public.listings
  FOR UPDATE USING (
    author_id IS NULL OR
    author_id = (SELECT id FROM public.tg_users WHERE id = auth.uid())
  );

-- Market items — включаем RLS
ALTER TABLE public.market_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "market_items_select_all" ON public.market_items;
CREATE POLICY "market_items_select_all" ON public.market_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "market_items_insert_auth" ON public.market_items;
CREATE POLICY "market_items_insert_auth" ON public.market_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "market_items_update_own" ON public.market_items;
CREATE POLICY "market_items_update_own" ON public.market_items
  FOR UPDATE USING (
    author_id IS NULL OR
    author_id = (SELECT id FROM public.tg_users WHERE id = auth.uid())
  );

-- Places — включаем RLS
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "places_select_all" ON public.places;
CREATE POLICY "places_select_all" ON public.places
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "places_insert_auth" ON public.places;
CREATE POLICY "places_insert_auth" ON public.places
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "places_update_own" ON public.places;
CREATE POLICY "places_update_own" ON public.places
  FOR UPDATE USING (
    author_id IS NULL OR
    author_id = (SELECT id FROM public.tg_users WHERE id = auth.uid())
  );

-- Events — включаем RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_all" ON public.events;
CREATE POLICY "events_select_all" ON public.events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "events_insert_auth" ON public.events;
CREATE POLICY "events_insert_auth" ON public.events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "events_update_own" ON public.events;
CREATE POLICY "events_update_own" ON public.events
  FOR UPDATE USING (
    author_id IS NULL OR
    author_id = (SELECT id FROM public.tg_users WHERE id = auth.uid())
  );

-- Favorites — включаем RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_select_own" ON public.favorites;
CREATE POLICY "favorites_select_own" ON public.favorites
  FOR SELECT USING (
    tg_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "favorites_insert_own" ON public.favorites;
CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT WITH CHECK (
    tg_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "favorites_delete_own" ON public.favorites;
CREATE POLICY "favorites_delete_own" ON public.favorites
  FOR DELETE USING (
    tg_user_id = auth.uid()
  );

-- Community posts — включаем RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_posts_select_all" ON public.community_posts;
CREATE POLICY "community_posts_select_all" ON public.community_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "community_posts_insert_auth" ON public.community_posts;
CREATE POLICY "community_posts_insert_auth" ON public.community_posts
  FOR INSERT WITH CHECK (true);

-- Notifications — включаем RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (
    tg_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (
    tg_user_id = auth.uid()
  );

-- tg_users — включаем RLS
ALTER TABLE public.tg_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tg_users_select_all" ON public.tg_users;
CREATE POLICY "tg_users_select_all" ON public.tg_users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "tg_users_update_own" ON public.tg_users;
CREATE POLICY "tg_users_update_own" ON public.tg_users
  FOR UPDATE USING (id = auth.uid());

-- =============================================
-- 14. RLS для новых таблиц
-- =============================================

-- Event attendees
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_attendees_select_all" ON public.event_attendees;
CREATE POLICY "event_attendees_select_all" ON public.event_attendees
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "event_attendees_insert_auth" ON public.event_attendees;
CREATE POLICY "event_attendees_insert_auth" ON public.event_attendees
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "event_attendees_update_own" ON public.event_attendees;
CREATE POLICY "event_attendees_update_own" ON public.event_attendees
  FOR UPDATE USING (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "event_attendees_delete_own" ON public.event_attendees;
CREATE POLICY "event_attendees_delete_own" ON public.event_attendees
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- Likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_select_all" ON public.likes;
CREATE POLICY "likes_select_all" ON public.likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "likes_insert_own" ON public.likes;
CREATE POLICY "likes_insert_own" ON public.likes
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "likes_delete_own" ON public.likes;
CREATE POLICY "likes_delete_own" ON public.likes
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- Chat rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_rooms_select_participant" ON public.chat_rooms;
CREATE POLICY "chat_rooms_select_participant" ON public.chat_rooms
  FOR SELECT USING (
    id IN (
      SELECT room_id FROM public.chat_participants
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chat_rooms_insert_auth" ON public.chat_rooms;
CREATE POLICY "chat_rooms_insert_auth" ON public.chat_rooms
  FOR INSERT WITH CHECK (true);

-- Chat participants
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_participants_select_room" ON public.chat_participants;
CREATE POLICY "chat_participants_select_room" ON public.chat_participants
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM public.chat_participants cp
      WHERE cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chat_participants_insert_auth" ON public.chat_participants;
CREATE POLICY "chat_participants_insert_auth" ON public.chat_participants
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "chat_participants_update_own" ON public.chat_participants;
CREATE POLICY "chat_participants_update_own" ON public.chat_participants
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Chat messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_messages_select_participant" ON public.chat_messages;
CREATE POLICY "chat_messages_select_participant" ON public.chat_messages
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM public.chat_participants
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chat_messages_insert_participant" ON public.chat_messages;
CREATE POLICY "chat_messages_insert_participant" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    room_id IN (
      SELECT room_id FROM public.chat_participants
      WHERE user_id = auth.uid()
    )
  );

-- Chat message translations
ALTER TABLE public.chat_message_translations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_translations_select_participant" ON public.chat_message_translations;
CREATE POLICY "chat_translations_select_participant" ON public.chat_message_translations
  FOR SELECT USING (
    message_id IN (
      SELECT cm.id FROM public.chat_messages cm
      JOIN public.chat_participants cp ON cp.room_id = cm.room_id
      WHERE cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chat_translations_insert_auth" ON public.chat_message_translations;
CREATE POLICY "chat_translations_insert_auth" ON public.chat_message_translations
  FOR INSERT WITH CHECK (true);

-- =============================================
-- КОНЕЦ МИГРАЦИИ
-- =============================================
