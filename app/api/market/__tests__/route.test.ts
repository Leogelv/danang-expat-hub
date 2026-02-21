import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { GET, POST } from '../route';

describe('GET /api/market', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with market items', async () => {
    const mockData = [{ id: '1', title: 'Used Laptop', price: 200 }];
    const chain = createMockQueryBuilder(mockData);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/market');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(mockData);
  });

  it('applies limit with default 12', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/market');
    await GET(req);

    expect(chain.limit).toHaveBeenCalledWith(12);
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'DB error' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/market');
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('DB error');
  });
});

describe('POST /api/market', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 on valid data', async () => {
    const mockItem = { id: '1', title: 'Bike', price: 150 };
    const chain = createMockQueryBuilder(mockItem);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Bike', price: 150 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toEqual(mockItem);
  });

  it('returns 400 when title is missing', async () => {
    const req = new NextRequest('http://localhost/api/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 100 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Title is required');
  });

  it('returns 400 when price is 0 or negative', async () => {
    const req = new NextRequest('http://localhost/api/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Item', price: -5 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Price must be greater than 0');
  });

  it('returns 500 on DB error during insert', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Insert failed' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Item', price: 100 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Insert failed');
  });
});
