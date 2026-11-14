import apiClient from "./axios";

import type { ApiResponse } from "../types/api";

import type {
  CreateNewsInput,
  News,
  NewsStatus,
  UpdateNewsInput,
} from "../types/news.types";

/**
 * News list query parameters.
 *
 * Used by the admin/private news endpoint.
 */
export interface NewsQuery {
  page?: number;

  pageSize?: number;

  search?: string;

  status?: NewsStatus;

  categoryId?: number;

  countryId?: number;

  scope?: string;

  stateId?: number;

  districtId?: number;

  sortBy?: string;

  sortOrder?: "ASC" | "DESC";
}

/**
 * Public news list query parameters.
 *
 * The public endpoint guarantees PUBLISHED news,
 * therefore status is intentionally not supported here.
 */
export type PublicNewsQuery = Omit<NewsQuery, "status"> & {
  /**
   * When true, the public API returns news ordered
   * by most-read count.
   */
  popular?: boolean;
  homepageOnly?: boolean;
};

/** Share concurrent identical public reads and short-lived remounts.
 * No background refresh, browser storage or polling. */
const PUBLIC_READ_REUSE_MS = 8_000;
type CachedPublicRead<T> = { createdAt: number; request: Promise<T> };
const publicReadRequests = new Map<string, CachedPublicRead<unknown>>();

function sharedPublicRead<T>(key: string, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = publicReadRequests.get(key);
  if (cached && now - cached.createdAt < PUBLIC_READ_REUSE_MS) {
    return cached.request as Promise<T>;
  }
  const request = load().catch((error: unknown) => {
    if (publicReadRequests.get(key)?.request === request) {
      publicReadRequests.delete(key);
    }
    throw error;
  });
  publicReadRequests.set(key, { createdAt: now, request });
  // Keep this cache bounded without adding a polling/expiry timer.
  if (publicReadRequests.size > 100) {
    for (const [entryKey, entry] of publicReadRequests) {
      if (now - entry.createdAt >= PUBLIC_READ_REUSE_MS)
        publicReadRequests.delete(entryKey);
    }
  }
  return request;
}

/**
 * Get News List.
 *
 * Admin/private endpoint.
 */
export const getNewsList = async (
  params?: NewsQuery,
): Promise<ApiResponse<News[]>> => {
  const response = await apiClient.get<ApiResponse<News[]>>("/news", {
    params,
  });

  return response.data;
};

/**
 * Get Published News List.
 *
 * Public endpoint.
 *
 * Backend guarantees:
 * - PUBLISHED news only
 * - published_at DESC ordering by default
 * - public pagination
 */
export const getPublishedNewsList = async (
  params?: PublicNewsQuery,
): Promise<ApiResponse<News[]>> => {
  const key = `list:${JSON.stringify(params ?? {})}`;
  return sharedPublicRead(key, async () => {
    const response = await apiClient.get<ApiResponse<News[]>>("/news/public", {
      params,
    });
    return response.data;
  });
};

/**
 * Get News by ID.
 */
export const getNewsById = async (id: number): Promise<ApiResponse<News>> => {
  const response = await apiClient.get<ApiResponse<News>>(`/news/${id}`);

  return response.data;
};

/**
 * Get News by Slug.
 *
 * Used by the public News Details page.
 */
export const getNewsBySlug = async (
  slug: string,
): Promise<ApiResponse<News>> => {
  return sharedPublicRead(`slug:${slug}`, async () => {
    const response = await apiClient.get<ApiResponse<News>>(
      `/news/slug/${encodeURIComponent(slug)}`,
    );
    return response.data;
  });
};

/**
 * Create News.
 */
export const createNews = async (
  payload: CreateNewsInput,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.post<ApiResponse<News>>("/news", payload);

  return response.data;
};

/**
 * Update News.
 */
export const updateNews = async (
  id: number,
  payload: UpdateNewsInput,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.put<ApiResponse<News>>(
    `/news/${id}`,
    payload,
  );

  return response.data;
};

/**
 * Delete News.
 *
 * Kept for compatibility with the existing API.
 *
 * Admin UI will use archive/deactivate instead because
 * archived news should remain available for audit/history.
 */
export const deleteNews = async (id: number): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/news/${id}`);

  return response.data;
};

/**
 * Archive / deactivate a news article.
 */
export const archiveNews = async (
  id: number,
  archivedBy: number,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.patch<ApiResponse<News>>(
    `/news/${id}/archive`,
    {
      archivedBy,
    },
  );

  return response.data;
};

/**
 * Activate / restore an archived news article.
 *
 * ARCHIVED -> DRAFT
 */
export const activateNews = async (
  id: number,
  activatedBy: number,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.patch<ApiResponse<News>>(
    `/news/${id}/activate`,
    {
      activatedBy,
    },
  );

  return response.data;
};

/**
 * Change news status.
 *
 * Used by the admin workflow for approval.
 */
export const changeNewsStatus = async (
  id: number,
  status: NewsStatus,
  userId: number,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.patch<ApiResponse<News>>(
    `/news/${id}/status`,
    {
      status,
      userId,
    },
  );

  return response.data;
};

/**
 * Submit a news article for review.
 */
export const submitNewsForReview = async (
  id: number,
  submittedBy: number,
): Promise<ApiResponse<News>> => {
  return changeNewsStatus(id, "IN_REVIEW", submittedBy);
};

/**
 * Approve a news article.
 */
export const approveNews = async (
  id: number,
  approvedBy: number,
): Promise<ApiResponse<News>> => {
  return changeNewsStatus(id, "APPROVED", approvedBy);
};

/**
 * Reject a news article.
 */
export const rejectNews = async (
  id: number,
  rejectedBy: number,
): Promise<ApiResponse<News>> => {
  return changeNewsStatus(id, "REJECTED", rejectedBy);
};

/**
 * Move a rejected article back to draft.
 */
export const moveNewsToDraft = async (
  id: number,
  updatedBy: number | string,
): Promise<ApiResponse<News>> => {
  return changeNewsStatus(id, "DRAFT", Number(updatedBy));
};

/**
 * Publish a news article.
 */
export const publishNews = async (
  id: number,
  publishedBy: number,
  publishedAt?: string,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.patch<ApiResponse<News>>(
    `/news/${id}/publish`,
    {
      publishedBy,
      ...(publishedAt ? { publishedAt } : {}),
    },
  );

  return response.data;
};

/**
 * Promote a published article for 3 days.
 */
export const promoteNews = async (
  id: number,
  promotedBy: number | string,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.post<ApiResponse<News>>(
    `/news/${id}/promote`,
    {
      promotedBy: Number(promotedBy),
      durationDays: 3,
    },
  );

  return response.data;
};

/**
 * Remove an existing promotion.
 */
export const removeNewsPromotion = async (
  id: number,
  updatedBy: number | string,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.delete<ApiResponse<News>>(
    `/news/${id}/promotion`,
    {
      data: {
        updatedBy: Number(updatedBy),
      },
    },
  );

  return response.data;
};

/** Validate persisted images and commit their final display order. */
export const finalSaveNews = async (
  newsId: number,
  mediaIds: number[],
): Promise<ApiResponse<unknown>> => {
  const response = await apiClient.post<ApiResponse<unknown>>(
    `/news/${newsId}/final-save`,
    { mediaIds },
  );
  return response.data;
};

export interface DistrictNewsSection {
  key: string;
  title: string;
  news: News[];
  hasMoreNews: boolean;
  nextNewsOffset: number | null;
  nextNewsCursor?: string | null;
}
export interface DistrictSectionBatch {
  sections: DistrictNewsSection[];
  hasMoreSections: boolean;
  nextSectionOffset: number | null;
}
export interface DistrictSectionNewsBatch {
  news: News[];
  hasMoreNews: boolean;
  nextNewsOffset: number | null;
  nextNewsCursor?: string | null;
}
export async function getDistrictSections(
  offset = 0,
): Promise<DistrictSectionBatch> {
  return sharedPublicRead(
    `district-sections:${offset}`,
    async () =>
      (
        await apiClient.get<DistrictSectionBatch>(
          "/news/public/district-sections",
          {
            params: { offset, limit: 8 },
          },
        )
      ).data,
  );
}
export async function getDistrictSectionNews(
  key: string,
  offset: number,
  cursor?: string | null,
): Promise<DistrictSectionNewsBatch> {
  return sharedPublicRead(
    `district-news:${key}:${cursor ?? offset}`,
    async () =>
      (
        await apiClient.get<DistrictSectionNewsBatch>(
          `/news/public/district-sections/${encodeURIComponent(key)}`,
          {
            params: cursor ? { cursor } : { offset },
          },
        )
      ).data,
  );
}
