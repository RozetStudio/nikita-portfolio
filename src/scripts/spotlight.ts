/**
 * Spotlight-подсветка карточек (паттерн 21st.dev): позиция курсора
 * пишется в CSS-переменные --mx/--my, градиент рисует ::before.
 * Только для устройств с hover и без reduced motion.
 */
export function initSpotlight(): void {
  if (!window.matchMedia("(hover: hover)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cards = document.querySelectorAll<HTMLElement>("[data-spotlight]");
  if (cards.length === 0) return;

  for (const card of cards) {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  }
}
