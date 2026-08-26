import { useNavigate } from "react-router-dom";

import HeroBadge from "./HeroBadge";
import HeroMeta from "./HeroMeta";

import type { NewsView } from "@/types";
import { ROUTES } from "@/constants";

interface Props {
  news: NewsView;
}

export default function HeroSlide({ news }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.NEWSDETAIL(news.slug));
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="
        relative
        cursor-pointer
        overflow-hidden
        rounded-xl
        bg-black
      "
    >
      <img
        src={
          news.thumbnailUrl ??
          "https://placehold.co/1200x700?text=News"
        }
        alt={news.title}
        className="
          h-[340px]
          w-full
          object-contain
          sm:h-[360px]
          md:h-[400px]
          lg:h-[430px]
          xl:h-[450px]
        "
      />

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

      <div
        className="
          absolute
          bottom-8
          left-12
          right-8
          z-20
          sm:bottom-25
          sm:left-25
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
        <div
          className="
            max-w-[240px]
            sm:max-w-[350px]
            md:max-w-[480px]
            lg:max-w-[580px]
            xl:max-w-[660px]
          "
        >
          <HeroBadge />

          <h1
            className="
              mt-2
              text-[1.18rem]
              font-bold
              leading-[1.08]
              tracking-tight
              text-white
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