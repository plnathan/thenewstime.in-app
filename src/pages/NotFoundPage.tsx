import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
        <SearchX size={80} className="mx-auto mb-6 text-red-700" />

        <h1 className="mb-2 text-6xl font-black text-red-700">404</h1>

        <h2 className="mb-4 text-3xl font-bold">Page Not Found</h2>

        <p className="mb-8 text-gray-600">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="rounded-xl bg-red-700 px-6 py-3 text-white transition hover:bg-red-800"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
