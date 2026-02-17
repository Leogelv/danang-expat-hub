import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

// GET /api/events — получение списка событий
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam) || 12, 1), 50);

    const supabase = getSupabaseServer({ serviceRole: true });
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('starts_at', { ascending: true })
      .limit(limit);

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

// POST /api/events — создание нового события
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, starts_at, ends_at, location, max_participants, organizer_contact, images, author_id } = body;

    // Валидация обязательных полей
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!starts_at) {
      return NextResponse.json({ error: 'starts_at is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        category: category || null,
        starts_at,
        ends_at: ends_at || null,
        location: location || null,
        max_participants: max_participants ? Number(max_participants) : null,
        organizer_contact: organizer_contact || null,
        images: Array.isArray(images) ? images : [],
        author_id: author_id || null,
        is_active: true,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
