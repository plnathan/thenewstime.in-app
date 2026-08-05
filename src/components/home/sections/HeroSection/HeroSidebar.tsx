import NewsCard from "@/components/news/NewsCard";
import Typography from "@/components/ui/Typography";
import type { NewsView } from "@/types";

interface Props {
  news: NewsView[];
}

export default function HeroSidebar({ news }: Props) {
  return (
    <aside className="flex flex-col gap-4">
      <Typography variant="sectionTitle">பிரபலமான செய்திகள்</Typography>

      {news.map((item) => (
        <NewsCard key={item.id} news={item} compact />
      ))}
    </aside>
  );
}
