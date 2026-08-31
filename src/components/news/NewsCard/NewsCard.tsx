/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : News Components
 * Component   : NewsCard
 * -----------------------------------------------------------------------------
 */

import {
  Clock3,
  Eye,
  MessageSquare,
  Volume2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import NewsMeta from "@/components/news/NewsMeta/NewsMeta";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";
import { ROUTES } from "@/constants";

import { formatRelativeTime } from "@/utils/date/formatRelativeTime";

import type { NewsCardProps } from "./NewsCard.types";

export default function NewsCard({
  news,
  compact = false,
  showSummary = false,
  onClick,
}: NewsCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(news);
      return;
    }

    navigate(ROUTES.NEWSDETAIL(news.slug));
  };

  const {
    title,
    summary,
    thumbnailUrl,
    publishedAt,
    views,
    comments,
    audioAvailable,
  } = news;

  const relativeTime = formatRelativeTime(publishedAt);

  return (
    <Surface
      hoverable
      clickable
      onClick={handleClick}
      className={`
        group
        overflow-hidden
        transition-all
        duration-300
        ${compact ? "p-3" : "p-4 md:p-5"}
      `}
    >
      <div
        className="
          grid
          grid-cols-[auto_minmax(0,1fr)]
          gap-4
        "
      >
        {/* -----------------------------------------------------------------
         * Thumbnail
         *
         * Keep the existing image size.
         * ----------------------------------------------------------------- */}
        {thumbnailUrl && (
          <div
            className={`
              shrink-0
              overflow-hidden
              rounded-lg
              ${compact
                ? "h-20 w-28"
                : "h-24 w-32 sm:h-28 sm:w-40 md:h-32 md:w-48"
              }
            `}
          >
            <img
              src={thumbnailUrl}
              alt={title}
              loading="lazy"
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />
          </div>
        )}

        {/* -----------------------------------------------------------------
         * News content
         * ----------------------------------------------------------------- */}
        <div className="min-w-0">
          <Typography
            variant="body"
            className={`
              font-bold
              leading-snug
              text-gray-900
              transition-colors
              group-hover:text-green-700
              ${compact
                ? "line-clamp-2 text-sm"
                : "line-clamp-2 text-base sm:text-lg"
              }
            `}
          >
            {title}
          </Typography>

          {/* Summary */}
          {(showSummary || !compact) && summary && (
            <Typography
              variant="summary"
              className="
                mt-2
                line-clamp-2
                text-sm
                text-gray-600
              "
            >
              {summary}
            </Typography>
          )}
        </div>

        {/* -----------------------------------------------------------------
         * Metadata
         *
         * IMPORTANT:
         *
         * This is intentionally OUTSIDE the right-side content column.
         *
         * col-span-2 makes the metadata occupy the full width of the card.
         *
         * For compact + showSummary (பிரபலமானவை):
         *   Time      -> left
         *   Views     -> right
         *   Comments  -> right
         *
         * This prevents the metadata from wrapping because of the
         * narrow news-content column.
         * ----------------------------------------------------------------- */}
        {compact && showSummary ? (
          <div
            className="
              col-span-2
              flex
              w-full
              items-center
              justify-between
              gap-2
              text-xs
              text-gray-500
            "
          >
            {/* Time - left aligned */}
            <span
              className="
                inline-flex
                min-w-0
                items-center
                gap-1
                truncate
              "
            >
              <Clock3
                size={13}
                className="shrink-0"
              />

              <span className="truncate">
                {relativeTime}
              </span>
            </span>

            {/* Views + Comments - right aligned */}
            <div
              className="
                flex
                shrink-0
                items-center
                gap-4
              "
            >
              <span className="inline-flex items-center gap-1">
                <Eye size={13} />

                {(views ?? 0).toLocaleString()}
              </span>

              <span className="inline-flex items-center gap-1">
                <MessageSquare size={13} />

                {comments ?? 1}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="
              col-span-2
            "
          >
            <NewsMeta
              publishedAt={publishedAt}
              views={views}
              comments={comments}
              audioAvailable={audioAvailable}
              compact={compact}
            />
          </div>
        )}

        {/* -----------------------------------------------------------------
         * Audio indicator
         * ----------------------------------------------------------------- */}
        {audioAvailable && compact && (
          <div className="col-span-2">
            <Volume2
              size={15}
              className="text-green-600"
            />
          </div>
        )}
      </div>
    </Surface>
  );
}