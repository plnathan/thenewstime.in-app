import { useCallback, useEffect, useState } from "react";

const AUTO_PLAY_INTERVAL = 5000;

export function useHeroCarousel(total: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActiveIndex((current) => (current + 1) % total);
  }, [total]);

  const previous = useCallback(() => {
    setActiveIndex((current) => (current === 0 ? total - 1 : current - 1));
  }, [total]);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    if (paused || total <= 1) {
      return;
    }

    const timer = window.setInterval(next, AUTO_PLAY_INTERVAL);

    return () => window.clearInterval(timer);
  }, [next, paused, total]);

  return {
    activeIndex,
    next,
    previous,
    goTo,
    paused,
    setPaused,
  };
}
