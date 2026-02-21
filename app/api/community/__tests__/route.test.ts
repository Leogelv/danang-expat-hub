import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { createMockQueryBuilder } from '@/__mocks__/supabase';

vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { GET, POST } from '../route';

describe('GET /api/community', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with community posts', async () => {
    const mockData = [{ id: '1', title: 'Hello Danang', body: 'Great city' }];
    const chain = createMockQueryBuilder(mockData);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/community');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(mockData);
  });

  it('applies tags filter using overlaps', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/community?tags=food,travel');
    await GET(req);

    expect(chain.overlaps).toHaveBeenCalledWith('tags', ['food', 'travel']);
  });

  it('applies geoOnly filter', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/community?geoOnly=true');
    await GET(req);

    expect(chain.not).toHaveBeenCalledWith('latitude', 'is', null);
    expect(chain.not).toHaveBeenCalledWith('longitude', 'is', null);
  });

  it('uses default limit 20 and max 100', async () => {
    const chain = createMockQueryBuilder([]);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/community');
    await GET(req);

    expect(chain.limit).toHaveBeenCalledWith(20);
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'DB error' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/community');
    const res = await GET(req);

    expect(res.status).toBe(500);
  });
});

describe('POST /api/community', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 with { post } on valid data', async () => {
    const mockPost = { id: '1', title: 'New Post', body: 'Post body' };
    const chain = createMockQueryBuilder(mockPost);
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Post', body: 'Post body' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const resBody = await res.json();
    // Возвращает { post }, а не { data }
    expect(resBody.post).toEqual(mockPost);
  });

  it('returns 400 when title is missing', async () => {
    const req = new NextRequest('http://localhost/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: 'Some text' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Title is required');
  });

  it('returns 400 when body (postBody) is missing', async () => {
    const req = new NextRequest('http://localhost/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Post Title' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Body is required');
  });

  it('returns 500 on DB error', async () => {
    const chain = createMockQueryBuilder(null, { message: 'Insert failed' });
    (getSupabaseServer as any).mockReturnValue(chain);

    const req = new NextRequest('http://localhost/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test', body: 'Body text' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(500);
  });
});
