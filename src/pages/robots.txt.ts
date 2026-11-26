import type { APIRoute } from "astro";
import { BASE_PATH } from "@/config/site";

/** robots.txt: sitemap добавляется только при заданном PUBLIC_SITE_URL. */
export const GET: APIRoute = () => {
  const site = (import.meta.env.PUBLIC_SITE_URL ?? "").trim();
  const lines = ["User-agent: *", "Allow: /"];
  if (site) {
    lines.push("", `Sitemap: ${new URL(`${BASE_PATH}sitemap-index.xml`, site).href}`);
  }
  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
