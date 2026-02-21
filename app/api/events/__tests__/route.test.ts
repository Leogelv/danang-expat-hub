import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { GET, POST } from '../route';

describe('GET /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with events sorted by starts_at ascending', async () => {
    const mockData = [
      { id: '1', title: 'Event A', starts_at: '2026-03-01' },
      { id: '2', title: 'Event B', starts_at: '2026-04-01' },
    ];
    const chain = createMockQueryBuilder(mockData);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/events');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(mockData);
    expect(chain.order).toHaveBeenCalledWith('starts_at', { ascending: true });
  });

  it('filters by is_active', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/events');
    await GET(req);

    expect(chain.eq).toHaveBeenCalledWith('is_active', true);
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'DB failure' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/events');
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('DB failure');
  });
});

describe('POST /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 on valid data', async () => {
    const mockEvent = { id: '1', title: 'Meetup', starts_at: '2026-03-15T18:00:00Z' };
    const chain = createMockQueryBuilder(mockEvent);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Meetup', starts_at: '2026-03-15T18:00:00Z' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toEqual(mockEvent);
  });

  it('returns 400 when title is missing', async () => {
    const req = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starts_at: '2026-03-15T18:00:00Z' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Title is required');
  });

  it('returns 400 when starts_at is missing', async () => {
    const req = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Meetup' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('starts_at is required');
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Insert error' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Meetup', starts_at: '2026-03-15T18:00:00Z' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Insert error');
  });
});
