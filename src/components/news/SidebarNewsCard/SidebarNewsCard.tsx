/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : SidebarNewsCard
 * -----------------------------------------------------------------------------
 */

import { useNavigate } from "react-router-dom";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import NewsMeta from "../NewsMeta";

import type { SidebarNewsCardProps } from "./SidebarNewsCard.types";
import { ROUTES } from "@/constants";

export default function SidebarNewsCard({
  news,
  onClick,
}: SidebarNewsCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(news);
      return;
    }

    navigate(ROUTES.NEWSDETAIL(news.slug));
  };

  return (
    <Surface
      layout="newspaper"
      hoverable
      clickable
      onClick={handleClick}
    >
      {/* Image + Title + Summary */}
      <div className="flex gap-3">
        {news.thumbnailUrl && (
          <img
            src={news.thumbnailUrl}
            alt={news.title}
            className="
              h-20
              w-28
              shrink-0
              rounded
              object-cover
            "
          />
        )}

        <div className="min-w-0 flex-1">
          <Typography
            variant="articleTitle"
            className="line-clamp-2"
          >
            {news.title}
          </Typography>

          {news.summary && (
            <Typography
              variant="body"
              className="mt-1 line-clamp-1"
            >
              {news.summary}
            </Typography>
          )}
        </div>
      </div>

      {/* Metadata - Full Width Bottom Row */}
      <NewsMeta
        compact
        className="mt-3"
        publishedAt={news.publishedAt}
        views={news.views}
      />
    </Surface>
  );
}