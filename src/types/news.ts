/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : News Types
 * File       : news.ts
 * -----------------------------------------------------------------------------


export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
}

export interface NewsSummary {
  id: number;
  title: string;
  slug: string;
  summary: string;
  thumbnailUrl?: string;
  category: NewsCategory;
  publishedAt: string;
}

export interface NewsDetail extends NewsSummary {
  content: string;
  author?: string;
  readingTime?: number;
}
 */
