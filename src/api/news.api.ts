import apiClient from "./axios";
import type { ApiResponse } from "../types/api";
import type { News } from "../types/news.types";

export const getNewsList = async () => {
  const response = await apiClient.get<ApiResponse<News[]>>("/news");

  return response.data;
};

export const getNewsById = async (id: number) => {
  const response = await apiClient.get<ApiResponse<News>>(`/news/${id}`);

  return response.data;
};
