import { RefreshCcw, Home } from "lucide-react";
import { Link } from "react-router-dom";

const ErrorFallback = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 shadow-xl text-center">
        <div className="mb-6 text-red-600">
          <RefreshCcw size={60} className="mx-auto" />
        </div>

        <h1 className="mb-3 text-3xl font-bold">Something went wrong</h1>

        <p className="mb-8 text-gray-600">
          An unexpected error occurred while loading this page. Please try
          again.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-red-700 px-5 py-3 text-white hover:bg-red-800"
          >
            Refresh Page
          </button>

          <Link
            to="/"
            className="rounded-lg border px-5 py-3 hover:bg-gray-100"
          >
            <Home className="inline mr-2" size={18} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
