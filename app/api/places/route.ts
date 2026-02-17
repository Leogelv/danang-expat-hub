import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

// GET /api/places — получение списка мест
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam) || 12, 1), 50);

    const supabase = getSupabaseServer({ serviceRole: true });
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
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

// POST /api/places — добавление нового места
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, address, price_level, wifi, vegan, latitude, longitude, images, contact, author_id } = body;

    // Валидация обязательных полей
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    const { data, error } = await supabase
      .from('places')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        category: category || null,
        address: address || null,
        price_level: price_level || null,
        wifi: wifi ?? false,
        vegan: vegan ?? false,
        latitude: latitude || null,
        longitude: longitude || null,
        images: Array.isArray(images) ? images : [],
        contact: contact || null,
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
