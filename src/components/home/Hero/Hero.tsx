import HeroCarousel from "./HeroCarousel";
import HeroSidebar from "./HeroSidebar";
import BreakingTicker from "./BreakingTicker";

import type { NewsView } from "@/types";

interface Props {
  featured: NewsView[];
  sidebar: NewsView[];
}

export default function Hero({ featured, sidebar }: Props) {
  return (
    <>
      <BreakingTicker
        news={featured}
      />

      <section
        className="
          mt-4
          grid
          gap-6

          xl:grid-cols-[2fr_360px]
        "
      >
        <HeroCarousel items={featured} />

        <HeroSidebar news={sidebar.slice(0, 5)} />
      </section>
    </>
  );
}
