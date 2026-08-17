import {
    ArrowLeft,
    Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getNewsById,
    updateNews,
} from "@/api/news.api";

import Button from "@/components/ui/Button";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import type {
    News,
    UpdateNewsInput,
} from "@/types/news.types";

const ADMIN_USER_ID = 1;

export default function AdminNewsEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const newsId = Number(id);

    const [news, setNews] =
        useState<News | null>(null);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [summary, setSummary] =
        useState("");
    const [content, setContent] =
        useState("");

    const isValidNewsId =
        Number.isInteger(newsId) && newsId > 0;

    const [loading, setLoading] =
        useState(isValidNewsId);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(
            isValidNewsId
                ? null
                : "Invalid news article ID.",
        );

    useEffect(() => {
        if (!Number.isInteger(newsId) || newsId <= 0) {
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const response =
                    await getNewsById(newsId);

                const article = response.data;

                setNews(article);
                setTitle(article.title);
                setSlug(article.slug);
                setSummary(article.summary ?? "");
                setContent(article.content);
            } catch (err) {
                console.error(err);

                setError(
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
            return;
        }

        if (!slug.trim()) {
            setError("Slug is required.");
            return;
        }

        if (!content.trim()) {
            setError("Content is required.");
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

            await updateNews(
                news.id,
                payload,
            );

            navigate("/admin/news");
        } catch (err) {
            console.error(err);

            setError(
                "Unable to update the news article.",
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
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
                <Link
                    to="/admin/news"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
                >
                    <ArrowLeft size={16} />
                    Back to News Management
                </Link>

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

                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
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
                                />
                            </Field>
                        </div>
                    </Surface>

                    <div className="flex justify-end gap-3">
                        <Link to="/admin/news">
                            <Button
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            loading={saving}
                            leftIcon={<Save size={17} />}
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
    "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100";

const textareaClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100";

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
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