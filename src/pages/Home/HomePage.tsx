import { useNavigate } from "react-router-dom";

import AppContainer from "@/components/container/AppContainer";
import MainContent from "@/components/container/MainContent";

import Hero from "@/components/home/Hero/Hero";
import HomeGrid from "@/components/home/HomeGrid";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import Section from "@/components/home/Section";
import Sidebar from "@/components/home/Sidebar";

import NewsCard from "@/components/news/NewsCard";

import PageLoader from "@/components/ui/PageLoader/PageLoader";

import MainLayout from "@/layouts/MainLayout";

import { useNews } from "@/hooks/useNews";

export default function HomePage() {
  const navigate = useNavigate();

  const {
    news,
    loading,
    error,
    refresh,
  } = useNews({
    publishedOnly: true,
    page: 1,
    pageSize: 50,
    sortBy: "published_at",
    sortOrder: "DESC",
  });

  const {
    news: popularNews,
    loading: popularLoading,
    error: popularError,
  } = useNews({
    publishedOnly: true,
    page: 1,
    pageSize: 4,
    popular: true,
  });

  /*
   * --------------------------------------------------
   * Homepage News Distribution
   * --------------------------------------------------
   *
   * API result is already ordered by:
   *
   * published_at DESC
   *
   * Distribution:
   *
   * 1 - 5   → Hero
   * 6 - 15  → Latest
   * 16+     → Geographical sections
   * --------------------------------------------------
   */

  const featuredNews = news.slice(0, 5);

  const latestNews = news.slice(5, 15);

  const remainingNews = news.slice(15);

  /*
   * --------------------------------------------------
   * Geographical Sections
   * --------------------------------------------------
   *
   * Articles are classified from the remaining news
   * only, so they do not duplicate Hero or Latest.
   *
   * Priority:
   *
   * DISTRICT
   * STATE / Tamil Nadu
   * INDIA
   * WORLD
   * --------------------------------------------------
   */

  const districtNews = remainingNews.filter(
    (item) => item.newsScope === "DISTRICT",
  );

  const tamilNaduNews = remainingNews.filter(
    (item) =>
      item.newsScope === "STATE" &&
      item.stateUrlName === "tamil-nadu",
  );

  const indiaNews = remainingNews.filter(
    (item) => item.newsScope === "INDIA",
  );

  const worldNews = remainingNews.filter(
    (item) => item.newsScope === "WORLD",
  );

  const tamilNaduStateId =
    tamilNaduNews.find(
      (item) => item.stateId != null,
    )?.stateId;

  /*
   * --------------------------------------------------
   * Sidebar
   * --------------------------------------------------
   *
   * Popular-news API is not implemented yet.
   *
   * For now, use the first four articles from the
   * latest-news area.
   * --------------------------------------------------
   */

  /*
   * --------------------------------------------------
   * Loading
   * --------------------------------------------------
   */

  if (loading) {
    return (
      <MainLayout>
        <AppContainer>
          <PageLoader message="செய்திகள் ஏற்றப்படுகின்றன..." />
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
                  {popularLoading ? (
                    <div className="py-6 text-center text-sm text-gray-500">
                      செய்திகள் ஏற்றப்படுகின்றன...
                    </div>
                  ) : popularError ? (
                    <div className="py-6 text-center text-sm text-red-600">
                      பிரபலமான செய்திகளை ஏற்ற முடியவில்லை.
                    </div>
                  ) : popularNews.length > 0 ? (
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

              {/* Latest */}
              <HomeNewsSection
                title="சமீபத்திய செய்திகள்"
                news={latestNews}
                actionLabel="அனைத்தையும் பார்க்க"
                onActionClick={() => navigate("/news")}
                layout="list"
              />

              {/* Tamil Nadu */}
              <HomeNewsSection
                title="தமிழ்நாடு"
                news={tamilNaduNews}
                actionLabel="மேலும்"
                onActionClick={() => {
                  if (tamilNaduStateId != null) {
                    navigate(
                      `/news?scope=STATE&stateId=${tamilNaduStateId}`,
                    );
                  }
                }}
                layout="featured"
              />

              {/* India */}
              <HomeNewsSection
                title="இந்தியா"
                news={indiaNews}
                actionLabel="மேலும்"
                onActionClick={() =>
                  navigate("/news?scope=INDIA")
                }
                layout="grid"
              />

              {/* World */}
              <HomeNewsSection
                title="உலகம்"
                news={worldNews}
                actionLabel="மேலும்"
                onActionClick={() =>
                  navigate("/news?scope=WORLD")
                }
                layout="grid"
              />

              {/* District */}
              <HomeNewsSection
                title="மாவட்ட செய்திகள்"
                news={districtNews}
                actionLabel="மேலும்"
                onActionClick={() =>
                  navigate("/news?scope=DISTRICT")
                }
                layout="compact"
              />

            </MainContent>
          </HomeGrid>
        </div>

      </AppContainer>
    </MainLayout>
  );
}