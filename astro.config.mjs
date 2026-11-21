import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Публичный адрес сайта задаётся в .env (PUBLIC_SITE_URL).
// Без него canonical/OG-ссылки и sitemap не генерируются.
const site = process.env.PUBLIC_SITE_URL?.trim() || undefined;

export default defineConfig({
  // TODO: задать реальный домен в .env, чтобы включить canonical и sitemap
  ...(site ? { site } : {}),
  output: "static",
  integrations: [react(), ...(site ? [sitemap()] : [])],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Для dev-контейнера на Windows: hot reload через polling
      watch: {
        usePolling: process.env.CHOKIDAR_USEPOLLING === "true",
        interval: 300,
      },
    },
  },
});
