import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { GET, PATCH, DELETE } from '../route';

// Хелпер для создания params (Next.js 15 — Promise)
function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/listings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with single listing', async () => {
    const mockListing = { id: 'uuid-1', title: 'Test', price: 500 };
    const chain = createMockQueryBuilder(mockListing);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings/uuid-1');
    const res = await GET(req, makeParams('uuid-1'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(mockListing);
  });

  it('returns 404 when not found', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Row not found' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings/nonexistent');
    const res = await GET(req, makeParams('nonexistent'));

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/listings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 on valid update', async () => {
    // Первый вызов — fetch existing (select author_id) через .single()
    // Второй вызов — update через .single()
    const updatedListing = { id: 'uuid-1', title: 'Updated', price: 600 };
    const chain = createMockQueryBuilder({ author_id: 'user-1' });
    // Переопределяем single чтобы при втором вызове вернуть обновлённые данные
    let singleCallCount = 0;
    chain.single = vi.fn().mockImplementation(() => {
      singleCallCount++;
      if (singleCallCount === 1) {
        return Promise.resolve({ data: { author_id: 'user-1' }, error: null });
      }
      return Promise.resolve({ data: updatedListing, error: null });
    });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings/uuid-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_id: 'user-1', title: 'Updated', price: 600 }),
    });
    const res = await PATCH(req, makeParams('uuid-1'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(updatedListing);
  });

  it('returns 400 without author_id', async () => {
    const req = new NextRequest('http://localhost/api/listings/uuid-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated' }),
    });
    const res = await PATCH(req, makeParams('uuid-1'));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('author_id is required');
  });

  it('returns 403 when author_id does not match', async () => {
    const chain = createMockQueryBuilder({ author_id: 'owner-1' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings/uuid-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_id: 'someone-else', title: 'Hack' }),
    });
    const res = await PATCH(req, makeParams('uuid-1'));

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Not authorized to update this listing');
  });

  it('returns 404 when listing not found', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Not found' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings/missing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_id: 'user-1', title: 'Updated' }),
    });
    const res = await PATCH(req, makeParams('missing'));

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/listings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 on soft delete', async () => {
    const chain = createMockQueryBuilder({ author_id: 'user-1' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings/uuid-1', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_id: 'user-1' }),
    });
    const res = await DELETE(req, makeParams('uuid-1'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('returns 400 without author_id', async () => {
    const req = new NextRequest('http://localhost/api/listings/uuid-1', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await DELETE(req, makeParams('uuid-1'));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('author_id is required');
  });

  it('returns 403 when not authorized', async () => {
    const chain = createMockQueryBuilder({ author_id: 'owner-1' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/listings/uuid-1', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author_id: 'intruder' }),
    });
    const res = await DELETE(req, makeParams('uuid-1'));

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Not authorized to delete this listing');
  });
});
