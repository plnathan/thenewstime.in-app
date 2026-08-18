import { useEffect, useRef, useState } from "react";

import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";

import HeroIndicators from "@/components/home/Hero/HeroIndicators";
import HeroNavigation from "@/components/home/Hero/HeroNavigation";

interface Props {
    media: NewsMedia[];
    title: string;
}

const AUTO_PLAY_INTERVAL = 5000;

export default function NewsArticleHeroCarousel({
    media,
    title,
}: Props) {
    const orderedMedia = [...media].sort(
        (a, b) => a.displayOrder - b.displayOrder,
    );

    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const touchStart = useRef(0);
    const touchEnd = useRef(0);

    const total = orderedMedia.length;

    const previous = () => {
        setActiveIndex((current) =>
            current === 0 ? total - 1 : current - 1,
        );
    };

    const next = () => {
        setActiveIndex((current) => (current + 1) % total);
    };

    useEffect(() => {
        if (paused || total <= 1) {
            return;
        }

        const timer = window.setInterval(
            next,
            AUTO_PLAY_INTERVAL,
        );

        return () => window.clearInterval(timer);
    }, [paused, total]);

    const handleTouchStart = (
        event: React.TouchEvent,
    ) => {
        touchStart.current =
            event.targetTouches[0]?.clientX ?? 0;

        touchEnd.current = touchStart.current;
    };

    const handleTouchMove = (
        event: React.TouchEvent,
    ) => {
        touchEnd.current =
            event.targetTouches[0]?.clientX ??
            touchEnd.current;
    };

    const handleTouchEnd = () => {
        const distance =
            touchStart.current - touchEnd.current;

        if (distance > 70) {
            next();
        }

        if (distance < -70) {
            previous();
        }
    };

    if (!total) {
        return null;
    }

    const activeMedia = orderedMedia[activeIndex];

    if (!activeMedia) {
        return null;
    }

    return (
        <section
            className="
        relative
        overflow-hidden
        rounded-xl
        bg-black
      "
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            aria-label="News image carousel"
        >
            <img
                src={activeMedia.fileUrl}
                alt={
                    activeMedia.altText ??
                    activeMedia.originalFileName ??
                    title
                }
                className="
          h-[340px]
          w-full
          object-cover

          sm:h-[360px]
          md:h-[400px]
          lg:h-[430px]
          xl:h-[450px]
        "
                onError={(event) => {
                    event.currentTarget.src =
                        "/assets/hero.png";
                }}
            />

            <div
                className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-gradient-to-t
          from-black/60
          via-black/10
          to-transparent
        "
            />

            {activeMedia.caption && (
                <div
                    className="
            absolute
            bottom-10
            left-4
            right-4
            z-20
            sm:left-8
            sm:right-8
            md:left-12
            md:right-12
          "
                >
                    <p
                        className="
              max-w-2xl
              text-sm
              leading-6
              text-white
              drop-shadow
            "
                    >
                        {activeMedia.caption}
                    </p>
                </div>
            )}

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