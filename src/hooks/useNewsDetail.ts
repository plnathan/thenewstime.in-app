import { useCallback, useEffect, useState } from "react";

import { getNewsBySlug } from "@/api/news.api";
import type { NewsView } from "@/types";
import { toNewsView } from "@/utils/news";

interface UseNewsDetailResult {
  news: NewsView | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNewsDetail(slug?: string): UseNewsDetailResult {
  const [news, setNews] = useState<NewsView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    if (!slug) {
      setNews(null);
      setError("News article was not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getNewsBySlug(slug);
      setNews(toNewsView(response.data));
    } catch (err) {
      console.error(err);
      setNews(null);
      setError("Unable to load this news article.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const fetchNews = async () => {
      await loadNews();
    };
    void fetchNews();
  }, [loadNews]);

  return {
    news,
    loading,
    error,
    refresh: loadNews,
  };
}
