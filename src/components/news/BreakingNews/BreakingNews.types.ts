export interface BreakingNewsItem {
  id: number;
  title: string;
  url: string;
}

export interface BreakingNewsProps {
  items?: BreakingNewsItem[];
}
