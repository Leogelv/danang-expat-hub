import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

// GET /api/listings — получение списка объявлений с фильтрами
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam) || 12, 1), 50);

    const supabase = getSupabaseServer({ serviceRole: true });
    let query = supabase
      .from('listings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
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

// POST /api/listings — создание нового объявления
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, price, currency, category, location, amenities, images, contact, contact_type, author_id } = body;

    // Валидация обязательных полей
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (price == null || Number(price) <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    const { data, error } = await supabase
      .from('listings')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        price: Number(price),
        currency: currency || 'USD',
        category: category || 'housing',
        location: location || null,
        amenities: Array.isArray(amenities) ? amenities : [],
        images: Array.isArray(images) ? images : [],
        contact: contact || null,
        contact_type: contact_type || null,
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
