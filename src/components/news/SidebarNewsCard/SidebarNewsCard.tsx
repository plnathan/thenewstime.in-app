/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : SidebarNewsCard
 * -----------------------------------------------------------------------------
 */

import {
  Clock3,
  Eye,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import type { SidebarNewsCardProps } from "./SidebarNewsCard.types";
import { ROUTES } from "@/constants";

import { formatRelativeTime } from "@/utils/date/formatRelativeTime";

const TEMP_COMMENTS_COUNT = 1;

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

  const relativeTime = formatRelativeTime(news.publishedAt);

  return (
    <Surface
      layout="newspaper"
      hoverable
      clickable
      onClick={handleClick}
    >
      <div className="flex min-w-0 max-w-full gap-3">
        {/* --------------------------------------------------
         * Left column
         *
         * Image + published time
         * -------------------------------------------------- */}
        <div className="w-32 min-w-0 shrink-0">
          {news.thumbnailUrl && (
            <img
              src={news.thumbnailUrl}
              alt={news.title}
              className="
                h-24
                w-32
                rounded
                object-cover
              "
            />
          )}

          {/* Published time directly below image */}
          {relativeTime && (
            <div
              className="
                mt-1
                flex
                shrink-0
                items-center
                gap-1
                text-xs
                text-gray-500
              "
            >
              <Clock3
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />

              <Typography
                as="span"
                variant="caption"
                className="whitespace-nowrap"
              >
                {relativeTime}
              </Typography>
            </div>
          )}
        </div>

        {/* --------------------------------------------------
         * Right column
         *
         * Title + one-line summary + views/comments
         * -------------------------------------------------- */}
        <div className="flex min-w-0 max-w-full flex-1 flex-col">
          {/* Title */}
          <Typography
            variant="articleTitle"
            className="
              min-w-0
              max-w-full
              wrap-break-word
              line-clamp-2
            "
          >
            {news.title}
          </Typography>

          {/* Summary - single line ONLY for SidebarNewsCard */}
          {news.summary && (
            <p
              className="
                mt-1
                min-w-0
                max-w-full
                truncate
                text-sm
                leading-snug
                text-gray-600
              "
            >
              {news.summary}
            </p>
          )}

          {/* Views + Comments */}
          <div
            className="
              mt-auto
              flex
              items-center
              justify-end
              gap-4
              pt-2
              text-xs
              text-gray-500
            "
          >
            <span className="inline-flex items-center gap-1.5">
              <Eye
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              <Typography
                as="span"
                variant="caption"
              >
                {(news.views ?? 0).toLocaleString()}
              </Typography>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <MessageSquare
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              <Typography
                as="span"
                variant="caption"
              >
                {TEMP_COMMENTS_COUNT}
              </Typography>
            </span>
          </div>
        </div>
      </div>
    </Surface>
  );
}