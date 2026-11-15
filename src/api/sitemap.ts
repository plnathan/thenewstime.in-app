import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const origin = process.env.SEO_API_ORIGIN?.replace(/\/$/, "");
  if (!origin) {
    res.status(503).send("SEO_API_ORIGIN is not configured");
    return;
  }
  try {
    const response = await fetch(`${origin}/api/v1/seo/sitemap.xml`);
    if (!response.ok) {
      res.status(502).send("Unable to retrieve sitemap");
      return;
    }
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.status(200).send(await response.text());
  } catch {
    res.status(502).send("Unable to retrieve sitemap");
  }
}
