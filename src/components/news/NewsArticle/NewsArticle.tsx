import { useNews } from "@/hooks/useNews";
import SidebarNewsCard from "@/components/news/SidebarNewsCard";
import Section from "@/components/home/Section";
import PublicAdvertisementModal from "@/components/advertisements/Advertisement/PublicAdvertisementModal";
import { CalendarDays, MapPin, BookOpen } from "lucide-react";

import NewsMeta from "@/components/news/NewsMeta";
import NewsSocialShare from "@/components/news/NewsSocialShare/NewsSocialShare";
import Typography from "@/components/ui/Typography";
import { formatDate } from "@/utils/format/formatDate";
import { calculateReadingTime } from "@/utils/news";

import DynamicNewsDetailSidebar from "@/components/advertisements/Advertisement/DynamicNewsDetailSidebar";
import LiveAdvertisementPlacement from "@/components/advertisements/Advertisement/LiveAdvertisementPlacement";
import NewsArticleContent from "./NewsArticleContent";
import NewsArticleHeroCarousel from "./NewsArticleHeroCarousel";
import type { NewsArticleProps } from "./NewsArticle.types";

function PopularNews({ currentNewsId, currentNewsSlug }: { currentNewsId: number; currentNewsSlug: string }) {
  const { news, loading, error } = useNews({
    publishedOnly: true,
    page: 1,
    // Fetch an extra article so excluding the current story can still show four.
    pageSize: 5,
    popular: true,
  });

  const distinctNews = news
    .filter((item) => item.id !== currentNewsId && item.slug !== currentNewsSlug)
    .filter((item, index, items) =>
      items.findIndex((candidate) => candidate.id === item.id) === index
    )
    .slice(0, 4);

  return (
    <Section title="பிரபலமானவை" className="mb-0 min-w-0 w-full">
      {loading ? (
        <p className="mt-3 text-sm text-gray-500">செய்திகள் பெறப்படுகின்றன...</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-600">பிரபலமான செய்திகளை பெற முடியவில்லை.</p>
      ) : distinctNews.length ? (
        <div className="space-y-4 min-w-0">
          {distinctNews.map((item) => <SidebarNewsCard key={item.id} news={item} compact />)}
        </div>
      ) : (
              <p className="mt-3 text-sm text-gray-500">விரைவில்...</p>
      )}
    </Section>
  );
}

function ImportantNews({ currentNewsId, currentNewsSlug }: { currentNewsId: number; currentNewsSlug: string }) {
  // Identical query and first-five selection to the homepage Hero Carousel.
  const { news, loading, error } = useNews({
    publishedOnly: true,
    homepageOnly: true,
    page: 1,
    pageSize: 10,
    sortBy: "published_at",
    sortOrder: "DESC",
  });

  const featured = news
    .filter((item) => item.showOnHomepage === true)
    .slice(0, 5)
    .filter((item) => item.id !== currentNewsId && item.slug !== currentNewsSlug);

  return (
    <Section title="முக்கியச் செய்திகள்" className="mb-0 min-w-0 w-full">
      {loading ? (
        <p className="mt-3 text-sm text-gray-500">செய்திகள் பெறப்படுகின்றன...</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-600">முக்கியச் செய்திகளை பெற முடியவில்லை.</p>
      ) : featured.length ? (
        <div className="space-y-4 min-w-0">
          {featured.map((item) => <SidebarNewsCard key={item.id} news={item} compact />)}
        </div>
      ) : (
              <p className="mt-3 text-sm text-gray-500">விரைவில்...</p>
      )}
    </Section>
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

  // A carousel is used only when more than four media items exist.
  // The first three remain inline; the rest appear at the article end.
  const carouselMedia = orderedMedia.length > 4
    ? orderedMedia.slice(3)
    : [];

  return (
    <>
      <PublicAdvertisementModal placementCode="NEWS_DETAIL_MODAL" newsId={news.id} />
      <div
        className="
        mx-auto
        w-full
        max-w-7xl
        lg:grid
        lg:grid-cols-[minmax(0,1fr)_300px]
        lg:gap-[18px]
        xl:grid-cols-[minmax(0,1fr)_300px]
        xl:gap-[18px]
      "
      >
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
              mt-3
              w-full
              max-w-none
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
                w-full
                max-w-none
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

          <div className="mx-auto mt-8 max-w-3xl sm:mt-10">
            <NewsArticleContent
              content={news.content ?? ""}
              media={orderedMedia}
              showAdPlaceholder
              newsId={news.id}
              fallbackThumbnailUrl={news.thumbnailUrl}
              fallbackTitle={news.title}
            />
          </div>

          {carouselMedia.length > 0 && (
            <div className="mx-auto mt-8 max-w-3xl sm:mt-10">
              <NewsArticleHeroCarousel
                media={carouselMedia}
                title={news.title}
              />
            </div>
          )}

          <div className="mt-[18px] flex w-full min-w-0 justify-center">
            <LiveAdvertisementPlacement
              placementCode="NEWS_DETAIL_BOTTOM"
              newsId={news.id}
            />
          </div>
        </article>

        <DynamicNewsDetailSidebar
          newsId={news.id}
          popularNews={<PopularNews currentNewsId={news.id} currentNewsSlug={news.slug} />}
          importantNews={<ImportantNews currentNewsId={news.id} currentNewsSlug={news.slug} />}
          className="hidden min-w-0 lg:flex lg:flex-col lg:gap-[18px]"
        />
      </div>
      <DynamicNewsDetailSidebar
        newsId={news.id}
        popularNews={<PopularNews currentNewsId={news.id} currentNewsSlug={news.slug} />}
        importantNews={<ImportantNews currentNewsId={news.id} currentNewsSlug={news.slug} />}
        className="mt-[18px] flex min-w-0 w-full flex-col gap-[18px] overflow-x-hidden lg:hidden"
      />
    </>
  );
}