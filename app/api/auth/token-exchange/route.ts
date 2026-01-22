import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServer } from '@/fsd/shared/lib/supabase';

function parseTelegramUser(initData: string) {
  const params = new URLSearchParams(initData);
  const userParam = params.get('user');
  if (!userParam) return null;

  try {
    return JSON.parse(decodeURIComponent(userParam));
  } catch {
    return null;
  }
}

function generateAuthPassword(telegramId: number): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback_secret';
  const hash = Buffer.from(`${telegramId}_${secret}`).toString('base64');
  return hash.substring(0, 32);
}

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();
    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }

    const telegramUser = parseTelegramUser(initData);
    if (!telegramUser?.id) {
      return NextResponse.json({ error: 'Invalid initData' }, { status: 401 });
    }

    const adminClient = getSupabaseServer({ serviceRole: true });

    const { data: tgUser, error: tgUserError } = await adminClient
      .from('tg_users')
      .upsert(
        {
          telegram_id: telegramUser.id,
          username: telegramUser.username,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          photo_url: telegramUser.photo_url,
        },
        { onConflict: 'telegram_id' },
      )
      .select()
      .single();

    if (tgUserError || !tgUser) {
      return NextResponse.json({ error: 'Failed to upsert user' }, { status: 500 });
    }

    const email = `telegram_${telegramUser.id}@telegram.internal`;
    const password = generateAuthPassword(telegramUser.id);

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    let { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      await adminClient.auth.admin.createUser({
        id: tgUser.id,
        email,
        password,
        email_confirm: true,
        user_metadata: { telegram_id: telegramUser.id, username: telegramUser.username },
      });

      const retry = await anonClient.auth.signInWithPassword({ email, password });
      signInData = retry.data;
      signInError = retry.error;
    }

    if (signInError || !signInData.session) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      user: tgUser,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
