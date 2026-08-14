/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : FeaturedNewsCard
 * -----------------------------------------------------------------------------
 */

import { useNavigate } from "react-router-dom";

import Badge from "@/components/ui/Badge";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import NewsMeta from "../NewsMeta";

import type { FeaturedNewsCardProps } from "./FeaturedNewsCard.types";
import { ROUTES } from "@/constants";

export default function FeaturedNewsCard({
  news,
  onClick,
}: FeaturedNewsCardProps) {
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
      clickable
      radius="lg"
      className="group overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative aspect-[5/4] w-full sm:aspect-[16/10] lg:aspect-[16/9]">
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5 lg:p-6">
          {news.breaking && (
            <Badge variant="danger">
              Breaking News
            </Badge>
          )}

          <Typography
            variant="heroTitle"
            className="mt-3 line-clamp-2 text-white"
          >
            {news.title}
          </Typography>

          {news.summary && (
            <Typography
              variant="summary"
              className="mt-3 hidden line-clamp-2 text-gray-200 md:block"
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
