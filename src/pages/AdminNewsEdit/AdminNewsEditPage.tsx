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
import type {
    FormEvent,
    ReactNode,
} from "react";
import {
    Link,
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

import NewsMediaUploader from "@/components/news/NewsMedia/NewsMediaUploader";
import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";

import MainLayout from "@/layouts/MainLayout";

import type {
    News,
    UpdateNewsInput,
} from "@/types/news.types";

import { normalizeSlug } from "@/utils/news/slug";

const ADMIN_USER_ID = 1;

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

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

export default function AdminNewsEditPage() {
    const { id } = useParams();

    const newsId = Number(id);

    const isValidNewsId =
        Number.isInteger(newsId) &&
        newsId > 0;

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

    const [currentTime] =
        useState(() => Date.now());

    const india = useMemo(
        () => countries.find((country) => {
            const value = country as MasterDataWithOptionalCode;
            return value.code?.trim().toUpperCase() === "IN" || value.displayName.trim().toLowerCase() === "india";
        }),
        [countries],
    );

    const tamilNadu = useMemo(
        () => states.find((state) => {
            const value = state as MasterDataWithOptionalCode;
            return value.code?.trim().toUpperCase() === "TN" || value.displayName.trim().toLowerCase() === "tamil nadu";
        }),
        [states],
    );

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
        newsScope === "DISTRICT"
            ? tamilNadu
                ? String(tamilNadu.id)
                : stateId
            : stateId;

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
        setStateId(value === "DISTRICT" && tamilNadu ? String(tamilNadu.id) : "");
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

        if (!news) {
            return;
        }

        if (
            news.status ===
            "ARCHIVED"
        ) {
            setError(
                "Archived news articles cannot be edited. Activate the article first.",
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
            title:
                title.trim(),

            slug:
                slug.trim(),

            summary:
                summary.trim() ||
                undefined,

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
                ADMIN_USER_ID,
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

            setSuccess(
                response.message ||
                "News article updated successfully.",
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
            <MainLayout>
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
            </MainLayout>
        );
    }

    if (
        news.status ===
        "ARCHIVED"
    ) {
        return (
            <MainLayout>
                <main className="min-h-screen bg-gray-50">
                    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
                        <Link
                            to="/admin/news"
                            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
                        >
                            <ArrowLeft
                                size={16}
                            />
                            Back to News Management
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
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                        {success}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3 pt-2">
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
                                                        ADMIN_USER_ID,
                                                    ),
                                                "News activated successfully and moved back to draft.",
                                            )
                                        }
                                    >
                                        Activate News
                                    </Button>

                                    <Link to="/admin/news">
                                        <Button
                                            type="button"
                                            variant="outline"
                                        >
                                            Back to News Management
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
                <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
                    <Link
                        to="/admin/news"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
                    >
                        <ArrowLeft
                            size={16}
                        />
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

                    {success && (
                        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="space-y-6"
                    >
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
                                                    !selectedCountryId ||
                                                    states.length === 0 ||
                                                    saving ||
                                                    workflowLoading ||
                                                    newsScope === "DISTRICT"
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
                                            saving ||
                                            workflowLoading
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Slug"
                                    hint="Automatically generated from the selected classification and title."
                                >
                                    <input
                                        value={slug}
                                        onChange={(event) => {
                                            setSlug(normalizeSlug(event.target.value));
                                        }}
                                        disabled={saving || workflowLoading}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="Summary">
                                    <textarea
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
                                        rows={4}
                                        className={
                                            textareaClass
                                        }
                                        disabled={
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
                                            saving ||
                                            workflowLoading
                                        }
                                    />
                                </Field>
                            </div>
                        </Surface>

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

                                    {news.status ===
                                        "IN_REVIEW" && (
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

                                    {news.status ===
                                        "APPROVED" && (
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

                                    {news.status ===
                                        "PUBLISHED" && (
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

                                    {news.status ===
                                        "REJECTED" && (
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

                        <NewsMediaUploader
                            newsId={
                                news.id
                            }
                            media={
                                media
                            }
                            onMediaChange={
                                setMedia
                            }
                            disabled={
                                saving ||
                                workflowLoading
                            }
                        />

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
                                loading={
                                    saving
                                }
                                disabled={
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
