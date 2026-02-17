# Спецификация P2P чата с автопереводом — Danang Expat Hub

> **Last Verified:** 2026-02-17

---

## Визионerское описание

Представь: вьетнамский лендлорд размещает квартиру. Экспат из России нажимает "Написать". Открывается чат. Экспат пишет по-русски — лендлорд видит сообщение на вьетнамском. Лендлорд отвечает голосовым на вьетнамском — экспат видит текст на русском + может прослушать оригинал. Внизу каждого сообщения — маленький флаг (🇷🇺/🇻🇳), нажатие показывает оригинал.

**Результат:** Языковой барьер = 0. Вьетнамцам не нужен английский. Экспатам не нужен вьетнамский.

---

## Пользовательские сценарии

### Сценарий 1: Аренда квартиры
```
Экспат (EN) на странице /rentals
    → видит "2BR apartment Son Tra $350"
    → нажимает "Chat" на карточке
    → создаётся chat_room с context: listing_id
    → шапка чата: фото квартиры + название + цена
    → пишет: "Is this still available? Can I see it tomorrow?"
    → лендлорд (VI) получает: "Căn hộ này còn trống không? Tôi có thể xem ngày mai không?"
    → лендлорд отвечает голосовым на вьетнамском
    → экспат видит: [▶ 0:08] "Yes, available. Come at 3pm, address is..."
    → внизу: 🇻🇳 tap to see original
```

### Сценарий 2: Покупка на маркете
```
Экспат (RU) → видит "iPhone 14 Pro - $400"
    → "Написать продавцу"
    → пишет: "Можно скинуть до 350?"
    → продавец (EN) видит: "Can you do $350?"
    → продавец: "Meet me at Vincom, $370 last price"
    → экспат видит: "Встречаемся в Vincom, $370 финальная цена"
```

### Сценарий 3: Голосовое сообщение
```
Вьетнамец (VI) → записывает голосовое "Xin chào, căn hộ này..."
    ↓
STT (Whisper): текст на вьетнамском
    ↓
Перевод: текст на языке получателя
    ↓
Получатель видит:
┌─────────────────────────────────┐
│ [▶ 0:12] ════════════ 🔊       │
│ "Hello, this apartment..."      │
│ 🇻🇳 Показать оригинал           │
└─────────────────────────────────┘
```

---

## Структура БД

```sql
-- Комнаты чата
CREATE TABLE chat_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    -- Контекст (к чему привязан чат)
    context_type text CHECK (context_type IN ('listing', 'market_item', 'place', 'event', NULL)),
    context_id uuid,
    -- Мета
    title text,                      -- для групповых чатов
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Участники чата
CREATE TABLE chat_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES tg_users(id) ON DELETE CASCADE,
    role text DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
    preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en', 'ru', 'uk', 'vi')),
    last_read_at timestamptz,
    joined_at timestamptz DEFAULT now(),
    UNIQUE(room_id, user_id)
);

-- Сообщения
CREATE TABLE chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES tg_users(id),
    -- Контент
    type text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'voice', 'image', 'system')),
    content text,                      -- текстовое содержание
    original_language text,            -- язык оригинала (auto-detected или из профиля)
    -- Медиа
    media_url text,                    -- URL для voice/image
    media_duration integer,            -- длительность аудио в секундах
    -- Мета
    reply_to_id uuid REFERENCES chat_messages(id),
    is_deleted boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Переводы сообщений (кэш)
CREATE TABLE chat_message_translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    target_language text NOT NULL CHECK (target_language IN ('en', 'ru', 'uk', 'vi')),
    translated_text text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(message_id, target_language)
);

-- RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_message_translations ENABLE ROW LEVEL SECURITY;

-- Пользователь видит только свои чаты
CREATE POLICY "Users see own rooms" ON chat_rooms FOR SELECT
    USING (id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid()));

-- Пользователь видит только участников своих чатов
CREATE POLICY "Users see own participants" ON chat_participants FOR SELECT
    USING (room_id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid()));

-- Пользователь видит сообщения только в своих чатах
CREATE POLICY "Users see own messages" ON chat_messages FOR SELECT
    USING (room_id IN (SELECT room_id FROM chat_participants WHERE user_id = auth.uid()));

-- Индексы
CREATE INDEX chat_messages_room_idx ON chat_messages(room_id, created_at DESC);
CREATE INDEX chat_participants_user_idx ON chat_participants(user_id);
CREATE INDEX chat_participants_room_idx ON chat_participants(room_id);
CREATE INDEX chat_translations_lookup_idx ON chat_message_translations(message_id, target_language);
```

---

## API Endpoints

### POST `/api/chat/rooms`
Создать комнату чата (при первом контакте).
```json
Request:
{
  "participantIds": ["uuid-user-1", "uuid-user-2"],
  "contextType": "listing",
  "contextId": "uuid-listing"
}

Response:
{ "room": { "id": "uuid", "type": "direct", ... } }
```

### GET `/api/chat/rooms`
Список чатов пользователя с last message и unread count.
```json
Response:
{
  "rooms": [{
    "id": "uuid",
    "participant": { "name": "Nguyen Van A", "photo": "..." },
    "context": { "type": "listing", "title": "2BR Son Tra", "image": "..." },
    "lastMessage": { "content": "See you tomorrow", "createdAt": "..." },
    "unreadCount": 2
  }]
}
```

### GET `/api/chat/rooms/[id]/messages?limit=50&before=cursor`
Сообщения в комнате (cursor-based pagination).
```json
Response:
{
  "messages": [{
    "id": "uuid",
    "sender": { "name": "John", "photo": "..." },
    "type": "text",
    "content": "Is this still available?",
    "originalLanguage": "en",
    "translation": "Căn hộ này còn trống không?",
    "translationLanguage": "vi",
    "createdAt": "..."
  }],
  "hasMore": true,
  "nextCursor": "uuid"
}
```

### POST `/api/chat/rooms/[id]/messages`
Отправить сообщение.
```json
Request:
{
  "type": "text",
  "content": "Hello, is this available?",
  "replyToId": null
}

Response:
{ "message": { ... }, "translations": { "vi": "Xin chào, cái này còn không?" } }
```

### POST `/api/chat/voice/transcribe`
Транскрибация голосового сообщения.
```json
Request: FormData { audio: Blob, roomId: "uuid" }

Response:
{
  "transcription": "Xin chào, căn hộ này còn trống",
  "sourceLanguage": "vi",
  "translations": {
    "en": "Hello, this apartment is still available",
    "ru": "Привет, эта квартира ещё свободна"
  }
}
```

---

## Real-time архитектура

```
Client A (sender)
    │
    │ POST /api/chat/rooms/[id]/messages
    │
    ▼
API Route Handler
    │
    ├── 1. INSERT в chat_messages
    ├── 2. Detect language (из профиля или auto-detect)
    ├── 3. Translate для КАЖДОГО участника (async)
    │       └── INSERT в chat_message_translations
    └── 4. Supabase Realtime broadcast
            │
            ▼
    ┌─────────────────────────────┐
    │  Supabase Realtime Channel   │
    │  channel: chat_room_{id}     │
    │                               │
    │  payload: {                   │
    │    message: {...},            │
    │    translations: {            │
    │      "en": "...",             │
    │      "vi": "...",             │
    │      "ru": "..."             │
    │    }                          │
    │  }                            │
    └────────────┬────────────────┘
                 │
                 ▼
Client B (receiver)
    │
    ├── Получает через subscription
    ├── Показывает перевод на свой язык
    └── Флаг оригинала: 🇻🇳 / 🇬🇧 / 🇷🇺 / 🇺🇦
```

---

## UI компоненты

### ChatRoomsList (замена текущего AI чата или отдельная вкладка)
```
┌─────────────────────────────────┐
│ 💬 Chats                    [🤖]│  ← [🤖] = переключатель на AI чат
├─────────────────────────────────┤
│ ┌─────┐ Nguyen Van A           │
│ │ 📷  │ 2BR Son Tra · $350     │  ← контекст
│ │     │ Căn hộ...→ "Available" │  ← last message (переведённое)
│ └─────┘              2m ago  ●2│  ← unread badge
├─────────────────────────────────┤
│ ┌─────┐ Mark Smith             │
│ │ 📷  │ iPhone 14 Pro          │
│ │     │ "Meet at Vincom"       │
│ └─────┘              1h ago    │
└─────────────────────────────────┘
```

### ChatRoom (переписка)
```
┌─────────────────────────────────┐
│ ← Nguyen Van A                  │
│    2BR apartment Son Tra $350   │  ← контекст листинга
├─────────────────────────────────┤
│                                  │
│        ┌──────────────────┐     │
│        │ Apartment is      │     │
│        │ available, come   │     │
│        │ see at 3pm        │     │
│        │ 🇻🇳 Показать       │     │  ← флаг + "показать оригинал"
│        └──────────────────┘     │
│                                  │
│ ┌──────────────────┐            │
│ │ Great! What's the │            │
│ │ exact address?    │            │
│ └──────────────────┘            │
│                                  │
│        ┌──────────────────┐     │
│        │ [▶ 0:08] ═══ 🔊 │     │  ← голосовое
│        │ "It's on Vo Nguyen│     │  ← транскрипция + перевод
│        │  Giap street..."  │     │
│        │ 🇻🇳 Показать       │     │
│        └──────────────────┘     │
│                                  │
├─────────────────────────────────┤
│ [🎤] [Type a message...] [📎] [➤]│
│                                  │
│ 🇷🇺 Русский ▼                    │  ← переключатель языка ввода
└─────────────────────────────────┘
```

### Переключатель оригинала (по нажатию на флаг)
```
До нажатия:                    После нажатия:
┌──────────────────┐          ┌──────────────────┐
│ Apartment is      │          │ Căn hộ còn trống,│
│ available, come   │    →     │ đến xem lúc 3    │
│ see at 3pm        │          │ giờ chiều         │
│ 🇻🇳 Показать       │          │ 🇬🇧 Перевод        │
└──────────────────┘          └──────────────────┘
```

---

## Голосовые сообщения — flow

```
1. User нажимает [🎤] → начинается запись (MediaRecorder API)
2. Удержание → запись, отпускание → отправка
3. Аудио → Blob → FormData → POST /api/chat/voice/transcribe
4. Server:
   a. Сохранить аудио в Supabase Storage
   b. Whisper API → транскрипция
   c. Detect language
   d. Перевести на языки участников
   e. INSERT chat_messages (type: 'voice', content: transcription)
   f. INSERT chat_message_translations
   g. Broadcast через Realtime
5. Получатель видит: аудио-плеер + транскрипция на своём языке
```

### Стоимость голосовых
- Whisper API: $0.006/минута
- Перевод (gpt-4o-mini): ~$0.0005/сообщение
- **При 100 голосовых/день (средние 10 сек): ~$0.10/день = ~$3/мес**

---

## Оптимизации

### Batch translation
Вместо перевода на все языки сразу — переводить только на языки участников комнаты. В direct чатах это максимум 1 перевод.

### Translation cache
Повторяющиеся фразы ("Hello", "Thank you", "How much?") — кэшировать навсегда.

### Language detection
Использовать `preferred_language` из профиля вместо auto-detect (дешевле и точнее для коротких сообщений).

### Offline queue
Если нет сети — сообщения в локальную очередь, отправка при восстановлении.
