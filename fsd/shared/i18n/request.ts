import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async () => {
  // Читаем язык из cookie (установленный из профиля пользователя)
  const store = await cookies();
  const cookieLocale = store.get('locale')?.value as Locale | undefined;

  const locale =
    cookieLocale && locales.includes(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    timeZone: 'Asia/Ho_Chi_Minh',
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
