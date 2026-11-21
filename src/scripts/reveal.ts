import { animate, inView } from "motion";

/**
 * Reveal-анимации секций: элементы с [data-reveal] плавно появляются.
 * — Элементы скрыты через CSS (html.js [data-reveal] { opacity: 0 }),
 *   поэтому при скролле нет «скачка»: видно→скрыто→появилось.
 * — Элементы первого экрана анимируются сразу (без IO), остальные —
 *   через Motion inView.
 * — Старт только после загрузки шрифтов: подмена метрик текста в первом
 *   прогоне даёт рывок.
 * — will-change ставится на время анимации и снимается после.
 * — Страховки: класс no-reveal (BaseLayout) и таймер 4s.
 */

let started = false;

export function initReveal(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

  const start = () => {
    if (started) return;
    started = true;

    if (elements.length > 0) {
      const handled = new WeakSet<HTMLElement>();

      const show = (el: HTMLElement, delay: number) => {
        if (handled.has(el)) return;
        handled.add(el);
        el.style.willChange = "opacity, transform";
        const controls = animate(
          el,
          { opacity: [0, 1], y: [24, 0] },
          { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
        );
        void controls.finished.then(() => {
          el.style.willChange = "";
        });
      };

      for (const el of elements) {
        const delay = Number(el.dataset.revealDelay ?? 0) / 1000;
        const rect = el.getBoundingClientRect();
        const inFirstViewport = rect.top < window.innerHeight && rect.bottom > 0;

        if (inFirstViewport) {
          requestAnimationFrame(() => show(el, delay));
        } else {
          inView(
            el,
            () => show(el, delay),
            { margin: "0px 0px -12% 0px", amount: 0.2 },
          );
        }
      }

      // Страховка: показать элементы, если анимация не сработала
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

    // Флаг для страховок (Hero, BaseLayout)
    document.documentElement.classList.add("reveal-done");
  };

  const fonts = (document as unknown as { fonts?: FontFaceSet }).fonts;
  if (fonts && fonts.status !== "loaded") {
    fonts.ready.then(() => start());
    // Страховка, если шрифты зависли
    window.setTimeout(() => start(), 700);
  } else {
    start();
  }
}
