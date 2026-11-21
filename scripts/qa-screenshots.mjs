/**
 * QA-скриншоты через puppeteer-core (использует установленный Chrome).
 * Запуск: node scripts/qa-screenshots.mjs
 * Результат: PNG в папке, указанной переменной окружения QA_OUT
 * (по умолчанию — temp\opencode\qa).
 * Инструмент только для локальной проверки, в сборку не входит.
 */
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

const url = process.argv[2] ?? "http://localhost:4321/";
const outDir = process.env.QA_OUT ?? "C:\\Users\\user\\AppData\\Local\\Temp\\opencode\\qa";
await mkdir(outDir, { recursive: true });

const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error("Chrome/Edge не найден");
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
});

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const sections = [
  { id: "top", label: "hero" },
  { id: "services", label: "services" },
  { id: "process", label: "process" },
  { id: "portfolio", label: "portfolio" },
  { id: "why-me", label: "why-me" },
  { id: "contact", label: "contact" },
];

for (const vp of viewports) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  // даём reveal-анимациям и шейдеру время
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1800));

  for (const section of sections) {
    try {
      const el = await page.$(`#${section.id}`);
      if (!el) continue;
      await page.evaluate((id) => {
        const target = document.getElementById(id);
        if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: "instant" });
      }, section.id);
      await new Promise((r) => setTimeout(r, 1000));
      const path = resolve(outDir, `${section.label}-${vp.name}.png`);
      await el.screenshot({ path });
      console.log(`✔ ${section.label}-${vp.name}.png`);
    } catch (error) {
      console.error(`✖ ${section.label}-${vp.name}: ${error.message}`);
    }
  }

  // нижняя часть страницы (футер)
  try {
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
    );
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: resolve(outDir, `footer-${vp.name}.png`) });
    console.log(`✔ footer-${vp.name}.png`);
  } catch (error) {
    console.error(`✖ footer-${vp.name}: ${error.message}`);
  }

  await page.close();
}

await browser.close();
console.log("Готово:", outDir);
