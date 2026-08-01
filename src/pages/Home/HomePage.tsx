import FeaturedNewsCard from "@/components/news/FeaturedNewsCard";
import NewsCard from "@/components/news/NewsCard";
import SidebarNewsCard from "@/components/news/SidebarNewsCard";

import AppContainer from "@/components/container/AppContainer";
import MainContent from "@/components/container/MainContent";

import HomeGrid from "@/components/home/HomeGrid";
import Section from "@/components/home/Section";
import Sidebar from "@/components/home/Sidebar";

import MainLayout from "@/layouts/MainLayout";

import { featuredNews, latestNews } from "@/mocks/news.mock";

export default function HomePage() {
  return (
    <MainLayout>
      <AppContainer>
        <div className="py-8">
          <FeaturedNewsCard news={featuredNews} />

          <div className="mt-10">
            <HomeGrid
              sidebar={
                <Sidebar>
                  <Section title="Trending">
                    {latestNews.slice(0, 5).map((news) => (
                      <SidebarNewsCard key={news.id} news={news} />
                    ))}
                  </Section>
                </Sidebar>
              }
            >
              <MainContent>
                <Section title="Latest News" actionLabel="View All">
                  {latestNews.map((news) => (
                    <NewsCard key={news.id} news={news} />
                  ))}
                </Section>
              </MainContent>
            </HomeGrid>
          </div>
        </div>
      </AppContainer>
    </MainLayout>
  );
}
