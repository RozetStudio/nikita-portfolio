import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// Публичный адрес сайта задаётся в .env (PUBLIC_SITE_URL).
// Без него canonical/OG-ссылки и sitemap не генерируются.
const site = process.env.PUBLIC_SITE_URL?.trim() || undefined;

// GitHub Pages проекта живёт в /<repo>/, локально — в /.
// BASE_PATH задаётся в workflow; Astro отдаёт его через import.meta.env.BASE_URL.
const rawBase = process.env.BASE_PATH?.trim() || "/";
const base = rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}/`;

export default defineConfig({
  // TODO: задать реальный домен в .env, чтобы включить canonical и sitemap
  ...(site ? { site } : {}),
  base,
  output: "static",
  integrations: [react(), ...(site ? [sitemap()] : [])],
  // CSP с автоматическими хэшами для инлайн-скриптов/стилей Astro.
  // Мета-тег покрывает script-src/style-src; frame-ancestors остаётся в nginx.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      // Инлайн style-атрибуты (визуальные компоненты) — только для атрибутов,
      // стилевые элементы получают хэши автоматически.
      styleDirective: {
        resources: ["'self'", { resource: "'unsafe-inline'", kind: "attribute" }],
      },
    },
  },
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
