import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

// GET /api/market — получение товаров барахолки
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam) || 12, 1), 50);

    const supabase = getSupabaseServer({ serviceRole: true });
    const { data, error } = await supabase
      .from('market_items')
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

// POST /api/market — создание нового товара на барахолке
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, price, currency, category, condition, images, contact, author_id } = body;

    // Валидация обязательных полей
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (price == null || Number(price) <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    const { data, error } = await supabase
      .from('market_items')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        price: Number(price),
        currency: currency || 'USD',
        category: category || null,
        condition: condition || null,
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
