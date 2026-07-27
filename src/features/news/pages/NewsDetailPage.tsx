import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { getNewsBySlug } from "../../../api/newsApi"; //"../api/newsApi";

import type { News } from "../types/news.types";

const NewsDetails = () => {
  const { slug } = useParams();

  const [news, setNews] = useState<News>();

  useEffect(() => {
    if (!slug) return;

    getNewsBySlug(slug).then(setNews);
  }, [slug]);

  if (!news) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <img src={news.thumbnailUrl} className="w-full rounded-lg" />

      <h1 className="text-4xl font-bold mt-5">{news.title}</h1>

      <div className="mt-6">{news.content}</div>
    </div>
  );
};

export default NewsDetails;
