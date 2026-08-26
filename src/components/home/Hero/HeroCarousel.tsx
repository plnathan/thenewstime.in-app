import { useEffect, useRef, useState } from "react";

import HeroIndicators from "./HeroIndicators";
import HeroNavigation from "./HeroNavigation";
import HeroSlide from "./HeroSlide";

import type { NewsView } from "@/types";

interface HeroCarouselProps {
  items: NewsView[];
}

const AUTO_PLAY_INTERVAL = 5000;
const SWIPE_THRESHOLD = 70;

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
      if (event.key === "ArrowLeft") {
        previous();
      }

      if (event.key === "ArrowRight") {
        next();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () =>
      window.removeEventListener("keydown", onKeyDown);
  }, [total]);

  function handleTouchStart(
    event: React.TouchEvent
  ) {
    const clientX = event.targetTouches[0]?.clientX ?? 0;

    /*
     * Initialize both values at touch start.
     *
     * This is important because a normal tap may not trigger
     * touchmove. Without this, touchEnd would remain 0 and
     * every tap could be interpreted as a swipe.
     */
    touchStart.current = clientX;
    touchEnd.current = clientX;
  }

  function handleTouchMove(
    event: React.TouchEvent
  ) {
    touchEnd.current =
      event.targetTouches[0]?.clientX ??
      touchStart.current;
  }

  function handleTouchEnd() {
    const distance =
      touchStart.current - touchEnd.current;

    /*
     * Only change the slide when the user's finger actually
     * moved beyond the swipe threshold.
     *
     * A normal tap produces distance === 0 and therefore does
     * not change the active slide.
     */
    if (distance > SWIPE_THRESHOLD) {
      next();
    } else if (distance < -SWIPE_THRESHOLD) {
      previous();
    }

    /*
     * Reset the touch values after the gesture.
     */
    touchStart.current = 0;
    touchEnd.current = 0;
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