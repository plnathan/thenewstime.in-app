import { useEffect, useState } from "react";
import { getNewsList } from "../api/news.api";
import type { News } from "../types/news.types";

export const useNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewsList()
      .then((response) => {
        setNews(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    news,
    loading,
  };
};
