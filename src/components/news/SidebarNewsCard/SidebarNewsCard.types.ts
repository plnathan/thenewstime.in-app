/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : SidebarNewsCard
 * -----------------------------------------------------------------------------
 */

import type { NewsView } from "@/types/news.types";

export interface SidebarNewsCardProps {
  news: NewsView;

  onClick?: (news: NewsView) => void;
}
