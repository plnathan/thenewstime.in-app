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
  } = useNews();

  /*
   * Hero News
   */
  const featuredNews = news.slice(0, 5);

  /*
   * Latest News
   */
  const latestNews = news;

  /*
   * Sidebar (Popular)
   */
  const popularNews = latestNews.slice(0, 4);

  /*
   * Sections
   */

  const tamilNaduNews = news.filter(
  (item) => item.categoryName === "தமிழ்நாடு",
);

const indiaNews = news.filter(
  (item) => item.categoryName === "இந்தியா",
);

const worldNews = news.filter(
  (item) => item.categoryName === "உலகம்",
);

const sportsNews = news.filter(
  (item) => item.categoryName === "விளையாட்டு",
);

  /*
   * Loading
   */
  if (loading) {
    return (
      <MainLayout>
        <AppContainer>
          <div className="py-20 text-center text-lg">
            Loading news...
          </div>
        </AppContainer>
      </MainLayout>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <MainLayout>
        <AppContainer>
          <div className="py-20 text-center">
            <p className="text-red-600">{error}</p>

            <button
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

  return (
    <MainLayout>
      <AppContainer>

        {/* Hero */}

        <Hero
          featured={featuredNews}
          sidebar={latestNews}
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
                title="விளையாட்டு"
                news={sportsNews}
                actionLabel="மேலும்"
                layout="compact"
              />

            </MainContent>
          </HomeGrid>
        </div>

      </AppContainer>
    </MainLayout>
  );
}