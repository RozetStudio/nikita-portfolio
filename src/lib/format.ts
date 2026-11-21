const MONTHS = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
] as const;

/** "2026-03" → "март 2026" */
export function formatDate(iso: string): string {
  const [year, month] = iso.split("-").map(Number);
  const name = MONTHS[month - 1] ?? "";
  return name ? `${name} ${year}` : iso;
}
