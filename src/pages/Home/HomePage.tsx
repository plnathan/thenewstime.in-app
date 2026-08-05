import NewsCard from "@/components/news/NewsCard";

import AppContainer from "@/components/container/AppContainer";
import MainContent from "@/components/container/MainContent";

import Hero from "@/components/home/Hero/Hero";
import HomeGrid from "@/components/home/HomeGrid";
import Section from "@/components/home/Section";
import Sidebar from "@/components/home/Sidebar";

// import HeroSection from "@/components/home/sections/HeroSection";

import MainLayout from "@/layouts/MainLayout";

import { featuredNews, latestNews } from "@/mocks/news.mock";

export default function HomePage() {
  return (
    <MainLayout>
      <AppContainer>

        <Hero featured={featuredNews} sidebar={latestNews} />

        <div className="mt-10">
          <HomeGrid
            sidebar={
              <Sidebar>
                <Section title="பிரபலமானவை">
                  {latestNews.slice(4, 8).map((news) => (
                    <NewsCard key={news.id} news={news} compact />
                  ))}
                </Section>
              </Sidebar>
            }
          >
            <MainContent>
              <Section
                title="சமீபத்திய செய்திகள்"
                actionLabel="அனைத்தையும் பார்க்க"
              >
                {latestNews.map((news) => (
                  <NewsCard key={news.id} news={news} />
                ))}
              </Section>
            </MainContent>
          </HomeGrid>
        </div>
      </AppContainer>
    </MainLayout>
  );
}
