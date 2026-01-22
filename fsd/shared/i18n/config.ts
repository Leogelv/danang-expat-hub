// Конфигурация поддерживаемых языков
export const locales = ['en', 'ru', 'uk', 'vi'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українська',
  vi: 'Tiếng Việt',
};

export const defaultLocale: Locale = 'en';

// Флаги для языков (emoji)
export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  ru: '🇷🇺',
  uk: '🇺🇦',
  vi: '🇻🇳',
};
