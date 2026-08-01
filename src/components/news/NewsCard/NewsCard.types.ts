/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : NewsCard
 * File        : NewsCard.types.ts
 * -----------------------------------------------------------------------------
 */
import type { NewsItem } from "@/types/news.types";

export interface NewsCardProps {
  news: NewsItem;
  image?: string;
  onClick?: () => void;
}
