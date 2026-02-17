# Danang Expat Hub — Обзор проекта

> **Last Verified:** 2026-02-17
> **Статус:** MVP / Early Alpha
> **Платформа:** Telegram Mini App (Next.js + Supabase)

---

## Что это?

**Danang Expat Hub** — мини-приложение для Telegram, созданное для экспатов в Дананге (Вьетнам). Объединяет аренду жилья, маркетплейс, каталог мест, события, коммьюнити и AI-ассистента в одном интерфейсе.

## Технический стек

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 14+ (App Router), React, TypeScript |
| Архитектура | FSD (Feature Sliced Design) |
| Стилизация | Tailwind CSS, Glass-morphism UI |
| Backend | Next.js API Routes (Route Handlers) |
| БД | Supabase (PostgreSQL 17) |
| Auth | Telegram initData → HMAC → JWT (обход GoTrue) |
| AI | OpenRouter / OpenAI (gpt-4o), Function Calling |
| i18n | next-intl (en, ru, uk, vi) |
| Telegram SDK | @telegram-apps/sdk-react |
| Карты | MapLibre GL + CartoDB tiles |
| Деплой | Standalone Docker (output: "standalone") |

## Разделы приложения

| Раздел | Путь | Статус | UGC |
|--------|------|--------|-----|
| Главная | `/` | Работает | Нет |
| AI Чат | `/chat` | Работает | Нет |
| Аренда | `/rentals` | Read-only | **Нет** |
| Маркет | `/market` | Read-only | **Нет** |
| Места | `/places` | Read-only | **Нет** |
| События | `/events` | Read-only | **Нет** |
| Коммьюнити | `/community` | Полный | **Да** |
| Профиль | `/profile` | Read-only | Нет |
| Уведомления | `/notifications` | Read-only | Нет |

## Документация

| Файл | Содержание |
|------|-----------|
| [01-PRODUCT-VISION.md](./01-PRODUCT-VISION.md) | Продуктовое видение и целевая аудитория |
| [02-DB-SCHEMA.md](./02-DB-SCHEMA.md) | Полная схема БД, таблицы, RLS |
| [03-API-REFERENCE.md](./03-API-REFERENCE.md) | Все API endpoints |
| [04-UX-FLOWS.md](./04-UX-FLOWS.md) | UX потоки и user jobs |
| [05-GAPS-ANALYSIS.md](./05-GAPS-ANALYSIS.md) | Анализ пробелов и проблем |
| [06-ROADMAP.md](./06-ROADMAP.md) | Дорожная карта развития |
| [07-AI-AGENTS-PLAN.md](./07-AI-AGENTS-PLAN.md) | План AI агентов обогащения базы |
| [08-REALTIME-CHAT-SPEC.md](./08-REALTIME-CHAT-SPEC.md) | Спецификация чата с переводом |
