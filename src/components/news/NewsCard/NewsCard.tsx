/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : NewsCard
 * -----------------------------------------------------------------------------
 */

import { Volume2 } from "lucide-react";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";
import NewsMeta from "@/components/news/NewsMeta/NewsMeta";

import type { NewsCardProps } from "./NewsCard.types";

export default function NewsCard({
  news,
  compact = false,
  onClick,
}: NewsCardProps) {
  const {
    title,
    summary,
    thumbnailUrl,
    publishedAt,
    views,
    comments,
    audioAvailable,
  } = news;

  return (
    <Surface
      hoverable
      clickable
      onClick={onClick}
      className={`
        group
        overflow-hidden
        transition-all
        duration-300
        ${compact ? "p-3" : "p-4 md:p-5"}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail */}

        {thumbnailUrl && (
          <div
            className={`
              overflow-hidden
              rounded-lg
              shrink-0

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

        {/* Content */}

        <div className="flex min-w-0 flex-1 flex-col">
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

          {!compact && summary && (
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

          <div className="mt-3">
            <NewsMeta
              publishedAt={publishedAt}
              views={views}
              comments={comments}
              audioAvailable={audioAvailable}
              compact={compact}
            />
          </div>

          {audioAvailable && compact && (
            <div className="mt-2">
              <Volume2
                size={15}
                className="text-green-600"
              />
            </div>
          )}
        </div>
      </div>
    </Surface>
  );
}