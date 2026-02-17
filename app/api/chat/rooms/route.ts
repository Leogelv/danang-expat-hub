import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

// GET /api/chat/rooms — получение списка комнат для пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    // Находим все комнаты, где пользователь является участником
    const { data: participations, error: pError } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', userId);

    if (pError) {
      return NextResponse.json({ error: pError.message }, { status: 500 });
    }

    if (!participations || participations.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const roomIds = participations.map((p) => p.room_id);

    // Получаем данные комнат
    const { data: rooms, error: rError } = await supabase
      .from('chat_rooms')
      .select('*')
      .in('id', roomIds)
      .order('updated_at', { ascending: false });

    if (rError) {
      return NextResponse.json({ error: rError.message }, { status: 500 });
    }

    return NextResponse.json({ data: rooms ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}

// POST /api/chat/rooms — создание новой комнаты чата
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, participant_ids, context_type, context_id } = body;

    // Валидация
    if (!participant_ids || !Array.isArray(participant_ids) || participant_ids.length === 0) {
      return NextResponse.json({ error: 'participant_ids is required and must be a non-empty array' }, { status: 400 });
    }

    const roomType = type || 'direct';

    const supabase = getSupabaseServer({ serviceRole: true });

    // Создаём комнату
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        type: roomType,
        context_type: context_type || null,
        context_id: context_id || null,
      })
      .select('*')
      .single();

    if (roomError) {
      return NextResponse.json({ error: roomError.message }, { status: 500 });
    }

    // Добавляем участников
    const participantRows = participant_ids.map((uid: string) => ({
      room_id: room.id,
      user_id: uid,
    }));

    const { error: pError } = await supabase
      .from('chat_participants')
      .insert(participantRows);

    if (pError) {
      return NextResponse.json({ error: pError.message }, { status: 500 });
    }

    return NextResponse.json({ data: room }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
