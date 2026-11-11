
/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : SidebarNewsCard
 * Description : Responsive news card with optional compact sidebar layout.
 * -----------------------------------------------------------------------------
 */

import { useNavigate } from "react-router-dom";
import { useState } from "react";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import NewsMeta from "../NewsMeta";

import type { SidebarNewsCardProps } from "./SidebarNewsCard.types";
import { ROUTES } from "@/constants";

export default function SidebarNewsCard({
  news,
  onClick,
  compact = false,
}: SidebarNewsCardProps) {
  const navigate = useNavigate();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const thumbnailUrl = news.thumbnailUrl?.trim() ?? "";
  const showThumbnail = Boolean(thumbnailUrl) && failedImageUrl !== thumbnailUrl;

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
      {/* Image and title */}
      <div
        className={
          compact
            ? "flex min-w-0 items-start gap-3"
            : "flex gap-3"
        }
      >
        {showThumbnail && (
          <img
            src={thumbnailUrl}
            onError={() => setFailedImageUrl(thumbnailUrl)}
            alt={news.title}
            loading="lazy"
            className={
              compact
                ? "h-[76px] w-[88px] shrink-0 rounded object-cover"
                : "h-20 w-28 shrink-0 rounded object-cover"
            }
          />
        )}

        <div className="min-w-0 flex-1">
          <Typography
            variant={compact ? "body" : "articleTitle"}
            className={
              compact
                ? "line-clamp-3 break-words text-[16px] font-semibold leading-[1.5]"
                : "line-clamp-2"
            }
          >
            {news.title}
          </Typography>

          {!compact && news.summary && (
            <Typography
              variant="body"
              className="mt-1 line-clamp-1"
            >
              {news.summary}
            </Typography>
          )}
        </div>
      </div>

      {/* Compact summary uses full card width */}
      {compact && news.summary && (
        <Typography
          variant="body"
          className="mt-2 line-clamp-2 break-words text-[13px] leading-[1.6] text-gray-600"
        >
          {news.summary}
        </Typography>
      )}

      {/* Metadata */}
      <NewsMeta
        compact
        className="mt-3"
        publishedAt={news.publishedAt}
        views={news.views}
      />
    </Surface>
  );
}
