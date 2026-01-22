import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Прямое подключение к Supabase Local БД (обходит JWT баг в новых версиях CLI)
const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres');

// JWT secret для Supabase Local (из supabase/config.toml или стандартный)
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';

// Bot token для валидации initData (ОБЯЗАТЕЛЬНО для продакшена)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Валидация initData через HMAC-SHA256 (защита от подделки)
function validateInitData(initData: string): boolean {
  if (!BOT_TOKEN) {
    // В dev режиме без токена пропускаем валидацию (но логируем warning)
    console.warn('[token-exchange] TELEGRAM_BOT_TOKEN not set, skipping validation (UNSAFE for production!)');
    return true;
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      console.error('[token-exchange] hash not found in initData');
      return false;
    }

    // Собираем data-check-string (все параметры кроме hash, отсортированные)
    params.delete('hash');
    const dataCheckArr: string[] = [];
    params.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // secret_key = HMAC-SHA256("WebAppData", bot_token)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();

    // computed_hash = HMAC-SHA256(data_check_string, secret_key)
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const isValid = computedHash === hash;
    if (!isValid) {
      console.error('[token-exchange] HMAC validation failed', {
        expected: hash.substring(0, 16) + '...',
        computed: computedHash.substring(0, 16) + '...',
      });
    }
    return isValid;
  } catch (error) {
    console.error('[token-exchange] validation error', error);
    return false;
  }
}

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

// Генерируем JWT токены напрямую (обходит сломанный GoTrue)
function generateTokens(userId: string, email: string) {
  const now = Math.floor(Date.now() / 1000);
  const accessTokenExpiry = now + 3600; // 1 час
  const refreshTokenExpiry = now + 60 * 60 * 24 * 7; // 7 дней

  const accessToken = jwt.sign(
    {
      aud: 'authenticated',
      exp: accessTokenExpiry,
      iat: now,
      iss: 'supabase',
      sub: userId,
      email: email,
      role: 'authenticated',
      session_id: crypto.randomUUID(),
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  const refreshToken = jwt.sign(
    {
      aud: 'authenticated',
      exp: refreshTokenExpiry,
      iat: now,
      iss: 'supabase',
      sub: userId,
      session_id: crypto.randomUUID(),
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  return { accessToken, refreshToken };
}

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();
    console.log('[token-exchange] initData length', initData?.length ?? 0);
    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }

    // Валидация HMAC подписи от Telegram
    if (!validateInitData(initData)) {
      return NextResponse.json({ error: 'Invalid initData signature' }, { status: 401 });
    }
    console.log('[token-exchange] initData validated');

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

    // Проверяем/создаём auth user
    let authUserId: string;
    const existingAuthUsers = await sql`
      SELECT id FROM auth.users WHERE email = ${email}
    `;

    if (existingAuthUsers.length > 0) {
      authUserId = existingAuthUsers[0].id;
      console.log('[token-exchange] auth user exists', authUserId);
    } else {
      // Создаём нового auth юзера через прямой SQL INSERT
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
          crypt('telegram_auth_' || ${telegramUser.id.toString()}, gen_salt('bf')),
          now(),
          ${sql.json({ provider: 'email', providers: ['email'] })},
          ${sql.json({ telegram_id: telegramUser.id, username: telegramUser.username })},
          now(),
          now()
        )
        RETURNING id
      `;

      if (newAuthUsers.length === 0) {
        return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
      }

      authUserId = newAuthUsers[0].id;
      console.log('[token-exchange] auth user created', authUserId);

      // Создаём identity
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
          ${sql.json({ sub: authUserId, email: email })},
          'email',
          ${email},
          now(),
          now(),
          now()
        )
      `;
      console.log('[token-exchange] identity created');
    }

    // Генерируем JWT токены напрямую (обходит сломанный GoTrue)
    const { accessToken, refreshToken } = generateTokens(authUserId, email);
    console.log('[token-exchange] tokens generated for user', authUserId);

    // Связываем tg_user с auth user если ещё не связан
    await sql`
      UPDATE public.tg_users
      SET id = ${authUserId}
      WHERE telegram_id = ${telegramUser.id} AND id != ${authUserId}
    `.catch(() => {
      // Игнорируем ошибку если id уже совпадает или есть конфликт
    });

    console.log('[token-exchange] success');
    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { ...tgUser, id: authUserId },
    });
  } catch (error) {
    console.error('[token-exchange] error', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 },
    );
  }
}
