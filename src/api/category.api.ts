import apiClient from "./axios";

import type { ApiResponse } from "../types/api";

export interface Category {
  id: number;
  code: string;
  displayName: string;
  urlName: string;
}

/**
 * Get all categories.
 *
 * Categories are master data and are used by the
 * public navigation/filtering UI.
 */
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  const response = await apiClient.get<ApiResponse<Category[]>>("/categories");

  return response.data;
};
