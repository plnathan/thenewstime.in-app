import { Clock3, Eye } from "lucide-react";

import type { NewsView } from "@/types";

interface Props {
  news: NewsView;
}

export default function SidebarNewsItem({ news }: Props) {
  return (
    <article
      className="
        flex
        gap-3
        cursor-pointer
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
          rounded-md
          object-cover
          flex-shrink-0
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
