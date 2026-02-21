import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { GET, POST, DELETE } from '../route';

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/events/[id]/rsvp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with attendees list', async () => {
    const mockAttendees = [
      { id: 'a1', user_id: 'u1', status: 'going', created_at: '2026-01-01' },
    ];
    const chain = createMockQueryBuilder(mockAttendees);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/events/ev-1/rsvp');
    const res = await GET(req, makeParams('ev-1'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(mockAttendees);
    expect(chain.eq).toHaveBeenCalledWith('event_id', 'ev-1');
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Query failed' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/events/ev-1/rsvp');
    const res = await GET(req, makeParams('ev-1'));

    expect(res.status).toBe(500);
  });
});

describe('POST /api/events/[id]/rsvp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 on valid RSVP with default status going', async () => {
    const mockRsvp = { event_id: 'ev-1', user_id: 'u1', status: 'going' };
    const chain = createMockQueryBuilder(mockRsvp);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/events/ev-1/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'u1' }),
    });
    const res = await POST(req, makeParams('ev-1'));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toEqual(mockRsvp);
    expect(chain.upsert).toHaveBeenCalled();
  });

  it('returns 400 when user_id is missing', async () => {
    const req = new NextRequest('http://localhost/api/events/ev-1/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req, makeParams('ev-1'));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('user_id is required');
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Upsert failed' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/events/ev-1/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'u1' }),
    });
    const res = await POST(req, makeParams('ev-1'));

    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/events/[id]/rsvp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 on successful deletion', async () => {
    const chain = createMockQueryBuilder(null);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/events/ev-1/rsvp', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'u1' }),
    });
    const res = await DELETE(req, makeParams('ev-1'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(chain.delete).toHaveBeenCalled();
  });

  it('returns 400 when user_id is missing', async () => {
    const req = new NextRequest('http://localhost/api/events/ev-1/rsvp', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await DELETE(req, makeParams('ev-1'));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('user_id is required');
  });
});
