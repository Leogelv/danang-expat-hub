'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getTelegramUser, initTelegramFeatures, type TelegramUser } from '@/fsd/shared/lib/telegram';

interface TelegramContextValue {
  isTelegram: boolean;
  initData: string | null;
  telegramUser: TelegramUser | null;
}

const TelegramContext = createContext<TelegramContextValue>({
  isTelegram: false,
  initData: null,
  telegramUser: null,
});

export const useTelegram = () => useContext(TelegramContext);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TelegramContextValue>({
    isTelegram: false,
    initData: null,
    telegramUser: null,
  });

  useEffect(() => {
    const result = initTelegramFeatures();
    setState({
      isTelegram: result.isTelegram,
      initData: result.initData,
      telegramUser: getTelegramUser(),
    });
  }, []);

  const value = useMemo(() => state, [state]);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
};
