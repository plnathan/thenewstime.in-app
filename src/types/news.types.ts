export interface News {
  id: number;
  newsNumber: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  newsScope: string;
  categoryId: number;
  stateId: number | null;
  districtId: number | null;
  status: string;
  publishedAt: string | null;
}

export interface NewsItem {
  id: number;
  slug: string;

  title: string;
  summary: string;

  thumbnailUrl?: string;

  publishedAt: string;

  views: number;

  comments: number;

  audioAvailable: boolean;

  category?: string;

  breaking?: boolean;

  featured?: boolean;
}