import { useRef as useValidationMessageRef, useEffect as useValidationMessageEffect } from "react";
import { scrollToValidationMessage } from "@/utils/scrollToValidationMessage";
import type { FormEvent, ReactNode } from "react";
import { ArrowLeft, Check, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuth } from "@/auth/AuthContext";

import { createNews, finalSaveNews } from "@/api/news.api";
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

import Button from "@/components/ui/Button";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import NewsMediaUploader from "@/components/news/NewsMedia/NewsMediaUploader";
import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";

import MainLayout from "@/layouts/MainLayout";

import type { CreateNewsInput } from "@/types/news.types";

import { normalizeSlug } from "@/utils/news/slug";

type NewsScopeValue =
    | ""
    | CreateNewsInput["newsScope"];

interface FormState {
    showOnHomepage: boolean;
    title: string;
    summary: string;
    content: string;
    newsScope: NewsScopeValue;
    countryId: string;
    stateId: string;
    districtId: string;
    categoryId: string;
    slug: string;
}

const INITIAL_FORM: FormState = {
    showOnHomepage: true,
    title: "",
    summary: "",
    content: "",
    newsScope: "",
    countryId: "",
    stateId: "",
    districtId: "",
    categoryId: "",
    slug: "",
};

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

export default function AdminNewsCreatePage() {
    const { user } = useAuth();
    const [form, setForm] =
        useState<FormState>(INITIAL_FORM);

    const [saving, setSaving] =
        useState(false);

    const validationMessageRef = useValidationMessageRef<HTMLDivElement>(null);

    const [error, setError] =
        useState<string | null>(null);

    useValidationMessageEffect(() => {
        if (error) scrollToValidationMessage(validationMessageRef.current);
    }, [error]);

    const [success, setSuccess] =
        useState<string | null>(null);

    const [finalSaved, setFinalSaved] = useState(false);

    const successMessageRef = useValidationMessageRef<HTMLDivElement>(null);
    useValidationMessageEffect(() => {
        if (success) scrollToValidationMessage(successMessageRef.current);
    }, [success]);

    const [createdNewsId, setCreatedNewsId] =
        useState<number | null>(null);

    const [media, setMedia] =
        useState<NewsMedia[]>([]);

    const [slugManuallyEdited, setSlugManuallyEdited] =
        useState(false);

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
     * For INDIA / STATE / DISTRICT the classification always uses India.
     * DISTRICT always uses Tamil Nadu. These are derived values rather than
     * effect-driven state synchronization, which avoids cascading renders.
     */
    const selectedCountryId =
        form.newsScope === "WORLD"
            ? form.countryId
            : india
                ? String(india.id)
                : form.countryId;

    const selectedStateId =
        form.stateId;


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
     * Load states when STATE or DISTRICT scope is selected.
     *
     * The selected country determines which states are loaded.
     * -------------------------------------------------------------------------
     */
    useEffect(() => {
        if (
            !selectedCountryId ||
            (
                form.newsScope !== "STATE" &&
                form.newsScope !== "DISTRICT"
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
        form.newsScope,
        selectedCountryId,
    ]);

    /*
     * -------------------------------------------------------------------------
     * Load districts when DISTRICT scope and a state are selected.
     * -------------------------------------------------------------------------
     */
    useEffect(() => {
        if (
            form.newsScope !== "DISTRICT" ||
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
        form.newsScope,
        selectedStateId,
    ]);

    /*
     * -------------------------------------------------------------------------
     * Generate slug prefix from SELECTED dropdown values.
     *
     * WORLD:
     *   category-country
     *
     * INDIA:
     *   category-country
     *
     * STATE:
     *   category-country-state
     *
     * DISTRICT:
     *   category-country-state-district
     * -------------------------------------------------------------------------
     */
    const generatedSlugPrefix =
        useMemo(() => {
            if (!form.newsScope) return "";

            const category = categories.find(
                (item) => String(item.id) === form.categoryId,
            );
            if (!category) return "";

            const categoryName = getMasterDataSlugName(category);
            const country = countries.find(
                (item) => String(item.id) === selectedCountryId,
            );
            if (!country) return "";

            const countryName = getMasterDataSlugName(country);

            if (form.newsScope === "WORLD" || form.newsScope === "INDIA") {
                return normalizeSlug(`${categoryName}-${countryName}`);
            }

            const state = states.find(
                (item) => String(item.id) === selectedStateId,
            );
            if (!state) return "";

            const stateName = getMasterDataSlugName(state);

            if (form.newsScope === "STATE") {
                return normalizeSlug(`${categoryName}-${countryName}-${stateName}`);
            }

            const district = districts.find(
                (item) => String(item.id) === form.districtId,
            );
            if (!district) return "";

            return normalizeSlug(
                `${categoryName}-${countryName}-${stateName}-${getMasterDataSlugName(district)}`,
            );
        }, [
            categories, countries, states, districts,
            form.newsScope, form.categoryId, selectedCountryId,
            selectedStateId, form.districtId,
        ]);

    // The Tamil title must never be used for an English URL slug.
    const generatedSlug = generatedSlugPrefix;

    const effectiveSlug =
        slugManuallyEdited
            ? form.slug
            : generatedSlug;

    const updateField = <
        K extends keyof FormState,
    >(
        field: K,
        value: FormState[K],
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleScopeChange = (
        value: NewsScopeValue,
    ) => {
        setSlugManuallyEdited(false);
        setForm((current) => ({
            ...current,
            newsScope: value,
            countryId: value === "WORLD" ? "" : india ? String(india.id) : "",
            stateId: "",
            districtId: "",
        }));

        setStates([]);
        setDistricts([]);
    };

    /*
     * -------------------------------------------------------------------------
     * Country change.
     *
     * Country is selectable for WORLD, INDIA, STATE and DISTRICT.
     *
     * Changing country invalidates state and district selections.
     * -------------------------------------------------------------------------
     */
    const handleCountryChange = (
        value: string,
    ) => {
        setSlugManuallyEdited(false);
        setForm((current) => ({
            ...current,
            countryId: value,
            stateId: "",
            districtId: "",
        }));

        setStates([]);
        setDistricts([]);
    };

    /*
     * -------------------------------------------------------------------------
     * State change.
     *
     * Changing state invalidates the district selection.
     * -------------------------------------------------------------------------
     */
    const handleStateChange = (
        value: string,
    ) => {
        setSlugManuallyEdited(false);
        setForm((current) => ({
            ...current,
            stateId: value,
            districtId: "",
        }));

        setDistricts([]);
    };

    const validate = (): string | null => {
        if (!form.newsScope) {
            return "News scope is required.";
        }

        if (!form.categoryId) {
            return "Category is required.";
        }

        if (!form.title.trim()) {
            return "Title is required.";
        }

        if (!effectiveSlug.trim()) {
            return "Slug could not be generated. Please check the classification selections.";
        }

        if (
            !/^[a-z0-9-]+$/.test(
                effectiveSlug,
            )
        ) {
            return "Generated slug contains invalid characters.";
        }

        if (!form.content.trim()) {
            return "News content is required.";
        }

        /*
         * Every actual scope requires a country.
         */
        if (!selectedCountryId) {
            return "Country is required.";
        }

        /*
         * STATE requires state.
         */
        if (
            form.newsScope ===
            "STATE" &&
            !selectedStateId
        ) {
            return "State is required for state news.";
        }

        /*
         * DISTRICT requires state + district.
         */
        if (
            form.newsScope ===
            "DISTRICT" &&
            (
                !selectedStateId ||
                !form.districtId
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

        if (
            createdNewsId !== null
        ) {
            return;
        }

        setError(null);
        setSuccess(null);

        const validationError =
            validate();

        if (validationError) {
            setError(
                validationError,
            );
            return;
        }

        /*
         * At this point newsScope is guaranteed to be non-empty
         * by validation.
         */
        if (!form.newsScope) {
            return;
        }

        const payload: CreateNewsInput = {
            showOnHomepage: form.showOnHomepage,
            title:
                form.title.trim(),

            slug:
                effectiveSlug.trim(),

            summary:
                form.summary.trim(),

            content:
                form.content.trim(),

            newsScope:
                form.newsScope,

            categoryId:
                Number(
                    form.categoryId,
                ),

            draftedBy:
                Number(user?.id ?? 0),

            createdBy:
                Number(user?.id ?? 0),

            countryId:
                Number(
                    selectedCountryId,
                ),
        };

        if (selectedStateId) {
            payload.stateId =
                Number(
                    selectedStateId,
                );
        }

        if (form.districtId) {
            payload.districtId =
                Number(
                    form.districtId,
                );
        }

        try {
            setSaving(true);

            const response =
                await createNews(
                    payload,
                );

            setCreatedNewsId(
                response.data.id,
            );

            setSuccess(
                "Draft saved successfully. You can now upload images or click Save Changes without images.",
            );
        } catch (err) {
            console.error(err);

            if (isAxiosError(err)) {
                console.error(
                    "CREATE NEWS VALIDATION RESPONSE:",
                    err.response?.data,
                );
            }

            const apiMessage =
                getApiErrorMessage(
                    err,
                );

            setError(
                apiMessage
                    ? `Unable to create the news article. ${apiMessage}`
                    : "Unable to create the news article. Please check the entered information.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <MainLayout>
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-6">
                    <div className="mb-6">
                        <Link
                            to="/admin/news/list"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
                        >
                            <ArrowLeft
                                size={16}
                            />
                            Back to News List
                        </Link>
                    </div>

                    <div className="admin-unified-header mb-6">
                        <Typography
                            as="h1"
                            variant="headline"
                            className="text-2xl md:text-3xl"
                        >
                            Create News
                        </Typography>

                        <Typography
                            variant="body"
                            className="mt-1 text-gray-500"
                        >
                            Select the news classification first, then enter the article details.
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
                                <label className="flex items-center gap-3 text-sm md:col-span-2">
                                    <input type="checkbox" checked={form.showOnHomepage}
                                        onChange={(event) => setForm((current) => ({ ...current, showOnHomepage: event.target.checked }))} />
                                    <span>Show on Homepage (Hot News)</span>
                                </label>
                                {/* Category */}
                                <Field
                                    label="Category"
                                    required
                                >
                                    <select
                                        value={
                                            form.categoryId
                                        }
                                        onChange={(event) => {
                                            setSlugManuallyEdited(false);
                                            updateField(
                                                "categoryId",
                                                event
                                                    .target
                                                    .value,
                                            );
                                        }}
                                        disabled={
                                            loadingMasterData ||
                                            saving
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
                                            form.newsScope
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
                                            saving
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
                                {form.newsScope && (
                                    <Field
                                        label="Country"
                                        required
                                    // hint={
                                    //     form.newsScope === "WORLD"
                                    //         ? undefined
                                    //         : "India is automatically selected and cannot be changed for this news scope."
                                    // }
                                    >
                                        <select
                                            value={
                                                form.countryId
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
                                                form.newsScope !== "WORLD"
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
                                {(form.newsScope ===
                                    "STATE" ||
                                    form.newsScope ===
                                    "DISTRICT") && (
                                        <Field
                                            label="State"
                                            required
                                        >
                                            <select
                                                value={
                                                    form.stateId
                                                }
                                                onChange={(event) =>
                                                    handleStateChange(
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={
                                                    !selectedCountryId ||
                                                    states.length === 0 ||
                                                    saving
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
                                {form.newsScope ===
                                    "DISTRICT" && (
                                        <Field
                                            label="District"
                                            required
                                        >
                                            <select
                                                value={
                                                    form.districtId
                                                }
                                                onChange={(event) => {
                                                    setSlugManuallyEdited(false);
                                                    updateField(
                                                        "districtId",
                                                        event
                                                            .target
                                                            .value,
                                                    );
                                                }}
                                                disabled={
                                                    !selectedStateId ||
                                                    districts.length ===
                                                    0 ||
                                                    saving
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
                                    {effectiveSlug ||
                                        "Select classification or enter an English slug"}
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
                                    hint="Enter English slug text, then select Format Slug. Tamil article titles are not used to generate slugs."
                                >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <input
                                            value={effectiveSlug}
                                            onChange={(event) => {
                                                setSlugManuallyEdited(true);
                                                updateField(
                                                    "slug",
                                                    event.target.value,
                                                );
                                            }}
                                            disabled={saving}
                                            className={inputClass}
                                        />
                                        <button type="button" disabled={saving} onClick={() => { setSlugManuallyEdited(true); updateField("slug", normalizeSlug(effectiveSlug).replace(/^-+|-+$/g, "")); }} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-green-700 px-3 text-sm font-medium text-green-800 hover:bg-green-50 disabled:opacity-50"><Check size={16} /> Format Slug</button>
                                    </div>
                                </Field>

                                <Field
                                    label="Title"
                                    required
                                >
                                    <input
                                        value={
                                            form.title
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateField(
                                                "title",
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        placeholder="Enter news headline"
                                        disabled={
                                            saving
                                        }
                                        className={
                                            inputClass
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
                                            form.summary
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateField(
                                                "summary",
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        rows={1}
                                        placeholder="Short summary of the news..."
                                        disabled={
                                            saving
                                        }
                                        className={
                                            `${textareaClass} min-h-11 resize-none overflow-hidden py-2`
                                        }
                                    />
                                </Field>

                                <Field
                                    label="Content"
                                    required
                                    hint="Separate paragraphs with a blank line. The public article page will render them as separate paragraphs."
                                >
                                    <textarea
                                        value={
                                            form.content
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            updateField(
                                                "content",
                                                event
                                                    .target
                                                    .value,
                                            )
                                        }
                                        rows={16}
                                        placeholder={
                                            "First paragraph...\n\nSecond paragraph...\n\nThird paragraph..."
                                        }
                                        disabled={
                                            saving
                                        }
                                        className={`${textareaClass} leading-7`}
                                    />
                                </Field>
                            </div>
                        </Surface>

                        {createdNewsId !==
                            null && (
                                <NewsMediaUploader
                                    newsId={
                                        createdNewsId
                                    }
                                    media={
                                        media
                                    }
                                    onMediaChange={
                                        setMedia
                                    }
                                    disabled={saving || finalSaved}
                                    deferReorder
                                />
                            )}

                        {createdNewsId !== null && !finalSaved && (
                            <p className="text-sm text-gray-600">Step 3: Click Save Changes to finish. Images are optional.</p>
                        )}
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Link to="/admin/news/list">
                                <Button
                                    type="button"
                                    variant="outline"
                                    fullWidth
                                    className="sm:w-auto"
                                >
                                    Cancel
                                </Button>
                            </Link>

                            <Button
                                type={createdNewsId === null ? "submit" : "button"}
                                onClick={createdNewsId === null ? undefined : () => {
                                    if (finalSaved || saving || createdNewsId === null) return;
                                    setSaving(true);
                                    setError(null);
                                    setSuccess(null);
                                    void finalSaveNews(createdNewsId, media.map(item => item.id))
                                        .then(() => {
                                            setFinalSaved(true);
                                            setSuccess("Changes saved successfully. Further changes can be made from Edit News.");
                                        })
                                        .catch((error: unknown) => {
                                            setError(getApiErrorMessage(error) ?? "Unable to finalize news. Please retry.");
                                        })
                                        .finally(() => setSaving(false));
                                }}
                                loading={saving}
                                disabled={saving || finalSaved}
                                leftIcon={
                                    <Save
                                        size={17}
                                    />
                                }
                                fullWidth
                                className="sm:w-auto"
                            >
                                {createdNewsId !== null ? "Save Changes" : "Save Draft"}
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
