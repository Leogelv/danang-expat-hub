'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabaseClient } from '@/fsd/shared/lib/supabase';
import type { TgUser } from '@/fsd/shared/types';
import { useTelegram } from './TelegramProvider';

interface AuthContextValue {
  user: TgUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  error?: string | null;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  status: 'loading',
  error: null,
  signOut: async () => {},
  refresh: async () => {},
});

export const useAuth = () => useContext(AuthContext);

async function fetchProfile(userId: string): Promise<TgUser | null> {
  const { data, error } = await supabaseClient
    .from('tg_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as TgUser;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initData, isTelegram, telegramUser } = useTelegram();
  const [user, setUser] = useState<TgUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');
  const [error, setError] = useState<string | null>(null);
  const allowBrowser = process.env.NEXT_PUBLIC_ALLOW_BROWSER_ACCESS === 'true';

  const runAuth = async () => {
    console.log('[AuthProvider] runAuth start', {
      initDataLength: initData?.length ?? 0,
      isTelegram,
      hasTelegramUser: !!telegramUser,
    });
    setStatus('loading');
    setError(null);

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      console.log('[AuthProvider] existing session', {
        hasSession: !!session,
        userId: session?.user?.id ?? null,
      });
      if (session?.user?.id) {
        const profile = await fetchProfile(session.user.id);
        console.log('[AuthProvider] profile fetch result', { hasProfile: !!profile });
        if (profile) {
          setUser(profile);
          setStatus('authenticated');
          return;
        }
      }

      if (!initData) {
        if (allowBrowser && telegramUser) {
          console.log('[AuthProvider] allowBrowser fallback');
          setUser({
            id: `demo-${telegramUser.id}`,
            telegram_id: telegramUser.id,
            username: telegramUser.username ?? null,
            first_name: telegramUser.first_name ?? null,
            last_name: telegramUser.last_name ?? null,
            photo_url: telegramUser.photo_url ?? null,
          });
          setStatus('authenticated');
          return;
        }

        console.warn('[AuthProvider] missing initData', { isTelegram });
        setStatus(isTelegram ? 'unauthenticated' : 'error');
        setError(isTelegram ? 'Telegram init data missing' : 'Open this app inside Telegram');
        return;
      }

      console.log('[AuthProvider] token-exchange start');
      const response = await fetch('/api/auth/token-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        console.error('[AuthProvider] token-exchange failed', payload);
        setStatus('error');
        setError(payload.error || 'Token exchange failed');
        return;
      }

      const payload = await response.json();
      console.log('[AuthProvider] token-exchange ok', {
        hasAccessToken: !!payload?.access_token,
        hasRefreshToken: !!payload?.refresh_token,
        userId: payload?.user?.id ?? null,
      });
      if (!payload?.access_token || !payload?.refresh_token) {
        setStatus('error');
        setError('Invalid auth payload');
        return;
      }

      console.log('[AuthProvider] setSession start');
      await supabaseClient.auth.setSession({
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
      });

      console.log('[AuthProvider] setSession ok');
      setUser(payload.user ?? null);
      setStatus('authenticated');
    } catch (err) {
      console.error('[AuthProvider] runAuth error', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Auth error');
    }
  };

  useEffect(() => {
    runAuth();
  }, [initData, isTelegram]);

  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AuthProvider] auth state change', {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id ?? null,
      });
      if (!session?.user?.id) {
        setUser(null);
        setStatus('unauthenticated');
        return;
      }
      const profile = await fetchProfile(session.user.id);
      setUser(profile);
      setStatus(profile ? 'authenticated' : 'unauthenticated');
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    setStatus('unauthenticated');
  };

  const value = useMemo(
    () => ({ user, status, error, signOut, refresh: runAuth }),
    [user, status, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
