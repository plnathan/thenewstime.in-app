import styles from "./BreakingNews.module.css";

import BreakingNewsControls from "./BreakingNewsControls";
import BreakingNewsItem from "./BreakingNewsItem";
import { breakingNews } from "./breakingNews.data";

import type { BreakingNewsProps } from "./BreakingNews.types";

export default function BreakingNews({
  items = breakingNews,
}: BreakingNewsProps) {
  // Duplicate items to create a seamless loop
  const tickerItems = [...items, ...items];

  return (
    <section
      className="
        flex
        items-center
        border-b
        border-gray-200
        bg-white
      "
    >
      <div
        className="
          bg-red-600
          px-4
          py-2
          text-xs
          font-bold
          uppercase
          text-white
          shrink-0
        "
      >
        Breaking
      </div>

      <div className={`flex-1 ${styles.ticker}`}>
        <div className={styles.track}>
          {tickerItems.map((item, index) => (
            <BreakingNewsItem key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>

      <BreakingNewsControls />
    </section>
  );
}
