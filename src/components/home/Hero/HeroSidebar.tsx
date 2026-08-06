import SidebarNewsItem from "./SidebarNewsItem";

import type { NewsView } from "@/types";

interface Props {
  news: NewsView[];
}

export default function HeroSidebar({
  news,
}: Props) {
  return (
    <aside
      className="
        hidden

        xl:flex
        xl:flex-col

        h-full
      "
    >
      <h2
        className="
          mb-5

          text-xl
          font-bold

          text-neutral-900
        "
      >
        பிரபலமானவை
      </h2>

      <div
        className="
          flex-1

          space-y-4
        "
      >
        {news.slice(0, 5).map((item) => (
          <SidebarNewsItem
            key={item.id}
            news={item}
          />
        ))}
      </div>
    </aside>
  );
}