import { useEffect, useRef } from "react";

import HeroIndicators from "./HeroIndicators";
import HeroNavigation from "./HeroNavigation";
import HeroSlide from "./HeroSlide";
import { useHeroCarousel } from "./useHeroCarousel";

import type { NewsView } from "@/types";

interface HeroCarouselProps {
  items: NewsView[];
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const { activeIndex, next, previous, goTo, setPaused } = useHeroCarousel(
    items.length,
  );

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
          next();
          break;

        case "ArrowLeft":
          previous();
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, previous]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setPaused(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [setPaused]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = event.changedTouches[0].clientX;

    const distance = touchStartX.current - touchEndX.current;

    if (distance > 60) {
      next();
    }

    if (distance < -60) {
      previous();
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Featured news carousel"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <HeroSlide news={items[activeIndex]} />

      {items.length > 1 && (
        <>
          <HeroNavigation onPrevious={previous} onNext={next} />

          <HeroIndicators
            total={items.length}
            active={activeIndex}
            onSelect={goTo}
          />
        </>
      )}
    </div>
  );
}
