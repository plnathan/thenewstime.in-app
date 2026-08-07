//import newsPlaceholder from "@/assets/images/news-placeholder.jpg";

import type { News, NewsView } from "@/types";

export function toNewsView(news: News): NewsView {
  return {
    id: news.id,

    slug: news.slug,

    title: news.title,

    summary: news.summary ?? "",

    thumbnailUrl: "/assets/images/news-placeholder.jpg",

    publishedAt: news.publishedAt ?? "",

    views: 0,

    comments: 0,

    audioAvailable: false,

    categoryName: news.categoryName,

    featured: false,

    breaking: false,
  };
}

export function toNewsViewList(news: News[]): NewsView[] {
  return news.map(toNewsView);
}
/*
function getCategoryName(categoryId: number): string {
  switch (categoryId) {
    case 1:
      return "தமிழ்நாடு";

    case 2:
      return "இந்தியா";

    case 3:
      return "உலகம்";

    case 4:
      return "விளையாட்டு";

    default:
      return "";
  }
}
*/
