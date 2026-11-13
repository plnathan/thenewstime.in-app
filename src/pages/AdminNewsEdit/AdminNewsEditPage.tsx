import {
    istInputToUtcIso,
    utcIsoToIstInput,
    formatIstDateTime,
} from "@/helpers/businessTimeZone.helpers";
import { useRef as useValidationMessageRef, useEffect as useValidationMessageEffect } from "react";
import { scrollToValidationMessage } from "@/utils/scrollToValidationMessage";
import {
    Archive,
    ArrowLeft,
    Check,
    RotateCcw,
    Save,
    Send,
    Star,
    StarOff,
    X,
} from "lucide-react";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import {
    isAdminUser,
    isReporterUser,
} from "@/auth/auth.utils";
import type {
    FormEvent,
    ReactNode,
} from "react";
import {
    Link,
    useLocation,
    useParams,
} from "react-router-dom";

import {
    getCategories,
    getCountries,
    getDistricts,
    getStates,
} from "@/api/master-data.api";

import type {
    CountryItem,
    DistrictItem,
    MasterDataItem,
    StateItem,
} from "@/api/master-data.api";

import {
    activateNews,
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

import Button from "@/components/ui/Button";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import { deleteNewsMedia } from "@/api/media.api";
import { finalSaveNews } from "@/api/news.api";
import NewsMediaUploader from "@/components/news/NewsMedia/NewsMediaUploader";
import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";

import MainLayout from "@/layouts/MainLayout";

import type {
    News,
    UpdateNewsInput,
} from "@/types/news.types";

import { normalizeSlug } from "@/utils/news/slug";

const getNewsListReturnUrl = (search: string): string => {
    const requested = new URLSearchParams(search).get("returnTo");
    return requested === "/admin/news/list" || requested?.startsWith("/admin/news/list?")
        ? requested
        : "/admin/news/list";
};

const getLocalPublicationInputValue = (): string => utcIsoToIstInput(new Date());

type NewsScopeValue =
    | ""
    | News["newsScope"];

type MasterDataWithOptionalCode = {
    id: number;
    displayName: string;
    code?: string | null;
    urlName?: string | null;
};

// const getMasterDataCode = (
//     item:
//         | CountryItem
//         | StateItem
//         | DistrictItem
//         | MasterDataItem,
// ): string => {
//     const value =
//         item as MasterDataWithOptionalCode;

//     return value.code?.trim() ?? "";
// };

const getMasterDataSlugName = (
    item:
        | CountryItem
        | StateItem
        | DistrictItem
        | MasterDataItem
        | undefined,
): string => {
    if (!item) {
        return "";
    }

    const value =
        item as MasterDataWithOptionalCode;

    return value.displayName.trim();
};

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
): string | null => {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return formatIstDateTime(date);
};

export default function AdminNewsEditPage() {
    const location = useLocation();
    const newsListReturnUrl = getNewsListReturnUrl(location.search);
    const { user } = useAuth();
    const { id } = useParams();

    const canManageNews = isAdminUser(user);
    const canReporterEdit = isReporterUser(user);

    const newsId = Number(id);

    const isValidNewsId =
        Number.isInteger(newsId) &&
        newsId > 0;

    const [news, setNews] =
        useState<News | null>(null);

    const [schedulePublication, setSchedulePublication] = useState(false);
    const [publicationLocalTime, setPublicationLocalTime] = useState("");

    const [showOnHomepage, setShowOnHomepage] = useState(false);

    const [title, setTitle] =
        useState("");

    const [slug, setSlug] =
        useState("");

    const [summary, setSummary] =
        useState("");

    const [content, setContent] =
        useState("");

    const [newsScope, setNewsScope] =
        useState<NewsScopeValue>("");

    const [categoryId, setCategoryId] =
        useState("");

    const [countryId, setCountryId] =
        useState("");

    const [stateId, setStateId] =
        useState("");

    const [districtId, setDistrictId] =
        useState("");

    const [categories, setCategories] =
        useState<MasterDataItem[]>([]);

    const [countries, setCountries] =
        useState<CountryItem[]>([]);

    const [states, setStates] =
        useState<StateItem[]>([]);

    const [districts, setDistricts] =
        useState<DistrictItem[]>([]);

    const [loadingMasterData, setLoadingMasterData] =
        useState(true);

    const [loading, setLoading] =
        useState(isValidNewsId);

    const [saving, setSaving] =
        useState(false);

    const [workflowLoading, setWorkflowLoading] =
        useState(false);

    const validationMessageRef = useValidationMessageRef<HTMLDivElement>(null);

    const [error, setError] =
        useState<string | null>(
            isValidNewsId
                ? null
                : "Invalid news article ID.",
        );

    useValidationMessageEffect(() => {
        if (error) scrollToValidationMessage(validationMessageRef.current);
    }, [error]);

    const [success, setSuccess] =
        useState<string | null>(null);

    const [media, setMedia] =
        useState<NewsMedia[]>([]);
    const [pendingMediaRemoval, setPendingMediaRemoval] = useState<number[]>([]);
    const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
    const successMessageRef = useValidationMessageRef<HTMLDivElement>(null);

    useValidationMessageEffect(() => {
        if (success) scrollToValidationMessage(successMessageRef.current);
    }, [success]);

    const currentSnapshot = JSON.stringify({ title, slug, summary, content, newsScope, categoryId, countryId, stateId, districtId, showOnHomepage, mediaIds: media.map(item => item.id) });
    const savedWithoutChanges = savedSnapshot !== null && savedSnapshot === currentSnapshot;

    const [currentTime] =
        useState(() => Date.now());

    const india = useMemo(
        () => countries.find((country) => {
            const value = country as MasterDataWithOptionalCode;
            return value.code?.trim().toUpperCase() === "IN" || value.displayName.trim().toLowerCase() === "india";
        }),
        [countries],
    );

    // const tamilNadu = useMemo(
    //     () => states.find((state) => {
    //         const value = state as MasterDataWithOptionalCode;
    //         return value.code?.trim().toUpperCase() === "TN" || value.displayName.trim().toLowerCase() === "tamil nadu";
    //     }),
    //     [states],
    // );

    /*
     * Frozen classification values are derived during render instead of being
     * synchronized through effects. This avoids cascading-render lint errors.
     */
    const selectedCountryId =
        newsScope === "WORLD"
            ? countryId
            : india
                ? String(india.id)
                : countryId;

    const selectedStateId =
        stateId;

    /*
     * -------------------------------------------------------------------------
     * Load categories and countries.
     * -------------------------------------------------------------------------
     */
    useEffect(() => {
        let cancelled = false;

        const loadMasterData = async () => {
            try {
                const [
                    categoryResponse,
                    countryResponse,
                ] = await Promise.all([
                    getCategories(),
                    getCountries(),
                ]);

                if (cancelled) {
                    return;
                }

                setCategories(
                    categoryResponse.data,
                );

                setCountries(
                    countryResponse.data,
                );
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Unable to load master data:",
                    err,
                );

                setError(
                    "Unable to load category and location data.",
                );
            } finally {
                if (!cancelled) {
                    setLoadingMasterData(false);
                }
            }
        };

        void loadMasterData();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * -------------------------------------------------------------------------
     * Load article.
     * -------------------------------------------------------------------------
     */
    useEffect(() => {
        if (!isValidNewsId) {
            return;
        }

        let cancelled = false;

        const loadNews = async () => {
            try {
                const response =
                    await getNewsById(
                        newsId,
                    );

                if (cancelled) {
                    return;
                }

                const article =
                    response.data;

                setNews(article);
                setTitle(article.title);
                setShowOnHomepage(article.showOnHomepage);
                setSlug(article.slug);
                setSummary(
                    article.summary ?? "",
                );
                setContent(
                    article.content,
                );
                setNewsScope(
                    article.newsScope,
                );
                setCategoryId(
                    String(
                        article.categoryId,
                    ),
                );
                setCountryId(
                    article.countryId !==
                        null
                        ? String(
                            article.countryId,
                        )
                        : "",
                );
                setStateId(
                    article.stateId !==
                        null
                        ? String(
                            article.stateId,
                        )
                        : "",
                );
                setDistrictId(
                    article.districtId !==
                        null
                        ? String(
                            article.districtId,
                        )
                        : "",
                );
                setMedia(
                    article.media ?? [],
                );
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(err);

                const apiMessage =
                    getApiErrorMessage(
                        err,
                    );

                setError(
                    apiMessage ??
                    "Unable to load the news article.",
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadNews();

        return () => {
            cancelled = true;
        };
    }, [
        isValidNewsId,
        newsId,
    ]);

    /*
     * -------------------------------------------------------------------------
     * Load states according to the SELECTED country.
     * -------------------------------------------------------------------------
     */
    useEffect(() => {
        if (
            !selectedCountryId ||
            (
                newsScope !== "STATE" &&
                newsScope !== "DISTRICT"
            )
        ) {
            return;
        }

        let cancelled = false;

        const loadStates = async () => {
            try {
                const response =
                    await getStates(
                        Number(
                            selectedCountryId,
                        ),
                    );

                if (cancelled) {
                    return;
                }

                setStates(
                    response.data,
                );
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Unable to load states:",
                    err,
                );

                setStates([]);

                setError(
                    "Unable to load states.",
                );
            }
        };

        void loadStates();

        return () => {
            cancelled = true;
        };
    }, [
        newsScope,
        selectedCountryId,
    ]);

    /*
     * -------------------------------------------------------------------------
     * Load districts according to the SELECTED state.
     * -------------------------------------------------------------------------
     */
    useEffect(() => {
        if (
            newsScope !== "DISTRICT" ||
            !selectedStateId
        ) {
            return;
        }

        let cancelled = false;

        const loadDistricts = async () => {
            try {
                const response =
                    await getDistricts(
                        Number(
                            selectedStateId,
                        ),
                    );

                if (cancelled) {
                    return;
                }

                setDistricts(
                    response.data,
                );
            } catch (err) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Unable to load districts:",
                    err,
                );

                setDistricts([]);

                setError(
                    "Unable to load districts.",
                );
            }
        };

        void loadDistricts();

        return () => {
            cancelled = true;
        };
    }, [
        newsScope,
        selectedStateId,
    ]);

    /*
     * -------------------------------------------------------------------------
     * Generate classification prefix from selected dropdown values.
     * -------------------------------------------------------------------------
     */
    const generatedSlugPrefix = useMemo(() => {
        if (!newsScope) {
            return "";
        }

        const category = categories.find(
            (item) => String(item.id) === categoryId,
        );

        if (!category) {
            return "";
        }

        const categoryName =
            getMasterDataSlugName(category);

        const country = countries.find(
            (item) => String(item.id) === selectedCountryId,
        );

        if (!country) {
            return "";
        }

        const countryName =
            getMasterDataSlugName(country);

        if (
            newsScope === "WORLD" ||
            newsScope === "INDIA"
        ) {
            return normalizeSlug(
                `${categoryName}-${countryName}`,
            ).replace(/-+$/, "");
        }

        const state = states.find(
            (item) => String(item.id) === selectedStateId,
        );

        if (!state) {
            return "";
        }

        const stateName =
            getMasterDataSlugName(state);

        if (newsScope === "STATE") {
            return normalizeSlug(
                `${categoryName}-${countryName}-${stateName}`,
            ).replace(/-+$/, "");
        }

        const district = districts.find(
            (item) => String(item.id) === districtId,
        );

        if (!district) {
            return "";
        }

        const districtName =
            getMasterDataSlugName(district);

        return normalizeSlug(
            `${categoryName}-${countryName}-${stateName}-${districtName}`,
        ).replace(/-+$/, "");
    }, [
        categories,
        countries,
        states,
        districts,
        newsScope,
        categoryId,
        selectedCountryId,
        selectedStateId,
        districtId,
    ]);

    /*
     * -------------------------------------------------------------------------
     * Generated slug.
     *
     * Classification + title are always regenerated.
     * -------------------------------------------------------------------------
     */
    const generatedSlug = useMemo(() => {
        if (!generatedSlugPrefix) {
            return "";
        }

        return `${generatedSlugPrefix.replace(/-+$/, "")}-`;
    }, [generatedSlugPrefix]);

    // const effectiveSlug =
    //     slugManuallyEdited
    //         ? slug
    //         : generatedSlug;

    const handleScopeChange = (
        value: NewsScopeValue,
    ) => {
        setNewsScope(value);
        setCountryId(value === "WORLD" ? "" : india ? String(india.id) : "");
        setStateId("");
        setDistrictId("");
        setStates([]);
        setDistricts([]);
    };

    /*
     * -------------------------------------------------------------------------
     * Country change.
     *
     * Country is selectable for every actual scope.
     * -------------------------------------------------------------------------
     */
    const handleCountryChange = (
        value: string,
    ) => {
        setCountryId(value);
        setStateId("");
        setDistrictId("");

        setStates([]);
        setDistricts([]);
    };

    /*
     * -------------------------------------------------------------------------
     * State change.
     * -------------------------------------------------------------------------
     */
    const handleStateChange = (
        value: string,
    ) => {
        setStateId(value);
        setDistrictId("");

        setDistricts([]);
    };

    const validate = (): string | null => {
        if (!newsScope) {
            return "News scope is required.";
        }

        if (!categoryId) {
            return "Category is required.";
        }

        if (!title.trim()) {
            return "Title is required.";
        }

        if (!slug.trim()) {
            return "Slug is required.";
        }

        if (!/^[a-z0-9-]+$/.test(slug)) {
            return "Slug contains invalid characters.";
        }

        if (!content.trim()) {
            return "Content is required.";
        }

        if (!selectedCountryId) {
            return "Country is required.";
        }

        if (
            newsScope === "STATE" &&
            !selectedStateId
        ) {
            return "State is required for state news.";
        }

        if (
            newsScope === "DISTRICT" &&
            (
                !selectedStateId ||
                !districtId
            )
        ) {
            return "State and district are required for district news.";
        }

        return null;
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!news || saving || savedWithoutChanges) {
            return;
        }

        if (!canEditArticle) {
            setError(
                "This news article cannot be edited in its current status or with your current access.",
            );
            return;
        }

        const validationError =
            validate();

        if (validationError) {
            setError(
                validationError,
            );
            setSuccess(null);
            return;
        }

        if (!newsScope) {
            return;
        }

        const payload: UpdateNewsInput = {
            showOnHomepage,
            title:
                title.trim(),

            slug:
                slug.trim(),

            summary:
                summary.trim(),

            content:
                content.trim(),

            newsScope,

            categoryId:
                Number(
                    categoryId,
                ),

            countryId:
                Number(
                    countryId,
                ),

            stateId:
                selectedStateId
                    ? Number(
                        selectedStateId,
                    )
                    : null,

            districtId:
                districtId
                    ? Number(
                        districtId,
                    )
                    : null,

            updatedBy:
                Number(user?.id ?? 0),
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

            setNews(
                (current) =>
                    current
                        ? {
                            ...current,
                            ...response.data,
                        }
                        : current,
            );

            // Media removal is intentionally deferred until Save Changes succeeds.
            // A failed deletion remains pending and can be retried by saving again.
            const failedRemovals: number[] = [];
            for (const mediaId of pendingMediaRemoval) {
                try {
                    await deleteNewsMedia(news.id, mediaId);
                } catch (mediaError) {
                    console.error("Unable to remove saved news media:", mediaError);
                    failedRemovals.push(mediaId);
                }
            }
            setPendingMediaRemoval(failedRemovals);
            if (failedRemovals.length === 0) {
                await finalSaveNews(news.id, media.map(item => item.id));
            }
            if (failedRemovals.length > 0) {
                setError(`${failedRemovals.length} image removal(s) failed. Save Changes again to retry cleanup.`);
            } else {
                setSavedSnapshot(currentSnapshot);
            }
            setSuccess(
                failedRemovals.length > 0
                    ? "News details saved. Some image removals require retry."
                    : response.message || "News article updated successfully.",
            );
        } catch (err) {
            console.error(err);

            const apiMessage =
                getApiErrorMessage(
                    err,
                );

            setError(
                apiMessage
                    ? `Unable to update the news article. ${apiMessage}`
                    : "Unable to update the news article.",
            );
        } finally {
            setSaving(false);
        }
    };

    const reloadArticle = async (
        articleId: number,
    ) => {
        const response =
            await getNewsById(
                articleId,
            );

        const article =
            response.data;

        setNews(article);
        setTitle(article.title);
        setShowOnHomepage(article.showOnHomepage);
        setSlug(article.slug);
        setSummary(
            article.summary ?? "",
        );
        setContent(
            article.content,
        );
        setNewsScope(
            article.newsScope,
        );
        setCategoryId(
            String(
                article.categoryId,
            ),
        );
        setCountryId(
            article.countryId !==
                null
                ? String(
                    article.countryId,
                )
                : "",
        );
        setStateId(
            article.stateId !==
                null
                ? String(
                    article.stateId,
                )
                : "",
        );
        setDistrictId(
            article.districtId !==
                null
                ? String(
                    article.districtId,
                )
                : "",
        );
        setMedia(
            article.media ?? [],
        );
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

            await reloadArticle(
                news.id,
            );

            setSuccess(
                successMessage,
            );
        } catch (err) {
            console.error(err);

            const apiMessage =
                getApiErrorMessage(
                    err,
                );

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
        news?.status ===
        "PUBLISHED" &&
        news.displayPriority > 0 &&
        Boolean(
            news.displayPriorityUntil &&
            new Date(
                news.displayPriorityUntil,
            ).getTime() >
            currentTime,
        );

    if (loading) {
        return (
            <MainLayout>
                <main className="min-h-screen bg-gray-50">
                    <div className="mx-auto w-full max-w-7xl px-4 py-10">
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
            <MainLayout>
                <main className="min-h-screen bg-gray-50">
                    <div className="mx-auto w-full max-w-7xl px-4 py-10">
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
                                to={newsListReturnUrl}
                                className="mt-4 inline-flex text-sm font-medium text-green-700"
                            >
                                Back to News List
                            </Link>
                        </Surface>
                    </div>
                </main>
            </MainLayout>
        );
    }

    const canEditArticle =
        news.status !== "ARCHIVED" &&
        (
            canManageNews ||
            (
                canReporterEdit &&
                news.status === "DRAFT"
            )
        );

    if (
        news.status ===
        "ARCHIVED"
    ) {
        return (
            <MainLayout>
                <main className="min-h-screen bg-gray-50">
                    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6">
                        <Link
                            to={newsListReturnUrl}
                            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
                        >
                            <ArrowLeft
                                size={16}
                            />
                            Back to News List
                        </Link>

                        <Surface
                            padding="lg"
                            border="all"
                            radius="lg"
                        >
                            <div className="space-y-4">
                                <Typography
                                    as="h1"
                                    variant="headline"
                                    className="text-2xl md:text-3xl"
                                >
                                    Archived News
                                </Typography>

                                <Typography
                                    variant="body"
                                    className="text-gray-600"
                                >
                                    This article is currently archived and cannot be edited. Activate it to return it to draft status.
                                </Typography>

                                {error && (
                                    <div ref={validationMessageRef} tabIndex={-1} role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div ref={successMessageRef} tabIndex={-1} role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                        {success}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3 pt-2">
                                    {canManageNews && (
                                        <Button
                                            type="button"
                                            loading={
                                                workflowLoading
                                            }
                                            disabled={
                                                workflowLoading
                                            }
                                            leftIcon={
                                                <RotateCcw
                                                    size={
                                                        16
                                                    }
                                                />
                                            }
                                            onClick={() =>
                                                void handleWorkflowAction(
                                                    () =>
                                                        activateNews(
                                                            news.id,
                                                            Number(user?.id ?? 0),
                                                        ),
                                                    "News activated successfully and moved back to draft.",
                                                )
                                            }
                                        >
                                            Activate News
                                        </Button>
                                    )}

                                    <Link to={newsListReturnUrl}>
                                        <Button
                                            type="button"
                                            variant="outline"
                                        >
                                            Back to News List
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Surface>
                    </div>
                </main>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6">
                    <Link
                        to={newsListReturnUrl}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
                    >
                        <ArrowLeft
                            size={16}
                        />
                        Back to News List
                    </Link>

                    <div className="admin-unified-header mb-6">
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
                        <div ref={validationMessageRef} tabIndex={-1} role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div ref={successMessageRef} tabIndex={-1} role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    {!canEditArticle && (
                        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            {canManageNews
                                ? `This article is ${news.status.toLowerCase().replace("_", " ")}. It is not editable in this status.`
                                : "This article is currently locked for editing. Only the permitted workflow role can edit it in this status."}
                        </div>
                    )}

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="space-y-6"
                    >
                        <label className="mb-4 flex items-center gap-3 text-sm">
                            <input type="checkbox" checked={showOnHomepage}
                                disabled={!canEditArticle || saving || workflowLoading}
                                onChange={(event) => setShowOnHomepage(event.target.checked)} />
                            <span>Show on Homepage (Hot News)</span>
                        </label>
                        {/* -----------------------------------------------------------------
                         * NEWS CLASSIFICATION
                         * ----------------------------------------------------------------- */}
                        <Surface
                            padding="lg"
                            border="all"
                            radius="lg"
                        >
                            <Typography
                                as="h2"
                                variant="sectionTitle"
                                className="mb-5 text-xl"
                            >
                                News Classification
                            </Typography>

                            <div className="grid gap-5 md:grid-cols-2">
                                {/* Category */}
                                <Field
                                    label="Category"
                                    required
                                >
                                    <select
                                        value={
                                            categoryId
                                        }
                                        onChange={(event) => {
                                            setCategoryId(
                                                event
                                                    .target
                                                    .value,
                                            );
                                        }}
                                        disabled={
                                            !canEditArticle ||
                                            loadingMasterData ||
                                            saving ||
                                            workflowLoading
                                        }
                                        className={
                                            inputClass
                                        }
                                    >
                                        <option value="">
                                            Select category
                                        </option>

                                        {categories.map(
                                            (
                                                category,
                                            ) => (
                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.displayName
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </Field>

                                {/* News Scope */}
                                <Field
                                    label="News Scope"
                                    required
                                >
                                    <select
                                        value={
                                            newsScope
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            handleScopeChange(
                                                event
                                                    .target
                                                    .value as NewsScopeValue,
                                            )
                                        }
                                        disabled={
                                            !canEditArticle ||
                                            saving ||
                                            workflowLoading
                                        }
                                        className={
                                            inputClass
                                        }
                                    >
                                        <option value="">
                                            Select News Scope
                                        </option>

                                        <option value="WORLD">
                                            World
                                        </option>

                                        <option value="INDIA">
                                            India
                                        </option>

                                        <option value="STATE">
                                            State
                                        </option>

                                        <option value="DISTRICT">
                                            District
                                        </option>
                                    </select>
                                </Field>

                                {/* Country */}
                                {newsScope && (
                                    <Field
                                        label="Country"
                                        required
                                    // hint={
                                    //     newsScope === "WORLD"
                                    //         ? undefined
                                    //         : "India is automatically selected and cannot be changed for this news scope."
                                    // }
                                    >
                                        <select
                                            value={
                                                countryId
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                handleCountryChange(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            disabled={
                                                !canEditArticle ||
                                                loadingMasterData ||
                                                saving ||
                                                workflowLoading ||
                                                newsScope !== "WORLD"
                                            }
                                            className={
                                                inputClass
                                            }
                                        >
                                            <option value="">
                                                Select country
                                            </option>

                                            {countries.map(
                                                (
                                                    country,
                                                ) => (
                                                    <option
                                                        key={
                                                            country.id
                                                        }
                                                        value={
                                                            country.id
                                                        }
                                                    >
                                                        {
                                                            country.displayName
                                                        }
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </Field>
                                )}

                                {/* State */}
                                {(newsScope ===
                                    "STATE" ||
                                    newsScope ===
                                    "DISTRICT") && (
                                        <Field
                                            label="State"
                                            required
                                        >
                                            <select
                                                value={
                                                    stateId
                                                }
                                                onChange={(event) =>
                                                    handleStateChange(
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={
                                                    !canEditArticle ||
                                                    !selectedCountryId ||
                                                    states.length === 0 ||
                                                    saving ||
                                                    workflowLoading
                                                }
                                                className={
                                                    inputClass
                                                }
                                            >
                                                <option value="">
                                                    Select state
                                                </option>

                                                {states.map(
                                                    (
                                                        state,
                                                    ) => (
                                                        <option
                                                            key={
                                                                state.id
                                                            }
                                                            value={
                                                                state.id
                                                            }
                                                        >
                                                            {
                                                                state.displayName
                                                            }
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </Field>
                                    )}

                                {/* District */}
                                {newsScope ===
                                    "DISTRICT" && (
                                        <Field
                                            label="District"
                                            required
                                        >
                                            <select
                                                value={
                                                    districtId
                                                }
                                                onChange={(event) => {
                                                    setDistrictId(
                                                        event
                                                            .target
                                                            .value,
                                                    );
                                                }}
                                                disabled={
                                                    !canEditArticle ||
                                                    !selectedStateId ||
                                                    districts.length ===
                                                    0 ||
                                                    saving ||
                                                    workflowLoading
                                                }
                                                className={
                                                    inputClass
                                                }
                                            >
                                                <option value="">
                                                    Select district
                                                </option>

                                                {districts.map(
                                                    (
                                                        district,
                                                    ) => (
                                                        <option
                                                            key={
                                                                district.id
                                                            }
                                                            value={
                                                                district.id
                                                            }
                                                        >
                                                            {
                                                                district.displayName
                                                            }
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </Field>
                                    )}
                            </div>

                            {/* Generated Slug */}
                            <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Generated Slug
                                </p>

                                <p className="mt-1 break-all text-sm font-medium text-gray-800">
                                    {generatedSlug ||
                                        "Select classification to generate a slug"}
                                </p>
                            </div>
                        </Surface>

                        {/* -----------------------------------------------------------------
                         * ARTICLE DETAILS
                         * ----------------------------------------------------------------- */}
                        <Surface
                            padding="lg"
                            border="all"
                            radius="lg"
                        >
                            <Typography
                                as="h2"
                                variant="sectionTitle"
                                className="mb-5 text-xl"
                            >
                                Article Details
                            </Typography>

                            <div className="space-y-5">
                                <Field
                                    label="Slug"
                                    required
                                    hint="Enter an English statement and select Format Slug. Existing published URLs change if you save a different slug."
                                >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <input
                                            value={slug}
                                            onChange={(event) => {
                                                setSlug(event.target.value);
                                            }}
                                            disabled={!canEditArticle || saving || workflowLoading}
                                            className={inputClass}
                                        />
                                        <button type="button" disabled={!canEditArticle || saving || workflowLoading} onClick={() => setSlug(normalizeSlug(slug).replace(/^-+|-+$/g, ""))} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-green-700 px-3 text-sm font-medium text-green-800 hover:bg-green-50 disabled:opacity-50"><Check size={16} /> Format Slug</button>
                                    </div>
                                </Field>

                                <Field
                                    label="Title"
                                    required
                                >
                                    <input
                                        value={
                                            title
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setTitle(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        className={
                                            inputClass
                                        }
                                        disabled={
                                            !canEditArticle ||
                                            saving ||
                                            workflowLoading
                                        }
                                    />
                                </Field>

                                <Field label="Summary">
                                    <textarea
                                        ref={(element) => {
                                            if (element) resizeSummaryTextarea(element);
                                        }}
                                        onInput={(event) =>
                                            resizeSummaryTextarea(event.currentTarget)
                                        }
                                        value={
                                            summary
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setSummary(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        rows={1}
                                        className={
                                            `${textareaClass} min-h-11 resize-none overflow-hidden py-2`
                                        }
                                        disabled={
                                            !canEditArticle ||
                                            saving ||
                                            workflowLoading
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Content"
                                    required
                                >
                                    <textarea
                                        value={
                                            content
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setContent(
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        rows={18}
                                        className={`${textareaClass} leading-7`}
                                        disabled={
                                            !canEditArticle ||
                                            saving ||
                                            workflowLoading
                                        }
                                    />
                                </Field>
                            </div>
                        </Surface>

                        <NewsMediaUploader
                            newsId={
                                news.id
                            }
                            media={
                                media
                            }
                            onMediaChange={(nextMedia) => {
                                const nextIds = new Set(nextMedia.map(item => item.id));
                                const removed = media.filter(item => !nextIds.has(item.id)).map(item => item.id);
                                setPendingMediaRemoval(previous => [...new Set([...previous, ...removed])].filter(id => !nextIds.has(id)));
                                setMedia(nextMedia);
                            }}
                            deferDeletion
                            disabled={
                                !canEditArticle ||
                                saving ||
                                workflowLoading
                            }
                        />

                        {/* -----------------------------------------------------------------
                         * WORKFLOW
                         * ----------------------------------------------------------------- */}
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
                                            {
                                                news.status
                                            }
                                        </strong>
                                    </Typography>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {news.status ===
                                        "DRAFT" && (
                                            <>
                                                {(canManageNews || canReporterEdit) && (
                                                    <Button
                                                        type="button"
                                                        disabled={
                                                            workflowLoading
                                                        }
                                                        leftIcon={
                                                            <Send
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        }
                                                        onClick={() =>
                                                            void handleWorkflowAction(
                                                                () =>
                                                                    submitNewsForReview(
                                                                        news.id,
                                                                        Number(user?.id ?? 0),
                                                                    ),
                                                                "News submitted for review successfully.",
                                                            )
                                                        }
                                                    >
                                                        Submit for Review
                                                    </Button>
                                                )}

                                                {canManageNews && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        disabled={
                                                            workflowLoading
                                                        }
                                                        leftIcon={
                                                            <Check
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        }
                                                        onClick={() =>
                                                            void handleWorkflowAction(
                                                                () =>
                                                                    approveNews(
                                                                        news.id,
                                                                        Number(user?.id ?? 0),
                                                                    ),
                                                                "News approved successfully.",
                                                            )
                                                        }
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                            </>
                                        )}

                                    {news.status ===
                                        "IN_REVIEW" &&
                                        canManageNews && (
                                            <>
                                                <Button
                                                    type="button"
                                                    disabled={
                                                        workflowLoading
                                                    }
                                                    leftIcon={
                                                        <Check
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    }
                                                    onClick={() =>
                                                        void handleWorkflowAction(
                                                            () =>
                                                                approveNews(
                                                                    news.id,
                                                                    Number(user?.id ?? 0),
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
                                                        <X
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    }
                                                    onClick={() =>
                                                        void handleWorkflowAction(
                                                            () =>
                                                                rejectNews(
                                                                    news.id,
                                                                    Number(user?.id ?? 0),
                                                                ),
                                                            "News rejected successfully.",
                                                        )
                                                    }
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}

                                    {news.status === "APPROVED" && canManageNews && (
                                        <div className="flex w-full flex-wrap items-end gap-3">
                                            <label className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-gray-800">
                                                <input
                                                    type="checkbox"
                                                    checked={schedulePublication}
                                                    disabled={workflowLoading}
                                                    onChange={(event) => {
                                                        setSchedulePublication(event.target.checked);
                                                        setPublicationLocalTime("");
                                                    }}
                                                />
                                                Schedule
                                            </label>
                                            {schedulePublication && (
                                                <label className="flex min-w-[220px] flex-col gap-1 text-sm">
                                                    Publication date and time (local) *
                                                    <input
                                                        type="datetime-local"
                                                        required
                                                        value={publicationLocalTime}
                                                        min={getLocalPublicationInputValue()}
                                                        onChange={(event) => setPublicationLocalTime(event.target.value)}
                                                        className="min-h-10 rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                                                    />
                                                </label>
                                            )}
                                            <Button
                                                type="button"
                                                disabled={workflowLoading}
                                                leftIcon={<Check size={16} />}
                                                onClick={() => {
                                                    void handleWorkflowAction(
                                                        () => {
                                                            if (!schedulePublication) {
                                                                return publishNews(news.id, Number(user?.id ?? 0));
                                                            }
                                                            if (!publicationLocalTime) {
                                                                throw new Error("Select the scheduled publication date and time.");
                                                            }
                                                            const date = new Date(istInputToUtcIso(publicationLocalTime));
                                                            if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
                                                                throw new Error("Scheduled publication must be a future date and time.");
                                                            }
                                                            return publishNews(news.id, Number(user?.id ?? 0), date.toISOString());
                                                        },
                                                        schedulePublication ? "News scheduled successfully." : "News published successfully.",
                                                    );
                                                }}
                                            >
                                                Publish
                                            </Button>
                                        </div>
                                    )}

                                    {news.status ===
                                        "PUBLISHED" &&
                                        canManageNews && (
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
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        }
                                                        onClick={() =>
                                                            void handleWorkflowAction(
                                                                () =>
                                                                    removeNewsPromotion(
                                                                        news.id,
                                                                        Number(user?.id ?? 0),
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
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        }
                                                        onClick={() =>
                                                            void handleWorkflowAction(
                                                                () =>
                                                                    promoteNews(
                                                                        news.id,
                                                                        Number(user?.id ?? 0),
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
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    }
                                                    onClick={() =>
                                                        void handleWorkflowAction(
                                                            () =>
                                                                archiveNews(
                                                                    news.id,
                                                                    Number(user?.id ?? 0),
                                                                ),
                                                            "News deactivated successfully.",
                                                        )
                                                    }
                                                >
                                                    Deactivate
                                                </Button>
                                            </>
                                        )}

                                    {news.status ===
                                        "REJECTED" &&
                                        canManageNews && (
                                            <Button
                                                type="button"
                                                disabled={
                                                    workflowLoading
                                                }
                                                leftIcon={
                                                    <RotateCcw
                                                        size={
                                                            16
                                                        }
                                                    />
                                                }
                                                onClick={() =>
                                                    void handleWorkflowAction(
                                                        () =>
                                                            moveNewsToDraft(
                                                                news.id,
                                                                Number(user?.id ?? 0),
                                                            ),
                                                        "News moved back to draft successfully.",
                                                    )
                                                }
                                            >
                                                Move to Draft
                                            </Button>
                                        )}
                                </div>

                                {news.status ===
                                    "PUBLISHED" &&
                                    news.displayPriority >
                                    0 && (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                            <div className="flex items-center gap-2">
                                                <Star
                                                    size={
                                                        16
                                                    }
                                                    aria-hidden="true"
                                                />

                                                <span className="font-semibold">
                                                    Promoted Article
                                                </span>
                                            </div>

                                            {promotionUntil && (
                                                <p className="mt-1 text-xs">
                                                    Promotion
                                                    active until{" "}
                                                    {
                                                        promotionUntil
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}
                            </div>
                        </Surface>

                        <div className="flex justify-end gap-3">
                            <Link to={newsListReturnUrl}>
                                <Button
                                    type="button"
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            </Link>

                            <Button
                                type="submit"
                                loading={
                                    saving
                                }
                                disabled={
                                    !canEditArticle ||
                                    saving ||
                                    savedWithoutChanges ||
                                    workflowLoading
                                }
                                leftIcon={
                                    <Save
                                        size={
                                            17
                                        }
                                    />
                                }
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </MainLayout>
    );
}

function resizeSummaryTextarea(element: HTMLTextAreaElement): void {
    // Reset first so the field also shrinks when text is deleted.
    element.style.height = "44px";
    element.style.height = `${Math.max(44, element.scrollHeight)}px`;
}

const inputClass =
    "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100";

const textareaClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100";

function Field({
    label,
    required = false,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </label>

            {hint && (
                <p className="mb-2 text-xs text-gray-500">
                    {hint}
                </p>
            )}

            {children}
        </div>
    );
}
