import apiClient from "./axios";

import type { ApiResponse } from "../types/api";
import type { News } from "../types/news.types";

export interface NewsQuery {
  page?: number;
  pageSize?: number;

  search?: string;

  status?: string;

  categoryId?: number;

  scope?: string;

  stateId?: number;

  districtId?: number;

  sortBy?: string;

  sortOrder?: "ASC" | "DESC";
}

export const getNewsList = async (
  params?: NewsQuery,
): Promise<ApiResponse<News[]>> => {
  const response = await apiClient.get<ApiResponse<News[]>>("/news", {
    params,
  });

  return response.data;
};

export const getNewsById = async (id: number): Promise<ApiResponse<News>> => {
  const response = await apiClient.get<ApiResponse<News>>(`/news/${id}`);

  return response.data;
};

export const createNews = async (
  payload: Partial<News>,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.post<ApiResponse<News>>("/news", payload);

  return response.data;
};

export const updateNews = async (
  id: number,
  payload: Partial<News>,
): Promise<ApiResponse<News>> => {
  const response = await apiClient.put<ApiResponse<News>>(
    `/news/${id}`,
    payload,
  );

  return response.data;
};

export const deleteNews = async (id: number): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/news/${id}`);

  return response.data;
};
