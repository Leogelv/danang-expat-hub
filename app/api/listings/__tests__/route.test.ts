import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { GET, POST } from '../route';

describe('GET /api/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with listings data', async () => {
    const mockData = [{ id: '1', title: 'Test Listing', price: 500 }];
    const chain = createMockQueryBuilder(mockData);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(mockData);
  });

  it('applies category filter when provided', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings?category=apartment');
    await GET(req);

    // eq вызывается для is_active и category
    expect(chain.eq).toHaveBeenCalledWith('is_active', true);
    expect(chain.eq).toHaveBeenCalledWith('category', 'apartment');
  });

  it('applies limit with default 12 and max 50', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    // Дефолтный лимит
    const req1 = new NextRequest('http://localhost/api/listings');
    await GET(req1);
    expect(chain.limit).toHaveBeenCalledWith(12);

    vi.clearAllMocks();
    const chain2 = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain2);

    // Превышение макс лимита
    const req2 = new NextRequest('http://localhost/api/listings?limit=100');
    await GET(req2);
    expect(chain2.limit).toHaveBeenCalledWith(50);
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'DB connection failed' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings');
    const res = await GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('DB connection failed');
  });
});

describe('POST /api/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 on valid data', async () => {
    const mockListing = { id: '1', title: 'New Listing', price: 300 };
    const chain = createMockQueryBuilder(mockListing);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Listing', price: 300, description: 'Desc' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toEqual(mockListing);
  });

  it('returns 400 when title is missing', async () => {
    const req = new NextRequest('http://localhost/api/listings', {
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
    const req = new NextRequest('http://localhost/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test', price: 0 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Price must be greater than 0');
  });

  it('returns 500 on DB error during insert', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Insert failed' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test', price: 100 }),
    });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Insert failed');
  });
});
