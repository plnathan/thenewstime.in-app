import { useCallback, useEffect, useState } from "react";

import { getNewsList } from "@/api/news.api";
import type { NewsView } from "@/types";
import { toNewsViewList } from "@/utils/news";

interface UseNewsOptions {
  page?: number;
  pageSize?: number;
  scope?: string;
  categoryId?: number;
  status?: string;
}

export function useNews(options?: UseNewsOptions) {
  const [news, setNews] = useState<NewsView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getNewsList({
        page: options?.page ?? 1,
        pageSize: options?.pageSize ?? 20,
        scope: options?.scope,
        categoryId: options?.categoryId,
        status: options?.status,
      });

      setNews(toNewsViewList(response.data));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Unable to load news.");
    } finally {
      setLoading(false);
    }
  }, [options]);

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
