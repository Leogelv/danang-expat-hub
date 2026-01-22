'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  init,
  miniApp,
  postEvent,
  mountViewport,
  bindViewportCssVars,
  viewportSafeAreaInsets,
  viewportContentSafeAreaInsets,
  expandViewport,
} from '@telegram-apps/sdk-react';
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
    console.log('[TelegramProvider] init start');
    try {
      init();
      console.log('[TelegramProvider] SDK init ok');
    } catch (error) {
      console.warn('[TelegramProvider] SDK init failed', error);
    }

    const result = initTelegramFeatures();
    console.log('[TelegramProvider] initTelegramFeatures', {
      isTelegram: result.isTelegram,
      initDataLength: result.initData?.length ?? 0,
    });
    if (result.isTelegram) {
      try {
        miniApp.ready();
        miniApp.setBackgroundColor('#0B0B0F');
        miniApp.setHeaderColor('#0B0B0F');
        console.log('[TelegramProvider] miniApp ready + colors');
      } catch (error) {
        console.warn('[TelegramProvider] miniApp setup failed', error);
      }

      try {
        postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
        postEvent('web_app_request_fullscreen');
        console.log('[TelegramProvider] postEvent swipe/fullscreen sent');
      } catch (error) {
        console.warn('[TelegramProvider] postEvent failed', error);
      }

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

    setState({
      isTelegram: result.isTelegram,
      initData: result.initData,
      telegramUser: getTelegramUser(),
    });
    console.log('[TelegramProvider] final state', {
      isTelegram: result.isTelegram,
      initDataLength: result.initData?.length ?? 0,
      telegramUser: getTelegramUser(),
      webAppVersion: (window as any)?.Telegram?.WebApp?.version ?? null,
    });
  }, []);

  const value = useMemo(() => state, [state]);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
};
