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
      <div className="flex gap-3">
        {news.thumbnailUrl && (
          <img
            src={news.thumbnailUrl}
            alt={news.title}
            className="
                  h-full
                  min-h-24
                  w-32
                  shrink-0
                  self-stretch
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

          <NewsMeta
            compact
            className="mt-2"
            publishedAt={news.publishedAt}
            views={news.views}
          />
        </div>
      </div>
    </Surface>
  );
}
