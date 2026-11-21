/**
 * Конвертация превью портфолио: кроп 4:3, 1200×900, WebP.
 * Использование: npm run cover -- <путь-к-исходнику> <id-проекта>
 * Результат: public/portfolio/<id>.webp
 */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const [, , input, id] = process.argv;

if (!input || !id) {
  console.error("Использование: npm run cover -- <путь-к-исходнику> <id-проекта>");
  console.error("Пример:        npm run cover -- ./shots/coffee.png landing-coffee-shop");
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  console.error("id должен быть slug латиницей через дефис, например landing-coffee-shop");
  process.exit(1);
}

const outDir = resolve(process.cwd(), "public/portfolio");
mkdirSync(outDir, { recursive: true });
const out = resolve(outDir, `${id}.webp`);

try {
  await sharp(input)
    .resize(1200, 900, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toFile(out);
  console.log(`✔ Превью готово: ${out}`);
} catch (error) {
  console.error(`✖ Не удалось обработать изображение: ${error.message}`);
  process.exit(1);
}
