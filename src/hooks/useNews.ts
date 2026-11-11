import { useCallback, useEffect, useRef, useState } from "react";

import { getNewsList, getPublishedNewsList } from "@/api/news.api";
import type { NewsQuery, PublicNewsQuery } from "@/api/news.api";
import type { NewsView } from "@/types";
import { toNewsViewList } from "@/utils/news";

interface UseNewsOptions extends NewsQuery {
  /** Order public news by most-read count. */
  popular?: boolean;
  /** Include only articles selected for homepage display on public requests. */
  homepageOnly?: boolean;
  /** Controls whether the request should execute. Defaults to true. */
  enabled?: boolean;
  /** Use the public endpoint, which returns published articles only. */
  publishedOnly?: boolean;
}

export function useNews(options?: UseNewsOptions) {
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
    homepageOnly = false,
    publishedOnly = false,
    enabled = true,
  } = options ?? {};

  const [news, setNews] = useState<NewsView[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextPage, setNextPage] = useState(page + 1);
  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);

  const fetchPage = useCallback(
    async (targetPage: number, append: boolean) => {
      const currentRequestId = ++requestId.current;

      if (append) {
        setLoadingMore(true);
        loadingMoreRef.current = true;
      } else {
        setLoading(true);
        setNews([]);
        setHasMore(true);
        setNextPage(page + 1);
      }

      try {
        let data: NewsView[];
        let meta: { hasNext?: boolean; totalPages?: number } | null = null;

        if (publishedOnly) {
          const query: PublicNewsQuery = {
            page: targetPage,
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
            homepageOnly,
          };
          const response = await getPublishedNewsList(query);
          data = toNewsViewList(response.data);
          meta = response.meta;
        } else {
          const query: NewsQuery = {
            page: targetPage,
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
          };
          const response = await getNewsList(query);
          data = toNewsViewList(response.data);
          meta = response.meta;
        }

        if (currentRequestId !== requestId.current) return;

        if (append) {
          setNews((current) => {
            const existingIds = new Set(current.map((item) => item.id));
            return [
              ...current,
              ...data.filter((item) => !existingIds.has(item.id)),
            ];
          });
        } else {
          setNews(data);
        }

        const moreAvailable =
          typeof meta?.hasNext === "boolean"
            ? meta.hasNext
            : typeof meta?.totalPages === "number"
              ? targetPage < meta.totalPages
              : data.length >= pageSize;

        setHasMore(moreAvailable);
        setNextPage(targetPage + 1);
        setError(null);
      } catch (err) {
        if (currentRequestId !== requestId.current) return;
        console.error(err);
        setError("Unable to load news.");
      } finally {
        if (currentRequestId === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
          loadingMoreRef.current = false;
        }
      }
    },
    [
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
      homepageOnly,
      publishedOnly,
    ],
  );

  const loadNews = useCallback(async () => {
    if (!enabled) return;
    await fetchPage(page, false);
  }, [enabled, fetchPage, page]);

  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || loadingMoreRef.current || loading) return;
    await fetchPage(nextPage, true);
  }, [enabled, fetchPage, hasMore, loading, nextPage]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) {
        return loadNews();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, loadNews]);

  return {
    news,
    loading,
    loadingMore,
    error,
    hasMore,
    refresh: loadNews,
    loadMore,
  };
}
