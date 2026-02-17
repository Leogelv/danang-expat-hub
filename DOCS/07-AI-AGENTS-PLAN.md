# План AI агентов обогащения базы — Danang Expat Hub

> **Last Verified:** 2026-02-17

---

## Концепция

AI агенты автоматически собирают, структурируют и добавляют контент в базу из внешних источников — Facebook групп, Telegram каналов и WhatsApp групп экспатов в Дананге. Это решает проблему "холодного старта" и обеспечивает актуальность данных.

---

## Архитектура

```
┌─────────────────────────────────────────────────────┐
│                   ORCHESTRATOR                        │
│   Управляет расписанием, очередями, дедупликацией     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Facebook  │  │ Telegram │  │ WhatsApp         │   │
│  │ Scraper   │  │ Listener │  │ Bridge           │   │
│  │ Agent     │  │ Agent    │  │ Agent            │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────────────┘   │
│       │              │              │                  │
│       ▼              ▼              ▼                  │
│  ┌──────────────────────────────────────────────┐    │
│  │              RAW CONTENT QUEUE                 │    │
│  │    (Supabase table: enrichment_raw_content)    │    │
│  └────────────────────┬─────────────────────────┘    │
│                       │                               │
│                       ▼                               │
│  ┌──────────────────────────────────────────────┐    │
│  │           AI PROCESSING PIPELINE              │    │
│  │                                                │    │
│  │  1. Classify (listing? event? place? market?)  │    │
│  │  2. Extract (structured data from text)        │    │
│  │  3. Translate (vi → en, detect language)        │    │
│  │  4. Deduplicate (similarity check)             │    │
│  │  5. Enrich (add coords, normalize prices)      │    │
│  │  6. Moderate (spam/scam check)                 │    │
│  └────────────────────┬─────────────────────────┘    │
│                       │                               │
│                       ▼                               │
│  ┌──────────────────────────────────────────────┐    │
│  │           MODERATION QUEUE                     │    │
│  │   (auto-approve high confidence,               │    │
│  │    queue low confidence for human review)       │    │
│  └────────────────────┬─────────────────────────┘    │
│                       │                               │
│                       ▼                               │
│  ┌──────────────────────────────────────────────┐    │
│  │        TARGET TABLES                           │    │
│  │   listings, market_items, places, events       │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## Агент 1: Facebook Scraper

### Целевые источники
| Группа | Участники | Контент |
|--------|-----------|---------|
| Danang Expats | ~25,000 | Аренда, продажа, вопросы |
| Da Nang Housing | ~15,000 | Квартиры, дома |
| Vietnam Digital Nomads | ~40,000 | Коворкинги, визы |
| Danang Buy & Sell | ~10,000 | Барахолка |
| Da Nang Events | ~8,000 | Мероприятия |

### Техническая реализация
```
Подход: Headless browser (Playwright) + периодический скрапинг
Частота: каждые 4 часа
Лимит: последние 50 постов за цикл

Pipeline:
1. Login → Navigate to group → Scroll → Extract posts
2. Для каждого поста:
   - text, images, author, timestamp, reactions, comments
   - Проверка: уже собран? (dedup по hash текста)
3. Сохранить в enrichment_raw_content
```

### Юридические риски
- Facebook ToS запрещает скрапинг
- **Альтернатива:** Facebook Graph API (для публичных групп, если есть access)
- **Рекомендация:** Начать с Telegram (легальнее), Facebook — фаза 2

---

## Агент 2: Telegram Listener

### Целевые источники
| Канал/Группа | Тип | Контент |
|-------------|-----|---------|
| @danang_expats | Группа | Обсуждения, вопросы |
| @danang_rent | Канал | Аренда жилья |
| @danang_motorbikes | Канал | Аренда/продажа байков |
| @danang_marketplace | Группа | Барахолка |
| @danang_events_vn | Канал | Мероприятия |

### Техническая реализация
```
Подход: Telegram Bot API (бот в группах) ИЛИ MTProto (Telethon/GramJS)
Частота: Real-time (слушает новые сообщения)

Архитектура:
├── Telegram Bot (добавлен в целевые группы)
│   ├── onMessage → enrich_raw_content
│   └── Webhook на Edge Function (Supabase)
│
└── Или: Userbot через MTProto (если бот нельзя добавить)
    ├── GramJS (TypeScript)
    ├── Подключение к каналам
    └── Polling новых сообщений

Pipeline:
1. Получить сообщение (text, media, forwarded_from)
2. Классифицировать: listing? market? event? question?
3. Извлечь структуру (GPT-4o-mini):
   - Для аренды: цена, район, кол-во комнат, контакт
   - Для маркета: товар, цена, состояние, контакт
   - Для событий: дата, время, место, описание
4. Перевести (если вьетнамский)
5. Проверить дубликаты
6. Сохранить → модерация → целевая таблица
```

### Пример prompt для классификации
```
Classify this Telegram message from a Da Nang expat group.
Categories: rental, market_sell, market_buy, event, place_recommendation, question, other

Message: "{text}"

Respond with JSON: { "category": "...", "confidence": 0.0-1.0, "data": {...} }
```

---

## Агент 3: WhatsApp Bridge

### Подход
WhatsApp не имеет публичного API для групп. Варианты:
1. **WhatsApp Business API** — только для бизнес-аккаунтов, нет доступа к группам
2. **WhatsApp Web Bridge** (Baileys/whatsapp-web.js) — неофициальный, рискованный
3. **Manual Forward Bot** — пользователи пересылают интересные сообщения боту

### Рекомендация: Manual Forward
```
Пользователь → пересылает сообщение из WhatsApp в Telegram бот
    ↓
Бот распознаёт forwarded text
    ↓
Классификация → Извлечение → Pipeline (как Telegram Agent)
```

Это легально, не нарушает ToS, и вовлекает community.

---

## Таблицы БД для обогащения

```sql
-- Сырой контент из источников
CREATE TABLE enrichment_raw_content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type text NOT NULL CHECK (source_type IN ('facebook', 'telegram', 'whatsapp', 'manual')),
    source_id text NOT NULL,           -- group/channel ID
    source_message_id text,            -- message ID в источнике
    author_name text,
    author_id text,                    -- ID автора в источнике
    raw_text text NOT NULL,
    media_urls text[] DEFAULT '{}',
    source_language text,
    collected_at timestamptz DEFAULT now(),
    processed boolean DEFAULT false,
    UNIQUE(source_type, source_id, source_message_id)
);

-- Обработанный контент (после AI pipeline)
CREATE TABLE enrichment_processed (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_id uuid NOT NULL REFERENCES enrichment_raw_content(id),
    category text NOT NULL,            -- listing, market, event, place
    confidence float NOT NULL,
    extracted_data jsonb NOT NULL,      -- структурированные данные
    translated_text text,
    target_language text DEFAULT 'en',
    moderation_status text DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
    target_table text,                 -- куда вставить (listings, market_items, etc.)
    target_id uuid,                    -- ID вставленной записи
    processed_at timestamptz DEFAULT now()
);

-- Конфигурация источников
CREATE TABLE enrichment_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type text NOT NULL,
    source_id text NOT NULL,
    source_name text NOT NULL,         -- "Danang Expats"
    is_active boolean DEFAULT true,
    config jsonb DEFAULT '{}',         -- специфичные настройки
    last_scraped_at timestamptz,
    created_at timestamptz DEFAULT now(),
    UNIQUE(source_type, source_id)
);

-- Джобы обогащения
CREATE TABLE enrichment_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id uuid REFERENCES enrichment_sources(id),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    items_collected int DEFAULT 0,
    items_processed int DEFAULT 0,
    items_approved int DEFAULT 0,
    error text,
    started_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now()
);
```

---

## AI Processing Pipeline (детально)

### Шаг 1: Classify
```
Input: raw text
Model: gpt-4o-mini
Output: { category, confidence, reasoning }

Правила:
- confidence >= 0.8 → auto-process
- confidence 0.5-0.8 → process + queue for review
- confidence < 0.5 → skip
```

### Шаг 2: Extract
```
Input: raw text + category
Model: gpt-4o-mini
Output: structured JSON по категории

Для listing:
{ title, description, price, currency, location, bedrooms, amenities, contact, contact_type }

Для market_item:
{ title, description, price, currency, category, condition, contact }

Для event:
{ title, description, starts_at, location, category, max_participants, organizer_contact }

Для place:
{ name, description, category, address, tags, wifi, vegan, price_level }
```

### Шаг 3: Translate
```
Input: extracted text fields
Model: gpt-4o-mini
Detect source language → translate to EN (if not EN)
Also translate to RU, VI for content_translations cache
```

### Шаг 4: Deduplicate
```
Проверка по:
1. Exact match: title + source_id
2. Fuzzy match: pg_trgm similarity > 0.7 на title
3. Price + location match для listings
```

### Шаг 5: Enrich
```
1. Geocoding: address → lat/lng (через Nominatim/Google Geocoding)
2. Price normalization: VND → USD
3. Image download: сохранить media в Supabase Storage
4. Category mapping: нормализация категорий
```

### Шаг 6: Moderate
```
AI проверка:
- Спам? (повторяющийся контент, рекламные паттерны)
- Мошенничество? (слишком низкие цены, подозрительные контакты)
- Нецензурная лексика?
- Персональные данные? (телефоны, документы)

confidence >= 0.9 && no_issues → auto_approve
иначе → pending (ручная модерация)
```

---

## Расписание

| Агент | Частота | Объём/цикл | Стоимость AI/мес |
|-------|---------|------------|------------------|
| Telegram Listener | Real-time | ~50-100 msg/day | ~$5-10 (mini) |
| Facebook Scraper | Каждые 4ч | ~50 posts/цикл | ~$15-20 (mini) |
| WhatsApp Bridge | По мере поступления | ~20 msg/day | ~$3-5 (mini) |

**Итого:** ~$25-35/мес на AI обработку (gpt-4o-mini)

---

## Метрики успеха

| Метрика | Цель (месяц 1) | Цель (месяц 3) |
|---------|-----------------|-----------------|
| Новые listings/неделя | 20+ | 50+ |
| Новые market items/неделя | 30+ | 80+ |
| Новые events/неделя | 5+ | 15+ |
| Auto-approve rate | 60% | 80% |
| False positive rate | <5% | <2% |
| Время обработки | <2 мин | <30 сек |
