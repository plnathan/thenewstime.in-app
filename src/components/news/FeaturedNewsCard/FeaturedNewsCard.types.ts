/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : FeaturedNewsCard
 * -----------------------------------------------------------------------------
 */

import type { NewsItem } from "@/types/news.types";

export interface FeaturedNewsCardProps {
  news: NewsItem;

  onClick?: (news: NewsItem) => void;
}
