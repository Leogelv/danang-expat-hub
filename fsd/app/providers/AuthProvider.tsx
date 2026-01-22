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
    setStatus('loading');
    setError(null);

    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user?.id) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser(profile);
          setStatus('authenticated');
          return;
        }
      }

      if (!initData) {
        if (allowBrowser && telegramUser) {
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

        setStatus(isTelegram ? 'unauthenticated' : 'error');
        setError(isTelegram ? 'Telegram init data missing' : 'Open this app inside Telegram');
        return;
      }

      const response = await fetch('/api/auth/token-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setStatus('error');
        setError(payload.error || 'Token exchange failed');
        return;
      }

      const payload = await response.json();
      if (!payload?.access_token || !payload?.refresh_token) {
        setStatus('error');
        setError('Invalid auth payload');
        return;
      }

      await supabaseClient.auth.setSession({
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
      });

      setUser(payload.user ?? null);
      setStatus('authenticated');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Auth error');
    }
  };

  useEffect(() => {
    runAuth();
  }, [initData, isTelegram]);

  useEffect(() => {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
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
