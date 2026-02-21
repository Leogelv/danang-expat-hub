import { vi } from 'vitest';

// Мок useTranslations — возвращает ключ как строку
export const useTranslations = vi.fn((namespace?: string) => {
  return (key: string) => key;
});

// Мок NextIntlClientProvider
export const NextIntlClientProvider = ({ children }: { children: React.ReactNode }) => children;

// Мок для серверных функций
export const getLocale = vi.fn().mockResolvedValue('en');
export const getMessages = vi.fn().mockResolvedValue({});
export const getTranslations = vi.fn((namespace?: string) => {
  return (key: string) => key;
});
