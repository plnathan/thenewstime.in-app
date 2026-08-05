/**
 * -----------------------------------------------------------------------------
 * Hero Section
 * -----------------------------------------------------------------------------
 */

import HeroCarousel from "./HeroCarousel";
import HeroSidebar from "./HeroSidebar";

import type { NewsView } from "@/types";

interface HeroSectionProps {
  featured: NewsView[];
  trending: NewsView[];
}

export default function HeroSection({ featured, trending }: HeroSectionProps) {
  return (
    <section
      className="
        mt-6

        grid
        gap-6

        xl:grid-cols-[2fr_360px]
      "
    >
      <HeroCarousel items={featured} />

      <HeroSidebar news={trending} />
    </section>
  );
}
