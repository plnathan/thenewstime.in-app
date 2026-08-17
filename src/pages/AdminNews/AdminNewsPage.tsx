import type { ReactNode } from "react";
import {
    Archive,
    CheckCircle2,
    Clock3,
    Edit3,
    Megaphone,
    Plus,
    RotateCcw,
    Search,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    archiveNews,
    changeNewsStatus,
    getNewsList,
    promoteNews,
    removeNewsPromotion,
} from "@/api/news.api";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import type {
    News,
    NewsStatus,
} from "@/types/news.types";

const ADMIN_USER_ID = 1;

const PAGE_SIZE = 20;

const STATUS_OPTIONS: Array<{
    value: "" | NewsStatus;
    label: string;
}> = [
        { value: "", label: "All statuses" },
        { value: "DRAFT", label: "Draft" },
        { value: "IN_REVIEW", label: "In Review" },
        { value: "APPROVED", label: "Approved" },
        { value: "PUBLISHED", label: "Published" },
        { value: "ARCHIVED", label: "Archived" },
        { value: "REJECTED", label: "Rejected" },
    ];

function statusVariant(
    status: NewsStatus,
): "secondary" | "warning" | "success" | "danger" {
    switch (status) {
        case "PUBLISHED":
            return "success";

        case "APPROVED":
            return "success";

        case "IN_REVIEW":
            return "warning";

        case "ARCHIVED":
        case "REJECTED":
            return "danger";

        default:
            return "secondary";
    }
}

function formatDate(value: string | null): string {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function isPromotionActive(news: News): boolean {
    if (!news.displayPriorityUntil) {
        return false;
    }

    return (
        news.status === "PUBLISHED" &&
        new Date(news.displayPriorityUntil).getTime() > Date.now()
    );
}

export default function AdminNewsPage() {
    const [news, setNews] = useState<News[]>([]);

    const [search, setSearch] = useState("");

    const [status, setStatus] = useState<"" | NewsStatus>("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    const [actionId, setActionId] = useState<number | null>(null);

    const loadNews = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getNewsList({
                page: 1,
                pageSize: PAGE_SIZE,
                search: search.trim() || undefined,
                status: status || undefined,
                sortBy: "publishedAt",
                sortOrder: "DESC",
            });

            setNews(response.data ?? []);
        } catch (err) {
            console.error(err);
            setError("Unable to load news articles.");
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadNews();
        }, 250);

        return () => {
            window.clearTimeout(timer);
        };
    }, [loadNews]);

    const handleArchive = async (article: News) => {
        const confirmed = window.confirm(
            `Deactivate "${article.title}" from display?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionId(article.id);

            await archiveNews(
                article.id,
                ADMIN_USER_ID,
            );

            await loadNews();
        } catch (err) {
            console.error(err);
            window.alert("Unable to deactivate the news article.");
        } finally {
            setActionId(null);
        }
    };

    const handlePromote = async (article: News) => {
        const confirmed = window.confirm(
            `Promote "${article.title}" for 3 days?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionId(article.id);

            await promoteNews(
                article.id,
                ADMIN_USER_ID,
            );

            await loadNews();
        } catch (err) {
            console.error(err);
            window.alert("Unable to promote the news article.");
        } finally {
            setActionId(null);
        }
    };

    const handleRemovePromotion = async (
        article: News,
    ) => {
        const confirmed = window.confirm(
            `Remove promotion from "${article.title}"?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionId(article.id);

            await removeNewsPromotion(
                article.id,
                ADMIN_USER_ID,
            );

            await loadNews();
        } catch (err) {
            console.error(err);
            window.alert(
                "Unable to remove the news promotion.",
            );
        } finally {
            setActionId(null);
        }
    };

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
            window.alert(
                "Unable to approve the news article.",
            );
        } finally {
            setActionId(null);
        }
    };

    if (loading && news.length === 0) {
        return (
            <AdminNewsLayout>
                <div className="flex min-h-[300px] items-center justify-center">
                    <Typography
                        variant="body"
                        className="text-gray-500"
                    >
                        Loading news...
                    </Typography>
                </div>
            </AdminNewsLayout>
        );
    }

    return (
        <AdminNewsLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Typography
                            as="h1"
                            variant="headline"
                            className="text-2xl md:text-3xl"
                        >
                            News Management
                        </Typography>

                        <Typography
                            variant="body"
                            className="mt-1 text-gray-500"
                        >
                            Create, edit, publish, deactivate and
                            promote news articles.
                        </Typography>
                    </div>

                    <Link to="/admin/news/create">
                        <Button
                            leftIcon={<Plus size={18} />}
                        >
                            Create News
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Surface
                    padding="md"
                    border="all"
                    radius="lg"
                >
                    <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search news..."
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value as
                                    | ""
                                    | NewsStatus,
                                )
                            }
                            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <Button
                            variant="outline"
                            onClick={() => void loadNews()}
                            leftIcon={<RotateCcw size={16} />}
                        >
                            Refresh
                        </Button>
                    </div>
                </Surface>

                {error && (
                    <Surface
                        padding="md"
                        border="all"
                        radius="lg"
                        className="border-red-200 bg-red-50"
                    >
                        <div className="flex items-center gap-3 text-red-700">
                            <XCircle size={20} />

                            <Typography variant="body">
                                {error}
                            </Typography>
                        </div>
                    </Surface>
                )}

                {/* Desktop table */}
                <Surface
                    padding="none"
                    border="all"
                    radius="lg"
                    className="hidden overflow-hidden md:block"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="border-b bg-gray-50">
                                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <th className="px-5 py-4">
                                        Article
                                    </th>

                                    <th className="px-5 py-4">
                                        Scope
                                    </th>

                                    <th className="px-5 py-4">
                                        Status
                                    </th>

                                    <th className="px-5 py-4">
                                        Display
                                    </th>

                                    <th className="px-5 py-4">
                                        Published
                                    </th>

                                    <th className="px-5 py-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {news.map((article) => {
                                    const promoted =
                                        isPromotionActive(article);

                                    const busy =
                                        actionId === article.id;

                                    return (
                                        <tr
                                            key={article.id}
                                            className="align-top hover:bg-gray-50/70"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="max-w-[360px]">
                                                    <Typography
                                                        variant="articleTitle"
                                                        className="text-base"
                                                    >
                                                        {article.title}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        className="mt-1 block"
                                                    >
                                                        #{article.newsNumber} ·{" "}
                                                        {article.category
                                                            ?.displayName ??
                                                            "—"}
                                                    </Typography>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <Badge variant="secondary">
                                                    {article.newsScope}
                                                </Badge>
                                            </td>

                                            <td className="px-5 py-4">
                                                <Badge
                                                    variant={statusVariant(
                                                        article.status,
                                                    )}
                                                >
                                                    {article.status}
                                                </Badge>
                                            </td>

                                            <td className="px-5 py-4">
                                                {promoted ? (
                                                    <div className="space-y-1">
                                                        <Badge variant="success">
                                                            <span className="mr-1">
                                                                #{article.displayPriority}
                                                            </span>
                                                            Promoted
                                                        </Badge>

                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Clock3 size={12} />
                                                            Until{" "}
                                                            {formatDate(
                                                                article.displayPriorityUntil,
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        Normal order
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(
                                                        article.publishedAt,
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        to={`/admin/news/${article.id}/edit`}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            leftIcon={
                                                                <Edit3 size={14} />
                                                            }
                                                        >
                                                            Edit
                                                        </Button>
                                                    </Link>

                                                    {article.status ===
                                                        "IN_REVIEW" && (
                                                            <Button
                                                                size="sm"
                                                                loading={busy}
                                                                leftIcon={
                                                                    <CheckCircle2
                                                                        size={14}
                                                                    />
                                                                }
                                                                onClick={() =>
                                                                    void handleApprove(
                                                                        article,
                                                                    )
                                                                }
                                                            >
                                                                Approve
                                                            </Button>
                                                        )}

                                                    {article.status ===
                                                        "PUBLISHED" &&
                                                        !promoted && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                loading={busy}
                                                                leftIcon={
                                                                    <Megaphone
                                                                        size={14}
                                                                    />
                                                                }
                                                                onClick={() =>
                                                                    void handlePromote(
                                                                        article,
                                                                    )
                                                                }
                                                            >
                                                                Promote
                                                            </Button>
                                                        )}

                                                    {promoted && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            loading={busy}
                                                            onClick={() =>
                                                                void handleRemovePromotion(
                                                                    article,
                                                                )
                                                            }
                                                        >
                                                            Remove Promotion
                                                        </Button>
                                                    )}

                                                    {article.status !==
                                                        "ARCHIVED" && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                loading={busy}
                                                                leftIcon={
                                                                    <Archive size={14} />
                                                                }
                                                                onClick={() =>
                                                                    void handleArchive(
                                                                        article,
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                Deactivate
                                                            </Button>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {news.length === 0 && (
                        <EmptyNews />
                    )}
                </Surface>

                {/* Mobile cards */}
                <div className="space-y-4 md:hidden">
                    {news.map((article) => {
                        const promoted =
                            isPromotionActive(article);

                        const busy =
                            actionId === article.id;

                        return (
                            <Surface
                                key={article.id}
                                padding="md"
                                border="all"
                                radius="lg"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <div className="mb-2 flex flex-wrap gap-2">
                                            <Badge
                                                variant={statusVariant(
                                                    article.status,
                                                )}
                                            >
                                                {article.status}
                                            </Badge>

                                            <Badge variant="secondary">
                                                {article.newsScope}
                                            </Badge>

                                            {promoted && (
                                                <Badge variant="success">
                                                    Promoted #{article.displayPriority}
                                                </Badge>
                                            )}
                                        </div>

                                        <Typography
                                            variant="articleTitle"
                                            className="text-lg"
                                        >
                                            {article.title}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            className="mt-1 block"
                                        >
                                            #{article.newsNumber} ·{" "}
                                            {article.category?.displayName ??
                                                "—"}
                                        </Typography>
                                    </div>

                                    {promoted && (
                                        <Typography
                                            variant="caption"
                                            className="flex items-center gap-1"
                                        >
                                            <Clock3 size={13} />
                                            Promotion until{" "}
                                            {formatDate(
                                                article.displayPriorityUntil,
                                            )}
                                        </Typography>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        <Link
                                            to={`/admin/news/${article.id}/edit`}
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                fullWidth
                                                leftIcon={
                                                    <Edit3 size={14} />
                                                }
                                            >
                                                Edit
                                            </Button>
                                        </Link>

                                        {article.status ===
                                            "PUBLISHED" &&
                                            !promoted && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    loading={busy}
                                                    fullWidth
                                                    onClick={() =>
                                                        void handlePromote(
                                                            article,
                                                        )
                                                    }
                                                >
                                                    Promote
                                                </Button>
                                            )}

                                        {promoted && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                loading={busy}
                                                fullWidth
                                                onClick={() =>
                                                    void handleRemovePromotion(
                                                        article,
                                                    )
                                                }
                                            >
                                                Remove Promotion
                                            </Button>
                                        )}

                                        {article.status !==
                                            "ARCHIVED" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    loading={busy}
                                                    fullWidth
                                                    onClick={() =>
                                                        void handleArchive(
                                                            article,
                                                        )
                                                    }
                                                    className="text-red-600"
                                                >
                                                    Deactivate
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </Surface>
                        );
                    })}

                    {news.length === 0 && <EmptyNews />}
                </div>
            </div>
        </AdminNewsLayout>
    );
}

function EmptyNews() {
    return (
        <div className="px-5 py-12 text-center">
            <Typography
                variant="body"
                className="text-gray-500"
            >
                No news articles found.
            </Typography>
        </div>
    );
}

function AdminNewsLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
                {children}
            </div>
        </main>
    );
}