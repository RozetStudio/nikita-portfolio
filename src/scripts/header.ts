/**
 * Поведение шапки:
 * — blur-фон после 16px скролла;
 * — мобильное меню на нативном <dialog> (Esc/focus-trap бесплатно);
 * — активный раздел навигации через IntersectionObserver.
 */
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

  const setOpen = (open: boolean) => {
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
    openButton.setAttribute("aria-expanded", String(dialog.open));
  };

  openButton.addEventListener("click", () => setOpen(!dialog.open));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) setOpen(false);
  });
  dialog.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
  dialog.addEventListener("close", () => openButton.setAttribute("aria-expanded", "false"));

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
