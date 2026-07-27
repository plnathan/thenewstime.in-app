import api from "./axios";
import type { News } from "../features/news/types/news.types.js" // "../types/news";

export const getNews = async (): Promise<News[]> => {
  const response = await api.get("/news");

  return response.data.data;
};

export const getNewsBySlug = async (slug: string): Promise<News> => {
  const response = await api.get(`/news/${slug}`);

  return response.data.data;
};
