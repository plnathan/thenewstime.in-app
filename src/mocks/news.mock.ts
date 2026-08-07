import type { NewsView } from "@/types/news.types";

export const featuredNews: NewsView[] = [
  {
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

    categoryName: "Politics",

    featured: true,

    breaking: true,
  },
  {
    id: 2,
    slug: "supreme-court-rejects-tamil-nadu-governments-request-in-thiruparankundram-deepa-case",

    title:
      "திருப்பரங்குன்றம் தீப வழக்கில் தமிழக அரசின் கோரிக்கையை நிராகரித்தது சுப்ரீம்கோர்ட்",

    summary:
      "திருப்பரங்குன்றம் தீப வழக்கில் தமிழக அரசின் கோரிக்கையை நிராகரித்தது சுப்ரீம்கோர்ட்.",

    thumbnailUrl: "https://picsum.photos/900/500",

    publishedAt: new Date().toISOString(),

    views: 1250,

    comments: 18,

    audioAvailable: true,

    categoryName: "Politics",

    featured: true,

    breaking: true,
  },
  {
    id: 3,
    slug: "tamil-nadu-budget-meeting",

    title: "தமிழக பட்ஜெட்டில் பள்ளி கல்வித்துறைக்கு ரூ.44,527 கோடி ஒதுக்கீடு",

    summary:
      "தமிழக பட்ஜெட்டில் பள்ளி கல்வித்துறைக்கு ரூ.44,527 கோடி ஒதுக்கீடு.",

    thumbnailUrl: "https://picsum.photos/900/500",

    publishedAt: new Date().toISOString(),

    views: 1250,

    comments: 18,

    audioAvailable: true,

    categoryName: "Politics",

    featured: true,

    breaking: true,
  },
  {
    id: 4,
    slug: "no-change-in-repo-rate-rbi-governor-announces",

    title:
      "ரெப்போ வட்டி விகிதத்தில் எந்த மாற்றமும் இல்லை; ஆர்பிஐ கவர்னர்  அறிவிப்பு",

    summary:
      "ரெப்போ வட்டி விகிதத்தில் எந்த மாற்றமும் இல்லை; ஆர்பிஐ கவர்னர்  அறிவிப்பு.",

    thumbnailUrl: "https://picsum.photos/900/500",

    publishedAt: new Date().toISOString(),

    views: 1250,

    comments: 18,

    audioAvailable: true,

    categoryName: "Politics",

    featured: true,

    breaking: true,
  },
  {
    id: 5,
    slug: "si-suspended-for-bribery-charges-to-grant-leave-to-fellow-police-officers",

    title:
      "சக போலீசாருக்கு விடுப்பு வழங்க லஞ்ச வசூல் அம்பலம்: எஸ்ஐ., ஏட்டு சஸ்பெண்ட்",

    summary:
      "சக போலீசாருக்கு விடுப்பு வழங்க லஞ்ச வசூல் அம்பலம்: எஸ்ஐ., ஏட்டு சஸ்பெண்ட்.",

    thumbnailUrl: "https://picsum.photos/900/500",

    publishedAt: new Date().toISOString(),

    views: 1250,

    comments: 18,

    audioAvailable: true,

    categoryName: "Politics",

    featured: true,

    breaking: true,
  },
  {
    id: 6,
    slug: "inconsistency-in-neet-answer-sheet-urgent-case-in-supreme-court",

    title: "நீட் விடைத்தாளில் முரண்பாடு; உச்ச நீதிமன்றத்தில் அவசர வழக்கு",

    summary: "நீட் விடைத்தாளில் முரண்பாடு; உச்ச நீதிமன்றத்தில் அவசர வழக்கு.",

    thumbnailUrl: "https://picsum.photos/900/500",

    publishedAt: new Date().toISOString(),

    views: 1250,

    comments: 18,

    audioAvailable: true,

    categoryName: "Politics",

    featured: true,

    breaking: true,
  },
];

export const latestNews: NewsView[] = Array.from({ length: 8 }, (_, index) => ({
  ...featuredNews[0],

  id: index + 2,

  slug: `news-${index + 2}`,

  title: `செய்தி தலைப்பு ${index + 2}`,
}));
