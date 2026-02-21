import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeTool } from '../executor';

// Мок supabase
vi.mock('@/fsd/shared/lib/supabase', () => ({
  getSupabaseServer: vi.fn(),
}));

import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

// Хелпер: chainable query builder мок
function createChainMock(resolvedValue: { data: any; error: any }) {
  const chain: any = {};
  const methods = [
    'from', 'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
    'is', 'in', 'not', 'or', 'order', 'limit', 'range', 'overlaps',
  ];
  methods.forEach(m => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });
  chain.single = vi.fn().mockResolvedValue(resolvedValue);
  chain.then = vi.fn((resolve) => resolve(resolvedValue));
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// === search_listings ===
describe('search_listings', () => {
  it('returns listings successfully', async () => {
    const mockData = [
      {
        id: '1', title: 'Studio in My Khe', description: 'Nice studio',
        price: 500, currency: 'USD', category: 'studio',
        location: 'My Khe', images: ['img.jpg'], contact: '@test',
      },
    ];
    const chain = createChainMock({ data: mockData, error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('search_listings', {}, {});

    expect(result.success).toBe(true);
    expect((result.data as any).count).toBe(1);
    expect((result.data as any).listings[0].title).toBe('Studio in My Khe');
    expect(chain.from).toHaveBeenCalledWith('listings');
  });

  it('applies all filters', async () => {
    const chain = createChainMock({ data: [], error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    await executeTool('search_listings', {
      category: 'apartment',
      priceMin: 300,
      priceMax: 1000,
      location: 'An Thuong',
      query: 'pool',
    }, {});

    expect(chain.eq).toHaveBeenCalledWith('category', 'apartment');
    expect(chain.gte).toHaveBeenCalledWith('price', 300);
    expect(chain.lte).toHaveBeenCalledWith('price', 1000);
    expect(chain.ilike).toHaveBeenCalledWith('location', '%An Thuong%');
    expect(chain.or).toHaveBeenCalledWith('title.ilike.%pool%,description.ilike.%pool%');
  });

  it('caps limit at 10', async () => {
    const chain = createChainMock({ data: [], error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    await executeTool('search_listings', { limit: 50 }, {});

    expect(chain.limit).toHaveBeenCalledWith(10);
  });

  it('returns error on supabase failure', async () => {
    const chain = createChainMock({ data: null, error: { message: 'DB error' } });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('search_listings', {}, {});

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB error');
  });
});

// === search_places ===
describe('search_places', () => {
  it('returns places successfully', async () => {
    const mockData = [
      {
        id: '1', name: 'Cool Cafe', description: 'Great coffee',
        category: 'cafe', address: '123 Street', price_level: '$$',
        has_wifi: true, is_vegan_friendly: false, rating: 4.5, images: [],
      },
    ];
    const chain = createChainMock({ data: mockData, error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('search_places', {}, {});

    expect(result.success).toBe(true);
    expect((result.data as any).count).toBe(1);
    expect((result.data as any).places[0].name).toBe('Cool Cafe');
    expect((result.data as any).places[0].wifi).toBe('\u2713');
  });

  it('applies wifi and vegan filters', async () => {
    const chain = createChainMock({ data: [], error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    await executeTool('search_places', { hasWifi: true, isVegan: true }, {});

    expect(chain.eq).toHaveBeenCalledWith('has_wifi', true);
    expect(chain.eq).toHaveBeenCalledWith('is_vegan_friendly', true);
  });
});

// === search_market ===
describe('search_market', () => {
  it('returns market items', async () => {
    const mockData = [
      {
        id: '1', title: 'MacBook Pro', description: 'Good condition',
        price: 800, currency: 'USD', category: 'electronics',
        condition: 'good', images: ['mac.jpg'], contact: '@seller',
      },
    ];
    const chain = createChainMock({ data: mockData, error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('search_market', {}, {});

    expect(result.success).toBe(true);
    expect((result.data as any).items[0].title).toBe('MacBook Pro');
    expect((result.data as any).items[0].condition).toBe('good');
  });

  it('applies condition filter', async () => {
    const chain = createChainMock({ data: [], error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    await executeTool('search_market', { condition: 'new' }, {});

    expect(chain.eq).toHaveBeenCalledWith('condition', 'new');
  });
});

// === search_events ===
describe('search_events', () => {
  it('returns future events', async () => {
    const mockData = [
      {
        id: '1', title: 'Beach Meetup', description: 'Fun',
        category: 'social', starts_at: '2026-03-01T10:00:00Z',
        ends_at: '2026-03-01T12:00:00Z', location: 'My Khe Beach',
        max_participants: 50, organizer_contact: '@host',
      },
    ];
    const chain = createChainMock({ data: mockData, error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('search_events', {}, {});

    expect(result.success).toBe(true);
    expect((result.data as any).events[0].title).toBe('Beach Meetup');
    expect((result.data as any).events[0].date).toBe('2026-03-01T10:00:00Z');
    expect(chain.from).toHaveBeenCalledWith('events');
  });

  it('applies date filters', async () => {
    const chain = createChainMock({ data: [], error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    await executeTool('search_events', {
      dateFrom: '2026-03-01',
      dateTo: '2026-04-01',
    }, {});

    expect(chain.gte).toHaveBeenCalledWith('starts_at', '2026-03-01');
    expect(chain.lte).toHaveBeenCalledWith('starts_at', '2026-04-01');
  });
});

// === get_user_favorites ===
describe('get_user_favorites', () => {
  it('returns favorites for authenticated user', async () => {
    const mockData = [
      { id: '1', source: 'listing', item_id: 'abc', created_at: '2026-01-01' },
    ];
    const chain = createChainMock({ data: mockData, error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('get_user_favorites', {}, { userId: 'user-1' });

    expect(result.success).toBe(true);
    expect((result.data as any).favorites).toEqual(mockData);
    expect(chain.eq).toHaveBeenCalledWith('tg_user_id', 'user-1');
  });

  it('returns error if no userId and no telegramId', async () => {
    const result = await executeTool('get_user_favorites', {}, {});

    expect(result.success).toBe(false);
    expect(result.error).toBe('User not authenticated');
  });
});

// === create_community_post ===
describe('create_community_post', () => {
  it('creates post successfully', async () => {
    const createdPost = { id: '1', body: 'Hello community!', tags: ['general'], created_at: '2026-01-01' };
    const chain = createChainMock({ data: createdPost, error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('create_community_post', {
      body: 'Hello community!',
      tags: ['general'],
    }, { telegramId: 12345 });

    expect(result.success).toBe(true);
    expect((result.data as any).message).toBe('Post created successfully');
    expect(chain.insert).toHaveBeenCalledWith({
      body: 'Hello community!',
      tags: ['general'],
      author_tg_id: 12345,
    });
  });

  it('returns error if body < 5 chars', async () => {
    const result = await executeTool('create_community_post', { body: 'Hi' }, { telegramId: 12345 });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Post body must be at least 5 characters');
  });

  it('returns error if no telegramId', async () => {
    const result = await executeTool('create_community_post', { body: 'Hello world post' }, {});

    expect(result.success).toBe(false);
    expect(result.error).toBe('Telegram user required to create posts');
  });
});

// === get_community_posts ===
describe('get_community_posts', () => {
  it('returns posts', async () => {
    const mockData = [
      {
        id: '1', body: 'Test post', tags: ['question'],
        author_name: 'John', author_tg_id: 123, created_at: '2026-01-01',
      },
    ];
    const chain = createChainMock({ data: mockData, error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('get_community_posts', {}, {});

    expect(result.success).toBe(true);
    expect((result.data as any).count).toBe(1);
    expect((result.data as any).posts[0].author).toBe('John');
  });

  it('applies tags overlap filter', async () => {
    const chain = createChainMock({ data: [], error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    await executeTool('get_community_posts', { tags: ['housing', 'question'] }, {});

    expect(chain.overlaps).toHaveBeenCalledWith('tags', ['housing', 'question']);
  });
});

// === create_listing ===
describe('create_listing', () => {
  it('creates listing successfully', async () => {
    const created = { id: '1', title: 'Nice Apartment', price: 500, currency: 'USD', category: 'housing', location: 'My Khe' };
    const chain = createChainMock({ data: created, error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('create_listing', {
      title: 'Nice Apartment',
      price: 500,
      category: 'apartment',
      location: 'My Khe',
    }, { userId: 'user-1', telegramId: 12345 });

    expect(result.success).toBe(true);
    expect((result.data as any).message).toBe('Listing created successfully');
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Nice Apartment',
      price: 500,
      author_id: 'user-1',
    }));
  });

  it('returns error if title < 3 chars', async () => {
    const result = await executeTool('create_listing', { title: 'Ab', price: 100 }, { userId: 'user-1' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Title must be at least 3 characters');
  });

  it('returns error if price <= 0', async () => {
    const result = await executeTool('create_listing', { title: 'Good Title', price: 0 }, { userId: 'user-1' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Price must be greater than 0');
  });

  it('returns error if no auth context', async () => {
    const result = await executeTool('create_listing', { title: 'Test', price: 100 }, {});

    expect(result.success).toBe(false);
    expect(result.error).toBe('User authentication required to create listings');
  });
});

// === create_event ===
describe('create_event', () => {
  it('creates event successfully', async () => {
    const created = { id: '1', title: 'Beach Party', category: 'party', starts_at: '2026-03-01T18:00:00Z', location: 'My Khe' };
    const chain = createChainMock({ data: created, error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('create_event', {
      title: 'Beach Party',
      starts_at: '2026-03-01T18:00:00Z',
      category: 'party',
      location: 'My Khe',
    }, { userId: 'user-1' });

    expect(result.success).toBe(true);
    expect((result.data as any).message).toBe('Event created successfully');
    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Beach Party',
      starts_at: '2026-03-01T18:00:00Z',
    }));
  });

  it('returns error if no starts_at', async () => {
    const result = await executeTool('create_event', { title: 'Test Event' }, { userId: 'user-1' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('starts_at date is required');
  });

  it('returns error if title < 3 chars', async () => {
    const result = await executeTool('create_event', { title: 'AB', starts_at: '2026-03-01' }, { userId: 'user-1' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Title must be at least 3 characters');
  });
});

// === rsvp_event ===
describe('rsvp_event', () => {
  it('creates RSVP successfully', async () => {
    const created = { id: '1', event_id: 'event-1', status: 'going' };
    const chain = createChainMock({ data: created, error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('rsvp_event', {
      event_id: 'event-1',
      status: 'going',
    }, { userId: 'user-1' });

    expect(result.success).toBe(true);
    expect((result.data as any).message).toBe('RSVP updated: going');
    expect(chain.upsert).toHaveBeenCalledWith(
      { event_id: 'event-1', user_id: 'user-1', status: 'going' },
      { onConflict: 'event_id,user_id' }
    );
  });

  it('returns error if no userId', async () => {
    const result = await executeTool('rsvp_event', { event_id: 'event-1' }, {});

    expect(result.success).toBe(false);
    expect(result.error).toBe('User authentication required for RSVP');
  });

  it('returns error if invalid status', async () => {
    const result = await executeTool('rsvp_event', {
      event_id: 'event-1',
      status: 'maybe',
    }, { userId: 'user-1' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid status');
  });

  it('returns error if no event_id', async () => {
    const result = await executeTool('rsvp_event', {}, { userId: 'user-1' });

    expect(result.success).toBe(false);
    expect(result.error).toBe('event_id is required');
  });
});

// === unknown tool ===
describe('executeTool edge cases', () => {
  it('returns error for unknown tool', async () => {
    const chain = createChainMock({ data: null, error: null });
    vi.mocked(getSupabaseServer).mockReturnValue(chain);

    const result = await executeTool('nonexistent_tool' as any, {}, {});

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown tool');
  });
});
