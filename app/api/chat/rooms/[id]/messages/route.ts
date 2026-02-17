import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/chat/rooms/[id]/messages — получение сообщений комнаты с пагинацией
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 100);
    const offset = Math.max(Number(offsetParam) || 0, 0);

    const supabase = getSupabaseServer({ serviceRole: true });

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

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

// POST /api/chat/rooms/[id]/messages — отправка сообщения в комнату
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sender_id, content, type, reply_to_id, media_url, original_language } = body;

    // Валидация
    if (!sender_id) {
      return NextResponse.json({ error: 'sender_id is required' }, { status: 400 });
    }
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: id,
        sender_id,
        content: content.trim(),
        type: type || 'text',
        reply_to_id: reply_to_id || null,
        media_url: media_url || null,
        original_language: original_language || 'en',
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Обновляем updated_at комнаты при новом сообщении
    await supabase
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
