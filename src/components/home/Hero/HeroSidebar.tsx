import SidebarNewsItem from "./SidebarNewsItem";

import type { NewsView } from "@/types";

interface Props {
  news: NewsView[];
}

export default function HeroSidebar({ news }: Props) {
  return (
    <aside
      className="
        hidden

        xl:flex
        xl:flex-col
      "
    >
      <h2
        className="
          mb-5
          text-xl
          font-bold
        "
      >
        பிரபலமானவை
      </h2>

      <div className="space-y-4">
        {news.slice(0, 5).map((item) => (
          <SidebarNewsItem key={item.id} news={item} />
        ))}
      </div>
    </aside>
  );
}
