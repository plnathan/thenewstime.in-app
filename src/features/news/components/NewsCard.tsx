import { Link } from "react-router-dom";
import type  { News } from "../types/news.types.js";

interface Props {
  news: News;
}

const NewsCard = ({ news }: Props) => {
  return (
    <div className="border rounded-lg shadow hover:shadow-lg">
      <img
        src={news.thumbnailUrl}
        alt={news.title}
        className="w-full h-52 object-cover"
      />

      <div className="p-4">
        <h2 className="font-bold text-xl">{news.title}</h2>

        <p className="text-gray-500 mt-2">{news.summary}</p>

        <Link
          to={`/news/${news.slug}`}
          className="text-blue-600 mt-4 inline-block"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
};

export default NewsCard;
