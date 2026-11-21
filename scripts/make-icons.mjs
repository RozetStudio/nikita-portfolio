/**
 * Генерация иконок из public/favicon.svg:
 * — public/apple-touch-icon.png (180×180)
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const svgPath = resolve(process.cwd(), "public/favicon.svg");
const svg = await readFile(svgPath, "utf8");

await sharp(Buffer.from(svg), { density: 300 })
  .resize(180, 180)
  .png()
  .toFile(resolve(process.cwd(), "public/apple-touch-icon.png"));

console.log("✔ apple-touch-icon.png создан");
