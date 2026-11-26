/**
 * Проверка собранной страницы пользовательского соглашения.
 * Запускать после `npm run build`: `npm run test:legal`.
 *
 * Проверяет не вёрстку, а обязательные юридические блоки и ссылки,
 * чтобы при будущих правках не потерялись ключевые условия.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const rawBase = (process.env.BASE_PATH ?? "/").trim();
const basePath = rawBase === "/" ? "/" : `/${rawBase.replace(/^\/+|\/+$/g, "")}/`;
const termsHref = `${basePath}terms/`;
const errors = [];
const fail = (message) => errors.push(message);

const termsFile = resolve(root, "dist/terms/index.html");
const homeFile = resolve(root, "dist/index.html");

if (!existsSync(termsFile)) fail("нет dist/terms/index.html — сначала выполните npm run build");
if (!existsSync(homeFile)) fail("нет dist/index.html — сначала выполните npm run build");

if (errors.length > 0) {
  console.error("✖ legal page: сборка не найдена");
  for (const error of errors) console.error(`  • ${error}`);
  process.exit(1);
}

const terms = readFileSync(termsFile, "utf8");
const home = readFileSync(homeFile, "utf8");

const requiredHeadings = [
  "1. Общие положения",
  "2. Термины",
  "3. Предмет соглашения",
  "4. Порядок оформления заказа",
  "5. Стоимость и оплата",
  "6. Сроки и рабочее время",
  "7. Демо-версия",
  "8. Приёмка работы",
  "9. Правки и дополнительные работы",
  "10. Отказ от работы и возврат",
  "11. Права на результат",
  "12. Гарантии и ответственность",
  "13. Конфиденциальность и персональные данные",
  "14. Материалы заказчика и запрещённый контент",
  "15. Обстоятельства непреодолимой силы",
  "16. Разрешение споров",
  "17. Изменение соглашения",
  "18. Реквизиты и контакты",
];

for (const heading of requiredHeadings) {
  if (!terms.includes(heading)) fail(`нет обязательного раздела: «${heading}»`);
}

const requiredPhrases = [
  "Пользовательское соглашение",
  "публичной оферт",
  "50%",
  "60%",
  "100%",
  "5 рабочих дней",
  "водяным знаком",
  "10:00–20:00",
  "МСК",
  "понедельник",
  "пятница",
  "Налог на профессиональный доход",
  "самозанят",
  "152-ФЗ",
  "фактически понесённых расходов",
  "Редакция 1.0",
  "26 ноября 2026",
];

for (const phrase of requiredPhrases) {
  if (!terms.includes(phrase)) fail(`нет обязательной формулировки: «${phrase}»`);
}

if (!/<h1[^>]*>[\s\S]*?Пользовательское соглашение[\s\S]*?<\/h1>/.test(terms)) {
  fail("на странице нет h1 «Пользовательское соглашение»");
}

if (!/<title>[^<]*Пользовательское соглашение[^<]*<\/title>/.test(terms)) {
  fail("title страницы не содержит «Пользовательское соглашение»");
}

if (!/<meta name="description" content="[^"]+"/.test(terms)) {
  fail("нет meta description");
}

if (/<meta name="robots" content="[^"]*noindex/i.test(terms)) {
  fail("страница закрыта от индексации (noindex) — по плану она индексируемая");
}

for (const [name, html] of [
  ["главная", home],
  ["соглашение", terms],
]) {
  if (!html.includes(`href="${termsHref}"`)) {
    fail(`на странице «${name}» нет ссылки на ${termsHref}`);
  }
  if (!html.includes("Пользовательское соглашение")) {
    fail(`на странице «${name}» нет текста ссылки «Пользовательское соглашение»`);
  }
}

// В HTML есть инлайн-стили BaseLayout с селекторами [data-reveal];
// проверяем именно атрибут на элементе, а не текст CSS.
if (/<[^>]*\sdata-reveal(?:\s|=|>)/.test(terms)) {
  fail("на юридической странице не должно быть reveal-анимаций: текст обязан быть виден сразу");
}

const ids = [...terms.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length > 0) {
  fail(`повторяющиеся id: ${[...new Set(duplicateIds)].join(", ")}`);
}

const anchors = [...terms.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
for (const anchor of new Set(anchors)) {
  if (!ids.includes(anchor)) fail(`якорь #${anchor} не находит цель на странице`);
}

const forbidden = ["TODO", "Lorem ipsum", "{{", "undefined", "[вставьте"];
for (const fragment of forbidden) {
  if (terms.includes(fragment)) fail(`в тексте осталась заглушка: «${fragment}»`);
}

if (errors.length > 0) {
  console.error("✖ legal page: проверка не пройдена");
  for (const error of errors) console.error(`  • ${error}`);
  process.exit(1);
}

console.log("✔ legal page: разделы, условия, ссылки и реквизиты на месте");
