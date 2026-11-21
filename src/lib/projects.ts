/**
 * Единственная схема данных портфолио. Продублирована в scripts/validate-projects.mjs
 * (для CLI-проверки) — при изменении полей правьте оба файла.
 */
import { z } from "zod";
import raw from "../data/projects.json";
import type { Project, ProjectCategory } from "../types/project";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  landing: "Лендинги",
  bot: "Telegram-боты",
  layout: "Вёрстка",
  script: "Скрипты",
};

const projectSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "id — slug латиницей через дефис, например landing-coffee-shop",
    ),
  title: z.string().min(1, "нужно название работы"),
  category: z.enum(["landing", "bot", "layout", "script"]),
  client: z.string().min(1).optional(),
  description: z.string().min(1, "нужно описание (1–2 предложения)"),
  stack: z.array(z.string().min(1)).min(1, "нужен хотя бы один пункт стека"),
  cover: z.string().min(1, "нужен путь к превью, например /portfolio/<id>.webp"),
  link: z
    .union([z.literal(""), z.url("link должен быть валидным URL или пустой строкой")])
    .optional(),
  date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "date в формате YYYY-MM, например 2026-03"),
  featured: z.boolean(),
  example: z.boolean().optional(),
});

const listSchema = z.array(projectSchema);

const parsed = listSchema.safeParse(raw);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  • [${issue.path.map(String).join(".")}] ${issue.message}`)
    .join("\n");
  throw new Error(`projects.json не валиден:\n${details}`);
}

const data = parsed.data as Project[];

const ids = new Set<string>();
for (const p of data) {
  if (ids.has(p.id)) {
    throw new Error(`projects.json: дублирующийся id "${p.id}"`);
  }
  ids.add(p.id);
}

// Порядок отображения: сначала featured, внутри групп — порядок файла (стабильная сортировка).
export const allProjects: Project[] = [...data].sort(
  (a, b) => Number(b.featured) - Number(a.featured),
);

/** Уникальные категории в порядке первого появления в файле. */
export function getCategories(): Array<{ value: ProjectCategory; label: string }> {
  const seen = new Set<ProjectCategory>();
  const result: Array<{ value: ProjectCategory; label: string }> = [];
  for (const p of data) {
    if (!seen.has(p.category)) {
      seen.add(p.category);
      result.push({ value: p.category, label: CATEGORY_LABELS[p.category] });
    }
  }
  return result;
}
