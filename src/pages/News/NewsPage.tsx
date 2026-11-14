import { usePageTitle } from "@/hooks/usePageTitle";
import PublicAdvertisementModal from "@/components/advertisements/Advertisement/PublicAdvertisementModal";
import LiveAdvertisementSlot from "@/components/advertisements/Advertisement/LiveAdvertisementSlot";
import DynamicNewsListSidebar from "@/components/advertisements/Advertisement/DynamicNewsListSidebar";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NewsCard from "@/components/news/NewsCard";
import { getPublishedNewsStream, invalidatePublicNewsStreamCache } from "@/api/news.api";
import { toNewsViewList } from "@/utils/news";
import type { NewsView } from "@/types";

import AppContainer from "@/components/container/AppContainer";
import MainContent from "@/components/container/MainContent";
import PageLoader from "@/components/ui/PageLoader/PageLoader";

import MainLayout from "@/layouts/MainLayout";

import { useCategories } from "@/hooks/useCategories";

import type { NewsScope } from "@/types/news.types";

const PAGE_SIZE = 15;
const INITIAL_BATCH = 20;
const CACHE_TTL_MS = 120_000;
type NewsListCacheEntry = { main: NewsView[]; sidebar: NewsView[]; hero: NewsView[]; cursor: string | null; hasNext: boolean; savedAt: number };
const newsListCache = new Map<string, NewsListCacheEntry>();
const pendingMore = new Set<string>();
const NEXT_PAGE_SIZE = 5;

/**
 * Keep filtered News List sidebars populated without repeating an article.
 * For a full batch: 5 important, 10 main, 5 additional.
 * Smaller batches give the main list priority and divide the remainder
 * between the two sidebar sections.
 * The unfiltered All News page retains its separate homepage hero feed.
 */
function partitionInitialNews(
    items: NewsView[],
    homepageHero: NewsView[],
    excludeHero: boolean,
): Pick<NewsListCacheEntry, "main" | "sidebar" | "hero"> {
    if (excludeHero) {
        return {
            main: items.slice(0, PAGE_SIZE),
            sidebar: items.slice(PAGE_SIZE, INITIAL_BATCH),
            hero: homepageHero,
        };
    }

    const count = items.length;
    const mainCount = count >= 15 ? 10 : Math.max(0, Math.ceil(count * 0.6));
    const remaining = count - mainCount;
    const importantCount = Math.min(5, Math.ceil(remaining / 2));

    return {
        hero: items.slice(0, importantCount),
        main: items.slice(importantCount, importantCount + mainCount),
        sidebar: items.slice(importantCount + mainCount),
    };
}


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

export default function NewsPage() {
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
    // A cache key is specific to every URL filter. No cross-category reuse.
    const stateSlug = searchParams.get("state") ?? undefined;
    const queryIdentity = [scope, categoryId, countryId, stateId, stateSlug, districtId,
        excludeHero].join(":");

    // A keyed child gets a fresh state initializer whenever filters change.
    // Cache restoration happens during initialization, never inside an effect.
    return (
        <NewsListContent
            key={queryIdentity}
            queryIdentity={queryIdentity}
            isReady={shouldLoadNews}
            categoriesLoading={categoriesLoading}
            categoriesError={categoriesError}
            categoryParam={categoryParam}
            category={category}
            scope={scope}
            categoryId={categoryId}
            countryId={countryId}
            stateId={stateId}
            stateSlug={stateSlug}
            districtId={districtId}
            excludeHero={excludeHero}
        />
    );
}

type NewsListContentProps = {
    queryIdentity: string;
    isReady: boolean;
    categoriesLoading: boolean;
    categoriesError: string | null | undefined;
    categoryParam: string | null;
    category: { id: number; displayName: string } | undefined;
    scope: NewsScope | undefined;
    categoryId: number | undefined;
    countryId: number | undefined;
    stateId: number | undefined;
    stateSlug: string | undefined;
    districtId: number | undefined;
    excludeHero: boolean;
};

function NewsListContent({
    queryIdentity, isReady, categoriesLoading, categoriesError, categoryParam,
    category, scope, categoryId, countryId, stateId, stateSlug, districtId, excludeHero,
}: NewsListContentProps) {
    const [snapshot, setSnapshot] = useState<NewsListCacheEntry | null>(() => {
        const entry = newsListCache.get(queryIdentity);
        return entry && Date.now() - entry.savedAt < CACHE_TTL_MS ? entry : null;
    });
    const [newsLoading, setNewsLoading] = useState(() => snapshot === null);
    const [newsError, setNewsError] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [moreError, setMoreError] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState(0);
    const [loadedIdentity, setLoadedIdentity] = useState<string | null>(() =>
        snapshot ? queryIdentity : null
    );

    const news = snapshot?.main ?? [];
    const sidebarNews = snapshot?.sidebar ?? [];
    const heroNews = snapshot?.hero ?? [];
    const nextCursor = snapshot?.cursor ?? null;
    const moreAvailable = snapshot?.hasNext ?? false;

    useEffect(() => {
        if (!isReady || loadedIdentity === queryIdentity) return;
        let active = true;
        void getPublishedNewsStream({
            limit: INITIAL_BATCH, scope, categoryId, countryId, stateId,
            state: stateSlug, districtId, excludeHomepageHero: excludeHero,
        }).then((response) => {
            if (!active) return;
            const items = toNewsViewList(response.data);
            const sections = partitionInitialNews(
                items,
                toNewsViewList(response.hero ?? []),
                excludeHero,
            );
            const entry: NewsListCacheEntry = {
                ...sections,
                cursor: response.meta.nextCursor,
                hasNext: response.meta.hasNext,
                savedAt: Date.now(),
            };
            newsListCache.set(queryIdentity, entry);
            setSnapshot(entry);
            setNewsError(null);
            setLoadedIdentity(queryIdentity);
        }).catch(() => {
            if (!active) return;
            setNewsError("செய்திகளை ஏற்ற முடியவில்லை.");
            setLoadedIdentity(queryIdentity);
        }).finally(() => {
            if (active) setNewsLoading(false);
        });
        return () => { active = false; };
    }, [queryIdentity, isReady, refreshToken, scope, categoryId, countryId,
        stateId, stateSlug, districtId, excludeHero, loadedIdentity]);

    const loadNextFive = async () => {
        if (loadingMore || !moreAvailable || !nextCursor || pendingMore.has(queryIdentity)) return;
        pendingMore.add(queryIdentity);
        setLoadingMore(true);
        setMoreError(null);
        try {
            const response = await getPublishedNewsStream({
                limit: NEXT_PAGE_SIZE, cursor: nextCursor, scope, categoryId,
                countryId, stateId, state: stateSlug, districtId,
                excludeHomepageHero: excludeHero,
            });
            const seen = new Set([...news, ...sidebarNews, ...heroNews].map((item) => item.id));
            const added = toNewsViewList(response.data).filter((item) => !seen.has(item.id));
            const entry: NewsListCacheEntry = {
                main: [...news, ...added], sidebar: sidebarNews, hero: heroNews,
                cursor: response.meta.nextCursor,
                hasNext: response.meta.hasNext,
                savedAt: Date.now(),
            };
            newsListCache.set(queryIdentity, entry);
            setSnapshot(entry);
        } catch {
            setMoreError("அடுத்த செய்திகளை ஏற்ற முடியவில்லை.");
        } finally {
            pendingMore.delete(queryIdentity);
            setLoadingMore(false);
        }
    };

    const refresh = () => {
        newsListCache.delete(queryIdentity);
        invalidatePublicNewsStreamCache();
        setSnapshot(null);
        setNewsLoading(true);
        setNewsError(null);
        setMoreError(null);
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