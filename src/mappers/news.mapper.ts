import type { News, NewsView } from "@/types";

export function toNewsView(news: News): NewsView {
  return {
    id: news.id,
    slug: news.slug,
    title: news.title,
    summary: news.summary ?? "",
    thumbnailUrl: "/images/news-placeholder.jpg", // temporary until media API
    publishedAt: news.publishedAt ?? "",
    views: 0,
    comments: 0,
    audioAvailable: false,
    category: "",
    featured: false,
    breaking: false,
  };
}
