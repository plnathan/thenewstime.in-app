import Advertisement from "@/components/advertisement";

import HeroCarousel from "./HeroCarousel";

import type { NewsView } from "@/types";

interface Props {
  featured: NewsView[];
}

export default function Hero({
  featured,
}: Props) {
  return (
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

      <Advertisement />
    </section>
  );
}