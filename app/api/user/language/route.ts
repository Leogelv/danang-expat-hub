import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';
import { cookies } from 'next/headers';

const VALID_LANGUAGES = ['en', 'ru', 'uk', 'vi'];

// POST /api/user/language - сохранение языка пользователя
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language, telegramId } = body;

    // Валидация языка
    if (!language || !VALID_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }

    // Устанавливаем cookie
    const cookieStore = await cookies();
    cookieStore.set('locale', language, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 год
      httpOnly: false, // Доступен из JS
      sameSite: 'lax',
    });

    // Если передан telegramId — обновляем в БД
    if (telegramId) {
      const supabase = getSupabaseServer({ serviceRole: true });

      const { error } = await supabase
        .from('tg_users')
        .update({ language })
        .eq('telegram_id', telegramId);

      if (error) {
        console.error('Failed to update user language in DB:', error);
        // Не возвращаем ошибку — cookie уже установлен
      }
    }

    return NextResponse.json({ success: true, language });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
