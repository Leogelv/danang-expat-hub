import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

// GET /api/community - получение постов с фильтрами
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam) || 20, 1), 100);
    const tags = searchParams.get('tags'); // comma-separated tags
    const geoOnly = searchParams.get('geoOnly') === 'true';

    const supabase = getSupabaseServer({ serviceRole: true });

    let query = supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Фильтр по тегам (массив в PostgreSQL)
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
      query = query.overlaps('tags', tagList);
    }

    // Только посты с геолокацией
    if (geoOnly) {
      query = query.not('latitude', 'is', null).not('longitude', 'is', null);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

// POST /api/community - создание нового поста
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, body: postBody, tags, latitude, longitude, authorName, authorTgId } = body;

    // Валидация
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!postBody || typeof postBody !== 'string' || postBody.trim().length === 0) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    }

    // Преобразуем теги в массив
    const tagsArray = Array.isArray(tags)
      ? tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const supabase = getSupabaseServer({ serviceRole: true });

    const { data: post, error } = await supabase
      .from('community_posts')
      .insert({
        title: title.trim(),
        body: postBody.trim(),
        tags: tagsArray,
        latitude: latitude || null,
        longitude: longitude || null,
        author_name: authorName || null,
        author_tg_id: authorTgId || null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
