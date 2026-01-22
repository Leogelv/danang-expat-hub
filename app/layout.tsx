import type { Metadata, Viewport } from "next";
import { getLocale, getMessages } from "next-intl/server";
import "../fsd/app/styles/globals.css";
import { AppProviders } from "@/fsd/app/providers/AppProviders";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Danang Expat Hub",
  description: "AI-first mini app for expats in Danang",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Получаем локаль из cookie (серверная сторона)
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased font-montserrat">
        <AppProviders locale={locale} messages={messages}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
