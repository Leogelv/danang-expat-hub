'use client';

import React, { useState, useTransition } from 'react';
import clsx from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import { locales, localeNames, localeFlags, type Locale } from '@/fsd/shared/i18n/config';

export interface LanguageSelectorProps {
  onChange?: (locale: Locale) => void;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
}

// Селектор языка для настроек профиля
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onChange,
  onOpenChange,
  className,
}) => {
  const t = useTranslations('profile');
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Обёртка для синхронизации состояния с родителем
  const updateOpen = (value: boolean) => {
    setIsOpen(value);
    onOpenChange?.(value);
  };

  // Смена языка через cookie и перезагрузку
  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      updateOpen(false);
      return;
    }

    startTransition(() => {
      // Устанавливаем cookie
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;

      // Сохраняем в API (если есть авторизация)
      fetch('/api/user/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLocale }),
      }).catch(() => {
        // Игнорируем ошибки API
      });

      // Callback
      onChange?.(newLocale);

      // Перезагружаем страницу для применения нового языка
      window.location.reload();
    });
  };

  return (
    <div className={clsx('relative', className)}>
      <label className="block text-sm text-white/70 mb-2">{t('language')}</label>

      {/* Текущий язык (триггер) */}
      <button
        type="button"
        onClick={() => updateOpen(!isOpen)}
        disabled={isPending}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl',
          'bg-white/5 border border-white/15 text-white',
          'hover:bg-white/8 transition-colors',
          'disabled:opacity-50'
        )}
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">{localeFlags[currentLocale]}</span>
          <span className="font-medium">{localeNames[currentLocale]}</span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={clsx('w-5 h-5 transition-transform', isOpen && 'rotate-180')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => updateOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-slate-800 border border-white/10 rounded-xl overflow-hidden shadow-xl">
            {locales.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => handleLocaleChange(locale)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  locale === currentLocale
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-white/80 hover:bg-white/5'
                )}
              >
                <span className="text-xl">{localeFlags[locale]}</span>
                <span className="font-medium">{localeNames[locale]}</span>
                {locale === currentLocale && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 ml-auto">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

LanguageSelector.displayName = 'LanguageSelector';
