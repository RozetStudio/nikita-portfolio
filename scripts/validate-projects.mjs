/**
 * Проверка src/data/projects.json перед сборкой.
 * Схема дублирует src/lib/projects.ts — держите файлы синхронными.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const root = process.cwd();

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

function fail(message) {
  console.error(`✖ projects.json: ${message}`);
  process.exit(1);
}

let raw;
try {
  raw = JSON.parse(readFileSync(resolve(root, "src/data/projects.json"), "utf8"));
} catch (error) {
  fail(`файл не читается (${error.message})`);
}

const parsed = listSchema.safeParse(raw);
if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  • [${issue.path.map(String).join(".")}] ${issue.message}`)
    .join("\n");
  fail(`схема не валидна:\n${details}`);
}

const projects = parsed.data;

const ids = new Set();
for (const project of projects) {
  if (ids.has(project.id)) {
    fail(`дублирующийся id "${project.id}"`);
  }
  ids.add(project.id);
}

const examples = projects.filter((project) => project.example === true);
if (examples.length > 1) {
  fail(`example: true может быть только у одной записи (сейчас ${examples.length})`);
}

for (const project of projects) {
  const coverPath = resolve(root, "public", project.cover.replace(/^\//, ""));
  if (!existsSync(coverPath)) {
    fail(`у "${project.id}" нет файла превью ${project.cover}`);
  }
}

mkdirSync(resolve(root, "public/portfolio"), { recursive: true });

const examplesNote = examples.length > 0 ? `, ${examples.length} демо` : "";
console.log(`✔ projects.json валиден: ${projects.length} работ${examplesNote}`);
