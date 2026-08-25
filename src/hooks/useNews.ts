import { useCallback, useEffect, useState } from "react";

import { getNewsList, getPublishedNewsList } from "@/api/news.api";

import type { NewsQuery, PublicNewsQuery } from "@/api/news.api";

import type { NewsView } from "@/types";

import { toNewsViewList } from "@/utils/news";

interface UseNewsOptions extends NewsQuery {
  /**
   * Controls whether the public API should order
   * news by most-read count.
   */
  popular?: boolean;

  /**
   * Controls whether the news request should execute.
   *
   * Defaults to true.
   */
  enabled?: boolean;

  /**
   * When true, use the public API.
   *
   * Public API guarantees PUBLISHED only.
   */
  publishedOnly?: boolean;
}

export function useNews(options?: UseNewsOptions) {
  /*
   * --------------------------------------------------
   * Extract options individually.
   *
   * IMPORTANT:
   * Do not use the complete `options` object as a
   * dependency of loadNews().
   *
   * The parent component may create a new object on
   * every render, which would cause loadNews() to be
   * recreated and the effect to run again.
   * --------------------------------------------------
   */
  const {
    page = 1,
    pageSize = 20,
    search,
    status,
    categoryId,
    countryId,
    scope,
    stateId,
    districtId,
    sortBy,
    sortOrder,
    popular = false,
    publishedOnly = false,
    enabled = true,
  } = options ?? {};

  const [news, setNews] = useState<NewsView[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /*
   * --------------------------------------------------
   * Load News
   * --------------------------------------------------
   */
  const loadNews = useCallback(async () => {
    try {
      setLoading(true);

      if (publishedOnly) {
        const query: PublicNewsQuery = {
          page,
          pageSize,
          search,
          categoryId,
          countryId,
          scope,
          stateId,
          districtId,
          sortBy,
          sortOrder,
          popular,
        };

        const response = await getPublishedNewsList(query);

        setNews(toNewsViewList(response.data));
      } else {
        const query: NewsQuery = {
          page,
          pageSize,
          search,

          /*
           * Public API already guarantees PUBLISHED
           * articles, so do not send status when using
           * the public endpoint.
           */
          status,
          categoryId,
          countryId,
          scope,
          stateId,
          districtId,

          /*
           * IMPORTANT:
           * sortBy must use the backend-supported
           * snake_case values, e.g.
           *
           * published_at
           * created_at
           * updated_at
           */
          sortBy,
          sortOrder,
        };

        const response = await getNewsList(query);

        setNews(toNewsViewList(response.data));
      }

      setError(null);
    } catch (err) {
      console.error(err);

      setError("Unable to load news.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    search,
    status,
    categoryId,
    countryId,
    scope,
    stateId,
    districtId,
    sortBy,
    sortOrder,
    popular,
    publishedOnly,
  ]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const fetchNews = async () => {
      await loadNews();
    };

    void fetchNews();
  }, [enabled, loadNews]);

  return {
    news,
    loading,
    error,
    refresh: loadNews,
  };
}
