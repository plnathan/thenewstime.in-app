/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : FeaturedNewsCard
 * -----------------------------------------------------------------------------
 */

import Badge from "@/components/ui/Badge";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import NewsMeta from "../NewsMeta";

import type { FeaturedNewsCardProps } from "./FeaturedNewsCard.types";

export default function FeaturedNewsCard({
  news,
  onClick,
}: FeaturedNewsCardProps) {
  return (
    <Surface
      clickable
      radius="lg"
      className="group overflow-hidden"
      onClick={() => onClick?.(news)}
    >
      <div className="relative aspect-[16/9] w-full">
        <img
          src={news.thumbnailUrl}
          alt={news.title}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />

        {/* Overlay */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/80
            via-black/40
            to-transparent
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            p-6
            text-white
          "
        >
          {news.breaking && <Badge variant="danger">Breaking News</Badge>}

          <Typography variant="heroTitle" className="mt-4 text-white">
            {news.title}
          </Typography>

          {news.summary && (
            <Typography
              variant="summary"
              className="mt-3 text-gray-200 line-clamp-2"
            >
              {news.summary}
            </Typography>
          )}

          <NewsMeta
            className="mt-5 text-gray-200"
            publishedAt={news.publishedAt}
            views={news.views}
            comments={news.comments}
            audioAvailable={news.audioAvailable}
          />
        </div>
      </div>
    </Surface>
  );
}
