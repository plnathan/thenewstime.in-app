import type { NewsItem } from "@/types/news.types";

export const featuredNews: NewsItem = {
  id: 1,
  slug: "annaamalai-meeting",

  title: "அண்ணாமலை முக்கிய நிர்வாகிகளுடன் ஆலோசனை கூட்டம் நடத்தினார்",

  summary:
    "தமிழக அரசியல் சூழ்நிலையை முன்னிட்டு முக்கிய ஆலோசனை கூட்டம் நடைபெற்றது.",

  thumbnailUrl: "https://picsum.photos/900/500",

  publishedAt: new Date().toISOString(),

  views: 1250,

  comments: 18,

  audioAvailable: true,

  category: "Politics",

  featured: true,

  breaking: true,
};

export const latestNews: NewsItem[] = Array.from({ length: 8 }, (_, index) => ({
  ...featuredNews,

  id: index + 2,

  slug: `news-${index + 2}`,

  title: `செய்தி தலைப்பு ${index + 2}`,
}));
