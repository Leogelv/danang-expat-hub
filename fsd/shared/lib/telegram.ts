import { postEvent, isTMA, retrieveRawInitData, retrieveLaunchParams } from '@telegram-apps/sdk-react';

const EVENT_REQUEST_FULLSCREEN = 'web_app_request_fullscreen' as const;

export type TelegramWebApp = {
  initData?: string;
  initDataUnsafe?: { user?: TelegramUser };
  version?: string;
  ready?: () => void;
  expand?: () => void;
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
  setBackgroundColor?: (color: string) => void;
  setHeaderColor?: (color: string) => void;
  safeAreaInset?: { top?: number; bottom?: number; left?: number; right?: number };
  contentSafeAreaInset?: { top?: number; bottom?: number; left?: number; right?: number };
};

export type TelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
};

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  return (window as any).Telegram?.WebApp ?? null;
}

// Проверка окружения Telegram через SDK (более надёжно)
export function isTelegramEnvironment(): boolean {
  try {
    return isTMA();
  } catch {
    // Fallback на проверку window.Telegram.WebApp
    return !!getTelegramWebApp();
  }
}

// Получение initData — приоритет: стандартный WebApp API, затем SDK
export function getTelegramInitData(): string | null {
  // Способ 1: window.Telegram.WebApp.initData — самый надёжный, стандартный API Telegram
  const tg = getTelegramWebApp();
  if (tg?.initData && tg.initData.length > 0) {
    console.log('[getTelegramInitData] via window.Telegram.WebApp.initData', {
      length: tg.initData.length,
      preview: tg.initData.substring(0, 80),
      hasHash: tg.initData.includes('hash='),
    });
    return tg.initData;
  }

  // Способ 2: через retrieveRawInitData (SDK bridge)
  try {
    const rawData = retrieveRawInitData?.();
    if (rawData && rawData.length > 0) {
      console.log('[getTelegramInitData] via retrieveRawInitData', {
        length: rawData.length,
        preview: rawData.substring(0, 80),
      });
      return rawData;
    }
  } catch (e) {
    console.warn('[getTelegramInitData] retrieveRawInitData failed', e);
  }

  // Способ 3: через launchParams.initDataRaw
  try {
    const launchParams = retrieveLaunchParams?.();
    const rawFromParams = (launchParams as any)?.initDataRaw;
    if (rawFromParams && rawFromParams.length > 0) {
      console.log('[getTelegramInitData] via launchParams.initDataRaw', {
        length: rawFromParams.length,
        preview: rawFromParams.substring(0, 80),
      });
      return rawFromParams;
    }
  } catch (e) {
    console.warn('[getTelegramInitData] launchParams.initDataRaw failed', e);
  }

  console.warn('[getTelegramInitData] no initData found from any source');
  return null;
}

// Получение пользователя через SDK
export function getTelegramUser(): TelegramUser | null {
  try {
    const launchParams = retrieveLaunchParams?.();
    if (launchParams?.tgWebAppData?.user) {
      const u = launchParams.tgWebAppData.user as {
        id: number;
        username?: string;
        firstName?: string;
        lastName?: string;
        photoUrl?: string;
      };
      return {
        id: u.id,
        username: u.username,
        first_name: u.firstName,
        last_name: u.lastName,
        photo_url: u.photoUrl,
      };
    }
  } catch {
    // Вне Telegram - нормально
  }
  // Fallback
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user ?? null;
}

export function requestFullscreen(): boolean {
  try {
    const tg = getTelegramWebApp();
    if (!tg) return false;

    if (typeof tg.requestFullscreen === 'function') {
      tg.requestFullscreen();
      return true;
    }

    postEvent(EVENT_REQUEST_FULLSCREEN);
    return true;
  } catch {
    return false;
  }
}

export function expandApp(): boolean {
  try {
    const tg = getTelegramWebApp();
    if (!tg) return false;
    if (typeof tg.expand === 'function') {
      tg.expand();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function bindTelegramSafeAreaVars(): void {
  if (typeof document === 'undefined') return;
  const tg = getTelegramWebApp();
  const root = document.documentElement;

  const safe = tg?.safeAreaInset ?? {};
  const content = tg?.contentSafeAreaInset ?? {};

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
}

export function initTelegramFeatures(): { isTelegram: boolean; initData: string | null } {
  // Используем SDK-проверку окружения
  const inTelegram = isTelegramEnvironment();
  if (!inTelegram) return { isTelegram: false, initData: null };

  const tg = getTelegramWebApp();
  try {
    tg?.ready?.();
    tg?.setBackgroundColor?.('#0B0B0F');
    tg?.setHeaderColor?.('#0B0B0F');
  } catch {
    // ignore
  }

  expandApp();
  requestFullscreen();
  bindTelegramSafeAreaVars();

  // Получаем initData через SDK
  const initData = getTelegramInitData();
  return { isTelegram: true, initData };
}
