import AdminListPagination from "@/components/ui/AdminListPagination";
import {
    History,
    Archive,
    Check,
    Edit3,
    Trash2,
    RotateCcw,
    RefreshCw,
    Star,
    StarOff,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import {
    isAdminUser,
    isReporterUser,
} from "@/auth/auth.utils";
import { Link, useSearchParams } from "react-router-dom";

import {
    activateNews,
    archiveNews,
    changeNewsStatus,
    deleteNews,
    getNewsList,
    getNewsById,
    promoteNews,
    removeNewsPromotion,
} from "@/api/news.api";

import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/helpers/advertisementManagement.helpers";
import MainLayout from "@/layouts/MainLayout";

import type { News, NewsStatus } from "@/types/news.types";

type StatusFilter = "ALL" | NewsStatus;

const DEFAULT_NEWS_PAGE_SIZE = 5;
const NEWS_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

const formatPublishedDateTime = (value: string | null): string => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    }).format(date);
};

export default function AdminNewsPage() {
    const { user, isAuthenticated } = useAuth();
    const [auditArticle, setAuditArticle] = useState<News | null>(null);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditError, setAuditError] = useState<string | null>(null);
    const openAudit = async (article: News): Promise<void> => {
        setAuditArticle(article);
        setAuditError(null);
        setAuditLoading(true);
        try {
            const response = await getNewsById(article.id);
            if (response.data) setAuditArticle(response.data);
        } catch (error) {
            setAuditError(getApiErrorMessage(error));
        } finally { setAuditLoading(false); }
    };
    const [searchParams, setSearchParams] = useSearchParams();
    const pageSizeValue = Number(searchParams.get("pageSize") ?? String(DEFAULT_NEWS_PAGE_SIZE));
    const pageSize = NEWS_PAGE_SIZE_OPTIONS.find((size) => size === pageSizeValue) ?? DEFAULT_NEWS_PAGE_SIZE;
    const pageValue = Number(searchParams.get("page") ?? "1");
    const currentPage = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const updatePage = (page: number) => {
        const next = new URLSearchParams(searchParams);
        if (page <= 1) next.delete("page");
        else next.set("page", String(page));
        setSearchParams(next, { replace: true, preventScrollReset: true });
    };
    const updatePageSize = (size: number) => {
        if (!NEWS_PAGE_SIZE_OPTIONS.some((option) => option === size)) return;
        const next = new URLSearchParams(searchParams);
        if (size === DEFAULT_NEWS_PAGE_SIZE) next.delete("pageSize");
        else next.set("pageSize", String(size));
        next.delete("page");
        setSearchParams(next, { replace: true, preventScrollReset: true });
    };
    const editReturnUrl = `/admin/news/list${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    const canManageNews =
        isAuthenticated &&
        isAdminUser(user);

    const canReporterEdit =
        isAuthenticated &&
        isReporterUser(user);

    const [news, setNews] = useState<News[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const hasLoadedNews = useRef(false);

    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => (searchParams.get("status") || "ALL") as StatusFilter);

    const [newsIdFilter, setNewsIdFilter] = useState(() => (searchParams.get("newsId") || ""));
    const [slugFilter, setSlugFilter] = useState(() => (searchParams.get("slug") || ""));
    const [scopeFilter, setScopeFilter] = useState(() => (searchParams.get("scope") || ""));
    const [categoryFilter, setCategoryFilter] = useState(() => (searchParams.get("category") || ""));
    const [publishedFrom, setPublishedFrom] = useState(() => (searchParams.get("from") || ""));
    const [publishedTo, setPublishedTo] = useState(() => (searchParams.get("to") || ""));



    const changeFilter = (key: string, value: string) => {
        const next = new URLSearchParams(searchParams);
        if (!value || (key === "status" && value === "ALL")) next.delete(key);
        else next.set(key, value);
        next.delete("page");
        setSearchParams(next, { replace: true, preventScrollReset: true });
    };

    /**
     * ID of the article currently performing an action.
     *
     * This prevents multiple actions from being triggered
     * on the same article while an API request is running.
     */
    const [actionId, setActionId] = useState<number | null>(null);
    const [newsPendingDeletion, setNewsPendingDeletion] = useState<News | null>(null);

    /**
     * Current time is kept in state instead of calling
     * Date.now() directly during render.
     *
     * This also allows promotion expiry to update while
     * the page remains open.
     */
    const [currentTime, setCurrentTime] = useState(() =>
        Date.now(),
    );

    /*
     * --------------------------------------------------
     * Keep promotion state reasonably fresh.
     * --------------------------------------------------
     */
    useEffect(() => {
        const interval = window.setInterval(() => {
            setCurrentTime(Date.now());
        }, 60_000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    /*
     * --------------------------------------------------
     * Load News
     * --------------------------------------------------
     */
    const loadNews = useCallback(async () => {
        try {
            if (hasLoadedNews.current) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const response = await getNewsList({
                page: 1,
                pageSize: 100,
                sortBy: "created_at",
                sortOrder: "DESC",
            });

            setNews(response.data);
        } catch (err) {
            console.error(err);

            setError("Unable to load news.");
        } finally {
            hasLoadedNews.current = true;
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const fetchNews = async () => {
            await loadNews();
        };

        void fetchNews();
    }, [loadNews]);

    /*
     * --------------------------------------------------
     * Filtered News
     * --------------------------------------------------
     */
    const availableCategories = useMemo(() => {
        const categories = new Map<number, string>();
        news.forEach((article) => {
            if (article.category?.displayName) {
                categories.set(article.categoryId, article.category.displayName);
            }
        });
        return [...categories.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    }, [news]);

    const filteredNews = useMemo(() => news.filter((article) => {
        if (statusFilter !== "ALL" && article.status !== statusFilter) return false;
        if (newsIdFilter.trim() && String(article.newsNumber) !== newsIdFilter.trim() && String(article.id) !== newsIdFilter.trim()) return false;
        if (slugFilter.trim() && !article.slug?.toLocaleLowerCase().includes(slugFilter.trim().toLocaleLowerCase())) return false;
        if (scopeFilter && article.newsScope !== scopeFilter) return false;
        if (categoryFilter && article.categoryId !== Number(categoryFilter)) return false;
        if (publishedFrom || publishedTo) {
            if (!article.publishedAt) return false;
            const date = new Date(article.publishedAt);
            if (Number.isNaN(date.getTime())) return false;
            const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            if (publishedFrom && day < publishedFrom) return false;
            if (publishedTo && day > publishedTo) return false;
        }
        return true;
    }), [news, statusFilter, newsIdFilter, slugFilter, scopeFilter, categoryFilter, publishedFrom, publishedTo]);

    const totalPages = Math.max(1, Math.ceil(filteredNews.length / pageSize));
    const visiblePage = Math.min(currentPage, totalPages);
    const paginatedNews = filteredNews.slice((visiblePage - 1) * pageSize, visiblePage * pageSize);


    /*
     * --------------------------------------------------
     * Promotion helper
     * --------------------------------------------------
     */
    const isPromotionActive = useCallback(
        (article: News) => {
            return (
                article.status === "PUBLISHED" &&
                article.displayPriority > 0 &&
                Boolean(
                    article.displayPriorityUntil &&
                    new Date(
                        article.displayPriorityUntil,
                    ).getTime() > currentTime,
                )
            );
        },
        [currentTime],
    );

    /*
     * --------------------------------------------------
     * Activate
     *
     * ARCHIVED -> DRAFT
     * --------------------------------------------------
     */
    const handlePermanentDelete = async () => {
        const article = newsPendingDeletion;
        if (!article || !canManageNews || actionId !== null) return;
        setActionId(article.id);
        setError(null);
        try {
            await deleteNews(article.id);
            setNewsPendingDeletion(null);
            await loadNews();
        } catch (error: unknown) {
            setError(getApiErrorMessage(error));
        } finally {
            setActionId(null);
        }
    };

    const handleActivate = async (article: News) => {
        try {
            setActionId(article.id);

            await activateNews(
                article.id,
                Number(user?.id ?? 0),
            );

            await loadNews();
        } catch (err) {
            console.error(err);

            setError("Unable to activate the news article.");
        } finally {
            setActionId(null);
        }
    };

    /*
     * --------------------------------------------------
     * Archive / Deactivate
     * --------------------------------------------------
     */
    const handleArchive = async (article: News) => {
        try {
            setActionId(article.id);

            await archiveNews(
                article.id,
                Number(user?.id ?? 0),
            );

            await loadNews();
        } catch (err) {
            console.error(err);

            setError("Unable to deactivate the news article.");
        } finally {
            setActionId(null);
        }
    };

    /*
     * --------------------------------------------------
     * Approve
     * --------------------------------------------------
     */
    const handleApprove = async (article: News) => {
        try {
            setActionId(article.id);

            await changeNewsStatus(
                article.id,
                "APPROVED",
                Number(user?.id ?? 0),
            );

            await loadNews();
        } catch (err) {
            console.error(err);

            setError("Unable to approve the news article.");
        } finally {
            setActionId(null);
        }
    };

    /*
     * --------------------------------------------------
     * Reject
     *
     * IN_REVIEW -> REJECTED
     *
     * IMPORTANT:
     * Button uses `outline`.
     * There is no `danger` or `destructive`
     * variant in the project's Button component.
     * --------------------------------------------------
     */
    const handleReject = async (article: News) => {
        try {
            setActionId(article.id);

            await changeNewsStatus(
                article.id,
                "REJECTED",
                Number(user?.id ?? 0),
            );

            await loadNews();
        } catch (err) {
            console.error(err);

            setError("Unable to reject the news article.");
        } finally {
            setActionId(null);
        }
    };

    /*
     * --------------------------------------------------
     * Promote
     * --------------------------------------------------
     */
    const handlePromote = async (article: News) => {
        try {
            setActionId(article.id);

            await promoteNews(
                article.id,
                Number(user?.id ?? 0),
            );

            await loadNews();
        } catch (err) {
            console.error(err);

            setError(`Unable to promote the news article: ${getApiErrorMessage(err)}`);
        } finally {
            setActionId(null);
        }
    };

    /*
     * --------------------------------------------------
     * Remove Promotion
     * --------------------------------------------------
     */
    const handleRemovePromotion = async (
        article: News,
    ) => {
        try {
            setActionId(article.id);

            await removeNewsPromotion(
                article.id,
                Number(user?.id ?? 0),
            );

            await loadNews();
        } catch (err) {
            console.error(err);

            setError(
                `Unable to remove the news promotion: ${getApiErrorMessage(err)}`,
            );
        } finally {
            setActionId(null);
        }
    };

    /*
     * --------------------------------------------------
     * Status badge
     * --------------------------------------------------
     */
    const getStatusClassName = (
        status: NewsStatus,
    ) => {
        switch (status) {
            case "PUBLISHED":
                return "bg-green-100 text-green-700";

            case "APPROVED":
                return "bg-blue-100 text-blue-700";

            case "IN_REVIEW":
                return "bg-yellow-100 text-yellow-700";

            case "REJECTED":
                return "bg-red-100 text-red-700";

            case "ARCHIVED":
                return "bg-gray-200 text-gray-700";

            case "DRAFT":
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const getNewsScopeLabel = (
        scope: News["newsScope"],
    ) => {
        switch (scope) {
            case "WORLD":
                return "World";

            case "INDIA":
                return "India";

            case "STATE":
                return "State";

            case "DISTRICT":
                return "District";

            default:
                return "-";
        }
    };

    /*
     * --------------------------------------------------
     * Loading
     * --------------------------------------------------
     */
    if (loading) {
        return (
            <MainLayout>
                <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
                    <div className="flex min-h-[300px] items-center justify-center">
                        <p className="text-sm text-gray-500">
                            Loading news...
                        </p>
                    </div>
                </div>
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
            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
                {/* Header */}
                <div className="admin-unified-header mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            News List
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage news articles and publishing workflow.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link to="/admin/news" className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">Back to News Administration</Link>
                        <button type="button" onClick={() => void loadNews()} disabled={loading || refreshing || actionId !== null} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} aria-hidden="true" /> {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                        <Link to="/admin/news/create">
                            <Button>
                                Create News
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Status Filters */}
                <div className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 pb-3">
                    {(
                        [
                            "ALL",
                            "DRAFT",
                            "IN_REVIEW",
                            "APPROVED",
                            "PUBLISHED",
                            "REJECTED",
                            "ARCHIVED",
                        ] as StatusFilter[]
                    ).map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() =>
                                (setStatusFilter(status), changeFilter("status", status))
                            }
                            className={[
                                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                                statusFilter === status
                                    ? "bg-green-700 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                            ].join(" ")}
                        >
                            {status === "ALL"
                                ? "All"
                                : status.replace("_", " ")}
                        </button>
                    ))}
                </div>

                {/* Advanced filters — applied to the currently loaded news records. */}
                <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4" aria-label="News filters">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold text-gray-800">Filter News</h2>
                        <button type="button" className="text-xs font-medium text-green-700 hover:underline" onClick={() => {
                            setNewsIdFilter(""); setSlugFilter(""); setScopeFilter(""); setCategoryFilter(""); setPublishedFrom(""); setPublishedTo("");
                            const next = new URLSearchParams(searchParams);
                            ["newsId", "slug", "scope", "category", "from", "to", "page"].forEach((key) => next.delete(key));
                            setSearchParams(next, { replace: true, preventScrollReset: true });
                        }}>Clear filters</button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <label className="text-xs font-medium text-gray-600">News ID
                            <input type="text" inputMode="numeric" value={newsIdFilter} onChange={(event) => (setNewsIdFilter(event.target.value), changeFilter("newsId", event.target.value))} placeholder="News ID / number" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-gray-600">Slug
                            <input type="search" value={slugFilter} onChange={(event) => (setSlugFilter(event.target.value), changeFilter("slug", event.target.value))} placeholder="Search article slug" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-gray-600">News Scope
                            <select value={scopeFilter} onChange={(event) => (setScopeFilter(event.target.value), changeFilter("scope", event.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                                <option value="">All scopes</option>
                                <option value="WORLD">World</option><option value="INDIA">India</option><option value="STATE">State</option><option value="DISTRICT">District</option>
                            </select>
                        </label>
                        <label className="text-xs font-medium text-gray-600">Category
                            <select value={categoryFilter} onChange={(event) => (setCategoryFilter(event.target.value), changeFilter("category", event.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                                <option value="">All categories</option>
                                {availableCategories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                            </select>
                        </label>
                        <label className="text-xs font-medium text-gray-600">Published From
                            <input type="date" value={publishedFrom} max={publishedTo || undefined} onChange={(event) => (setPublishedFrom(event.target.value), changeFilter("from", event.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        </label>
                        <label className="text-xs font-medium text-gray-600">Published To
                            <input type="date" value={publishedTo} min={publishedFrom || undefined} onChange={(event) => (setPublishedTo(event.target.value), changeFilter("to", event.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                        </label>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">Showing {filteredNews.length} of {news.length} loaded articles. Filters apply to the first 100 articles returned by the current API request.</p>
                </section>

                {/* Empty */}
                {!filteredNews.length ? (
                    <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
                        <p className="text-sm text-gray-500">
                            No news articles found.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                News
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                News Scope
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Category
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Audit History
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedNews.map((article) => {
                                            const archived =
                                                article.status === "ARCHIVED";

                                            const promotionActive =
                                                isPromotionActive(article);

                                            const busy =
                                                actionId === article.id;

                                            const canEditArticle =
                                                !archived &&
                                                (
                                                    canManageNews ||
                                                    (
                                                        canReporterEdit &&
                                                        (
                                                            article.status === "DRAFT" ||
                                                            article.status === "REJECTED"
                                                        )
                                                    )
                                                );

                                            return (
                                                <tr
                                                    key={article.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    {/* News */}
                                                    <td className="max-w-md px-5 py-4">
                                                        <div className="line-clamp-2 break-words text-sm font-medium leading-[21px] text-gray-900" title={article.title}>
                                                            {article.title}
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-500">
                                                            #{article.newsNumber}
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500">

                                                        </div>
                                                    </td>

                                                    {/* News Scope */}
                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                        {getNewsScopeLabel(article.newsScope)}
                                                    </td>

                                                    {/* Category */}
                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                        {article.category?.displayName ??
                                                            "-"}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-4 text-sm">
                                                        <span
                                                            className={`inline - flex rounded - full px - 3 py - 1 text - xs font - semibold ${getStatusClassName(
                                                                article.status,
                                                            )
                                                                } `}
                                                        >
                                                            {article.status.replace(
                                                                "_",
                                                                " ",
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Published */}
                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                        <button type="button" onClick={() => void openAudit(article)} className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-green-200 px-3 py-1.5 font-medium text-green-700 hover:bg-green-50"><History size={14} aria-hidden="true" className="shrink-0" /><span>History</span></button>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-4">
                                                        {(canManageNews || canReporterEdit) && (
                                                            <div className="flex flex-wrap justify-end gap-2">
                                                                {/* Edit
                                                                 *
                                                                 * Admin / Super Admin:
                                                                 * All non-archived articles.
                                                                 *
                                                                 * Reporter:
                                                                 * DRAFT and REJECTED only.
                                                                 */}
                                                                {canEditArticle && (
                                                                    <Link
                                                                        to={`/admin/news/${article.id}/edit?returnTo=${encodeURIComponent(editReturnUrl)}`}
                                                                    >
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            leftIcon={
                                                                                <Edit3 size={15} />
                                                                            }
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                    </Link >
                                                                )}

                                                                {canManageNews && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        disabled={actionId !== null}
                                                                        onClick={() => setNewsPendingDeletion(article)}
                                                                        leftIcon={<Trash2 size={15} />}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                )}

                                                                {/* IN_REVIEW actions */}
                                                                {
                                                                    canManageNews &&
                                                                    article.status === "IN_REVIEW" && (
                                                                        <>
                                                                            <Button
                                                                                type="button"
                                                                                size="sm"
                                                                                loading={
                                                                                    busy
                                                                                }
                                                                                onClick={() =>
                                                                                    void handleApprove(
                                                                                        article,
                                                                                    )
                                                                                }
                                                                                leftIcon={
                                                                                    <Check size={15} />
                                                                                }
                                                                            >
                                                                                Approve
                                                                            </Button>

                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                loading={
                                                                                    busy
                                                                                }
                                                                                onClick={() =>
                                                                                    void handleReject(
                                                                                        article,
                                                                                    )
                                                                                }
                                                                                leftIcon={
                                                                                    <X size={15} />
                                                                                }
                                                                            >
                                                                                Reject
                                                                            </Button>
                                                                        </>
                                                                    )
                                                                }

                                                                {/* Archived -> Activate */}
                                                                {
                                                                    canManageNews &&
                                                                    archived && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            loading={busy}
                                                                            onClick={() =>
                                                                                void handleActivate(
                                                                                    article,
                                                                                )
                                                                            }
                                                                            leftIcon={
                                                                                <RotateCcw
                                                                                    size={15}
                                                                                />
                                                                            }
                                                                        >
                                                                            Activate
                                                                        </Button>
                                                                    )
                                                                }

                                                                {/* Non-archived -> Deactivate */}
                                                                {
                                                                    canManageNews &&
                                                                    !archived &&
                                                                    article.status !==
                                                                    "DRAFT" && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            loading={busy}
                                                                            onClick={() =>
                                                                                void handleArchive(
                                                                                    article,
                                                                                )
                                                                            }
                                                                            leftIcon={
                                                                                <Archive
                                                                                    size={15}
                                                                                />
                                                                            }
                                                                        >
                                                                            Deactivate
                                                                        </Button>
                                                                    )
                                                                }

                                                                {/* Promotion */}
                                                                {
                                                                    canManageNews &&
                                                                    article.status === "PUBLISHED" &&
                                                                    (promotionActive ? (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            loading={busy}
                                                                            onClick={() =>
                                                                                void handleRemovePromotion(
                                                                                    article,
                                                                                )
                                                                            }
                                                                            leftIcon={
                                                                                <StarOff
                                                                                    size={15}
                                                                                />
                                                                            }
                                                                        >
                                                                            Remove Promotion
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            loading={busy}
                                                                            onClick={() =>
                                                                                void handlePromote(
                                                                                    article,
                                                                                )
                                                                            }
                                                                            leftIcon={
                                                                                <Star
                                                                                    size={15}
                                                                                />
                                                                            }
                                                                        >
                                                                            Promote
                                                                        </Button>
                                                                    ))
                                                                }
                                                            </div >
                                                        )}
                                                    </td >
                                                </tr >
                                            );
                                        })}
                                    </tbody >
                                </table >
                            </div >
                        </div >

                        {/* Mobile */}
                        < div className="space-y-4 md:hidden" >
                            {
                                paginatedNews.map((article) => {
                                    const archived =
                                        article.status === "ARCHIVED";

                                    const promotionActive =
                                        isPromotionActive(article);

                                    const busy =
                                        actionId === article.id;

                                    const canEditArticle =
                                        !archived &&
                                        (
                                            canManageNews ||
                                            (
                                                canReporterEdit &&
                                                (
                                                    article.status === "DRAFT" ||
                                                    article.status === "REJECTED"
                                                )
                                            )
                                        );

                                    return (
                                        <article
                                            key={article.id}
                                            className="rounded-xl border border-gray-200 bg-white p-4"
                                        >
                                            {/* Title */}
                                            <div>
                                                <div className="line-clamp-2 break-words text-sm font-medium leading-[21px] text-gray-900" title={article.title}>
                                                    {article.title}
                                                </div>

                                                <div className="mt-1 text-xs text-gray-500">
                                                    #{article.newsNumber}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500">

                                                </div>
                                            </div>

                                            {/* Metadata */}
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(
                                                        article.status,
                                                    )}`}
                                                >
                                                    {article.status.replace(
                                                        "_",
                                                        " ",
                                                    )}
                                                </span>

                                                <span className="text-xs text-gray-500">
                                                    {getNewsScopeLabel(article.newsScope)}
                                                </span>

                                                <span className="text-xs text-gray-500">
                                                    {article.category?.displayName ??
                                                        "-"}
                                                </span>
                                            </div>

                                            {/* Published */}
                                            <div className="mt-3 text-xs text-gray-500">
                                                <button type="button" onClick={() => void openAudit(article)} className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-green-200 px-3 py-1.5 font-medium text-green-700 hover:bg-green-50"><History size={14} aria-hidden="true" className="shrink-0" /><span>History</span></button>
                                            </div>

                                            {/* Actions */}
                                            {(canManageNews || canReporterEdit) && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {/* Edit */}
                                                    {canEditArticle && (
                                                        <Link
                                                            to={`/admin/news/${article.id}/edit?returnTo=${encodeURIComponent(editReturnUrl)}`}
                                                        >
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                leftIcon={
                                                                    <Edit3 size={15} />
                                                                }
                                                            >
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                    )}

                                                    {canManageNews && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={actionId !== null}
                                                            onClick={() => setNewsPendingDeletion(article)}
                                                            leftIcon={<Trash2 size={15} />}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}

                                                    {/* IN_REVIEW */}
                                                    {canManageNews &&
                                                        article.status === "IN_REVIEW" && (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    loading={busy}
                                                                    onClick={() =>
                                                                        void handleApprove(
                                                                            article,
                                                                        )
                                                                    }
                                                                    leftIcon={
                                                                        <Check size={15} />
                                                                    }
                                                                >
                                                                    Approve
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    loading={busy}
                                                                    onClick={() =>
                                                                        void handleReject(
                                                                            article,
                                                                        )
                                                                    }
                                                                    leftIcon={
                                                                        <X size={15} />
                                                                    }
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}

                                                    {/* Archived -> Activate */}
                                                    {canManageNews &&
                                                        archived && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                loading={busy}
                                                                onClick={() =>
                                                                    void handleActivate(
                                                                        article,
                                                                    )
                                                                }
                                                                leftIcon={
                                                                    <RotateCcw size={15} />
                                                                }
                                                            >
                                                                Activate
                                                            </Button>
                                                        )}

                                                    {/* Active -> Deactivate */}
                                                    {canManageNews &&
                                                        !archived &&
                                                        article.status !==
                                                        "DRAFT" && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                loading={busy}
                                                                onClick={() =>
                                                                    void handleArchive(
                                                                        article,
                                                                    )
                                                                }
                                                                leftIcon={
                                                                    <Archive size={15} />
                                                                }
                                                            >
                                                                Deactivate
                                                            </Button>
                                                        )}

                                                    {/* Promotion */}
                                                    {canManageNews &&
                                                        article.status === "PUBLISHED" &&
                                                        (promotionActive ? (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                loading={busy}
                                                                onClick={() =>
                                                                    void handleRemovePromotion(
                                                                        article,
                                                                    )
                                                                }
                                                                leftIcon={
                                                                    <StarOff
                                                                        size={15}
                                                                    />
                                                                }
                                                            >
                                                                Remove Promotion
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                loading={busy}
                                                                onClick={() =>
                                                                    void handlePromote(
                                                                        article,
                                                                    )
                                                                }
                                                                leftIcon={
                                                                    <Star size={15} />
                                                                }
                                                            >
                                                                Promote
                                                            </Button>
                                                        ))}
                                                </div>
                                            )}
                                        </article>
                                    );
                                })
                            }
                        </div >
                        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
                            <AdminListPagination page={visiblePage} pageSize={pageSize} total={filteredNews.length} onPageChange={updatePage} onPageSizeChange={updatePageSize} />
                        </div>
                    </>
                )}
            </div >
            {auditArticle && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuditArticle(null); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby="news-audit-title" onKeyDown={(event) => { if (event.key === "Escape") setAuditArticle(null); }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 id="news-audit-title" className="text-lg font-semibold text-gray-900">Audit History — News #{auditArticle.newsNumber}</h2>
                        {auditLoading && <p role="status" className="mt-4 text-sm text-gray-600">Loading complete audit details...</p>}
                        {auditError && <p role="alert" className="mt-4 text-sm text-red-700">{auditError}</p>}
                        {!auditLoading && <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-sm">
                            {([
                                ["Drafted By", auditArticle.draftedByName || (auditArticle.draftedBy ? `User #${auditArticle.draftedBy}` : "-")],
                                ["Drafted On", formatPublishedDateTime(auditArticle.draftedAt)],
                                ["Approved By", auditArticle.approvedByName || (auditArticle.approvedBy ? `User #${auditArticle.approvedBy}` : "-")],
                                ["Approved On", formatPublishedDateTime(auditArticle.approvedAt)],
                                ["Published By", auditArticle.publishedByName || (auditArticle.publishedBy ? `User #${auditArticle.publishedBy}` : "-")],
                                ["Published On", formatPublishedDateTime(auditArticle.publishedAt)],
                            ] as const).map(([label, value]) => (
                                <div key={label} className="contents"><dt className="font-medium text-gray-600">{label}:</dt><dd className="break-words text-gray-900">{value}</dd></div>
                            ))}
                        </dl>}
                        <div className="mt-6 flex justify-end"><button type="button" autoFocus onClick={() => setAuditArticle(null)} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white">Close</button></div>
                    </section>
                </div>
            )}
            {newsPendingDeletion && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && actionId === null) {
                            setNewsPendingDeletion(null);
                        }
                    }}
                >
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-news-title"
                        aria-describedby="delete-news-description"
                        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
                        onKeyDown={(event) => {
                            if (event.key === "Escape" && actionId === null) setNewsPendingDeletion(null);
                        }}
                    >
                        <div className="mb-4 flex items-center gap-3 text-red-700">
                            <span className="rounded-full bg-red-50 p-3"><Trash2 size={22} /></span>
                            <h2 id="delete-news-title" className="text-lg font-semibold">Permanently delete news?</h2>
                        </div>
                        <div id="delete-news-description" className="space-y-3 text-sm text-gray-700">
                            <p><strong>News ID:</strong> {newsPendingDeletion.id}</p>
                            <p className="break-words"><strong>Title:</strong> {newsPendingDeletion.title}</p>
                            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                                This cannot be undone. Unreferenced Cloudinary assets will also be removed.
                            </p>
                        </div>
                        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" autoFocus disabled={actionId !== null}
                                onClick={() => setNewsPendingDeletion(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50">
                                Cancel
                            </button>
                            <button type="button" disabled={actionId !== null}
                                onClick={() => void handlePermanentDelete()}
                                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">
                                {actionId !== null ? "Deleting..." : "Permanently Delete"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </MainLayout >
    );
}
