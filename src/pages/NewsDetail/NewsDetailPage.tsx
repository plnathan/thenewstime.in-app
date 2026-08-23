import { Link, useParams } from "react-router-dom";

import AppContainer from "@/components/container/AppContainer";
import NewsArticle from "@/components/news/NewsArticle";
import PageLoader from "@/components/ui/PageLoader/PageLoader";

import { useNewsDetail } from "@/hooks/useNewsDetail";

import MainLayout from "@/layouts/MainLayout";

function decodeSlug(value?: string) {
  if (!value) return undefined;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const decodedSlug = decodeSlug(slug);

  const {
    news,
    loading,
    error,
    refresh,
  } = useNewsDetail(decodedSlug);

  return (
    <MainLayout>
      <AppContainer>
        <main className="py-6 sm:py-10 lg:py-12">

          {/* Loading */}
          {loading && (
            <PageLoader message="செய்தி ஏற்றப்படுகிறது..." />
          )}

          {/* Error / Not Found */}
          {!loading && (error || !news) && (
            <div className="flex min-h-[60vh] items-center justify-center py-12">
              <div className="max-w-md text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                  📰
                </div>

                <h1 className="mt-5 text-2xl font-bold text-gray-900">
                  செய்தி கிடைக்கவில்லை
                </h1>

                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {error ?? "இந்த செய்தியை தற்போது பார்க்க முடியவில்லை."}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">

                  <button
                    type="button"
                    onClick={() => void refresh()}
                    className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                  >
                    மீண்டும் முயற்சி
                  </button>

                  <Link
                    to="/"
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-green-600 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                  >
                    முகப்புப் பக்கம்
                  </Link>

                </div>
              </div>
            </div>
          )}

          {/* News Article */}
          {!loading && news && (
            <NewsArticle news={news} />
          )}

        </main>
      </AppContainer>
    </MainLayout>
  );
}