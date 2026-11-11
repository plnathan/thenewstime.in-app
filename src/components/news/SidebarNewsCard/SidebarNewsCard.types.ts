/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : SidebarNewsCard
 * -----------------------------------------------------------------------------
 */

import type { NewsView } from "@/types/news.types";

export interface SidebarNewsCardProps {
  news: NewsView;
  /** Compact sidebar layout for News Details popular stories. */
  compact?: boolean;

  onClick?: (news: NewsView) => void;
}
