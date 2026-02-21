import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { GET, POST } from '../route';

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/chat/rooms/[id]/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with messages sorted ascending', async () => {
    const mockMessages = [
      { id: 'm1', content: 'Hello', sender_id: 'u1', created_at: '2026-01-01T10:00:00Z' },
      { id: 'm2', content: 'Hi', sender_id: 'u2', created_at: '2026-01-01T10:01:00Z' },
    ];
    const chain = createMockQueryBuilder(mockMessages);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/chat/rooms/room-1/messages');
    const res = await GET(req, makeParams('room-1'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(mockMessages);
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('applies pagination via limit and offset', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/chat/rooms/room-1/messages?limit=10&offset=20');
    await GET(req, makeParams('room-1'));

    expect(chain.range).toHaveBeenCalledWith(20, 29);
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Query failed' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/chat/rooms/room-1/messages');
    const res = await GET(req, makeParams('room-1'));

    expect(res.status).toBe(500);
  });
});

describe('POST /api/chat/rooms/[id]/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 on valid message send', async () => {
    const mockMsg = { id: 'm1', room_id: 'room-1', sender_id: 'u1', content: 'Hello' };
    const chain = createMockQueryBuilder(mockMsg);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/chat/rooms/room-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: 'u1', content: 'Hello' }),
    });
    const res = await POST(req, makeParams('room-1'));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toEqual(mockMsg);
  });

  it('returns 400 when sender_id is missing', async () => {
    const req = new NextRequest('http://localhost/api/chat/rooms/room-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello' }),
    });
    const res = await POST(req, makeParams('room-1'));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('sender_id is required');
  });

  it('returns 400 when content is missing', async () => {
    const req = new NextRequest('http://localhost/api/chat/rooms/room-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: 'u1' }),
    });
    const res = await POST(req, makeParams('room-1'));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Content is required');
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Insert failed' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/chat/rooms/room-1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: 'u1', content: 'Hello' }),
    });
    const res = await POST(req, makeParams('room-1'));

    expect(res.status).toBe(500);
  });
});
