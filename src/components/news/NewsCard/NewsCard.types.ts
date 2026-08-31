/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : NewsCard
 * File        : NewsCard.types.ts
 * -----------------------------------------------------------------------------
 */
import type { NewsView } from "@/types/news.types";

export interface NewsCardProps {
  news: NewsView;
  //image?: string;
  /**
   * Compact layout used in:
   * - Hero sidebar
   * - Trending news
   * - Related news
   */
  compact?: boolean;
  showSummary?: boolean;
  onClick?: (news: NewsView) => void;
}
