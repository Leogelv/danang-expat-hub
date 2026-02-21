import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { PATCH } from '../route';

describe('PATCH /api/notifications/read', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 on valid notification_ids', async () => {
    const chain = createMockQueryBuilder(null);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_ids: ['n1', 'n2', 'n3'] }),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.updated).toBe(3);
    expect(chain.update).toHaveBeenCalledWith({ is_read: true });
    expect(chain.in).toHaveBeenCalledWith('id', ['n1', 'n2', 'n3']);
  });

  it('returns 400 when notification_ids is missing', async () => {
    const req = new NextRequest('http://localhost/api/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('notification_ids');
  });

  it('returns 400 when notification_ids is empty array', async () => {
    const req = new NextRequest('http://localhost/api/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_ids: [] }),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Update failed' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_ids: ['n1'] }),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Update failed');
  });
});
