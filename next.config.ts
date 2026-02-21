import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Подключаем next-intl с кастомным путём к конфигу
const withNextIntl = createNextIntlPlugin("./fsd/shared/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  // Разрешаем dev-запросы с локальной сети (для тестирования на устройствах)
  allowedDevOrigins: ["172.20.10.2", "localhost", "127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
