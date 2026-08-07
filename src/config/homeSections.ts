//import { latestNews } from "@/mocks/news.mock";

export interface HomeSectionConfig {
  id: string;
  title: string;
  actionLabel?: string;
}

export const homeSections: HomeSectionConfig[] = [
  {
    id: "latest",
    title: "சமீபத்திய செய்திகள்",
    actionLabel: "அனைத்தையும் பார்க்க",
  },
  {
    id: "tamilnadu",
    title: "தமிழ்நாடு",
    actionLabel: "மேலும்",
  },
  {
    id: "india",
    title: "இந்தியா",
    actionLabel: "மேலும்",
  },
  {
    id: "world",
    title: "உலகம்",
    actionLabel: "மேலும்",
  },
  {
    id: "sports",
    title: "விளையாட்டு",
    actionLabel: "மேலும்",
  },
];
