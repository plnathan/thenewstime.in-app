import { ArrowLeft, Clock3, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import NewsMeta from "@/components/news/NewsMeta";
import Typography from "@/components/ui/Typography";
import { formatDate } from "@/utils/format/formatDate";
import { calculateReadingTime } from "@/utils/news";

import NewsArticleContent from "./NewsArticleContent";
import type { NewsArticleProps } from "./NewsArticle.types";

export default function NewsArticle({ news }: NewsArticleProps) {
  const navigate = useNavigate();
  const readingTime = calculateReadingTime(news.content ?? "");

  const location =
    news.district?.displayName ??
    news.state?.displayName ??
    news.country?.displayName ??
    null;

  const publishedDate = news.publishedAt
    ? formatDate(news.publishedAt, "dd MMMM yyyy")
    : null;

  const publishedTime = news.publishedAt
    ? formatDate(news.publishedAt, "hh:mm a")
    : null;

  return (
    <article className="mx-auto w-full max-w-4xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-7 inline-flex items-center gap-2 rounded-md text-sm font-medium text-gray-500 transition hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>மீண்டும் செய்திகள்</span>
      </button>

      <header>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-green-700">
          <span>{news.categoryName}</span>

          {location && (
            <>
              <span className="text-gray-300" aria-hidden="true">
                •
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {location}
              </span>
            </>
          )}
        </div>

        <Typography
          as="h1"
          variant="headline"
          className="mt-4 max-w-4xl text-[2rem] leading-[1.3] text-gray-950 sm:text-[2.65rem] sm:leading-[1.28] lg:text-[3.2rem] lg:leading-[1.24]"
        >
          {news.title}
        </Typography>

        {news.summary && (
          <p className="mt-5 max-w-3xl font-[Noto_Sans_Tamil,Inter,system-ui,sans-serif] text-[1.05rem] leading-[1.9] text-gray-600 sm:text-[1.2rem] sm:leading-[1.9]">
            {news.summary}
          </p>
        )}

        <div className="mt-7 border-y border-gray-200 py-4">
          <NewsMeta
            publishedAt={news.publishedAt}
            views={news.views}
            comments={news.comments}
            audioAvailable={news.audioAvailable}
          />

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
            {publishedDate && (
              <span>
                வெளியிடப்பட்டது: {publishedDate}
                {publishedTime ? `, ${publishedTime}` : ""}
              </span>
            )}

            {readingTime.minutes > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                வாசிப்பு நேரம்: {readingTime.minutes} நிமிடம்
              </span>
            )}
          </div>
        </div>
      </header>

      <figure className="mt-8 overflow-hidden rounded-xl bg-gray-100 sm:mt-10">
        <img
          src={news.thumbnailUrl}
          alt={news.title}
          className="aspect-[16/9] w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = "/assets/hero.png";
          }}
        />
      </figure>

      <div className="mx-auto mt-8 max-w-3xl sm:mt-10">
        <NewsArticleContent content={news.content ?? ""} />
      </div>
    </article>
  );
}
