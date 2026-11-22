/**
 * Reveal-анимации: показ через CSS-transition (класс reveal-in).
 *
 * Детерминированно во всех браузерах: скрытие и переходы заданы
 * в BaseLayout (<style is:inline>, нелейерные правила), анимацию
 * выполняет браузер на композиторе (opacity + translate). Нет
 * асинхронного резолва кейфреймов и WAAPI-гонок Motion.
 *
 * — IO-триггер с ранним порогом; если колбэк сработал, когда элемент
 *   уже глубоко в экране (быстрая прокрутка), показ мгновенный.
 * — Каскад через transition-delay с очисткой после старта, чтобы
 *   задержка не влияла на hover-переходы карточек.
 * — Страховки: sweep 4s + повтор на visibilitychange,
 *   no-reveal (BaseLayout) при отказе модуля.
 */

let started = false;

export function initReveal(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

  const start = () => {
    if (started) return;
    started = true;

    const handled = new WeakSet<HTMLElement>();

    /** Мгновенный показ: без анимации (быстрый скролл / страховка). */
    const showInstant = (el: HTMLElement) => {
      if (handled.has(el)) return;
      handled.add(el);
      // Подавить transition на один кадр: показать мгновенно и вернуть
      // hover-переходы в следующем кадре
      el.style.transition = "none";
      el.style.transitionDelay = "";
      el.classList.add("reveal-in");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = "";
        });
      });
    };

    /** Плавное появление с каскадной задержкой. */
    const showAnimated = (el: HTMLElement, delayMs: number) => {
      if (handled.has(el)) return;
      handled.add(el);
      if (delayMs > 0) {
        // Две анимируемые зависимости: opacity и translate
        el.style.transitionDelay = `${delayMs}ms, ${delayMs}ms`;
      }
      el.style.willChange = "opacity, translate";
      el.classList.add("reveal-in");
      if (delayMs > 0) {
        // Очистка задержки и will-change: иначе задержка повиснет
        // на hover-переходах карточек
        let cleared = false;
        const clear = () => {
          if (cleared) return;
          cleared = true;
          el.style.transitionDelay = "";
          el.style.willChange = "";
        };
        const onEnd = (event: TransitionEvent) => {
          if (
            event.target === el &&
            (event.propertyName === "opacity" || event.propertyName === "translate")
          ) {
            clear();
          }
        };
        el.addEventListener("transitionend", onEnd);
        window.setTimeout(clear, delayMs + 750);
      } else {
        const clear = () => {
          el.style.willChange = "";
        };
        const onEnd = (event: TransitionEvent) => {
          if (
            event.target === el &&
            (event.propertyName === "opacity" || event.propertyName === "translate")
          ) {
            clear();
          }
        };
        el.addEventListener("transitionend", onEnd);
        window.setTimeout(clear, 800);
      }
    };

    /**
     * Появление при скролле: если элемент уже глубоко в экране
     * (колбэк сработал с запозданием на быстрой прокрутке) —
     * мгновенно, иначе плавно.
     */
    const showOnScroll = (el: HTMLElement, delayMs: number) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.7) {
        showInstant(el);
        return;
      }
      showAnimated(el, delayMs);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          showOnScroll(el, Number(el.dataset.revealDelay ?? 0));
        }
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.02 },
    );

    for (const el of elements) {
      const delayMs = Number(el.dataset.revealDelay ?? 0);
      const rect = el.getBoundingClientRect();
      const inFirstViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (inFirstViewport) {
        // Первый экран: каскад от момента загрузки
        requestAnimationFrame(() => showAnimated(el, delayMs));
      } else {
        observer.observe(el);
      }
    }

    // Страховка: показать видимые, но необработанные элементы.
    // Без проверки visibilityState — повторяем на возврате во вкладку.
    const sweep = () => {
      for (const el of elements) {
        if (handled.has(el)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) showInstant(el);
      }
    };
    window.setTimeout(sweep, 4000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") window.setTimeout(sweep, 300);
    });

    // Флаг для страховок (Hero, BaseLayout)
    document.documentElement.classList.add("reveal-done");
  };

  // Старт после загрузки шрифтов: подмена метрик текста в первом
  // прогоне даёт рывок верстки
  const fonts = (document as unknown as { fonts?: FontFaceSet }).fonts;
  if (fonts && fonts.status !== "loaded") {
    fonts.ready.then(() => start());
    // Страховка, если шрифты зависли
    window.setTimeout(() => start(), 700);
  } else {
    start();
  }
}
