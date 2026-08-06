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
      "
    >
      {/* Image */}

      <img
        src={
          news.thumbnailUrl ??
          "https://placehold.co/1200x700?text=News"
        }
        alt={news.title}
        className="
          h-[340px]
          w-full
          object-cover

          sm:h-[360px]
          md:h-[400px]
          lg:h-[430px]
          xl:h-[450px]
        "
      />

      {/* Dark Overlay */}

      <div
        className="
          absolute
          inset-0
          z-10

          bg-gradient-to-t
          from-black/90
          via-black/35
          to-transparent
        "
      />

      {/* Content */}

      <div
        className="
          absolute
          z-20

          bottom-8

          left-12
          right-8

          sm:bottom-15
          sm:left-20
          sm:right-10

          md:bottom-12
          md:left-16
          md:right-16

          lg:bottom-14
          lg:left-20
          lg:right-20

          xl:bottom-16
          xl:left-20
          xl:right-20
        "
      >
        {/* Limit text width */}

        <div
          className="
            max-w-[240px]

            sm:max-w-[320px]

            md:max-w-[480px]

            lg:max-w-[580px]

            xl:max-w-[660px]
          "
        >
          <HeroBadge />

          <h1
            className="
              mt-2

              text-white

              font-bold
              tracking-tight
              leading-[1.08]

              text-[1.18rem]

              sm:text-[1.45rem]

              md:text-[2rem]

              lg:text-[2.18rem]

              xl:text-[2.28rem]
            "
          >
            {news.title}
          </h1>

          <p
            className="
              mt-4

              hidden

              text-base
              leading-7

              text-white/90

              lg:block
            "
          >
            {news.summary}
          </p>

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