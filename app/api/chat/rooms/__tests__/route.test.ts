import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { GET, POST } from '../route';

describe('GET /api/chat/rooms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when userId is missing', async () => {
    const req = new NextRequest('http://localhost/api/chat/rooms');
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('userId is required');
  });

  it('returns 200 with rooms for user', async () => {
    // getSupabaseServer вызывается один раз, но внутри делается 2 запроса (from)
    // Первый from('chat_participants') — возвращает participations
    // Второй from('chat_rooms') — возвращает rooms
    const mockRooms = [{ id: 'room-1', type: 'direct', updated_at: '2026-01-01' }];
    const chain = createMockQueryBuilder([{ room_id: 'room-1' }]);

    // Переопределяем поведение: разные данные для разных вызовов from
    let fromCallCount = 0;
    chain.from = vi.fn().mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        // chat_participants запрос
        return createMockQueryBuilder([{ room_id: 'room-1' }]);
      }
      // chat_rooms запрос
      return createMockQueryBuilder(mockRooms);
    });

    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/chat/rooms?userId=user-1');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(mockRooms);
  });

  it('returns empty array when user has no rooms', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/chat/rooms?userId=user-1');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});

describe('POST /api/chat/rooms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 on valid room creation', async () => {
    const mockRoom = { id: 'room-new', type: 'direct' };
    const chain = createMockQueryBuilder(mockRoom);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_ids: ['user-1', 'user-2'] }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toEqual(mockRoom);
  });

  it('returns 400 when participant_ids is missing', async () => {
    const req = new NextRequest('http://localhost/api/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('participant_ids');
  });

  it('returns 400 when participant_ids is empty array', async () => {
    const req = new NextRequest('http://localhost/api/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_ids: [] }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error during room creation', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Room creation failed' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_ids: ['u1', 'u2'] }),
    });
    const res = await POST(req);

    expect(res.status).toBe(500);
  });
});
