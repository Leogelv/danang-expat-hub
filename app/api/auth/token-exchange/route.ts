import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';

// Прямое подключение к Supabase Local БД (обходит JWT баг в новых версиях CLI)
const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres');

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
    console.log('[token-exchange] initData length', initData?.length ?? 0);
    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }

    const telegramUser = parseTelegramUser(initData);
    console.log('[token-exchange] parsed telegram user', telegramUser);
    if (!telegramUser?.id) {
      return NextResponse.json({ error: 'Invalid initData' }, { status: 401 });
    }

    // Upsert в tg_users через SQL
    const tgUsers = await sql`
      INSERT INTO public.tg_users (telegram_id, username, first_name, last_name, photo_url)
      VALUES (${telegramUser.id}, ${telegramUser.username || null}, ${telegramUser.first_name || null}, ${telegramUser.last_name || null}, ${telegramUser.photo_url || null})
      ON CONFLICT (telegram_id) DO UPDATE SET
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        photo_url = EXCLUDED.photo_url
      RETURNING *
    `;

    if (tgUsers.length === 0) {
      console.error('[token-exchange] upsert failed');
      return NextResponse.json({ error: 'Failed to upsert user' }, { status: 500 });
    }

    const tgUser = tgUsers[0];
    console.log('[token-exchange] tg_user upserted', tgUser.id);

    const email = `telegram_${telegramUser.id}@telegram.internal`;
    const password = generateAuthPassword(telegramUser.id);

    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Пробуем залогиниться
    let { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.warn('[token-exchange] signIn failed, creating user via SQL', signInError.message);

      // Проверяем существует ли auth user
      const existingAuthUsers = await sql`
        SELECT id FROM auth.users WHERE email = ${email}
      `;

      if (existingAuthUsers.length > 0) {
        // Юзер существует - обновляем пароль через SQL
        console.log('[token-exchange] auth user exists, updating password via SQL');
        await sql`
          UPDATE auth.users
          SET encrypted_password = crypt(${password}, gen_salt('bf')),
              updated_at = now()
          WHERE email = ${email}
        `;
      } else {
        // Создаём нового auth юзера через прямой SQL INSERT (обходит JWT баг)
        console.log('[token-exchange] creating auth user via SQL');
        const newAuthUsers = await sql`
          INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
          ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            ${email},
            crypt(${password}, gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            ${JSON.stringify({ telegram_id: telegramUser.id, username: telegramUser.username })}::jsonb,
            now(),
            now()
          )
          RETURNING id
        `;

        if (newAuthUsers.length > 0) {
          const authUserId = newAuthUsers[0].id;
          console.log('[token-exchange] auth user created', authUserId);

          // Создаём identity для корректной работы Auth
          await sql`
            INSERT INTO auth.identities (
              id,
              user_id,
              identity_data,
              provider,
              provider_id,
              last_sign_in_at,
              created_at,
              updated_at
            ) VALUES (
              gen_random_uuid(),
              ${authUserId},
              ${JSON.stringify({ sub: authUserId, email: email })}::jsonb,
              'email',
              ${email},
              now(),
              now(),
              now()
            )
          `;
          console.log('[token-exchange] identity created');
        }
      }

      // Повторяем signIn
      const retry = await anonClient.auth.signInWithPassword({ email, password });
      signInData = retry.data;
      signInError = retry.error;
    }

    if (signInError || !signInData.session) {
      console.error('[token-exchange] signIn failed after retry', signInError);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    console.log('[token-exchange] success, session created');
    return NextResponse.json({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      user: tgUser,
    });
  } catch (error) {
    console.error('[token-exchange] error', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
