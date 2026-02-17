# API Reference — Danang Expat Hub

> **Last Verified:** 2026-02-17
> **Base URL:** Next.js API Routes (`/api/*`)
> **Auth:** Все routes используют serviceRole (обходят RLS)

---

## Сводная таблица endpoints

| # | Endpoint | Метод | Auth | UGC | Статус |
|---|----------|-------|------|-----|--------|
| 1 | `/api/auth/token-exchange` | POST | HMAC | — | Работает |
| 2 | `/api/assistant` | POST | ❌ | — | Работает |
| 3 | `/api/translate` | POST | ❌ | — | Работает |
| 4 | `/api/listings` | GET | ❌ | ❌ | Read-only |
| 5 | `/api/places` | GET | ❌ | ❌ | Read-only |
| 6 | `/api/market` | GET | ❌ | ❌ | Read-only |
| 7 | `/api/events` | GET | ❌ | ❌ | Read-only |
| 8 | `/api/community` | GET/POST | ❌ | ✅ | Работает |
| 9 | `/api/community/[id]/comments` | GET/POST | ❌ | ✅ | Работает |
| 10 | `/api/favorites` | GET/POST/DELETE | ❌ | — | Работает |
| 11 | `/api/search` | POST | ❌ | — | Работает |
| 12 | `/api/notifications` | GET | ❌ | — | Read-only |
| 13 | `/api/user/language` | POST | ❌ | — | Работает |
| 14 | `/api/stats` | GET | ❌ | — | Работает |

---

## Детальное описание

### 1. POST `/api/auth/token-exchange`

Авторизация через Telegram Mini App.

**Request:**
```json
{ "initData": "query_id=...&user=...&hash=..." }
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "user": { "id": "uuid", "telegram_id": 123, "username": "..." }
}
```

**Логика:** initData → HMAC-SHA256 валидация → upsert tg_users → create/find auth.users → JWT

---

### 2. POST `/api/assistant`

AI ассистент с function calling.

**Request:**
```json
{
  "messages": [{ "role": "user", "content": "Find me apartment in Son Tra" }],
  "userId": "uuid (optional)",
  "telegramId": 123456 (optional)
}
```

**Response (200):**
```json
{
  "message": "I found 3 apartments...",
  "toolCalls": [{ "name": "search_listings", "args": {...}, "result": {...} }],
  "conversationId": "uuid"
}
```

**AI Tools (7):** search_listings, search_places, search_market, search_events, get_user_favorites, create_community_post, get_community_posts

---

### 3. POST `/api/translate`

AI перевод контента с кэшированием.

**Request:**
```json
{
  "sourceTable": "community_posts",
  "sourceId": "uuid",
  "fieldName": "title",
  "originalText": "Best coffee in Da Nang",
  "targetLanguage": "ru"
}
```

**Response (200):**
```json
{ "translatedText": "Лучший кофе в Дананге", "fromCache": false }
```

---

### 4. GET `/api/listings?category=housing&limit=12`

Получение объявлений аренды (только чтение).

---

### 5. GET `/api/places?limit=12`

Получение каталога мест (только чтение).

---

### 6. GET `/api/market?limit=12`

Получение товаров маркетплейса (только чтение).

---

### 7. GET `/api/events?limit=12`

Получение событий (только чтение, сортировка по starts_at).

---

### 8. GET/POST `/api/community`

**GET:** `?limit=20&tags=housing,food&geoOnly=true`
**POST:** `{ title, body, tags?, latitude?, longitude?, authorName?, authorTgId? }`

---

### 9. GET/POST `/api/community/[id]/comments`

**GET:** Все комментарии к посту
**POST:** `{ body, authorName?, authorTgId? }`

---

### 10. GET/POST/DELETE `/api/favorites`

**GET:** `?userId=uuid` → EnrichedFavorite[] (с данными из связанных таблиц)
**POST:** `{ userId, source, itemId }`
**DELETE:** `{ userId, source, itemId }`

---

### 11. POST `/api/search`

**Request:** `{ query, category?, source?, limit? }`
**Поиск:** ILIKE по title, description, location (нет full-text search).

---

### 12. GET `/api/notifications?userId=uuid&limit=12`

Уведомления пользователя (нет mark as read endpoint).

---

### 13. POST `/api/user/language`

**Request:** `{ language: "ru", telegramId?: 123 }`
Устанавливает cookie `locale` + обновляет tg_users.language.

---

### 14. GET `/api/stats`

Публичная статистика: count по каждой таблице.

---

## Отсутствующие endpoints (нужно создать)

| Приоритет | Endpoint | Описание |
|-----------|----------|----------|
| P0 | POST `/api/listings` | Создание объявления аренды |
| P0 | POST `/api/market` | Создание товара на маркете |
| P0 | PATCH `/api/listings/[id]` | Редактирование объявления |
| P0 | DELETE `/api/listings/[id]` | Удаление объявления |
| P0 | POST `/api/chat/rooms` | Создание комнаты чата |
| P0 | GET/POST `/api/chat/messages` | Сообщения чата |
| P0 | POST `/api/moderate` | Модерация контента |
| P1 | POST `/api/places` | Добавление места |
| P1 | POST `/api/events` | Создание события |
| P1 | POST `/api/events/[id]/rsvp` | RSVP на событие |
| P1 | PATCH `/api/notifications/read` | Mark as read |
| P1 | POST `/api/voice/transcribe` | STT для голосовых |
| P2 | POST `/api/admin/*` | Админ-панель API |
| P2 | POST `/api/enrichment/trigger` | Запуск AI обогащения |
