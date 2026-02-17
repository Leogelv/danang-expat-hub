# Дорожная карта — Danang Expat Hub

> **Last Verified:** 2026-02-17

---

## Фаза 0: Стабилизация (1-2 недели)

> Цель: Закрыть критические баги и дыры в безопасности

### 0.1 Безопасность
- [ ] Создать auth middleware для API routes (проверка JWT/telegram_id)
- [ ] Добавить rate limiting (особенно `/api/assistant` и `/api/translate`)
- [ ] Включить RLS на ВСЕХ таблицах
- [ ] Исправить захардкоженный JWT secret fallback
- [ ] Добавить input validation на все endpoints

### 0.2 Исправление несоответствий
- [ ] Синхронизировать поля favorites в executor.ts (item_type → source)
- [ ] Исправить поле date → starts_at в events executor
- [ ] Унифицировать приоритет API ключей (OpenRouter → OpenAI везде)
- [ ] Убрать дублирование images в миграциях
- [ ] Согласовать auth system (ai_conversations.user_id vs tg_users)

### 0.3 Подключение готовых компонентов
- [ ] Подключить LanguageSelector в ProfilePage
- [ ] Подключить FilterSheet в Places и Rentals
- [ ] Подключить PriceRangeSlider в Rentals и Market
- [ ] Применить i18n ко всем страницам (ключи уже есть в JSON)
- [ ] Добавить индекс на notifications.tg_user_id
- [ ] Добавить updated_at триггеры на все таблицы

---

## Фаза 1: UGC и контент (2-3 недели)

> Цель: Пользователи могут создавать контент во всех разделах

### 1.1 Миграция БД
- [ ] Добавить `author_id` (FK → tg_users) к listings, market_items, places, events
- [ ] Добавить `moderation_status` (pending|approved|rejected) ко всем контентным таблицам
- [ ] Добавить `updated_at` ко всем таблицам
- [ ] Добавить `latitude`/`longitude` к places
- [ ] Создать таблицу `event_attendees` (event_id, user_id, status)
- [ ] Создать таблицу `likes` (user_id, source_table, source_id)

### 1.2 API endpoints
- [ ] POST/PATCH/DELETE `/api/listings` — CRUD для объявлений аренды
- [ ] POST/PATCH/DELETE `/api/market` — CRUD для маркетплейса
- [ ] POST `/api/places` — добавление мест пользователями
- [ ] POST `/api/events` + POST `/api/events/[id]/rsvp` — создание + запись
- [ ] POST `/api/upload` — загрузка изображений (Supabase Storage)
- [ ] PATCH `/api/notifications/read` — mark as read

### 1.3 Frontend формы
- [ ] CreateListingModal (title, description, price, location, photos, contact)
- [ ] CreateMarketItemModal (title, description, price, condition, photos)
- [ ] SuggestPlaceModal (name, category, address, coordinates)
- [ ] CreateEventModal (title, description, date/time, location, max participants)
- [ ] RSVP кнопка на EventDetailSheet
- [ ] Detail Sheet для Events (сейчас отсутствует)

### 1.4 Модерация (базовая)
- [ ] AI pre-модерация при создании (проверка текста через GPT)
- [ ] Кнопка "Пожаловаться" на контенте
- [ ] Таблицы: moderation_queue, user_reports

---

## Фаза 2: P2P чат с переводом (3-4 недели)

> Цель: Real-time чат между пользователями с автоматическим переводом

### 2.1 БД
- [ ] Таблица `chat_rooms` (id, type: direct|group, context_type, context_id)
- [ ] Таблица `chat_participants` (room_id, user_id, joined_at, last_read_at)
- [ ] Таблица `chat_messages` (room_id, sender_id, content, original_language, type: text|voice|image)
- [ ] Таблица `chat_message_translations` (message_id, target_language, translated_text)
- [ ] Таблица `voice_messages` (message_id, audio_url, duration, transcription, source_language)

### 2.2 Real-time
- [ ] Supabase Realtime subscriptions на chat_messages
- [ ] Typing indicators
- [ ] Online/offline статус
- [ ] Read receipts (last_read_at)

### 2.3 Перевод в чате
- [ ] Автоматический перевод при получении сообщения (на язык получателя)
- [ ] UI: переключатель "показать оригинал" (флаг страны отправителя)
- [ ] Кэширование переводов в chat_message_translations
- [ ] Определение языка входящего сообщения

### 2.4 Голосовые сообщения
- [ ] Запись аудио (MediaRecorder API)
- [ ] Загрузка в Supabase Storage
- [ ] STT (Speech-to-Text) через Whisper API
- [ ] Перевод транскрипции
- [ ] UI: аудио-плеер + транскрипция + перевод

### 2.5 Контекстные чаты
- [ ] "Написать" на карточке листинга → создаёт чат с контекстом (listing_id)
- [ ] "Написать" на маркетплейсе → чат с продавцом (market_item_id)
- [ ] Показ контекста в шапке чата (название объявления, фото)

---

## Фаза 3: AI Agent v2 + Streaming (2-3 недели)

> Цель: AI-first experience с быстрыми ответами

### 3.1 Streaming
- [ ] Переключить /api/assistant на SSE (Server-Sent Events)
- [ ] Streaming токенов в UI (посимвольный вывод)
- [ ] Markdown рендеринг ответов AI

### 3.2 Расширение tools
- [ ] `create_listing` — создание объявления аренды через чат
- [ ] `create_market_item` — продать через чат
- [ ] `book_event` — RSVP через чат
- [ ] `start_chat` — начать чат с пользователем через AI
- [ ] `translate_text` — перевести произвольный текст
- [ ] `get_nearby_places` — найти рядом (с геолокацией)

### 3.3 Персонализация
- [ ] Сохранение предпочтений пользователя (район, бюджет, интересы)
- [ ] Контекст прошлых разговоров
- [ ] Proactive suggestions (новые листинги по критериям)

---

## Фаза 4: Админ-панель и модерация (2 недели)

> Цель: Полный контроль над контентом и пользователями

### 4.1 Роли
- [ ] Таблица `user_roles` (user_id, role: admin|moderator|business|user)
- [ ] Middleware для проверки ролей
- [ ] Admin-only API endpoints

### 4.2 Админ-панель (отдельный route group `/admin`)
- [ ] Dashboard: статистика, графики активности
- [ ] Модерация: очередь на проверку, approve/reject/ban
- [ ] Пользователи: список, роли, баны
- [ ] Контент: CRUD для всех сущностей
- [ ] AI конфиг: редактирование system prompt, модели, температуры

### 4.3 Аудит
- [ ] Таблица `audit_log` (actor_id, action, target_table, target_id, diff, timestamp)
- [ ] Логирование всех admin-действий

---

## Фаза 5: AI Обогащение базы (3-4 недели)

> Цель: Автоматическое наполнение базы из внешних источников

**Подробный план: см. [07-AI-AGENTS-PLAN.md](./07-AI-AGENTS-PLAN.md)**

---

## Фаза 6: Оптимизация и масштабирование (ongoing)

### 6.1 Поиск
- [ ] Full-text search (tsvector + tsquery)
- [ ] Fuzzy matching (pg_trgm)
- [ ] Geo-search (PostGIS: ST_DWithin)

### 6.2 Производительность
- [ ] Cursor-based пагинация
- [ ] Server Components + ISR для статического контента
- [ ] Edge caching для API responses
- [ ] Image optimization (Supabase Storage transformations)

### 6.3 UX
- [ ] Push-уведомления (Telegram Bot API)
- [ ] Pull-to-refresh
- [ ] Skeleton loading
- [ ] Offline support (PWA)
- [ ] Onboarding flow (выбор языка, интересов)

### 6.4 Навигация
- [ ] Оптимизация BottomNav (5 основных + "More")
- [ ] Deep linking (открытие конкретного листинга/поста из уведомления)

---

## Временная оценка

| Фаза | Срок | Результат |
|------|------|-----------|
| 0. Стабилизация | 1-2 нед | Безопасный, работающий MVP |
| 1. UGC | 2-3 нед | Пользователи создают контент |
| 2. P2P Чат | 3-4 нед | Общение с переводом |
| 3. AI v2 | 2-3 нед | Быстрый AI с новыми tools |
| 4. Админка | 2 нед | Контроль над платформой |
| 5. Обогащение | 3-4 нед | Автоматическое наполнение |
| 6. Оптимизация | ongoing | Масштаб и качество |
