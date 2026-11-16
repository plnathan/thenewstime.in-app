import type { VercelRequest, VercelResponse } from "@vercel/node";

const SITE_URL = "https://www.thenewstime.in";
const API_BASE_URL = process.env.API_BASE_URL;

interface NewsMedia {
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  displayOrder?: number | null;
  altText?: string | null;
  mimeType?: string | null;
}
interface NewsArticle {
  title: string;
  summary?: string | null;
  content: string;
  slug: string;
  status: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  publishedByName?: string | null;
  media?: NewsMedia[];
}
interface ApiResponse<T> {
  data?: T;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function descriptionOf(article: NewsArticle): string {
  return (article.summary?.trim() || article.content || "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}
function imageOf(article: NewsArticle): NewsMedia | undefined {
  return [...(article.media ?? [])]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .find((item) => Boolean(item.fileUrl && /^https:\/\//i.test(item.fileUrl)));
}
function inline(text: string): string {
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
/** Match the existing article editor's heading, paragraph and bullet conventions. */
function articleBody(content: string): string {
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushBullets = () => {
    if (bullets.length)
      blocks.push(
        `<ul>${bullets.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`,
      );
    bullets = [];
  };
  for (const raw of content.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushBullets();
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushBullets();
      blocks.push(`<h2>${inline(line.slice(3).trim())}</h2>`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      bullets.push(line.slice(2).trim());
    } else {
      flushBullets();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushBullets();
  return blocks.join("\n");
}
function safeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
function sendNotFound(res: VercelResponse): void {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.status(404).setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(
    '<!doctype html><html lang="ta"><head><meta name="robots" content="noindex, nofollow"><title>செய்தி கிடைக்கவில்லை</title></head><body><h1>செய்தி கிடைக்கவில்லை</h1></body></html>',
  );
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    res.status(405).end();
    return;
  }
  const raw = Array.isArray(req.query.slug)
    ? req.query.slug[0]
    : req.query.slug;
  if (!raw || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw)) {
    sendNotFound(res);
    return;
  }
  if (!API_BASE_URL) {
    res.status(503).send("Article service unavailable");
    return;
  }
  try {
    const base = API_BASE_URL.replace(/\/+$/, "");
    // Public endpoint MUST enforce status=PUBLISHED and publishedAt <= NOW().
    const response = await fetch(
      `${base}/news/public/slug/${encodeURIComponent(raw)}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (response.status === 404) {
      sendNotFound(res);
      return;
    }
    if (!response.ok) {
      res.status(502).send("Article service unavailable");
      return;
    }
    const result = (await response.json()) as ApiResponse<NewsArticle>;
    const article = result.data;
    const publishedTime = article?.publishedAt
      ? Date.parse(article.publishedAt)
      : NaN;
    if (
      !article ||
      article.status !== "PUBLISHED" ||
      article.slug !== raw ||
      !Number.isFinite(publishedTime) ||
      publishedTime > Date.now()
    ) {
      sendNotFound(res);
      return;
    }
    const canonical = `${SITE_URL}/news/${encodeURIComponent(article.slug)}`;
    const title = article.title.trim();
    const description = descriptionOf(article);
    const media = imageOf(article);
    const image = media?.fileUrl ?? null;
    const modifiedTime =
      article.updatedAt &&
      Number.isFinite(Date.parse(article.updatedAt)) &&
      Date.parse(article.updatedAt) >= publishedTime
        ? article.updatedAt
        : article.publishedAt!;
    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      headline: title,
      description,
      inLanguage: "ta-IN",
      datePublished: article.publishedAt,
      dateModified: modifiedTime,
      publisher: {
        "@type": "Organization",
        name: "The News Time",
        url: SITE_URL,
      },
    };
    if (image) schema.image = [image];
    if (article.publishedByName?.trim())
      schema.author = {
        "@type": "Person",
        name: article.publishedByName.trim(),
      };
    const safe = (value: string) => escapeHtml(value);
    const imageTags = image
      ? `<meta property="og:image" content="${safe(image)}"><meta name="twitter:image" content="${safe(image)}">`
      : "";
    const imageHtml = image
      ? `<figure><img src="${safe(image)}" alt="${safe(media?.altText?.trim() || title)}"></figure>`
      : "";
    const html = `<!doctype html><html lang="ta"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${safe(title)} | The News Time</title><meta name="description" content="${safe(description)}">
<meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="${safe(canonical)}">
<meta property="og:type" content="article"><meta property="og:site_name" content="The News Time">
<meta property="og:locale" content="ta_IN"><meta property="og:title" content="${safe(title)}">
<meta property="og:description" content="${safe(description)}"><meta property="og:url" content="${safe(canonical)}">
<meta property="article:published_time" content="${safe(article.publishedAt!)}">
<meta property="article:modified_time" content="${safe(modifiedTime!)}">
<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">${imageTags}
<script type="application/ld+json">${safeJsonLd(schema)}</script></head>
<body><header><a href="${SITE_URL}/">The News Time</a></header><main><article>
<h1>${safe(title)}</h1><p><time datetime="${safe(article.publishedAt!)}">${safe(article.publishedAt!)}</time></p>
${imageHtml}${article.summary ? `<p>${safe(article.summary)}</p>` : ""}
<div class="article-content">${articleBody(article.content)}</div>
</article></main><footer><a href="${safe(canonical)}">${safe(canonical)}</a></footer></body></html>`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=60",
    );
    res.setHeader("Vary", "User-Agent");
    res.setHeader("X-Robots-Tag", "index, follow");
    res.status(200).send(req.method === "HEAD" ? "" : html);
  } catch (error) {
    console.error("SEO article rendering failed", error);
    res.setHeader("Cache-Control", "no-store");
    res.status(503).send("Article service temporarily unavailable");
  }
}
