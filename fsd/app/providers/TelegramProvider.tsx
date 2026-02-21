'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  init,
  isTMA,
  miniApp,
  postEvent,
  mountBackButton,
  unmountBackButton,
  mountViewport,
  unmountViewport,
  bindViewportCssVars,
  isViewportMounted,
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
    let disposed = false;

    const bindSafeAreaCssVars = () => {
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
    };

    const requestSafeAreaFallback = () => {
      try {
        postEvent('web_app_request_safe_area');
        postEvent('web_app_request_content_safe_area');
        console.log('[TelegramProvider] safe area fallback events sent');
      } catch (error) {
        console.warn('[TelegramProvider] safe area fallback events failed', error);
      }
    };

    const initViewportWithSafeArea = async () => {
      try {
        if (mountViewport.isAvailable && !mountViewport.isAvailable()) {
          console.warn('[TelegramProvider] mountViewport is not available');
          return false;
        }

        await mountViewport();
        console.log('[TelegramProvider] viewport mounted');

        if (bindViewportCssVars.isAvailable && bindViewportCssVars.isAvailable()) {
          bindViewportCssVars();
          console.log('[TelegramProvider] viewport css vars bound');
        }

        if (expandViewport.isAvailable && expandViewport.isAvailable()) {
          expandViewport();
          console.log('[TelegramProvider] viewport expanded');
        }

        bindSafeAreaCssVars();
        return true;
      } catch (error) {
        console.warn('[TelegramProvider] viewport/safe area setup failed', error);
        return false;
      }
    };

    const run = async () => {
      console.log('[TelegramProvider] init start');

      let insideTelegram = false;
      try {
        insideTelegram = isTMA();
        console.log('[TelegramProvider] isTMA() =', insideTelegram);
      } catch (err) {
        console.warn('[TelegramProvider] isTMA() check failed', err);
        insideTelegram = typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp;
        console.log('[TelegramProvider] fallback check =', insideTelegram);
      }

      try {
        init();
        console.log('[TelegramProvider] SDK init() ok');
      } catch (error) {
        console.warn('[TelegramProvider] SDK init() failed', error);
      }

      if (insideTelegram) {
        try {
          mountBackButton();
          console.log('[TelegramProvider] mountBackButton() ok');
        } catch (error) {
          console.warn('[TelegramProvider] mountBackButton failed', error);
        }

        try {
          if (miniApp && typeof miniApp.mount === 'function') {
            await miniApp.mount();
            console.log('[TelegramProvider] miniApp.mount() ok');
          }
        } catch (mountErr) {
          console.warn('[TelegramProvider] miniApp.mount() failed', mountErr);
        }

        try {
          if (miniApp && typeof miniApp.ready === 'function') {
            miniApp.ready();
            console.log('[TelegramProvider] miniApp.ready() ok');
          }
        } catch (readyErr) {
          console.warn('[TelegramProvider] miniApp.ready() failed', readyErr);
        }

        try {
          if (miniApp && typeof miniApp.setBackgroundColor === 'function') {
            miniApp.setBackgroundColor('#0B0B0F');
            console.log('[TelegramProvider] setBackgroundColor ok');
          }
        } catch (bgErr) {
          console.warn('[TelegramProvider] setBackgroundColor failed', bgErr);
        }

        try {
          if (miniApp && typeof miniApp.setHeaderColor === 'function') {
            miniApp.setHeaderColor('#0B0B0F');
            console.log('[TelegramProvider] setHeaderColor ok');
          }
        } catch (headerErr) {
          console.warn('[TelegramProvider] setHeaderColor failed', headerErr);
        }

        try {
          postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
          postEvent('web_app_request_fullscreen');
          console.log('[TelegramProvider] postEvent swipe/fullscreen sent');
        } catch (error) {
          console.warn('[TelegramProvider] postEvent failed', error);
        }

        const viewportInitialized = await initViewportWithSafeArea();
        let viewportMounted = false;
        try {
          viewportMounted = isViewportMounted();
        } catch {
          viewportMounted = false;
        }

        if (!viewportInitialized || !viewportMounted) {
          requestSafeAreaFallback();
        }
      }

      const initData = getTelegramInitData();
      const telegramUser = getTelegramUser();

      if (disposed) return;

      setState({
        isTelegram: insideTelegram,
        initData,
        telegramUser,
        isReady: true,
      });

      console.log('[TelegramProvider] final state', {
        isTelegram: insideTelegram,
        initDataLength: initData?.length ?? 0,
        telegramUser,
        webAppVersion: (window as any)?.Telegram?.WebApp?.version ?? null,
      });
    };

    void run();

    return () => {
      disposed = true;
      try {
        unmountBackButton();
      } catch (error) {
        console.warn('[TelegramProvider] unmountBackButton failed', error);
      }

      try {
        if (isViewportMounted()) {
          unmountViewport();
        }
      } catch (error) {
        console.warn('[TelegramProvider] unmountViewport failed', error);
      }
    };
  }, []);

  const value = useMemo(() => state, [state]);

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
};
