import { animate, inView } from "motion";

/**
 * Reveal-анимации секций: элементы с [data-reveal] плавно появляются.
 * — Элементы, уже попадающие в первый экран, анимируются сразу (без IO),
 *   чтобы hero не зависел от IntersectionObserver.
 * — Остальные появляются через Motion inView при скролле.
 * — data-reveal-delay — задержка в мс.
 * — Страховка: если через 4s элемент виден в вьюпорте, но остался
 *   прозрачным (сбой анимации), принудительно показываем.
 */
export function initReveal(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (elements.length === 0) return;

  const handled = new WeakSet<HTMLElement>();

  const show = (el: HTMLElement, delay: number) => {
    if (handled.has(el)) return;
    handled.add(el);
    animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] });
  };

  for (const el of elements) {
    const delay = Number(el.dataset.revealDelay ?? 0) / 1000;
    const rect = el.getBoundingClientRect();
    const inFirstViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (inFirstViewport) {
      requestAnimationFrame(() => show(el, delay));
    } else {
      inView(el, () => show(el, delay), { margin: "0px 0px -12% 0px", amount: 0.2 });
    }
  }

  // Флаг для страховки в Hero: reveal инициализирован
  document.documentElement.classList.add("reveal-done");

  window.setTimeout(() => {
    if (document.visibilityState !== "visible") return;
    for (const el of elements) {
      if (handled.has(el)) continue;
      if (Number(getComputedStyle(el).opacity) < 0.05) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.style.opacity = "1";
          el.style.transform = "none";
          handled.add(el);
        }
      }
    }
  }, 4000);
}
