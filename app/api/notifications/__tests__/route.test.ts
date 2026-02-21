import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { GET } from '../route';

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with notifications', async () => {
    const mockData = [{ id: 'n1', title: 'New message', is_read: false }];
    const chain = createMockQueryBuilder(mockData);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/notifications');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(mockData);
  });

  it('filters by userId when provided', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/notifications?userId=user-123');
    await GET(req);

    expect(chain.eq).toHaveBeenCalledWith('tg_user_id', 'user-123');
  });

  it('applies default limit 12 and max 50', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/notifications');
    await GET(req);

    expect(chain.limit).toHaveBeenCalledWith(12);
  });

  it('caps limit at 50', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/notifications?limit=200');
    await GET(req);

    expect(chain.limit).toHaveBeenCalledWith(50);
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'DB error' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/notifications');
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('DB error');
  });
});
