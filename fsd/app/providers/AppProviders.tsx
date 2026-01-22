'use client';

import React from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { TelegramProvider } from './TelegramProvider';
import { AuthProvider } from './AuthProvider';

interface AppProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

// Провайдеры приложения: i18n -> Telegram -> Auth
export const AppProviders: React.FC<AppProvidersProps> = ({ children, locale, messages }) => (
  <NextIntlClientProvider locale={locale} messages={messages}>
    <TelegramProvider>
      <AuthProvider>{children}</AuthProvider>
    </TelegramProvider>
  </NextIntlClientProvider>
);
