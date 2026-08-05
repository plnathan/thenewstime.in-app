import SidebarNewsCard from "@/components/news/SidebarNewsCard";

import Sidebar from "@/components/home/Sidebar";
import Section from "@/components/home/Section";

import type { NewsView } from "@/types";

interface Props {
  news: NewsView[];
}

export default function TrendingSection({ news }: Props) {
  return (
    <Sidebar>
      <Section title="Trending">
        {news.map((item) => (
          <SidebarNewsCard key={item.id} news={item} />
        ))}
      </Section>
    </Sidebar>
  );
}
