/**
 * Проверка прод-заголовков и статики. Запускать после `docker compose up`:
 *   npm run test:prod
 *
 * BASE_URL можно переопределить: BASE_URL=http://localhost:8080 npm run test:prod
 */
const base = (process.env.BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const errors = [];

const check = (condition, message) => {
  if (!condition) errors.push(message);
};

const request = (path, options = {}) => fetch(`${base}${path}`, { redirect: "manual", ...options });

const header = (response, name) => response.headers.get(name) ?? "";

try {
  const home = await request("/");
  check(home.status === 200, `/: статус ${home.status}`);
  const homeHtml = await home.text();

  const terms = await request("/terms/");
  check(terms.status === 200, `/terms/: статус ${terms.status}`);

  const termsNoSlash = await request("/terms");
  check(termsNoSlash.status === 301, `/terms: ожидался 301, получен ${termsNoSlash.status}`);
  check(
    header(termsNoSlash, "location").startsWith("/"),
    `/terms: Location должен быть относительным, получен «${header(termsNoSlash, "location")}»`,
  );

  const missing = await request("/definitely-missing-audit-page");
  check(missing.status === 404, `404: статус ${missing.status}`);

  const manifest = await request("/site.webmanifest");
  check(manifest.status === 200, `/site.webmanifest: статус ${manifest.status}`);
  check(
    header(manifest, "content-type").includes("application/manifest+json"),
    `/site.webmanifest: Content-Type «${header(manifest, "content-type")}»`,
  );

  check(
    header(home, "content-type").toLowerCase().includes("text/html; charset=utf-8"),
    `/ : Content-Type «${header(home, "content-type")}» без charset=utf-8`,
  );

  const securityHeaders = [
    ["x-content-type-options", "nosniff"],
    ["referrer-policy", "strict-origin-when-cross-origin"],
    ["x-frame-options", "SAMEORIGIN"],
    ["cross-origin-opener-policy", "same-origin"],
    ["cross-origin-resource-policy", "same-origin"],
  ];
  for (const [name, expected] of securityHeaders) {
    check(
      header(home, name).toLowerCase() === expected.toLowerCase(),
      `/${name}: «${header(home, name)}», ожидалось «${expected}»`,
    );
  }
  check(
    header(home, "permissions-policy").includes("camera=()"),
    "permissions-policy: нет camera=()",
  );
  const csp = header(home, "content-security-policy");
  check(csp.includes("frame-ancestors 'self'"), "CSP: нет frame-ancestors 'self'");
  check(csp.includes("object-src 'none'"), "CSP: нет object-src 'none'");

  const server = header(home, "server");
  check(server === "nginx", `Server: «${server}» раскрывает версию или пуст`);
  check(!header(home, "x-powered-by"), "X-Powered-By не должен отдаваться");

  for (const path of ["/.env", "/.git/config", "/.agents/skills/terms-of-service/SKILL.md"]) {
    const response = await request(path);
    check(response.status === 403, `${path}: ожидался 403, получен ${response.status}`);
  }
  for (const path of ["/AGENTS.md", "/HISTORY.md", "/package.json", "/src/pages/index.astro"]) {
    const response = await request(path);
    check(response.status === 404, `${path}: ожидался 404, получен ${response.status}`);
  }

  for (const method of ["OPTIONS", "PUT"]) {
    const response = await request("/terms/", { method });
    check(response.status === 405, `${method} /terms/: ожидался 405, получен ${response.status}`);
  }

  const robots = await request("/robots.txt");
  check(robots.status === 200, `/robots.txt: статус ${robots.status}`);
  check(
    header(robots, "content-type").startsWith("text/plain"),
    `/robots.txt: Content-Type «${header(robots, "content-type")}»`,
  );

  const assetPath = homeHtml.match(/_astro\/[A-Za-z0-9_.-]+\.css/)?.[0];
  check(Boolean(assetPath), "не найден CSS-ассет в HTML главной");
  if (assetPath) {
    const asset = await request(`/${assetPath}`);
    check(asset.status === 200, `/${assetPath}: статус ${asset.status}`);
    check(
      header(asset, "cache-control").includes("max-age=31536000"),
      `/${assetPath}: Cache-Control «${header(asset, "cache-control")}»`,
    );
    check(
      header(asset, "content-type").includes("text/css"),
      `/${assetPath}: Content-Type «${header(asset, "content-type")}»`,
    );
  }
} catch (error) {
  console.error(`✖ prod headers: не удалось подключиться к ${base}`);
  console.error(`  • ${error.message}`);
  process.exit(1);
}

if (errors.length > 0) {
  console.error(`✖ prod headers: ${errors.length} ошибок`);
  for (const error of errors) console.error(`  • ${error}`);
  process.exit(1);
}

console.log("✔ prod headers: MIME, charset, безопасность, кэш, методы и скрытые файлы");
