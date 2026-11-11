import HeroCarousel from "./HeroCarousel";

import type { NewsView } from "@/types";

interface Props {
  featured: NewsView[];
}

export default function Hero({ featured }: Props) {
  return (
    <section className="w-full min-w-0">
      <HeroCarousel items={featured} />
    </section>
  );
}
