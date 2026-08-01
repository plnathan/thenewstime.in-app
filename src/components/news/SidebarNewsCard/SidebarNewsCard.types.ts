/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : SidebarNewsCard
 * -----------------------------------------------------------------------------
 */

import type { NewsItem } from "@/types/news.types";

export interface SidebarNewsCardProps {
  news: NewsItem;

  onClick?: (news: NewsItem) => void;
}
