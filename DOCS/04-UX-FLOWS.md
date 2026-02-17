# UX потоки и User Jobs — Danang Expat Hub

> **Last Verified:** 2026-02-17

---

## 1. Поток авторизации

```
Telegram → Open Mini App
    ↓
TelegramProvider: isTMA() check
    ├─ Telegram: initData → HMAC verify → token-exchange → JWT + profile
    └─ Browser: ALLOW_BROWSER_ACCESS → demo user (fallback)
    ↓
AuthProvider: session check
    ├─ Session exists → load profile from tg_users
    └─ No session → token-exchange → create/find auth.users → JWT
    ↓
App ready (no onboarding)
```

**Проблемы:**
- ❌ Нет онбординга (выбор языка, welcome screen)
- ❌ Нет выбора интересов при первом входе
- ❌ В dev-режиме без BOT_TOKEN валидация пропускается
- ❌ JWT secret захардкожен в fallback

---

## 2. Поток поиска жилья

```
User → /rentals
    ↓
Вкладки: Housing | Motorbikes
    ↓
Список карточек (ImageCarousel, price, location)
    ↓
Поиск по названию (client-side filter)
    ↓
Фильтр по районам (захардкожены: An Thuong, My Khe, Son Tra, Ngu Hanh Son)
    ↓
Клик на карточку → Detail Sheet (bottom sheet)
    ↓
Контакт → Telegram/WhatsApp/Email ссылка
```

**Покрытые JTBD:** ✅ Найти жильё, ✅ Связаться с владельцем
**Непокрытые JTBD:**
- ❌ Разместить своё объявление
- ❌ Фильтр по цене
- ❌ Показать на карте
- ❌ Добавить в избранное из листинга (только через AI)
- ❌ Общаться с владельцем в чате (только внешние ссылки)

---

## 3. Поток AI ассистента

```
User → /chat
    ↓
Приветственное сообщение AI
    ↓
User вводит текст → POST /api/assistant
    ↓
AI анализирует → вызывает tools (search_listings, search_places, etc.)
    ↓
Результаты tools → второй запрос к LLM → финальный ответ
    ↓
UI: сообщение AI + ToolCallPanel (список найденных объектов)
```

**Покрытые JTBD:** ✅ Задать вопрос, ✅ Поиск через AI
**Непокрытые JTBD:**
- ❌ Streaming ответы (нет SSE, долгое ожидание)
- ❌ Голосовой ввод
- ❌ Переключение языка в чате
- ❌ Персонализация (не помнит предпочтения между сессиями)

---

## 4. Поток коммьюнити (самый развитый)

```
User → /community
    ↓
Список постов + карта (MapLibre)
    ├─ Фильтр по тегам (tips, housing, food, work, visa, question, social)
    ├─ Переключатель List/Map view
    └─ TranslateButton (AI перевод заголовков)
    ↓
"New Post" → CreatePostModal
    ├─ Title, Body, Tags (comma-separated)
    ├─ "Share location" → Telegram Geolocation API
    └─ Submit → POST /api/community
    ↓
Клик на пост → PostDetailSheet
    ├─ Полный текст + TranslateButton для body
    ├─ CommentThread (список комментариев)
    └─ Форма добавления комментария
```

**Покрытые JTBD:** ✅ Создать пост, ✅ Комментировать, ✅ Геотег, ✅ Перевод, ✅ Карта
**Непокрытые JTBD:**
- ❌ Лайки/реакции
- ❌ Редактирование/удаление постов
- ❌ Поиск по тексту (только фильтр по тегам)
- ❌ Пагинация (limit=50)
- ❌ Уведомления о новых комментариях
- ❌ Загрузка изображений к постам

---

## 5. Поток маркетплейса

```
User → /market
    ↓
Список товаров (фото, цена, состояние)
    ↓
Поиск по названию
    ↓
Клик → Detail Sheet
    ↓
Контакт → Telegram ссылка (всегда)
```

**Покрытые JTBD:** ✅ Просмотр товаров
**Непокрытые JTBD:**
- ❌ Разместить товар на продажу
- ❌ Фильтр по категории/цене/состоянию
- ❌ Чат с продавцом в приложении

---

## 6. Поток событий

```
User → /events
    ↓
Список событий (дата, локация, участники)
    ↓
Бейдж "RSVP" (чисто визуальный, НЕ КЛИКАБЕЛЬНЫЙ)
```

**Покрытые JTBD:** ✅ Просмотр событий
**Непокрытые JTBD:**
- ❌ RSVP / записаться
- ❌ Создать событие
- ❌ Поиск/фильтрация
- ❌ Календарный вид
- ❌ Уведомления о предстоящих
- ❌ Detail Sheet (нет деталей по клику!)

---

## 7. Поток профиля

```
User → /profile
    ↓
Аватар, имя, username, telegram_id, UUID, timezone
    ↓
Список "Favorites" (из /api/favorites)
```

**Покрытые JTBD:** ✅ Просмотр профиля, ✅ Просмотр избранного
**Непокрытые JTBD:**
- ❌ Редактирование профиля
- ❌ Смена языка (LanguageSelector создан, НЕ ПОДКЛЮЧЁН)
- ❌ Удаление из избранного
- ❌ Мои объявления
- ❌ Мои посты
- ❌ Настройки уведомлений

---

## 8. Поток уведомлений

```
User → /notifications
    ↓
Список уведомлений (иконки по типу: info, success, warning, event, message)
```

**Покрытые JTBD:** ✅ Просмотр уведомлений
**Непокрытые JTBD:**
- ❌ Mark as read
- ❌ Push-уведомления
- ❌ Группировка/фильтрация
- ❌ Действия из уведомления (перейти к посту, к событию)

---

## Навигация (BottomNav)

```
[Home] [AI] [Rentals] [Market] [Places] [Events] [Community] [Alerts] [Profile]
```

**9 элементов** — слишком много для мобильного. Рекомендация: 5 основных + "More" меню.

## Созданные но неиспользуемые компоненты

| Компонент | Путь | Предназначение |
|-----------|------|---------------|
| LanguageSelector | fsd/features/language-selector/ | Выбор языка (флаги) |
| FilterSheet | fsd/shared/ui/client/overlays/ | Фильтры bottom sheet |
| PriceRangeSlider | fsd/shared/ui/client/inputs/ | Диапазон цены |
| ToggleFilter | fsd/shared/ui/client/inputs/ | Переключатель фильтра |
