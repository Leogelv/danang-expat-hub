import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validate as tmaValidate } from '@telegram-apps/init-data-node';

// Прямое подключение к Supabase Local БД (обходит JWT баг в новых версиях CLI)
const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres');

// JWT secret для Supabase Local (из supabase/config.toml или стандартный)
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';

// Bot token для валидации initData (ОБЯЗАТЕЛЬНО для продакшена)
// .trim() предотвращает проблемы с пробелами/переносами из .env файлов
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();

// Валидация initData через HMAC-SHA256 (защита от подделки)
// Двойная валидация: наш код + официальный @telegram-apps/init-data-node
function validateInitData(initData: string): { valid: boolean; reason?: string } {
  if (!BOT_TOKEN) {
    console.warn('[token-exchange] TELEGRAM_BOT_TOKEN not set, skipping validation (UNSAFE for production!)');
    return { valid: true };
  }

  try {
    // === Способ 1: Официальный пакет @telegram-apps/init-data-node ===
    try {
      tmaValidate(initData, BOT_TOKEN, { expiresIn: 0 }); // expiresIn: 0 = не проверять срок
      console.log('[token-exchange] ✅ tmaValidate PASSED');
      return { valid: true };
    } catch (tmaErr) {
      console.error('[token-exchange] ❌ tmaValidate FAILED:', tmaErr instanceof Error ? tmaErr.message : tmaErr);
    }

    // === Способ 2: Наша ручная валидация (для диагностики) ===
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      return { valid: false, reason: 'hash not found in initData' };
    }

    // Удаляем только hash (signature оставляем — официальный пакет его НЕ удаляет)
    params.delete('hash');
    const dataCheckArr: string[] = [];
    params.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // secret_key = HMAC-SHA256(key="WebAppData", data=bot_token)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();

    // computed_hash = HMAC-SHA256(key=secret_key, data=data_check_string)
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const isValid = computedHash === hash;
    if (!isValid) {
      console.error('[token-exchange] HMAC manual validation FAILED', {
        initDataLength: initData.length,
        initDataPreview: initData.substring(0, 80) + '...',
        botTokenPrefix: BOT_TOKEN.substring(0, 10) + '...',
        hashFromInitData: hash,
        computedHash,
        dataCheckStringLength: dataCheckString.length,
        dataCheckStringPreview: dataCheckString.substring(0, 120) + '...',
        paramKeys: dataCheckArr.map(p => p.split('=')[0]),
      });
      return { valid: false, reason: 'HMAC mismatch — both tmaValidate and manual check failed' };
    }

    return { valid: true };
  } catch (error) {
    console.error('[token-exchange] validation error', error);
    return { valid: false, reason: `Validation exception: ${error instanceof Error ? error.message : 'Unknown'}` };
  }
}

function parseTelegramUser(initData: string) {
  const params = new URLSearchParams(initData);
  const userParam = params.get('user');
  if (!userParam) return null;

  try {
    // URLSearchParams.get() уже URL-декодирует значение, поэтому JSON.parse напрямую
    return JSON.parse(userParam);
  } catch {
    // Fallback: если значение было закодировано дважды
    try {
      return JSON.parse(decodeURIComponent(userParam));
    } catch {
      console.error('[token-exchange] parseTelegramUser failed, raw value:', userParam.substring(0, 50));
      return null;
    }
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
    console.log('[token-exchange] === DEBUG START ===');
    console.log('[token-exchange] initData length', initData?.length ?? 0);
    console.log('[token-exchange] initData raw (first 500):', typeof initData === 'string' ? initData.substring(0, 500) : 'NOT_STRING');
    console.log('[token-exchange] BOT_TOKEN length:', BOT_TOKEN?.length ?? 0);
    console.log('[token-exchange] BOT_TOKEN value:', BOT_TOKEN ? BOT_TOKEN.substring(0, 20) + '...(rest hidden)' : 'NOT_SET');
    if (!initData || typeof initData !== 'string') {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }

    // Валидация HMAC подписи от Telegram
    const validation = validateInitData(initData);
    if (!validation.valid) {
      console.error('[token-exchange] validation rejected:', validation.reason);
      // TEMP: в dev режиме пропускаем валидацию чтобы не блокировать тестирование
      // TODO: убрать этот обход перед деплоем в прод!
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ALLOW_BROWSER_ACCESS === 'true') {
        console.warn('[token-exchange] ⚠️ BYPASSING validation in dev mode! REMOVE BEFORE PROD!');
      } else {
        return NextResponse.json(
          { error: 'Invalid initData signature', details: validation.reason },
          { status: 401 },
        );
      }
    } else {
      console.log('[token-exchange] initData validated OK');
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
