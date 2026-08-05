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
          h-[240px]
          w-full
          object-cover

          md:h-[380px]

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
          bottom-16

          left-12
          right-12

          z-20

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

            max-w-[620px]

            text-white

            font-bold

            tracking-tight

            leading-[1.12]

            text-[1.75rem]

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

        <div className="mt-5">
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