import NewsCard from "@/components/news/NewsCard";

import MainContent from "@/components/container/MainContent";

import Section from "@/components/home/Section";

import type { NewsView } from "@/types";

interface Props {
  news: NewsView[];
}

export default function LatestNewsSection({ news }: Props) {
  return (
    <MainContent>
      <Section title="Latest News" actionLabel="View All">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </Section>
    </MainContent>
  );
}
