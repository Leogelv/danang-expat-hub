import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { POST } from '../route';

describe('POST /api/chat/translate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns cached translation when found', async () => {
    const cachedTranslation = { message_id: 'm1', target_language: 'ru', translated_text: 'Привет' };
    // single() для кэша — возвращает данные без ошибки
    const chain = createMockQueryBuilder(cachedTranslation);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/chat/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: 'm1', target_language: 'ru', text: 'Hello' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(true);
    expect(body.data).toEqual(cachedTranslation);
  });

  it('creates new translation when not cached', async () => {
    const newTranslation = { message_id: 'm1', target_language: 'vi', translated_text: 'Xin chao' };
    const chain = createMockQueryBuilder(null);

    // Первый single() — кэш не найден (ошибка), второй — вставка
    let singleCallCount = 0;
    chain.single = vi.fn().mockImplementation(() => {
      singleCallCount++;
      if (singleCallCount === 1) {
        return Promise.resolve({ data: null, error: { message: 'Not found' } });
      }
      return Promise.resolve({ data: newTranslation, error: null });
    });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/chat/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: 'm1', target_language: 'vi', text: 'Hello' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.cached).toBe(false);
    expect(body.data).toEqual(newTranslation);
  });

  it('returns 400 when message_id is missing', async () => {
    const req = new NextRequest('http://localhost/api/chat/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_language: 'ru', text: 'Hello' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('message_id is required');
  });

  it('returns 400 when target_language is missing', async () => {
    const req = new NextRequest('http://localhost/api/chat/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: 'm1', text: 'Hello' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('target_language is required');
  });

  it('returns 400 when text is missing', async () => {
    const req = new NextRequest('http://localhost/api/chat/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: 'm1', target_language: 'ru' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('text is required');
  });
});
