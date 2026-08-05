import Typography from "@/components/ui/Typography";

import type { NewsView } from "@/types";

interface HeroSlideProps {
  news: NewsView;
}

export default function HeroSlide({ news }: HeroSlideProps) {
  return (
    <article
      aria-roledescription="slide"
      className="
        relative
        overflow-hidden
        rounded-xl
        transition-opacity
        duration-500
      "
    >
      <img
        loading="lazy"
        src={news.thumbnailUrl ?? "https://placehold.co/1200x675?text=News"}
        alt={news.title}
        className="
          aspect-[4/3]
          w-full
          object-cover
          lg:aspect-[16/9]
        "
      />

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/80
          via-black/35
          to-transparent
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          p-5
          sm:p-6
          lg:p-8
        "
      >
        {news.category && (
          <span
            className="
              inline-block
              rounded
              bg-red-600
              px-3
              py-1
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-white
            "
          >
            {news.category}
          </span>
        )}

        <Typography variant="heroTitle" className="mt-4 text-white">
          {news.title}
        </Typography>

        {news.summary && (
          <Typography
            variant="summary"
            className="
              mt-3
              hidden
              max-w-3xl
              text-white/90
              md:block
            "
          >
            {news.summary}
          </Typography>
        )}
      </div>
    </article>
  );
}
