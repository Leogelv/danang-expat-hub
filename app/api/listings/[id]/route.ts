import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/listings/[id] — получение одного объявления по id
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabase = getSupabaseServer({ serviceRole: true });
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

// PATCH /api/listings/[id] — обновление объявления (проверка author_id)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { author_id, ...updates } = body;

    // Проверяем что author_id передан для авторизации
    if (!author_id) {
      return NextResponse.json({ error: 'author_id is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    // Проверяем что объявление принадлежит пользователю
    const { data: existing, error: fetchError } = await supabase
      .from('listings')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existing.author_id && existing.author_id !== author_id) {
      return NextResponse.json({ error: 'Not authorized to update this listing' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

// DELETE /api/listings/[id] — деактивация объявления (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { author_id } = body;

    if (!author_id) {
      return NextResponse.json({ error: 'author_id is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    // Проверяем владельца
    const { data: existing, error: fetchError } = await supabase
      .from('listings')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (existing.author_id && existing.author_id !== author_id) {
      return NextResponse.json({ error: 'Not authorized to delete this listing' }, { status: 403 });
    }

    // Мягкое удаление — деактивация
    const { error } = await supabase
      .from('listings')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
