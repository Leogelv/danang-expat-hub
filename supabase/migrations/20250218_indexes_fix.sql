-- Индексы для ускорения основных запросов
-- is_active фильтры (используются во всех GET endpoints)
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON public.listings (is_active);
CREATE INDEX IF NOT EXISTS idx_market_items_is_active ON public.market_items (is_active);
CREATE INDEX IF NOT EXISTS idx_places_is_active ON public.places (is_active);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events (is_active);

-- GIN индекс для поиска по тегам
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON public.community_posts USING gin (tags);

-- FK индексы (ускоряют JOIN и фильтрацию по user)
CREATE INDEX IF NOT EXISTS idx_favorites_tg_user_id ON public.favorites (tg_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tg_user_id ON public.notifications (tg_user_id);

-- Chat индексы
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages (room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON public.chat_participants (user_id);

-- Events attendance
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees (event_id);
