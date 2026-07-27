import { useEffect, useState } from "react";

import { getNews } from "../../../api/newsApi"; //"../api/newsApi";

import type { News } from "../types/news.types";

import NewsCard from "../components/NewsCard";

import Loading from "../../../components/common/Loading";


const NewsList = () => {
  const [news, setNews] = useState<News[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await getNews();

        setNews(data);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
};

export default NewsList;
