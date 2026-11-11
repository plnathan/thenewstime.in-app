import apiClient from "./axios";

import type { ApiResponse } from "../types/api";

export interface Category {
  id: number;
  code: string;
  displayName: string;
  urlName: string;
  status?: "ACTIVE" | "INACTIVE";
}

/**
 * Get all categories.
 *
 * Categories are master data and are used by the
 * public navigation/filtering UI.
 */
const CATEGORY_REUSE_MS = 5 * 60_000;
let categoryRequest: Promise<ApiResponse<Category[]>> | null = null;
let categoryRequestAt = 0;

/** Shared category master-data read; no polling or persistent browser storage. */
export const getCategories = (): Promise<ApiResponse<Category[]>> => {
  const now = Date.now();
  if (categoryRequest && now - categoryRequestAt < CATEGORY_REUSE_MS) {
    return categoryRequest;
  }
  categoryRequestAt = now;
  const request = apiClient
    .get<ApiResponse<Category[]>>("/categories")
    .then((response) => response.data)
    .catch((error: unknown) => {
      if (categoryRequest === request) categoryRequest = null;
      throw error;
    });
  categoryRequest = request;
  return request;
};

export const invalidateCategoriesCache = (): void => {
  categoryRequest = null;
  categoryRequestAt = 0;
};

export const createCategory = async (
  input: Pick<Category, "code" | "displayName" | "urlName">,
): Promise<ApiResponse<Category>> => {
  const response = await apiClient.post<ApiResponse<Category>>(
    "/categories",
    input,
  );
  invalidateCategoriesCache();
  return response.data;
};
export const updateCategory = async (
  id: number,
  input: Partial<Pick<Category, "code" | "displayName" | "urlName" | "status">>,
): Promise<ApiResponse<Category>> => {
  const response = await apiClient.patch<ApiResponse<Category>>(
    `/categories/${id}`,
    input,
  );
  invalidateCategoriesCache();
  return response.data;
};
