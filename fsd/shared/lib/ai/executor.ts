// AI Agent Tool Executor - выполняет инструменты и возвращает результаты

import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import type { ToolName, ToolResult } from './tools';

interface ExecutorContext {
  userId?: string;
  telegramId?: number;
}

// Главная функция выполнения инструмента
export async function executeTool(
  toolName: ToolName,
  args: Record<string, unknown>,
  context: ExecutorContext
): Promise<ToolResult> {
  const supabase = getSupabaseServer({ serviceRole: true });

  try {
    switch (toolName) {
      case 'search_listings':
        return await searchListings(supabase, args);

      case 'search_places':
        return await searchPlaces(supabase, args);

      case 'search_market':
        return await searchMarket(supabase, args);

      case 'search_events':
        return await searchEvents(supabase, args);

      case 'get_user_favorites':
        return await getUserFavorites(supabase, args, context);

      case 'create_community_post':
        return await createCommunityPost(supabase, args, context);

      case 'get_community_posts':
        return await getCommunityPosts(supabase, args);

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[executor] ${toolName} error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Tool execution failed',
    };
  }
}

// === Tool Implementations ===

async function searchListings(
  supabase: ReturnType<typeof getSupabaseServer>,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const limit = Math.min(Number(args.limit) || 5, 10);

  let query = supabase
    .from('listings')
    .select('id, title, description, price, currency, category, location, images, contact')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (args.category) {
    query = query.eq('category', args.category);
  }
  if (args.priceMin) {
    query = query.gte('price', args.priceMin);
  }
  if (args.priceMax) {
    query = query.lte('price', args.priceMax);
  }
  if (args.location) {
    query = query.ilike('location', `%${args.location}%`);
  }
  if (args.query) {
    query = query.or(`title.ilike.%${args.query}%,description.ilike.%${args.query}%`);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      count: data?.length ?? 0,
      listings: data?.map((l) => ({
        id: l.id,
        title: l.title,
        price: `${l.price} ${l.currency || 'USD'}`,
        category: l.category,
        location: l.location,
        description: l.description?.substring(0, 150) + (l.description?.length > 150 ? '...' : ''),
        hasImages: (l.images?.length ?? 0) > 0,
      })),
    },
  };
}

async function searchPlaces(
  supabase: ReturnType<typeof getSupabaseServer>,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const limit = Math.min(Number(args.limit) || 5, 10);

  let query = supabase
    .from('places')
    .select('id, name, description, category, address, price_level, has_wifi, is_vegan_friendly, rating, images')
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (args.category) {
    query = query.eq('category', args.category);
  }
  if (args.hasWifi === true) {
    query = query.eq('has_wifi', true);
  }
  if (args.isVegan === true) {
    query = query.eq('is_vegan_friendly', true);
  }
  if (args.priceLevel) {
    query = query.eq('price_level', args.priceLevel);
  }
  if (args.query) {
    query = query.or(`name.ilike.%${args.query}%,description.ilike.%${args.query}%`);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      count: data?.length ?? 0,
      places: data?.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        address: p.address,
        priceLevel: p.price_level,
        rating: p.rating,
        wifi: p.has_wifi ? '✓' : '✗',
        vegan: p.is_vegan_friendly ? '✓' : '✗',
        description: p.description?.substring(0, 100) + (p.description?.length > 100 ? '...' : ''),
      })),
    },
  };
}

async function searchMarket(
  supabase: ReturnType<typeof getSupabaseServer>,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const limit = Math.min(Number(args.limit) || 5, 10);

  let query = supabase
    .from('market_items')
    .select('id, title, description, price, currency, category, condition, images, contact')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (args.category) {
    query = query.eq('category', args.category);
  }
  if (args.condition) {
    query = query.eq('condition', args.condition);
  }
  if (args.priceMin) {
    query = query.gte('price', args.priceMin);
  }
  if (args.priceMax) {
    query = query.lte('price', args.priceMax);
  }
  if (args.query) {
    query = query.or(`title.ilike.%${args.query}%,description.ilike.%${args.query}%`);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      count: data?.length ?? 0,
      items: data?.map((m) => ({
        id: m.id,
        title: m.title,
        price: `${m.price} ${m.currency || 'USD'}`,
        category: m.category,
        condition: m.condition,
        description: m.description?.substring(0, 100) + (m.description?.length > 100 ? '...' : ''),
        hasImages: (m.images?.length ?? 0) > 0,
      })),
    },
  };
}

async function searchEvents(
  supabase: ReturnType<typeof getSupabaseServer>,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const limit = Math.min(Number(args.limit) || 5, 10);

  let query = supabase
    .from('events')
    .select('id, title, description, category, date, time, location, price, organizer')
    .gte('date', new Date().toISOString().split('T')[0]) // только будущие
    .order('date', { ascending: true })
    .limit(limit);

  if (args.category) {
    query = query.eq('category', args.category);
  }
  if (args.dateFrom) {
    query = query.gte('date', args.dateFrom);
  }
  if (args.dateTo) {
    query = query.lte('date', args.dateTo);
  }
  if (args.query) {
    query = query.or(`title.ilike.%${args.query}%,description.ilike.%${args.query}%`);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      count: data?.length ?? 0,
      events: data?.map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        date: e.date,
        time: e.time,
        location: e.location,
        price: e.price ? `${e.price} USD` : 'Free',
        organizer: e.organizer,
      })),
    },
  };
}

async function getUserFavorites(
  supabase: ReturnType<typeof getSupabaseServer>,
  args: Record<string, unknown>,
  context: ExecutorContext
): Promise<ToolResult> {
  if (!context.userId && !context.telegramId) {
    return { success: false, error: 'User not authenticated' };
  }

  const type = (args.type as string) || 'all';

  let query = supabase
    .from('favorites')
    .select('id, item_type, item_id, created_at');

  if (context.userId) {
    query = query.eq('user_id', context.userId);
  }

  if (type !== 'all') {
    query = query.eq('item_type', type);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(20);
  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      count: data?.length ?? 0,
      favorites: data,
    },
  };
}

async function createCommunityPost(
  supabase: ReturnType<typeof getSupabaseServer>,
  args: Record<string, unknown>,
  context: ExecutorContext
): Promise<ToolResult> {
  if (!context.telegramId) {
    return { success: false, error: 'Telegram user required to create posts' };
  }

  const body = args.body as string;
  if (!body || body.trim().length < 5) {
    return { success: false, error: 'Post body must be at least 5 characters' };
  }

  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      body: body.trim(),
      tags: args.tags || [],
      author_tg_id: context.telegramId,
    })
    .select('id, body, tags, created_at')
    .single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      message: 'Post created successfully',
      post: data,
    },
  };
}

async function getCommunityPosts(
  supabase: ReturnType<typeof getSupabaseServer>,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const limit = Math.min(Number(args.limit) || 5, 10);

  let query = supabase
    .from('community_posts')
    .select('id, body, tags, author_name, author_tg_id, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (args.tags && Array.isArray(args.tags) && args.tags.length > 0) {
    query = query.overlaps('tags', args.tags);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };

  return {
    success: true,
    data: {
      count: data?.length ?? 0,
      posts: data?.map((p) => ({
        id: p.id,
        body: p.body?.substring(0, 200) + (p.body?.length > 200 ? '...' : ''),
        tags: p.tags,
        author: p.author_name || `User #${p.author_tg_id}`,
        date: p.created_at,
      })),
    },
  };
}
