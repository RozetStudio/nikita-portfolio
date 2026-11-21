export const SITE_NAME = "Никита";
export const SITE_ROLE = "фриланс-разработчик";

// TODO: задать реальный домен в .env (PUBLIC_SITE_URL)
export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL ?? "").trim();

// Ссылки на профили. Пока не известны — оставлены пустыми.
// Кнопки с пустым значением показывают «Ссылка скоро появится».
// TODO: заполнить позже (см. .env.example)
export const TELEGRAM_URL = (import.meta.env.TELEGRAM_URL ?? "").trim();
// TODO: заполнить позже (см. .env.example)
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
