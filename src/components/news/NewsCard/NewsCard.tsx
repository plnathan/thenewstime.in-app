/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : NewsCard
 * -----------------------------------------------------------------------------
 */

import { Eye, MessageSquare, Volume2 } from "lucide-react";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";
import { formatDate } from "@/utils";

import type { NewsCardProps } from "./NewsCard.types";

export default function NewsCard({
  news,
  compact = false,
  onClick,
}: NewsCardProps) {
  const {
    title,
    summary,
    publishedAt,
    audioAvailable,
    views,
    comments,
    thumbnailUrl,
  } = news;
  return (
    <Surface
      hoverable
      clickable
      onClick={onClick}
      className={compact ? "p-3" : "p-5"}
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="flex-1">
          <Typography variant="articleTitle" className="line-clamp-2">
            {title}
          </Typography>

          {!compact && summary && (
            <Typography variant="summary" className="mt-2 line-clamp-2">
              {summary}
            </Typography>
          )}

          <div
            className={
              compact
                ? "mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500"
                : "mt-2 sm:mt-4 flex flex-wrap items-center gap-5 text-sm text-gray-500"
            }
          >
            <span>{formatDate(publishedAt)}</span>

            {audioAvailable && <Volume2 size={16} />}

            {!compact && (
              <>
                <span className="flex items-center gap-1">
                  <Eye size={15} />
                  {views.toLocaleString()}
                </span>

                <span className="flex items-center gap-1">
                  <MessageSquare size={15} />
                  {comments}
                </span>
              </>
            )}
          </div>
        </div>

        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title}
            className={
              compact
                ? `
        h-20
        w-28
        rounded
        object-cover
        flex-shrink-0
      `
                : `
        hidden
        h-28
        w-40
        rounded
        object-cover
        md:block
      `
            }
          />
        )}
      </div>
    </Surface>
  );
}
