import type { BreakingNewsItem as Item } from "./BreakingNews.types";

interface Props {
  item: Item;
}

export default function BreakingNewsItem({ item }: Props) {
  return (
    <a
      href={item.url}
      className="
        mx-6
        whitespace-nowrap
        text-sm
        text-gray-700
        hover:text-green-700
      "
    >
      ● {item.title}
    </a>
  );
}
