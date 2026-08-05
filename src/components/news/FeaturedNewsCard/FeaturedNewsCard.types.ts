/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : FeaturedNewsCard
 * -----------------------------------------------------------------------------
 */

import type { NewsView } from "@/types/news.types";

export interface FeaturedNewsCardProps {
  news: NewsView;

  onClick?: (news: NewsView) => void;
}
