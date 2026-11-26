import Lenis from "lenis";

/** Высота фиксированной шапки (см. Header.astro). */
const HEADER_HEIGHT = 72;
/** Небольшой зазор между шапкой и содержимым секции. */
const HEADER_GAP = 8;

/**
 * Плавный скролл (Lenis) и якоря.
 * При клике по якорю содержимое секции (её заголовок) прижимается
 * к верху экрана сразу под шапкой: учитываем paddingTop секции.
 * Отключается при prefers-reduced-motion.
 */
export function initSmoothScroll(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const lenis = new Lenis({ autoRaf: true, lerp: 0.12, smoothWheel: true });
  let pendingHash: string | null = null;

  const scrollToAnchor = (href: string): boolean => {
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return false;

    // Позиция заголовка секции: верх секции + её внутренний отступ сверху.
    const rect = target.getBoundingClientRect();
    const paddingTop = Number.parseFloat(getComputedStyle(target).paddingTop) || 0;
    const docTop = window.scrollY + rect.top + paddingTop;
    const scrollToY = Math.max(0, docTop - HEADER_HEIGHT - HEADER_GAP);

    lenis.scrollTo(scrollToY, { duration: 1.1 });
    history.replaceState(null, "", href);
    return true;
  };

  // Мобильное меню: блокируем скролл страницы, пока меню открыто
  document.addEventListener("site:menu-open", () => lenis.stop());
  document.addEventListener("site:menu-close", () => {
    lenis.start();
    // Якорь из мобильного меню: Lenis был остановлен, поэтому скролл
    // выполняем после закрытия dialog, иначе scrollTo игнорируется.
    if (pendingHash) {
      const href = pendingHash;
      pendingHash = null;
      requestAnimationFrame(() => scrollToAnchor(href));
    }
  });

  document.addEventListener("click", (event) => {
    const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;
    // Skip-link должен нативно перевести фокус в main, а не просто скроллить
    if (anchor.classList.contains("skip-link")) return;
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;

    event.preventDefault();

    const menu = document.querySelector<HTMLDialogElement>("dialog[data-mobile-menu]");
    if (menu?.open || document.documentElement.classList.contains("menu-open")) {
      pendingHash = href;
      return;
    }

    scrollToAnchor(href);
  });
}
