/**
 * Поведение шапки:
 * — blur-фон после 16px скролла;
 * — мобильное меню на нативном <dialog> с плавной анимацией
 *   (вход/выход, морфинг бургера, каскад пунктов);
 * — активный раздел навигации через IntersectionObserver.
 */

const MENU_ANIMATION_MS = 420;

export function initHeader(): void {
  const header = document.querySelector<HTMLElement>("[data-header]");
  const dialog = document.querySelector<HTMLDialogElement>("[data-mobile-menu]");
  const openButton = document.querySelector<HTMLButtonElement>("[data-menu-open]");
  if (!header || !dialog || !openButton) return;

  let ticking = false;
  const updateScrolled = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 16);
    ticking = false;
  };
  updateScrolled();
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrolled);
      }
    },
    { passive: true },
  );

  let closing = false;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setExpanded = (open: boolean) => {
    openButton.setAttribute("aria-expanded", String(open));
    openButton.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  };

  const openMenu = () => {
    if (dialog.open || closing) return;
    dialog.showModal();
    setExpanded(true);
    document.documentElement.classList.add("menu-open");
    // Lenis: не скроллить страницу за открытым меню
    document.dispatchEvent(new CustomEvent("site:menu-open"));
    if (prefersReducedMotion) {
      dialog.classList.add("is-open");
      return;
    }
    // Двойной rAF: сначала применяем скрытое состояние, затем класс → transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => dialog.classList.add("is-open"));
    });
  };

  const closeMenu = (instant = false) => {
    if (closing || !dialog.open) return;
    setExpanded(false);
    if (instant || prefersReducedMotion) {
      // Переход по ссылке не должен ждать анимацию закрытия
      dialog.classList.remove("is-open");
      dialog.close();
      return;
    }
    closing = true;
    dialog.classList.remove("is-open");

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      closing = false;
      if (dialog.open) dialog.close();
    };

    const panel = dialog.querySelector<HTMLElement>("[data-menu-panel]");
    const onEnd = (event: TransitionEvent) => {
      if (panel && event.target === panel && event.propertyName === "opacity") {
        panel.removeEventListener("transitionend", onEnd);
        finish();
      }
    };
    panel?.addEventListener("transitionend", onEnd);
    // Страховка: если transitionend не пришёл (reduced motion и т.п.)
    window.setTimeout(finish, MENU_ANIMATION_MS);
  };

  openButton.addEventListener("click", () => {
    if (dialog.open) closeMenu();
    else openMenu();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeMenu();
  });

  // Esc: перехватываем нативное закрытие, чтобы анимировать выход
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeMenu();
  });

  dialog.addEventListener("close", () => {
    dialog.classList.remove("is-open");
    document.documentElement.classList.remove("menu-open");
    closing = false;
    setExpanded(false);
    // Lenis: возвращаем скролл страницы
    document.dispatchEvent(new CustomEvent("site:menu-close"));
  });

  dialog.querySelectorAll("a").forEach((link) => {
    // Переход по ссылке — без задержки на анимацию закрытия
    link.addEventListener("click", () => closeMenu(true));
  });

  dialog.querySelector("[data-menu-close]")?.addEventListener("click", () => closeMenu());

  const links = Array.from(header.querySelectorAll<HTMLAnchorElement>("a[data-nav]"));
  const linkById = new Map(links.map((link) => [(link.getAttribute("href") ?? "").slice(1), link]));
  const sections = Array.from(linkById.keys())
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  if ("IntersectionObserver" in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const link = linkById.get(entry.target.id);
          if (!link) continue;
          links.forEach((l) => l.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "true");
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
  }
}
