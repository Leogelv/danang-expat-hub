import { postEvent } from '@telegram-apps/sdk-react';

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

export function isTelegramEnvironment(): boolean {
  return !!getTelegramWebApp();
}

export function getTelegramInitData(): string | null {
  const tg = getTelegramWebApp();
  return tg?.initData ?? null;
}

export function getTelegramUser(): TelegramUser | null {
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
  const tg = getTelegramWebApp();
  if (!tg) return { isTelegram: false, initData: null };

  try {
    tg.ready?.();
    tg.setBackgroundColor?.('#0B0B0F');
    tg.setHeaderColor?.('#0B0B0F');
  } catch {
    // ignore
  }

  expandApp();
  requestFullscreen();
  bindTelegramSafeAreaVars();

  return { isTelegram: true, initData: tg.initData ?? null };
}
