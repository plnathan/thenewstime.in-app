/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : NewsCard
 * -----------------------------------------------------------------------------
 */

import { Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import NewsMeta from "@/components/news/NewsMeta/NewsMeta";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";
import { ROUTES } from "@/constants";

import type { NewsCardProps } from "./NewsCard.types";

export default function NewsCard({
  news,
  compact = false,
  onClick,
}: NewsCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
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
        </div>

        <div
          className="
            col-span-2
            md:col-span-1
            md:col-start-2
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

        {audioAvailable && compact && (
          <div className="col-span-2 md:col-start-2 md:col-span-1">
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