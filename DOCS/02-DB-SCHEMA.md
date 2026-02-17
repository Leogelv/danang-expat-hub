# Схема базы данных — Danang Expat Hub

> **Last Verified:** 2026-02-17
> **PostgreSQL:** 17, **Supabase**, **Extensions:** pgcrypto

---

## ER-диаграмма (текущая)

```
tg_users (uuid PK)
├── telegram_id (bigint UNIQUE)
├── username, first_name, last_name, photo_url
├── language (en|ru|uk|vi)
├── timezone
└── created_at

notifications (uuid PK)
├── tg_user_id → tg_users(id) CASCADE
├── title, message, type, metadata(jsonb)
├── is_read
└── created_at

listings (uuid PK)          ⚠ НЕТ FK к автору
├── category, title, description
├── price, currency, location
├── amenities[], images[], contact, contact_type
├── is_active
└── created_at

market_items (uuid PK)      ⚠ НЕТ FK к автору
├── title, description, price, currency
├── category, condition, contact
├── images[], is_active
└── created_at

places (uuid PK)             ⚠ НЕТ lat/lng координат
├── name, description, category, price_level
├── tags[], wifi, vegan, address, contact
├── rating, images[], is_active
└── created_at

events (uuid PK)             ⚠ НЕТ ends_at, НЕТ organizer FK
├── title, description, starts_at
├── location, category, max_participants
├── organizer_contact, images[], is_active
└── created_at

community_posts (uuid PK)
├── title, body, author_name
├── author_tg_id → tg_users(telegram_id)
├── tags[], latitude, longitude
├── images[]
└── created_at

community_comments (uuid PK)
├── post_id → community_posts(id) CASCADE
├── author_name, author_tg_id → tg_users(telegram_id)
├── body
└── created_at

favorites (uuid PK)
├── tg_user_id → tg_users(id) CASCADE
├── source, item_id (полиморфная ссылка)
└── created_at
└── UNIQUE(tg_user_id, source, item_id)

content_translations (uuid PK)
├── source_table, source_id, field_name
├── source_language, target_language
├── translated_text, created_by → tg_users(id)
└── created_at
└── UNIQUE(source_table, source_id, field_name, target_language)

ai_agent_config (uuid PK)
├── name (UNIQUE, default 'default')
├── system_prompt, model, temperature, max_tokens
├── tools_enabled[]
└── created_at, updated_at

ai_conversations (uuid PK)
├── user_id → auth.users(id) CASCADE
├── telegram_id, title, metadata(jsonb)
└── created_at, updated_at

ai_messages (uuid PK)
├── conversation_id → ai_conversations(id) CASCADE
├── role (system|user|assistant|tool)
├── content, tool_calls(jsonb), tool_call_id, name
└── created_at

search_items (VIEW)
└── UNION ALL: listings + market_items + places + events + community_posts
```

## RLS статус

| Таблица | RLS | Политики | Статус |
|---------|-----|----------|--------|
| tg_users | ❌ НЕТ | — | **КРИТИЧНО** |
| notifications | ❌ НЕТ | — | **КРИТИЧНО** |
| listings | ❌ НЕТ | — | **КРИТИЧНО** |
| market_items | ❌ НЕТ | — | **КРИТИЧНО** |
| places | ❌ НЕТ | — | **КРИТИЧНО** |
| events | ❌ НЕТ | — | **КРИТИЧНО** |
| community_posts | ❌ НЕТ | — | **КРИТИЧНО** |
| favorites | ❌ НЕТ | — | **КРИТИЧНО** |
| community_comments | ✅ ДА | SELECT/INSERT: true | Открытый |
| content_translations | ✅ ДА | SELECT/INSERT: true | Открытый |
| ai_agent_config | ✅ ДА | SELECT: true | Только чтение |
| ai_conversations | ✅ ДА | ALL: user_id = auth.uid() | Защищённый |
| ai_messages | ✅ ДА | ALL: через подзапрос | Защищённый |

## Отсутствующие таблицы (нужно создать)

### Для P2P чата
```sql
-- Комнаты чата (1-to-1 или групповые)
chat_rooms, chat_participants, chat_messages, chat_message_translations

-- Голосовые сообщения
voice_messages (audio_url, transcription, translation)
```

### Для модерации
```sql
-- Модерация контента
moderation_queue, moderation_actions, user_reports, user_bans

-- Роли
user_roles (admin, moderator, user, business)
```

### Для UGC
```sql
-- Добавить к listings, market_items, places, events:
-- author_id → tg_users(id)
-- moderation_status (pending|approved|rejected)
-- updated_at (с триггером)

-- RSVP для событий
event_attendees (event_id, user_id, status)
```

### Для AI обогащения
```sql
-- Источники данных
enrichment_sources, enrichment_jobs, enrichment_results
```

## Индексы

| Таблица | Индекс | Тип |
|---------|--------|-----|
| tg_users | tg_users_language_idx | btree(language) |
| listings | listings_category_idx | btree(category) |
| listings | listings_location_idx | btree(location) |
| listings | idx_listings_images | GIN(images) |
| market_items | market_items_category_idx | btree(category) |
| market_items | idx_market_items_images | GIN(images) |
| places | places_category_idx | btree(category) |
| places | idx_places_images | GIN(images) |
| events | events_category_idx | btree(category) |
| community_posts | community_posts_geo_idx | btree(lat, lng) partial |
| community_posts | community_posts_tags_idx | GIN(tags) |
| community_comments | community_comments_post_idx | btree(post_id) |
| community_comments | community_comments_created_idx | btree(created_at) |
| content_translations | translations_source_idx | btree(source_table, source_id) |
| content_translations | translations_lookup_idx | btree(source_table, source_id, field_name, target_language) |
| ai_conversations | ai_conversations_user_idx | btree(user_id) |
| ai_conversations | ai_conversations_telegram_idx | btree(telegram_id) |
| ai_messages | ai_messages_conversation_idx | btree(conversation_id) |
| ai_messages | ai_messages_created_idx | btree(created_at) |

### Отсутствующие индексы (рекомендация)
- `notifications` — нет индекса по `tg_user_id` (медленные запросы)
- `favorites` — нет индекса по `item_id` (полиморфный join)
