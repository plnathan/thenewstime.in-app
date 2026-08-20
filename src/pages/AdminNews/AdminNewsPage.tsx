import {
    Archive,
    Check,
    Edit3,
    RotateCcw,
    Star,
    StarOff,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
    activateNews,
    archiveNews,
    changeNewsStatus,
    getNewsList,
    promoteNews,
    removeNewsPromotion,
} from "@/api/news.api";

import Button from "@/components/ui/Button";
import MainLayout from "@/layouts/MainLayout";

import type { News, NewsStatus } from "@/types/news.types";

const ADMIN_USER_ID = 1;

type StatusFilter = "ALL" | NewsStatus;

export default function AdminNewsPage() {
    const [news, setNews] = useState<News[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("ALL");

    /**
     * ID of the article currently performing an action.
     *
     * This prevents multiple actions from being triggered
     * on the same article while an API request is running.
     */
    const [actionId, setActionId] = useState<number | null>(null);

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
            setLoading(true);
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
            setLoading(false);
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
    const filteredNews = useMemo(() => {
        if (statusFilter === "ALL") {
            return news;
        }

        return news.filter(
            (article) => article.status === statusFilter,
        );
    }, [news, statusFilter]);

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
    const handleActivate = async (article: News) => {
        try {
            setActionId(article.id);

            await activateNews(
                article.id,
                ADMIN_USER_ID,
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
                ADMIN_USER_ID,
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
                ADMIN_USER_ID,
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
                ADMIN_USER_ID,
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
                ADMIN_USER_ID,
            );

            await loadNews();
        } catch (err) {
            console.error(err);

            setError("Unable to promote the news article.");
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
                ADMIN_USER_ID,
            );

            await loadNews();
        } catch (err) {
            console.error(err);

            setError(
                "Unable to remove the news promotion.",
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
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            News Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage news articles and publishing workflow.
                        </p>
                    </div>

                    <Link to="/admin/news/create">
                        <Button>
                            Create News
                        </Button>
                    </Link>
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
                                setStatusFilter(status)
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
                                                Category
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Published
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {filteredNews.map((article) => {
                                            const archived =
                                                article.status === "ARCHIVED";

                                            const promotionActive =
                                                isPromotionActive(article);

                                            const busy =
                                                actionId === article.id;

                                            return (
                                                <tr
                                                    key={article.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    {/* News */}
                                                    <td className="max-w-md px-5 py-4">
                                                        <div className="font-medium text-gray-900">
                                                            {article.title}
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-500">
                                                            #{article.newsNumber}
                                                        </div>
                                                    </td>

                                                    {/* Category */}
                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                        {article.category?.displayName ??
                                                            "-"}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-5 py-4">
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
                                                    </td>

                                                    {/* Published */}
                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                        {article.publishedAt
                                                            ? new Date(
                                                                article.publishedAt,
                                                            ).toLocaleDateString(
                                                                "en-GB",
                                                            )
                                                            : "-"}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-wrap justify-end gap-2">
                                                            {/* Edit
                               *
                               * ARCHIVED articles must not
                               * expose Edit.
                               */}
                                                            {!archived && (
                                                                <Link
                                                                    to={`/admin/news/${article.id}/edit`}
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

                                                            {/* IN_REVIEW actions */}
                                                            {article.status ===
                                                                "IN_REVIEW" && (
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
                                                                )}

                                                            {/* Archived -> Activate */}
                                                            {archived && (
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
                                                            )}

                                                            {/* Non-archived -> Deactivate */}
                                                            {!archived &&
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
                                                                )}

                                                            {/* Promotion */}
                                                            {article.status ===
                                                                "PUBLISHED" &&
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
                                                                ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="space-y-4 md:hidden">
                            {filteredNews.map((article) => {
                                const archived =
                                    article.status === "ARCHIVED";

                                const promotionActive =
                                    isPromotionActive(article);

                                const busy =
                                    actionId === article.id;

                                return (
                                    <article
                                        key={article.id}
                                        className="rounded-xl border border-gray-200 bg-white p-4"
                                    >
                                        {/* Title */}
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {article.title}
                                            </div>

                                            <div className="mt-1 text-xs text-gray-500">
                                                #{article.newsNumber}
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
                                                {article.category?.displayName ??
                                                    "-"}
                                            </span>
                                        </div>

                                        {/* Published */}
                                        <div className="mt-3 text-xs text-gray-500">
                                            Published:{" "}
                                            {article.publishedAt
                                                ? new Date(
                                                    article.publishedAt,
                                                ).toLocaleDateString(
                                                    "en-GB",
                                                )
                                                : "-"}
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {/* Edit */}
                                            {!archived && (
                                                <Link
                                                    to={`/admin/news/${article.id}/edit`}
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

                                            {/* IN_REVIEW */}
                                            {article.status ===
                                                "IN_REVIEW" && (
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
                                            {archived && (
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
                                            {!archived &&
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
                                            {article.status ===
                                                "PUBLISHED" &&
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
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    );
}