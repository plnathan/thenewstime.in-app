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
  news: { title, summary, publishedAt, audioAvailable, views, comments },
  image,
  onClick,
}: NewsCardProps) {
  return (
    <Surface layout="newspaper" hoverable clickable onClick={onClick}>
      <div className="flex gap-3 sm:gap-4">
        <div className="flex-1">
          <Typography variant="articleTitle" className="line-clamp-2">
            {title}
          </Typography>

          <Typography variant="summary" className="mt-2 line-clamp-2">
            {summary}
          </Typography>

          <div className="mt-2 sm:mt-4 flex flex-wrap items-center gap-5 text-sm text-gray-500">
            <span>{formatDate(publishedAt)}</span>

            {audioAvailable && <Volume2 size={16} />}

            <span className="flex items-center gap-1">
              <Eye size={15} />

              {views.toLocaleString()}
            </span>

            <span className="flex items-center gap-1">
              <MessageSquare size={15} />

              {comments}
            </span>
          </div>
        </div>

        {image && (
          <img
            src={image}
            alt={title}
            className="h-20 w-28
                        sm:h-24
                        sm:w-32

                        lg:h-28
                        lg:w-40 rounded object-cover flex-shrink-0"
          />
        )}
      </div>
    </Surface>
  );
}
