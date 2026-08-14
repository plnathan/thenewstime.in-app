import apiClient from "./axios";

import type { ApiResponse } from "../types/api";
import type {
  CreateNewsInput,
  News,
  UpdateNewsInput,
} from "../types/news.types";

/**
 * News list query parameters
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
 * Get News by ID
 */
export const getNewsById = async (id: number): Promise<ApiResponse<News>> => {
  const response = await apiClient.get<ApiResponse<News>>(`/news/${id}`);

  return response.data;
};

/**
 * Get News by Slug
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
 * Create News
 *
 * Temporary generic payload.
 *
 * We will introduce a dedicated CreateNewsPayload
 * when implementing the Admin module.
 */
export const createNews = async (
  payload: CreateNewsInput,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.post<ApiResponse<News>>("/news", payload);

  return response.data;
};

/**
 * Update News
 *
 * Temporary generic payload.
 *
 * We will introduce a dedicated UpdateNewsPayload
 * when implementing the Admin module.
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
 * Delete News
 */
export const deleteNews = async (id: number): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/news/${id}`);

  return response.data;
};
