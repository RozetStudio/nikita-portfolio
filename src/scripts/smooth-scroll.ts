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

  document.addEventListener("click", (event) => {
    const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;

    event.preventDefault();

    // Позиция заголовка секции: верх секции + её внутренний отступ сверху.
    const rect = target.getBoundingClientRect();
    const paddingTop = Number.parseFloat(getComputedStyle(target).paddingTop) || 0;
    const docTop = window.scrollY + rect.top + paddingTop;
    // Заголовок должен оказаться на экране на высоте: шапка + зазор.
    const scrollToY = Math.max(0, docTop - HEADER_HEIGHT - HEADER_GAP);

    lenis.scrollTo(scrollToY, { duration: 1.1 });
    history.replaceState(null, "", href);
  });
}
