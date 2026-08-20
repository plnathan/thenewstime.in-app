import {
    Archive,
    ArrowLeft,
    Check,
    RotateCcw,
    Save,
    Star,
    StarOff,
    X,
    Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
    Link,
    useParams,
} from "react-router-dom";

import {
    approveNews,
    archiveNews,
    getNewsById,
    moveNewsToDraft,
    promoteNews,
    publishNews,
    rejectNews,
    removeNewsPromotion,
    submitNewsForReview,
    updateNews,
} from "@/api/news.api";
import { isAxiosError } from "axios";

import Button from "@/components/ui/Button";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import type {
    News,
    UpdateNewsInput,
} from "@/types/news.types";

import NewsMediaUploader from "@/components/news/NewsMedia/NewsMediaUploader";
import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";
import MainLayout from "@/layouts/MainLayout";

const ADMIN_USER_ID = 1;

const getApiErrorMessage = (
    error: unknown,
): string | null => {
    if (!isAxiosError(error)) {
        return null;
    }

    const data = error.response?.data as
        | {
            message?: string;
            details?: Array<{
                message?: string;
            }>;
        }
        | undefined;

    const detailMessage =
        data?.details
            ?.map((detail) =>
                detail.message?.trim(),
            )
            .filter(Boolean)
            .join(" ");

    return (
        detailMessage ||
        data?.message?.trim() ||
        null
    );
};

const formatPromotionUntil = (
    value:
        | string
        | Date
        | null
        | undefined,
) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

export default function AdminNewsEditPage() {
    const { id } = useParams();

    const newsId = Number(id);

    const [news, setNews] =
        useState<News | null>(null);

    const [title, setTitle] =
        useState("");

    const [slug, setSlug] =
        useState("");

    const [summary, setSummary] =
        useState("");

    const [content, setContent] =
        useState("");

    const isValidNewsId =
        Number.isInteger(newsId) &&
        newsId > 0;

    const [loading, setLoading] =
        useState(isValidNewsId);

    const [saving, setSaving] =
        useState(false);

    const [workflowLoading, setWorkflowLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(
            isValidNewsId
                ? null
                : "Invalid news article ID.",
        );

    const [success, setSuccess] =
        useState<string | null>(null);

    const [media, setMedia] =
        useState<NewsMedia[]>([]);

    const [currentTime] = useState(() => Date.now());

    useEffect(() => {
        if (
            !Number.isInteger(newsId) ||
            newsId <= 0
        ) {
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await getNewsById(newsId);

                const article =
                    response.data;

                setNews(article);
                setTitle(article.title);
                setSlug(article.slug);
                setSummary(
                    article.summary ?? "",
                );
                setContent(article.content);
                setMedia(
                    article.media ?? [],
                );
            } catch (err) {
                console.error(err);

                const apiMessage =
                    getApiErrorMessage(err);

                setError(
                    apiMessage ??
                    "Unable to load the news article.",
                );
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [newsId]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!news) {
            return;
        }

        if (!title.trim()) {
            setError("Title is required.");
            setSuccess(null);
            return;
        }

        if (!slug.trim()) {
            setError("Slug is required.");
            setSuccess(null);
            return;
        }

        if (!content.trim()) {
            setError("Content is required.");
            setSuccess(null);
            return;
        }

        const payload: UpdateNewsInput = {
            title: title.trim(),
            slug: slug.trim(),
            summary:
                summary.trim() || undefined,
            content: content.trim(),
            updatedBy: ADMIN_USER_ID,
        };

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response =
                await updateNews(
                    news.id,
                    payload,
                );

            setNews((current) =>
                current
                    ? {
                        ...current,
                        ...response.data,
                    }
                    : current,
            );

            setSuccess(
                response.message ||
                "News article updated successfully.",
            );
        } catch (err) {
            console.error(err);

            const apiMessage =
                getApiErrorMessage(err);

            setError(
                apiMessage
                    ? `Unable to update the news article. ${apiMessage}`
                    : "Unable to update the news article.",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleWorkflowAction = async (
        action: () => Promise<unknown>,
        successMessage: string,
    ) => {
        if (
            !news ||
            workflowLoading
        ) {
            return;
        }

        try {
            setWorkflowLoading(true);
            setError(null);
            setSuccess(null);

            await action();

            /*
             * Reload the article after every
             * workflow operation so that the
             * latest status, timestamps,
             * promotion information, etc.
             * are reflected immediately.
             */
            const response =
                await getNewsById(news.id);

            setNews(response.data);

            setTitle(
                response.data.title,
            );

            setSlug(
                response.data.slug,
            );

            setSummary(
                response.data.summary ?? "",
            );

            setContent(
                response.data.content,
            );

            setMedia(
                response.data.media ?? [],
            );

            setSuccess(successMessage);
        } catch (err) {
            console.error(err);

            const apiMessage =
                getApiErrorMessage(err);

            setError(
                apiMessage
                    ? `${successMessage} ${apiMessage}`
                    : "Unable to complete the requested workflow action.",
            );
        } finally {
            setWorkflowLoading(false);
        }
    };

    const promotionUntil =
        formatPromotionUntil(
            news?.displayPriorityUntil,
        );

    const promotionActive =
        news?.status === "PUBLISHED" &&
        news.displayPriority > 0 &&
        Boolean(
            news.displayPriorityUntil &&
            new Date(news.displayPriorityUntil).getTime() >
            currentTime,
        );

    if (loading) {
        return (
            <MainLayout>
                <main className="min-h-screen bg-gray-50">
                    <div className="mx-auto max-w-5xl px-4 py-10">
                        <Typography
                            variant="body"
                            className="text-gray-500"
                        >
                            Loading article...
                        </Typography>
                    </div>
                </main>
            </MainLayout>
        );
    }

    if (!news) {
        return (
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-5xl px-4 py-10">
                    <Surface
                        padding="lg"
                        border="all"
                        radius="lg"
                    >
                        <Typography
                            variant="body"
                            className="text-red-600"
                        >
                            {error ??
                                "News article not found."}
                        </Typography>

                        <Link
                            to="/admin/news"
                            className="mt-4 inline-flex text-sm font-medium text-green-700"
                        >
                            Back to News Management
                        </Link>
                    </Surface>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">

                {/* Back */}
                <Link
                    to="/admin/news"
                    className="
                        mb-6
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-gray-600
                        hover:text-green-700
                    "
                >
                    <ArrowLeft size={16} />
                    Back to News Management
                </Link>

                {/* Page heading */}
                <div className="mb-6">
                    <Typography
                        as="h1"
                        variant="headline"
                        className="text-2xl md:text-3xl"
                    >
                        Edit News
                    </Typography>

                    <Typography
                        variant="caption"
                        className="mt-2 block"
                    >
                        News #{news.newsNumber} ·{" "}
                        {news.status}
                    </Typography>
                </div>

                {/* Error */}
                {error && (
                    <div
                        className="
                            mb-5
                            rounded-lg
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-700
                        "
                    >
                        {error}
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div
                        className="
                            mb-5
                            rounded-lg
                            border
                            border-green-200
                            bg-green-50
                            px-4
                            py-3
                            text-sm
                            text-green-700
                        "
                    >
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* ----------------------------------------
                     * Article Details
                     * ---------------------------------------- */}
                    <Surface
                        padding="lg"
                        border="all"
                        radius="lg"
                    >
                        <div className="space-y-5">

                            <Field label="Title">
                                <input
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                    disabled={
                                        saving ||
                                        workflowLoading
                                    }
                                />
                            </Field>

                            <Field label="Slug">
                                <input
                                    value={slug}
                                    onChange={(event) =>
                                        setSlug(
                                            event.target.value,
                                        )
                                    }
                                    className={inputClass}
                                    disabled={
                                        saving ||
                                        workflowLoading
                                    }
                                />
                            </Field>

                            <Field label="Summary">
                                <textarea
                                    value={summary}
                                    onChange={(event) =>
                                        setSummary(
                                            event.target.value,
                                        )
                                    }
                                    rows={4}
                                    className={textareaClass}
                                    disabled={
                                        saving ||
                                        workflowLoading
                                    }
                                />
                            </Field>

                            <Field label="Content">
                                <textarea
                                    value={content}
                                    onChange={(event) =>
                                        setContent(
                                            event.target.value,
                                        )
                                    }
                                    rows={18}
                                    className={`${textareaClass} leading-7`}
                                    disabled={
                                        saving ||
                                        workflowLoading
                                    }
                                />
                            </Field>

                        </div>
                    </Surface>

                    {/* ----------------------------------------
                     * Workflow
                     * ---------------------------------------- */}
                    <Surface
                        padding="lg"
                        border="all"
                        radius="lg"
                    >
                        <div className="space-y-5">

                            <div>
                                <Typography
                                    as="h2"
                                    variant="sectionTitle"
                                    className="text-xl"
                                >
                                    Workflow
                                </Typography>

                                <Typography
                                    variant="caption"
                                    className="mt-1 block"
                                >
                                    Current status:{" "}
                                    <strong>
                                        {news.status}
                                    </strong>
                                </Typography>
                            </div>

                            <div className="flex flex-wrap gap-3">

                                {/* DRAFT */}
                                {news.status === "DRAFT" && (
                                    <>
                                        <Button
                                            type="button"
                                            disabled={
                                                workflowLoading
                                            }
                                            leftIcon={
                                                <Send size={16} />
                                            }
                                            onClick={() =>
                                                void handleWorkflowAction(
                                                    () =>
                                                        submitNewsForReview(
                                                            news.id,
                                                            ADMIN_USER_ID,
                                                        ),
                                                    "News submitted for review successfully.",
                                                )
                                            }
                                        >
                                            Submit for Review
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={
                                                workflowLoading
                                            }
                                            leftIcon={
                                                <Check size={16} />
                                            }
                                            onClick={() =>
                                                void handleWorkflowAction(
                                                    () =>
                                                        approveNews(
                                                            news.id,
                                                            ADMIN_USER_ID,
                                                        ),
                                                    "News approved successfully.",
                                                )
                                            }
                                        >
                                            Approve
                                        </Button>
                                    </>
                                )}

                                {/* IN REVIEW */}
                                {news.status === "IN_REVIEW" && (
                                    <>
                                        <Button
                                            type="button"
                                            disabled={
                                                workflowLoading
                                            }
                                            leftIcon={
                                                <Check size={16} />
                                            }
                                            onClick={() =>
                                                void handleWorkflowAction(
                                                    () =>
                                                        approveNews(
                                                            news.id,
                                                            ADMIN_USER_ID,
                                                        ),
                                                    "News approved successfully.",
                                                )
                                            }
                                        >
                                            Approve
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={
                                                workflowLoading
                                            }
                                            leftIcon={
                                                <X size={16} />
                                            }
                                            onClick={() =>
                                                void handleWorkflowAction(
                                                    () =>
                                                        rejectNews(
                                                            news.id,
                                                            ADMIN_USER_ID,
                                                        ),
                                                    "News rejected successfully.",
                                                )
                                            }
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}

                                {/* APPROVED */}
                                {news.status === "APPROVED" && (
                                    <Button
                                        type="button"
                                        disabled={
                                            workflowLoading
                                        }
                                        leftIcon={
                                            <Check size={16} />
                                        }
                                        onClick={() =>
                                            void handleWorkflowAction(
                                                () =>
                                                    publishNews(
                                                        news.id,
                                                        ADMIN_USER_ID,
                                                    ),
                                                "News published successfully.",
                                            )
                                        }
                                    >
                                        Publish
                                    </Button>
                                )}

                                {/* PUBLISHED */}
                                {news.status === "PUBLISHED" && (
                                    <>
                                        {promotionActive ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={
                                                    workflowLoading
                                                }
                                                leftIcon={
                                                    <StarOff
                                                        size={16}
                                                    />
                                                }
                                                onClick={() =>
                                                    void handleWorkflowAction(
                                                        () =>
                                                            removeNewsPromotion(
                                                                news.id,
                                                                ADMIN_USER_ID,
                                                            ),
                                                        "News promotion removed successfully.",
                                                    )
                                                }
                                            >
                                                Remove Promotion
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={
                                                    workflowLoading
                                                }
                                                leftIcon={
                                                    <Star
                                                        size={16}
                                                    />
                                                }
                                                onClick={() =>
                                                    void handleWorkflowAction(
                                                        () =>
                                                            promoteNews(
                                                                news.id,
                                                                ADMIN_USER_ID,
                                                            ),
                                                        "News promoted for 3 days successfully.",
                                                    )
                                                }
                                            >
                                                Promote for 3 Days
                                            </Button>
                                        )}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={
                                                workflowLoading
                                            }
                                            leftIcon={
                                                <Archive
                                                    size={16}
                                                />
                                            }
                                            onClick={() =>
                                                void handleWorkflowAction(
                                                    () =>
                                                        archiveNews(
                                                            news.id,
                                                            ADMIN_USER_ID,
                                                        ),
                                                    "News deactivated successfully.",
                                                )
                                            }
                                        >
                                            Deactivate
                                        </Button>
                                    </>
                                )}

                                {/* REJECTED */}
                                {news.status === "REJECTED" && (
                                    <Button
                                        type="button"
                                        disabled={
                                            workflowLoading
                                        }
                                        leftIcon={
                                            <RotateCcw
                                                size={16}
                                            />
                                        }
                                        onClick={() =>
                                            void handleWorkflowAction(
                                                () =>
                                                    moveNewsToDraft(
                                                        news.id,
                                                        ADMIN_USER_ID,
                                                    ),
                                                "News moved back to draft successfully.",
                                            )
                                        }
                                    >
                                        Move to Draft
                                    </Button>
                                )}

                            </div>

                            {/* Promotion information */}
                            {news.status === "PUBLISHED" &&
                                news.displayPriority > 0 && (
                                    <div
                                        className="
                                            rounded-lg
                                            border
                                            border-amber-200
                                            bg-amber-50
                                            px-4
                                            py-3
                                            text-sm
                                            text-amber-800
                                        "
                                    >
                                        <div className="flex items-center gap-2">
                                            <Star
                                                size={16}
                                                aria-hidden="true"
                                            />

                                            <span className="font-semibold">
                                                Promoted Article
                                            </span>
                                        </div>

                                        {promotionUntil && (
                                            <p className="mt-1 text-xs">
                                                Promotion active
                                                until{" "}
                                                {promotionUntil}
                                            </p>
                                        )}
                                    </div>
                                )}

                        </div>
                    </Surface>

                    {/* ----------------------------------------
                     * Media
                     * ---------------------------------------- */}
                    <NewsMediaUploader
                        newsId={news.id}
                        media={media}
                        onMediaChange={setMedia}
                        disabled={
                            saving ||
                            workflowLoading
                        }
                    />

                    {/* ----------------------------------------
                     * Actions
                     * ---------------------------------------- */}
                    <div className="flex justify-end gap-3">

                        <Link to="/admin/news">
                            <Button
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            loading={saving}
                            disabled={
                                workflowLoading
                            }
                            leftIcon={
                                <Save size={17} />
                            }
                        >
                            Save Changes
                        </Button>

                    </div>

                </form>
            </div>
        </main>
    );
}

const inputClass =
    "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100";

const textareaClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100";

function Field({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                {label}
            </label>

            {children}
        </div>
    );
}