import DistrictNewsPage from "./DistrictNewsPage";
import { usePageTitle } from "@/hooks/usePageTitle";
import PublicAdvertisementModal from "@/components/advertisements/Advertisement/PublicAdvertisementModal";
import LiveAdvertisementSlot from "@/components/advertisements/Advertisement/LiveAdvertisementSlot";
import DynamicNewsListSidebar from "@/components/advertisements/Advertisement/DynamicNewsListSidebar";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NewsCard from "@/components/news/NewsCard";
import { getPublishedNewsList } from "@/api/news.api";
import { toNewsViewList } from "@/utils/news";
import type { NewsView } from "@/types";

import AppContainer from "@/components/container/AppContainer";
import MainContent from "@/components/container/MainContent";
import PageLoader from "@/components/ui/PageLoader/PageLoader";

import MainLayout from "@/layouts/MainLayout";

import { useCategories } from "@/hooks/useCategories";
import { useNews } from "@/hooks/useNews";

import type { NewsScope } from "@/types/news.types";

const PAGE_SIZE = 15;
const NEXT_PAGE_SIZE = 5;

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
            return "அனைத்துச் செய்திகள்";
    }
};

function StandardNewsPage() {
    usePageTitle();
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

    const categoryIdParam =
        searchParams.get("categoryId");

    const countryIdParam =
        searchParams.get("countryId");

    const stateIdParam =
        searchParams.get("stateId");

    const districtIdParam =
        searchParams.get("districtId");

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
    } = useCategories(Boolean(categoryParam) && categoryIdFromQuery == null);

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
        !categoryParam || categoryIdFromQuery != null || !categoriesLoading;

    // Match the homepage Hero Carousel selection exactly.
    const excludeHero = !scope && !categoryParam && !categoryIdFromQuery &&
        !countryId && !stateId && !districtId;
    const heroQuery = useNews({
        enabled: excludeHero,
        publishedOnly: true,
        homepageOnly: true,
        page: 1,
        pageSize: 10,
        sortBy: "published_at",
        sortOrder: "DESC",
    });
    const heroNews = heroQuery.news.filter((item) => item.showOnHomepage).slice(0, 5);
    const heroIdentity = heroNews.map((item) => item.id).join(",");
    const queryIdentity = [scope, categoryId, countryId, stateId, districtId,
        excludeHero, heroIdentity].join(":");
    const [loadedIdentity, setLoadedIdentity] = useState<string | null>(null);
    const [news, setNews] = useState<NewsView[]>([]);
    const [sidebarNews, setSidebarNews] = useState<NewsView[]>([]);
    const [nextPage, setNextPage] = useState(1);
    const [moreAvailable, setMoreAvailable] = useState(false);
    const [newsLoading, setNewsLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [newsError, setNewsError] = useState<string | null>(null);
    const [moreError, setMoreError] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState(0);
    const isReady = shouldLoadNews && (!excludeHero || !heroQuery.loading);

    useEffect(() => {
        if (!isReady) return;
        let active = true;
        const excludedIds = new Set(excludeHero ? heroNews.map((item) => item.id) : []);
        const excludedSlugs = new Set(excludeHero ? heroNews.map((item) => item.slug) : []);
        const fetchInitial = async () => {
            const collected: NewsView[] = [];
            let page = 1;
            let hasMore: boolean = true;
            // Main list (15) + reserved sidebar (5), in a single ordered stream.
            while (hasMore && collected.length < PAGE_SIZE + NEXT_PAGE_SIZE) {
                const response = await getPublishedNewsList({
                    page, pageSize: NEXT_PAGE_SIZE, scope, categoryId,
                    countryId, stateId, districtId,
                    sortBy: "published_at", sortOrder: "DESC",
                });
                const received = toNewsViewList(response.data);
                for (const item of received) {
                    if (excludedIds.has(item.id) || excludedSlugs.has(item.slug)) continue;
                    excludedIds.add(item.id);
                    excludedSlugs.add(item.slug);
                    collected.push(item);
                }
                page += 1;
                hasMore = response.meta?.hasNext ?? received.length === NEXT_PAGE_SIZE;
            }
            return { collected, page, hasMore };
        };
        void fetchInitial().then(({ collected, page, hasMore }) => {
            if (!active) return;
            setNews(collected.slice(0, PAGE_SIZE));
            setSidebarNews(collected.slice(PAGE_SIZE, PAGE_SIZE + NEXT_PAGE_SIZE));
            setNextPage(page);
            setMoreAvailable(hasMore);
            setNewsError(null);
            setLoadedIdentity(queryIdentity);
        }).catch(() => {
            if (!active) return;
            setNewsError("செய்திகளை ஏற்ற முடியவில்லை.");
            setLoadedIdentity(queryIdentity);
        }).finally(() => { if (active) setNewsLoading(false); });
        return () => { active = false; };
        // Query identity captures filters and the exact current Hero Carousel IDs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryIdentity, isReady, refreshToken]);

    const loadNextFive = async () => {
        if (loadingMore || !moreAvailable) return;
        setLoadingMore(true);
        setMoreError(null);
        try {
            const seen = new Set([...heroNews, ...news, ...sidebarNews].map((item) => item.id));
            const collected: NewsView[] = [];
            let page = nextPage;
            let hasMore: boolean = moreAvailable;
            while (hasMore && collected.length < NEXT_PAGE_SIZE) {
                const response = await getPublishedNewsList({
                    page, pageSize: NEXT_PAGE_SIZE, scope, categoryId,
                    countryId, stateId, districtId,
                    sortBy: "published_at", sortOrder: "DESC",
                });
                const received = toNewsViewList(response.data);
                for (const item of received) {
                    if (seen.has(item.id)) continue;
                    seen.add(item.id);
                    collected.push(item);
                }
                page += 1;
                hasMore = response.meta?.hasNext ?? received.length === NEXT_PAGE_SIZE;
            }
            setNews((current) => [...current, ...collected]);
            setNextPage(page);
            setMoreAvailable(hasMore);
        } catch {
            setMoreError("அடுத்த செய்திகளை ஏற்ற முடியவில்லை.");
        } finally {
            setLoadingMore(false);
        }
    };
    const refresh = () => {
        setNewsLoading(true);
        setNewsError(null);
        setLoadedIdentity(null);
        setRefreshToken((current) => current + 1);
    };
    const allNews = news;

    const loading =
        categoriesLoading ||
        !isReady ||
        loadedIdentity !== queryIdentity ||
        newsLoading;

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

    /*
     * --------------------------------------------------
     * Loading
     * --------------------------------------------------
     *
     * Use the same branded PageLoader as the Home page
     * and News Details page.
     * --------------------------------------------------
     */
    if (loading) {
        return (
            <MainLayout>
                <AppContainer>
                    <PageLoader
                        message="செய்திகள் பெறப்படுகின்றன..."
                        variant="page"
                    />
                </AppContainer>
            </MainLayout>
        );
    }

    /*
     * --------------------------------------------------
     * Error
     * --------------------------------------------------
     */

    if (error && news.length === 0) {
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

    /*
     * --------------------------------------------------
     * Page
     * --------------------------------------------------
     */

    return (
        <MainLayout>
            <AppContainer>
                <div className="pt-[18px] pb-[18px]">
                    <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_300px]">
                        <MainContent>
                            <h1 className="mb-5 text-xl font-bold text-gray-900">{title}</h1>
                            <div className="space-y-[18px]">
                                {allNews.map((item, index) => (
                                    <div key={item.id}>
                                        <NewsCard news={item} />
                                        {(index + 1) % 5 === 0 && index < 25 && (
                                            <div className="my-[18px]">
                                                <LiveAdvertisementSlot
                                                    placementCode="NEWS_LIST_BETWEEN"
                                                    slotNumber={Math.floor(index / 5) + 1}
                                                    configuredCode={`NEWS_LIST_BETWEEN_SLOT_${Math.floor(index / 5) + 1}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {moreAvailable && (
                                <div className="mt-6 text-center">
                                    <button type="button" onClick={() => void loadNextFive()} disabled={loadingMore}
                                        className="rounded-md bg-green-700 px-5 py-2 font-semibold text-white disabled:opacity-60">
                                        {loadingMore ? "பெறப்படுகிறது..." : "மேலும்"}
                                    </button>
                                </div>
                            )}
                            {moreError && <p role="alert" className="mt-3 text-center text-sm text-red-600">{moreError}</p>}
                            {error && news.length > 0 && (
                                <p className="mt-4 text-center text-sm text-red-600" role="alert">
                                    அடுத்த செய்திகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.
                                    <button
                                        type="button"
                                        className="ml-2 font-semibold underline"
                                        onClick={() => void refresh()}
                                    >
                                        மீண்டும் முயற்சிக்கவும்
                                    </button>
                                </p>
                            )}
                            <div className="mt-[18px] flex w-full min-w-0 justify-center">
                                <LiveAdvertisementSlot placementCode="NEWS_LIST_BOTTOM" slotNumber={1} />
                            </div>
                        </MainContent>
                        <aside aria-label="News list sidebar advertisement">
                            <DynamicNewsListSidebar importantNews={heroNews} additionalNews={sidebarNews} />
                        </aside>
                    </div>
                </div>
            </AppContainer>
            <PublicAdvertisementModal placementCode="NEWS_LIST_MODAL" />
        </MainLayout>
    );
}

/** Dedicated district page avoids the generic News List's multiple initial reads. */
export default function NewsPage() {
    const [params] = useSearchParams();
    if (params.get('scope') === 'DISTRICT' && !params.has('districtId') &&
        !params.has('category') && !params.has('categoryId')) {
        return <DistrictNewsPage />;
    }
    return <StandardNewsPage />;
}
