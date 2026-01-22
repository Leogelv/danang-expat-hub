import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Подключаем next-intl с кастомным путём к конфигу
const withNextIntl = createNextIntlPlugin("./fsd/shared/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
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
