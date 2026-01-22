'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  init,
  isTMA,
  miniApp,
  postEvent,
  mountBackButton,
  mountViewport,
  bindViewportCssVars,
  viewportSafeAreaInsets,
  viewportContentSafeAreaInsets,
  expandViewport,
} from '@telegram-apps/sdk-react';
import { getTelegramUser, getTelegramInitData, type TelegramUser } from '@/fsd/shared/lib/telegram';

interface TelegramContextValue {
  isTelegram: boolean;
  initData: string | null;
  telegramUser: TelegramUser | null;
  isReady: boolean; // флаг что инициализация завершена
}

const TelegramContext = createContext<TelegramContextValue>({
  isTelegram: false,
  initData: null,
  telegramUser: null,
  isReady: false,
});

export const useTelegram = () => useContext(TelegramContext);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TelegramContextValue>({
    isTelegram: false,
    initData: null,
    telegramUser: null,
    isReady: false,
  });

  useEffect(() => {
    console.log('[TelegramProvider] init start');

    // Проверяем окружение через SDK функцию isTMA()
    let insideTelegram = false;
    try {
      insideTelegram = isTMA();
      console.log('[TelegramProvider] isTMA() =', insideTelegram);
    } catch (err) {
      console.warn('[TelegramProvider] isTMA() check failed', err);
      // Fallback на window.Telegram.WebApp
      insideTelegram = typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp;
      console.log('[TelegramProvider] fallback check =', insideTelegram);
    }

    // Инициализируем SDK
    try {
      init();
      console.log('[TelegramProvider] SDK init() ok');
    } catch (error) {
      console.warn('[TelegramProvider] SDK init() failed', error);
    }

    if (insideTelegram) {
      // Монтируем back button
      try {
        mountBackButton();
        console.log('[TelegramProvider] mountBackButton() ok');
      } catch (error) {
        console.warn('[TelegramProvider] mountBackButton failed', error);
      }

      // miniApp ready и цвета
      try {
        if (miniApp && typeof miniApp.mount === 'function') {
          miniApp.mount();
          console.log('[TelegramProvider] miniApp.mount() ok');
        }
        if (miniApp && typeof miniApp.ready === 'function') {
          miniApp.ready();
          console.log('[TelegramProvider] miniApp.ready() ok');
        }
        if (miniApp && typeof miniApp.setBackgroundColor === 'function') {
          miniApp.setBackgroundColor('#0B0B0F');
        }
        if (miniApp && typeof miniApp.setHeaderColor === 'function') {
          miniApp.setHeaderColor('#0B0B0F');
        }
        console.log('[TelegramProvider] miniApp colors set');
      } catch (error) {
        console.warn('[TelegramProvider] miniApp setup failed', error);
      }

      // postEvent для fullscreen и swipe
      try {
        postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
        postEvent('web_app_request_fullscreen');
        console.log('[TelegramProvider] postEvent swipe/fullscreen sent');
      } catch (error) {
        console.warn('[TelegramProvider] postEvent failed', error);
      }

      // Viewport и safe area
      try {
        if (mountViewport.isAvailable && mountViewport.isAvailable()) {
          mountViewport();
          console.log('[TelegramProvider] viewport mounted');
        }
        if (bindViewportCssVars.isAvailable && bindViewportCssVars.isAvailable()) {
          bindViewportCssVars();
          console.log('[TelegramProvider] viewport css vars bound');
        }
        if (expandViewport.isAvailable && expandViewport.isAvailable()) {
          expandViewport();
          console.log('[TelegramProvider] viewport expanded');
        }

        const safe = viewportSafeAreaInsets() ?? {};
        const content = viewportContentSafeAreaInsets() ?? {};
        const root = document.documentElement;
        const safeTop = safe.top ?? 0;
        const safeBottom = safe.bottom ?? 0;
        const safeLeft = safe.left ?? 0;
        const safeRight = safe.right ?? 0;
        const contentTop = content.top ?? 0;
        const contentBottom = content.bottom ?? 0;

        root.style.setProperty('--tg-safe-area-inset-top', `${safeTop}px`);
        root.style.setProperty('--tg-safe-area-inset-bottom', `${safeBottom}px`);
        root.style.setProperty('--tg-safe-area-inset-left', `${safeLeft}px`);
        root.style.setProperty('--tg-safe-area-inset-right', `${safeRight}px`);
        root.style.setProperty('--tg-content-safe-area-inset-top', `${contentTop}px`);
        root.style.setProperty('--tg-content-safe-area-inset-bottom', `${contentBottom}px`);
        root.style.setProperty('--tg-total-safe-area-top', `${safeTop + contentTop}px`);
        root.style.setProperty('--tg-total-safe-area-bottom', `${safeBottom + contentBottom}px`);
        console.log('[TelegramProvider] safe area vars', {
          safeTop,
          safeBottom,
          safeLeft,
          safeRight,
          contentTop,
          contentBottom,
        });
      } catch (error) {
        console.warn('[TelegramProvider] viewport/safe area setup failed', error);
      }
    }

    // Получаем данные через SDK функции
    const initData = getTelegramInitData();
    const telegramUser = getTelegramUser();

    setState({
      isTelegram: insideTelegram,
      initData,
      telegramUser,
      isReady: true, // Инициализация завершена
    });

    console.log('[TelegramProvider] final state', {
      isTelegram: insideTelegram,
      initDataLength: initData?.length ?? 0,
      telegramUser,
      webAppVersion: (window as any)?.Telegram?.WebApp?.version ?? null,
    });
  }, []);

  const value = useMemo(() => state, [state]);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
};
