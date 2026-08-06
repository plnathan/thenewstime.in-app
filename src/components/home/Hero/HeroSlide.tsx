import HeroBadge from "./HeroBadge";
import HeroMeta from "./HeroMeta";

import type { NewsView } from "@/types";

interface Props {
  news: NewsView;
}

export default function HeroSlide({ news }: Props) {
  return (
    <article
      className="
        relative
        overflow-hidden
        rounded-xl
        bg-black
        animate-in
        fade-in
        duration-500
      "
    >
      {/* Image */}

      <img
        src={news.thumbnailUrl ?? "https://placehold.co/1200x700?text=News"}
        alt={news.title}
        className="
          h-[340px]
          w-full
          object-cover

          sm:h-[360px]

          md:h-[380px]

          lg:h-[420px]

          xl:h-[440px]
        "
      />

      {/* Overlay */}

      <div
        className="
          absolute
          inset-0
          z-10
          bg-gradient-to-t
          from-black/85
          via-black/30
          to-transparent
        "
      />

      {/* Content */}

      <div
        className="
          absolute

          bottom-8

          left-5
          right-5

          z-20

          sm:bottom-10
          sm:left-8
          sm:right-8

          md:bottom-16
          md:left-16
          md:right-16

          lg:left-20
          lg:right-20

          xl:left-24
          xl:right-24
        "
      >
        <HeroBadge />

        <h1
          className="
            mt-3

            max-w-[640px]

            font-bold

            tracking-tight

            leading-[1.12]

            text-white

            text-[1.55rem]

            sm:text-[1.75rem]

            md:text-[2rem]

            lg:text-[2.25rem]

            xl:text-[2.5rem]
          "
        >
          {news.title}
        </h1>

        <p
          className="
            mt-4

            hidden

            max-w-[580px]

            text-base

            leading-7

            text-white/90

            lg:block
          "
        >
          {news.summary}
        </p>

        <div className="mt-4">
          <HeroMeta
            publishedAt={news.publishedAt}
            views={news.views}
            comments={news.comments}
          />
        </div>
      </div>
    </article>
  );
}