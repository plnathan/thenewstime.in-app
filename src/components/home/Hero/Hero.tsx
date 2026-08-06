import BreakingTicker from "./BreakingTicker";
import HeroCarousel from "./HeroCarousel";
import HeroSidebar from "./HeroSidebar";

import type { NewsView } from "@/types";

interface Props {
  featured: NewsView[];
  sidebar: NewsView[];
}

export default function Hero({
  featured,
  sidebar,
}: Props) {
  return (
    <>
      <BreakingTicker news={featured} />

      <section
        className="
          mt-4

          grid
          gap-6

          xl:grid-cols-[minmax(0,2fr)_360px]
          xl:items-start
        "
      >
        <HeroCarousel items={featured} />

        <HeroSidebar news={sidebar.slice(0, 5)} />
      </section>
    </>
  );
}