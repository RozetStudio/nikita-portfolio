export const SITE_NAME = "Никита";
export const SITE_ROLE = "фриланс-разработчик";

// TODO: задать реальный домен в .env (PUBLIC_SITE_URL)
export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL ?? "").trim();

// Базовый путь: "/" локально и "/<repo>/" на GitHub Pages.
// Astro подставляет сюда astro.config.base на этапе сборки.
const rawBase = import.meta.env.BASE_URL || "/";
export const BASE_PATH = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

/** Префикс пути с учётом base (для ссылок и public-ассетов). */
export function withBase(path: string): string {
  return `${BASE_PATH}${path.replace(/^\//, "")}`;
}

// Ссылки на профили. Задаются в .env; пустая строка → заглушка.
// Кнопки с пустым значением показывают «Ссылка скоро появится».
export const TELEGRAM_URL = (import.meta.env.TELEGRAM_URL ?? "").trim();
export const VK_URL = (import.meta.env.VK_URL ?? "").trim();

/** Пункты навигации (якоря главной страницы). */
export const NAV_LINKS = [
  { href: "#services", label: "Услуги" },
  { href: "#portfolio", label: "Портфолио" },
  { href: "#contact", label: "Контакты" },
] as const;

/** Заглушка: пустая строка, "#" или "TODO". */
export function isPlaceholder(url: string | undefined): boolean {
  if (!url) return true;
  const v = url.trim();
  return v === "" || v.startsWith("#") || v.toLowerCase() === "todo";
}
