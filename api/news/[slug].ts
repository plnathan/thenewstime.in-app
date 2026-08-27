import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE_URL = process.env.VITE_API_BASE_URL;

const SITE_URL = "https://thenewstime.in";

interface NewsMedia {
  id?: number;
  url?: string;
  mediaUrl?: string;
  secureUrl?: string;
  displayOrder?: number;
}

interface NewsArticle {
  title?: string;
  summary?: string | null;
  content?: string;
  slug?: string;
  media?: NewsMedia[];
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getFirstImage(media: NewsMedia[] | undefined): string | null {
  if (!media || media.length === 0) {
    return null;
  }

  const orderedMedia = [...media].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  const firstMedia = orderedMedia[0];

  if (!firstMedia) {
    return null;
  }

  return firstMedia.secureUrl ?? firstMedia.mediaUrl ?? firstMedia.url ?? null;
}

function getDescription(news: NewsArticle): string {
  const value = news.summary?.trim() || news.content?.trim() || "";

  return value.replace(/\s+/g, " ").slice(0, 200);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slugParam = req.query.slug;

  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  if (!slug) {
    res.status(400).send("News slug is required.");
    return;
  }

  if (!API_BASE_URL) {
    console.error("API_BASE_URL environment variable is not configured.");

    res.status(500).send("News metadata configuration is missing.");
    return;
  }

  try {
    const apiUrl = `${API_BASE_URL}/news/slug/` + encodeURIComponent(slug);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 404) {
        res.status(404).send("News article not found.");
        return;
      }

      res.status(502).send("Unable to load news article.");
      return;
    }

    const result = (await response.json()) as ApiResponse<NewsArticle>;

    const news = result.data;

    if (!news) {
      res.status(404).send("News article not found.");
      return;
    }

    const title = news.title?.trim() || "thenewstime.in";

    const description = getDescription(news);

    const image = getFirstImage(news.media);

    const newsUrl = `${SITE_URL}/news/` + encodeURIComponent(slug);

    const safeTitle = escapeHtml(title);

    const safeDescription = escapeHtml(description);

    const safeUrl = escapeHtml(newsUrl);

    const safeImage = image ? escapeHtml(image) : null;

    const imageMeta = safeImage
      ? `
        <meta
          property="og:image"
          content="${safeImage}"
        />

        <meta
          property="og:image:secure_url"
          content="${safeImage}"
        />

        <meta
          property="og:image:type"
          content="image/jpeg"
        />

        <meta
          name="twitter:image"
          content="${safeImage}"
        />
      `
      : "";

    const html = `
<!doctype html>
<html lang="ta">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>
      ${safeTitle} | thenewstime.in
    </title>

    <meta
      name="description"
      content="${safeDescription}"
    />

    <link
      rel="canonical"
      href="${safeUrl}"
    />

    <!-- Open Graph -->

    <meta
      property="og:type"
      content="article"
    />

    <meta
      property="og:site_name"
      content="thenewstime.in"
    />

    <meta
      property="og:title"
      content="${safeTitle}"
    />

    <meta
      property="og:description"
      content="${safeDescription}"
    />

    <meta
      property="og:url"
      content="${safeUrl}"
    />

    ${imageMeta}

    <meta
      property="og:locale"
      content="ta_IN"
    />

    <!-- Twitter / X -->

    <meta
      name="twitter:card"
      content="summary_large_image"
    />

    <meta
      name="twitter:title"
      content="${safeTitle}"
    />

    <meta
      name="twitter:description"
      content="${safeDescription}"
    />

    ${
      safeImage
        ? `
    <meta
      name="twitter:image"
      content="${safeImage}"
    />
    `
        : ""
    }
  </head>

  <body>
    <article>
      <h1>${safeTitle}</h1>

      <p>${safeDescription}</p>

      ${
        safeImage
          ? `
      <img
        src="${safeImage}"
        alt="${safeTitle}"
      />
      `
          : ""
      }

      <p>
        <a href="${safeUrl}">
          Read the full article on thenewstime.in
        </a>
      </p>
    </article>
  </body>
</html>
    `;

    /*
     * The same /news/:slug URL can be requested by
     * both crawlers and normal browsers.
     *
     * Keep this response cacheable, but tell caches
     * that the response varies by User-Agent.
     */
    res.setHeader("Vary", "User-Agent");

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600",
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    res.status(200).send(html);
  } catch (error) {
    console.error("Unable to generate news metadata:", error);

    res.status(500).send("Unable to generate news metadata.");
  }
}
