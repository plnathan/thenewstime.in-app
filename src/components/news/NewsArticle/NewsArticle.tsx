import { CalendarDays, MapPin, BookOpen } from "lucide-react";

import NewsMeta from "@/components/news/NewsMeta";
import NewsSocialShare from "@/components/news/NewsSocialShare/NewsSocialShare";
import Typography from "@/components/ui/Typography";
import { formatDate } from "@/utils/format/formatDate";
import { calculateReadingTime } from "@/utils/news";

import Advertisement from "@/components/advertisement";
import NewsArticleContent from "./NewsArticleContent";
import NewsArticleHeroCarousel from "./NewsArticleHeroCarousel";
import type { NewsArticleProps } from "./NewsArticle.types";

const DYNAMIC_AD_SLOT_COUNT = 5;

function AdvertisementColumn({
  side,
}: {
  side: "left" | "right";
}) {
  return (
    <aside
      aria-label={
        side === "left"
          ? "Left advertisement area"
          : "Right advertisement area"
      }
      className="
        hidden
        lg:flex
        lg:flex-col
        lg:gap-6
      "
    >
      {/* Static advertisement */}
      <div className="h-[450px]">
        <Advertisement />
      </div>

      {/* Dynamic advertisement slots */}
      {Array.from({
        length: DYNAMIC_AD_SLOT_COUNT,
      }).map((_, index) => (
        <div
          key={`${side}-dynamic-${index + 1}`}
          className="h-[450px]"
        >
          <Advertisement />
        </div>
      ))}
    </aside>
  );
}

function MobileStaticAdvertisement({
  position,
}: {
  position: "top" | "bottom";
}) {
  return (
    <div
      className="
        my-5
        lg:hidden
      "
      aria-label={
        position === "top"
          ? "Top advertisement"
          : "Bottom advertisement"
      }
    >
      <div className="h-[120px]">
        <Advertisement />
      </div>
    </div>
  );
}

export default function NewsArticle({
  news,
}: NewsArticleProps) {
  const readingTime = calculateReadingTime(
    news.content ?? "",
  );

  const location =
    news.district?.displayName ??
    news.state?.displayName ??
    news.country?.displayName ??
    null;

  const publishedDate = news.publishedAt
    ? formatDate(
      news.publishedAt,
      "dd MMMM yyyy",
    )
    : null;

  const publishedTime = news.publishedAt
    ? formatDate(
      news.publishedAt,
      "hh:mm a",
    )
    : null;

  const orderedMedia = [
    ...(news.media ?? []),
  ].sort(
    (a, b) =>
      a.displayOrder -
      b.displayOrder,
  );

  const hasHeroCarousel =
    orderedMedia.length > 3;

  return (
    <>
      <MobileStaticAdvertisement position="top" />
      <div
        className="
        mx-auto
        w-full
        max-w-7xl
        lg:grid
        lg:grid-cols-[220px_minmax(0,1fr)_220px]
        lg:gap-6
        xl:grid-cols-[240px_minmax(0,1fr)_240px]
        xl:gap-8
      "
      >
        <AdvertisementColumn side="left" />

        <article className="min-w-0 w-full">
          <header>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-green-700">
              <span>{news.categoryName}</span>

              {location && (
                <>
                  <span
                    className="text-gray-300"
                    aria-hidden="true"
                  >
                    •
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <MapPin
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />

                    {location}
                  </span>
                </>
              )}
            </div>

            <Typography
              as="h1"
              variant="headline"
              className="
              mt-4
              max-w-4xl
              text-[2rem]
              leading-[1.3]
              text-gray-950
              sm:text-[2.65rem]
              sm:leading-[1.28]
              lg:text-[1.6rem]
              lg:leading-[1.3]
            "
            >
              {news.title}
            </Typography>

            {news.summary && (
              <p
                className="
                mt-5
                max-w-3xl
                font-[Noto_Sans_Tamil,Inter,system-ui,sans-serif]
                text-[0.95rem]
                leading-[1.9]
                text-gray-600
                sm:text-[1.2rem]
                sm:leading-[1.9]
              "
              >
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
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />

                    வெளியிடப்பட்டது: {publishedDate}
                    {publishedTime
                      ? `, ${publishedTime}`
                      : ""}
                  </span>
                )}

                {readingTime.minutes > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />

                    வாசிப்பு நேரம்:{" "}
                    {readingTime.minutes} நிமிடம்
                  </span>
                )}
              </div>

              <NewsSocialShare
                title={news.title}
                slug={news.slug}
              />
            </div>
          </header>

          {hasHeroCarousel ? (
            <div className="mt-8 sm:mt-10">
              <NewsArticleHeroCarousel
                media={orderedMedia}
                title={news.title}
              />
            </div>
          ) : (
            <figure className="mt-8 overflow-hidden rounded-xl bg-gray-100 sm:mt-10">
              <img
                src={
                  orderedMedia[0]?.fileUrl ??
                  news.thumbnailUrl
                }
                alt={
                  orderedMedia[0]?.altText ??
                  news.title
                }
                className="
                aspect-[16/9]
                w-full
                object-contain
                bg-gray-100
              "
                onError={(event) => {
                  event.currentTarget.src =
                    "/assets/hero.png";
                }}
              />

              {orderedMedia[0]?.caption && (
                <figcaption className="px-3 py-2 text-xs text-gray-500 sm:px-4">
                  {orderedMedia[0].caption}
                </figcaption>
              )}
            </figure>
          )}

          <div className="mx-auto mt-8 max-w-3xl sm:mt-10">
            <NewsArticleContent
              content={news.content ?? ""}
              media={orderedMedia}
            />
          </div>
        </article>

        <AdvertisementColumn side="right" />

      </div>
      <MobileStaticAdvertisement position="bottom" />
    </>
  );
}