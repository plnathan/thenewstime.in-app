import { useSearchParams } from "react-router-dom";

import AppContainer from "@/components/container/AppContainer";
import MainContent from "@/components/container/MainContent";
import HomeNewsSection from "@/components/home/HomeNewsSection";

import MainLayout from "@/layouts/MainLayout";

import { useCategories } from "@/hooks/useCategories";
import { useNews } from "@/hooks/useNews";

import type { NewsScope } from "@/types/news.types";

const PAGE_SIZE = 20;

const getScopeTitle = (scope: NewsScope | null) => {
    switch (scope) {
        case "STATE":
            return "தமிழ்நாடு";

        case "INDIA":
            return "இந்தியா";

        case "WORLD":
            return "உலகம்";

        case "DISTRICT":
            return "மாவட்ட செய்திகள்";

        default:
            return "அனைத்து செய்திகள்";
    }
};

export default function NewsPage() {
    const [searchParams] = useSearchParams();

    const scopeParam = searchParams.get("scope");

    const categoryParam = searchParams.get("category");

    const scope: NewsScope | undefined =
        scopeParam === "STATE" ||
            scopeParam === "INDIA" ||
            scopeParam === "WORLD" ||
            scopeParam === "DISTRICT"
            ? scopeParam
            : undefined;

    const categoryIdParam = searchParams.get("categoryId");
    const countryIdParam = searchParams.get("countryId");
    const stateIdParam = searchParams.get("stateId");
    const districtIdParam = searchParams.get("districtId");

    const categoryIdFromQuery = categoryIdParam
        ? Number(categoryIdParam)
        : undefined;

    const countryId = countryIdParam
        ? Number(countryIdParam)
        : undefined;

    const stateId = stateIdParam
        ? Number(stateIdParam)
        : undefined;

    const districtId = districtIdParam
        ? Number(districtIdParam)
        : undefined;

    /*
     * --------------------------------------------------
     * Category master data
     * --------------------------------------------------
     */
    const {
        categories,
        loading: categoriesLoading,
        error: categoriesError,
    } = useCategories();

    const category = categoryParam
        ? categories.find(
            (item) => item.urlName === categoryParam,
        )
        : undefined;

    const categoryId =
        categoryIdFromQuery ?? category?.id;

    /*
     * --------------------------------------------------
     * Public News
     * --------------------------------------------------
     *
     * Wait until category resolution has completed when
     * a category URL parameter is present.
     * --------------------------------------------------
     */
    const shouldLoadNews =
        !categoryParam || !categoriesLoading;

    const {
        news,
        loading: newsLoading,
        error: newsError,
        refresh,
    } = useNews({
        enabled: shouldLoadNews,
        publishedOnly: true,
        page: 1,
        pageSize: PAGE_SIZE,
        scope,
        categoryId,
        countryId,
        stateId,
        districtId,
        sortBy: "published_at",
        sortOrder: "DESC",
    });

    const loading =
        categoriesLoading || !shouldLoadNews || newsLoading;

    const error =
        categoriesError ||
        newsError ||
        (categoryParam &&
            !categoriesLoading &&
            !category
            ? "Category not found."
            : null);

    const title =
        category?.displayName ??
        getScopeTitle(scope ?? null);

    if (loading) {
        return (
            <MainLayout>
                <AppContainer>
                    <div className="flex min-h-[300px] items-center justify-center">
                        <p className="text-sm text-gray-500">
                            Loading news...
                        </p>
                    </div>
                </AppContainer>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <AppContainer>
                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                        <p className="text-sm text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            className="mt-4 rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                            onClick={() => void refresh()}
                        >
                            Retry
                        </button>
                    </div>
                </AppContainer>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <AppContainer>
                <div className="py-8">
                    <MainContent>
                        <HomeNewsSection
                            title={title}
                            news={news}
                            layout="list"
                        />
                    </MainContent>
                </div>
            </AppContainer>
        </MainLayout>
    );
}