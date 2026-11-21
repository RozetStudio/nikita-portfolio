import Lenis from "lenis";

/**
 * Плавный скролл (Lenis) + скролл по якорям с отступом под фиксированную шапку.
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
    lenis.scrollTo(target, { offset: -80, duration: 1.2 });
    history.replaceState(null, "", href);
  });
}
