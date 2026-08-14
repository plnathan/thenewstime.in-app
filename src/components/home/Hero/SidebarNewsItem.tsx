import { Clock3, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { NewsView } from "@/types";
import { ROUTES } from "@/constants";

interface Props {
  news: NewsView;
}

export default function SidebarNewsItem({
  news,
}: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.NEWSDETAIL(news.slug));
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="
        flex
        cursor-pointer
        gap-3
        transition
        hover:opacity-80
      "
    >
      <img
        src={news.thumbnailUrl}
        alt={news.title}
        className="
          h-20
          w-28
          shrink-0
          rounded-md
          object-cover
        "
      />

      <div className="min-w-0">
        <h3
          className="
            line-clamp-2
            text-sm
            font-semibold
            leading-snug
          "
        >
          {news.title}
        </h3>

        <div
          className="
            mt-2
            flex
            items-center
            gap-4
            text-xs
            text-gray-500
          "
        >
          <span className="flex items-center gap-1">
            <Clock3 size={13} />
            {news.publishedAt}
          </span>

          <span className="flex items-center gap-1">
            <Eye size={13} />
            {(news.views ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
}