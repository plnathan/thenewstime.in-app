/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : SidebarNewsCard
 * -----------------------------------------------------------------------------
 */

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import NewsMeta from "../NewsMeta";

import type { SidebarNewsCardProps } from "./SidebarNewsCard.types";

export default function SidebarNewsCard({
  news,
  onClick,
}: SidebarNewsCardProps) {
  return (
    <Surface
      layout="newspaper"
      hoverable
      clickable
      onClick={() => onClick?.(news)}
    >
      <div className="flex gap-3">
        {news.thumbnailUrl && (
          <img
            src={news.thumbnailUrl}
            alt={news.title}
            className="h-20 w-28 shrink-0 rounded object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          <Typography variant="articleTitle" className="line-clamp-2">
            {news.title}
          </Typography>

          <NewsMeta
            compact
            className="mt-2"
            publishedAt={news.publishedAt}
            views={news.views}
          />
        </div>
      </div>
    </Surface>
  );
}
