import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

// POST /api/chat/translate — перевод сообщения (с кэшированием)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message_id, target_language, text } = body;

    // Валидация
    if (!message_id) {
      return NextResponse.json({ error: 'message_id is required' }, { status: 400 });
    }
    if (!target_language) {
      return NextResponse.json({ error: 'target_language is required' }, { status: 400 });
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer({ serviceRole: true });

    // Проверяем кэш — есть ли уже перевод
    const { data: cached, error: cacheError } = await supabase
      .from('chat_message_translations')
      .select('*')
      .eq('message_id', message_id)
      .eq('target_language', target_language)
      .single();

    // Если перевод уже есть — возвращаем из кэша
    if (!cacheError && cached) {
      return NextResponse.json({ data: cached, cached: true });
    }

    // Сохраняем новый перевод
    const { data, error } = await supabase
      .from('chat_message_translations')
      .insert({
        message_id,
        target_language,
        translated_text: text.trim(),
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, cached: false }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
