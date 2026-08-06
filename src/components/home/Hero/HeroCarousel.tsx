import { useEffect, useRef, useState } from "react";

import HeroIndicators from "./HeroIndicators";
import HeroNavigation from "./HeroNavigation";
import HeroSlide from "./HeroSlide";

import type { NewsView } from "@/types";

interface HeroCarouselProps {
  items: NewsView[];
}

const AUTO_PLAY_INTERVAL = 5000;

export default function HeroCarousel({
  items,
}: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const total = items.length;

  function previous() {
    setActiveIndex((current) =>
      current === 0 ? total - 1 : current - 1
    );
  }

  function next() {
    setActiveIndex((current) => (current + 1) % total);
  }

  useEffect(() => {
    if (paused || total <= 1) return;

    const timer = window.setInterval(
      next,
      AUTO_PLAY_INTERVAL
    );

    return () => clearInterval(timer);
  }, [paused, total]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") previous();

      if (event.key === "ArrowRight") next();
    }

    window.addEventListener("keydown", onKeyDown);

    return () =>
      window.removeEventListener("keydown", onKeyDown);
  }, [total]);

  function handleTouchStart(
    event: React.TouchEvent
  ) {
    touchStart.current =
      event.targetTouches[0].clientX;
  }

  function handleTouchMove(
    event: React.TouchEvent
  ) {
    touchEnd.current =
      event.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    const distance =
      touchStart.current - touchEnd.current;

    if (distance > 70) next();

    if (distance < -70) previous();
  }

  if (!total) return null;

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-xl
      "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <HeroSlide news={items[activeIndex]} />

      {total > 1 && (
        <>
          <HeroNavigation
            onPrevious={previous}
            onNext={next}
          />

          <HeroIndicators
            total={total}
            active={activeIndex}
            onSelect={setActiveIndex}
          />
        </>
      )}
    </section>
  );
}