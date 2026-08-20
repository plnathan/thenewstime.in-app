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
export type PublicNewsQuery = Omit<NewsQuery, "status">;

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
  const response = await apiClient.get<ApiResponse<News[]>>("/news/public", {
    params,
  });

  return response.data;
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
  const response = await apiClient.get<ApiResponse<News>>(
    `/news/slug/${encodeURIComponent(slug)}`,
  );

  return response.data;
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
  updatedBy: number,
): Promise<ApiResponse<News>> => {
  return changeNewsStatus(id, "DRAFT", updatedBy);
};

/**
 * Publish a news article.
 */
export const publishNews = async (
  id: number,
  publishedBy: number,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.patch<ApiResponse<News>>(
    `/news/${id}/publish`,
    {
      publishedBy,
    },
  );

  return response.data;
};

/**
 * Promote a published article for 3 days.
 */
export const promoteNews = async (
  id: number,
  promotedBy: number,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.post<ApiResponse<News>>(
    `/news/${id}/promote`,
    {
      promotedBy,
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
  updatedBy: number,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.delete<ApiResponse<News>>(
    `/news/${id}/promotion`,
    {
      data: {
        updatedBy,
      },
    },
  );

  return response.data;
};
