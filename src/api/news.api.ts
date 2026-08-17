import apiClient from "./axios";

import type { ApiResponse } from "../types/api";

import type {
  CreateNewsInput,
  News,
  UpdateNewsInput,
} from "../types/news.types";

/**
 * News list query parameters.
 */
export interface NewsQuery {
  page?: number;

  pageSize?: number;

  search?: string;

  status?: string;

  categoryId?: number;

  countryId?: number;

  scope?: string;

  stateId?: number;

  districtId?: number;

  sortBy?: string;

  sortOrder?: "ASC" | "DESC";
}

/**
 * Get News List
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
 * Change news status.
 *
 * Used by the admin workflow for approval.
 */
export const changeNewsStatus = async (
  id: number,
  status: string,
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
