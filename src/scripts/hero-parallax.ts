/**
 * Лёгкий параллакс hero: позиция курсора пишется в CSS-переменные
 * --hx/--hy, слои с data-parallax="<множитель>" сдвигаются на CSS.
 * Только hover-устройства и без reduced motion.
 */
export function initHeroParallax(): void {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover)").matches) return;

  let raf = 0;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;

  const apply = () => {
    x += (targetX - x) * 0.08;
    y += (targetY - y) * 0.08;
    hero.style.setProperty("--hx", x.toFixed(4));
    hero.style.setProperty("--hy", y.toFixed(4));
    if (Math.abs(targetX - x) > 0.002 || Math.abs(targetY - y) > 0.002) {
      raf = requestAnimationFrame(apply);
    } else {
      raf = 0;
    }
  };

  hero.addEventListener(
    "pointermove",
    (event) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      targetY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(apply);
    },
    { passive: true },
  );

  hero.addEventListener(
    "pointerleave",
    () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    },
    { passive: true },
  );
}
