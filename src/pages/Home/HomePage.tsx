import AppContainer from "@/components/container/AppContainer";
import MainContent from "@/components/container/MainContent";

import Hero from "@/components/home/Hero/Hero";
import HomeGrid from "@/components/home/HomeGrid";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import Section from "@/components/home/Section";
import Sidebar from "@/components/home/Sidebar";

import NewsCard from "@/components/news/NewsCard";

import MainLayout from "@/layouts/MainLayout";

import { useNews } from "@/hooks/useNews";

export default function HomePage() {
  const {
    news,
    loading,
    error,
    refresh,
  } = useNews({
    publishedOnly: true,
    page: 1,
    pageSize: 20,
    sortBy: "published_at",
    sortOrder: "DESC"
  });

  /*
   * --------------------------------------------------
   * Hero News
   * --------------------------------------------------
   */
  const featuredNews = news.slice(0, 5);

  /*
   * --------------------------------------------------
   * Latest News
   * --------------------------------------------------
   */
  const latestNews = news;

  /*
   * --------------------------------------------------
   * Sidebar
   *
   * This is currently using the latest articles.
   *
   * Later we can replace this with a dedicated
   * "popular news" API query based on views.
   * --------------------------------------------------
   */
  const popularNews = latestNews.slice(0, 4);

  /*
   * --------------------------------------------------
   * District level News to display in the "District News" section.
   *
   * District is geographical information.
   *
   * Therefore we must NOT use:
   *
   * This includes only district-level in Tamil Nadu news
   * because district records are linked to Tamil Nadu.
   * --------------------------------------------------
   */
  const districtNews = news.filter(
    (item) => item.newsScope === "DISTRICT",
  );

  /*
   * --------------------------------------------------
   * Tamil Nadu News
   *
   * Tamil Nadu is geographical information.
   *
   * Therefore we must NOT use:
   *
   * item.categoryName === "தமிழ்நாடு"
   *
   * Instead we use the state's URL name.
   *
   * This also includes district-level Tamil Nadu news
   * because district records are linked to Tamil Nadu.
   * --------------------------------------------------
   */
  const tamilNaduNews = news.filter(
    (item) =>
      item.stateUrlName === "tamil-nadu",
  );

  /*
   * --------------------------------------------------
   * India News
   *
   * India-level news is identified by newsScope.
   * --------------------------------------------------
   */
  const indiaNews = news.filter(
    (item) =>
      item.newsScope === "INDIA",
  );

  /*
   * --------------------------------------------------
   * World News
   *
   * World-level news is identified by newsScope.
   * --------------------------------------------------
   */
  const worldNews = news.filter(
    (item) =>
      item.newsScope === "WORLD",
  );

  /*
   * --------------------------------------------------
   * Sports News
   *
   * Your current category master data does NOT contain
   * "sports".
   *
   * We keep this filter ready for when the category is
   * added to the master table.
   *
   * Once the "sports" category exists, this section
   * will automatically start displaying articles.
   * --------------------------------------------------
   */
  // const sportsNews = news.filter(
  //   (item) =>
  //     item.categoryUrlName === "sports",
  // );

  /*
   * --------------------------------------------------
   * Loading
   * --------------------------------------------------
   */
  if (loading) {
    return (
      <MainLayout>
        <AppContainer>
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-gray-500">
              Loading news...
            </p>
          </div>
        </AppContainer>
      </MainLayout>
    );
  }

  /*
   * --------------------------------------------------
   * Error
   * --------------------------------------------------
   */
  if (error) {
    return (
      <MainLayout>
        <AppContainer>
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              className="mt-4 rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
              onClick={() => void refresh()}
            >
              Retry
            </button>
          </div>
        </AppContainer>
      </MainLayout>
    );
  }

  /*
   * --------------------------------------------------
   * Page
   * --------------------------------------------------
   */
  return (
    <MainLayout>
      <AppContainer>

        {/* Hero */}
        <Hero
          featured={featuredNews}
        />

        {/* Main */}
        <div className="mt-10">
          <HomeGrid
            sidebar={
              <Sidebar>
                <Section title="பிரபலமானவை">
                  {popularNews.length > 0 ? (
                    popularNews.map((item) => (
                      <NewsCard
                        key={item.id}
                        news={item}
                        compact
                      />
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-gray-500">
                      செய்திகள் இல்லை.
                    </div>
                  )}
                </Section>
              </Sidebar>
            }
          >
            <MainContent>

              <HomeNewsSection
                title="சமீபத்திய செய்திகள்"
                news={latestNews}
                actionLabel="அனைத்தையும் பார்க்க"
                layout="list"
              />

              <HomeNewsSection
                title="தமிழ்நாடு"
                news={tamilNaduNews}
                actionLabel="மேலும்"
                layout="featured"
              />

              <HomeNewsSection
                title="இந்தியா"
                news={indiaNews}
                actionLabel="மேலும்"
                layout="grid"
              />

              <HomeNewsSection
                title="உலகம்"
                news={worldNews}
                actionLabel="மேலும்"
                layout="grid"
              />

              <HomeNewsSection
                title="மாவட்ட செய்திகள்"
                news={districtNews}
                actionLabel="மேலும்"
                layout="compact"
              />

              {/* Sports */}
              {/* {sportsNews.length > 0 && (
                <HomeNewsSection
                  title="விளையாட்டு"
                  news={sportsNews}
                  actionLabel="மேலும்"
                  layout="compact"
                />
              )} */}

            </MainContent>
          </HomeGrid>
        </div>

      </AppContainer>
    </MainLayout>
  );
}