import type { FormEvent, ReactNode } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { createNews } from "@/api/news.api";
import { isAxiosError } from "axios";

import Button from "@/components/ui/Button";
import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import type { CreateNewsInput } from "@/types/news.types";

import { normalizeSlug } from "@/utils/news/slug";

import NewsMediaUploader from "@/components/news/NewsMedia/NewsMediaUploader";
import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";

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
import MainLayout from "@/layouts/MainLayout";

const ADMIN_USER_ID = 1;

interface FormState {
    title: string;
    slug: string;
    summary: string;
    content: string;
    newsScope: CreateNewsInput["newsScope"];
    countryId: string;
    stateId: string;
    districtId: string;
    categoryId: string;
}

const getApiErrorMessage = (error: unknown): string | null => {
    if (!isAxiosError(error)) {
        return null;
    }

    const data = error.response?.data as
        | {
            message?: string;
            details?: Array<{ message?: string }>;
        }
        | undefined;

    const detailMessage = data?.details
        ?.map((detail) => detail.message?.trim())
        .filter(Boolean)
        .join(" ");

    return detailMessage || data?.message?.trim() || null;
};

const INITIAL_FORM: FormState = {
    title: "",
    slug: "",
    summary: "",
    content: "",
    newsScope: "STATE",
    countryId: "",
    stateId: "",
    districtId: "",
    categoryId: "",
};

export default function AdminNewsCreatePage() {
    //const navigate = useNavigate();

    const [form, setForm] =
        useState<FormState>(INITIAL_FORM);

    const [slugEdited, setSlugEdited] =
        useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState<string | null>(null);

    const [createdNewsId, setCreatedNewsId] =
        useState<number | null>(null);

    const [media, setMedia] =
        useState<NewsMedia[]>([]);

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

    //const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMasterData =
            async () => {
                try {
                    setLoadingMasterData(true);
                    //setLoading(true);
                    const [
                        categoryResponse,
                        countryResponse,
                    ] = await Promise.all([
                        getCategories(),
                        getCountries(),
                    ]);

                    setCategories(
                        categoryResponse.data,
                    );

                    setCountries(
                        countryResponse.data,
                    );
                } catch (error) {
                    console.error(
                        "Unable to load master data:",
                        error,
                    );

                    setError(
                        "Unable to load category and location data.",
                    );
                } finally {
                    setLoadingMasterData(false);
                    //setLoading(false);
                }
            };

        void loadMasterData();
    }, []);

    useEffect(() => {
        if (!form.countryId) {
            return;
        }

        const loadStates = async () => {
            try {
                const response = await getStates(
                    Number(form.countryId),
                );

                setStates(response.data);
            } catch (error) {
                console.error(
                    "Unable to load states:",
                    error,
                );

                setStates([]);
                setError("Unable to load states.");
            }
        };

        void loadStates();
    }, [form.countryId]);

    useEffect(() => {
        if (!form.stateId) {
            return;
        }

        const loadDistricts = async () => {
            try {
                const response = await getDistricts(
                    Number(form.stateId),
                );

                setDistricts(response.data);
            } catch (error) {
                console.error(
                    "Unable to load districts:",
                    error,
                );

                setDistricts([]);
                setError("Unable to load districts.");
            }
        };

        void loadDistricts();
    }, [form.stateId]);

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

    const handleTitleChange = (
        value: string,
    ) => {
        setForm((current) => ({
            ...current,
            title: value,
            slug: slugEdited
                ? current.slug
                : normalizeSlug(value),
        }));
    };

    const handleScopeChange = (
        value: FormState["newsScope"],
    ) => {
        setForm((current) => ({
            ...current,
            newsScope: value,

            countryId:
                value === "WORLD"
                    ? ""
                    : current.countryId,

            stateId:
                value === "STATE" ||
                    value === "DISTRICT"
                    ? current.stateId
                    : "",

            districtId:
                value === "DISTRICT"
                    ? current.districtId
                    : "",
        }));

        if (
            value !== "DISTRICT"
        ) {
            setDistricts([]);
        }

        if (
            value !== "STATE" &&
            value !== "DISTRICT"
        ) {
            setStates([]);
        }
    };

    const validate = (): string | null => {
        if (!form.title.trim()) {
            return "Title is required.";
        }

        if (!form.slug.trim()) {
            return "Slug is required.";
        }

        if (!/^[a-z0-9-]+$/.test(form.slug)) {
            return "Slug can contain only lowercase letters, numbers and hyphens.";
        }

        if (!form.content.trim()) {
            return "News content is required.";
        }

        if (!form.categoryId) {
            return "Category ID is required.";
        }

        if (
            form.newsScope === "STATE" &&
            !form.stateId
        ) {
            return "State ID is required for state news.";
        }

        if (
            form.newsScope === "DISTRICT" &&
            (!form.stateId || !form.districtId)
        ) {
            return "State ID and District ID are required for district news.";
        }

        return null;
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (createdNewsId !== null) {
            return;
        }

        setError(null);
        setSuccess(null);

        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        const payload: CreateNewsInput = {
            title: form.title.trim(),
            slug: form.slug.trim(),
            summary:
                form.summary.trim() || undefined,
            content: form.content.trim(),
            newsScope: form.newsScope,
            categoryId: Number(form.categoryId),
            draftedBy: ADMIN_USER_ID,
            createdBy: ADMIN_USER_ID,
        };

        if (form.countryId) {
            payload.countryId = Number(
                form.countryId,
            );
        }

        if (form.stateId) {
            payload.stateId = Number(
                form.stateId,
            );
        }

        if (form.districtId) {
            payload.districtId = Number(
                form.districtId,
            );
        }

        try {
            setSaving(true);

            const response =
                await createNews(payload);

            setCreatedNewsId(
                response.data.id,
            );

            setSuccess(
                response.message ||
                "News article created successfully. You can now upload images.",
            );
        } catch (err) {
            console.error(err);

            const apiMessage = getApiErrorMessage(err);

            setError(
                apiMessage
                    ? `Unable to create the news article. Please check the entered information. ${apiMessage}`
                    : "Unable to create the news article. Please check the entered information.",
            );
        } finally {
            setSaving(false);
        }
    };
    // if (loading) {
    return (
        <MainLayout>
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
                    <div className="mb-6">
                        <Link
                            to="/admin/news"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700"
                        >
                            <ArrowLeft size={16} />
                            Back to News Management
                        </Link>
                    </div>

                    <div className="mb-6">
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
                            Create a new article as a draft.
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
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <Surface
                            padding="lg"
                            border="all"
                            radius="lg"
                        >
                            <div className="space-y-5">
                                <Field
                                    label="Title"
                                    required
                                >
                                    <input
                                        value={form.title}
                                        onChange={(event) =>
                                            handleTitleChange(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter news headline"
                                        className={inputClass}
                                    />
                                </Field>

                                <Field
                                    label="Slug"
                                    required
                                    hint="English lowercase URL name."
                                >
                                    <input
                                        value={form.slug}
                                        onChange={(event) => {
                                            setSlugEdited(true);

                                            updateField(
                                                "slug",
                                                normalizeSlug(
                                                    event.target.value,
                                                ),
                                            );
                                        }}
                                        placeholder="news-article-slug"
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="Summary">
                                    <textarea
                                        value={form.summary}
                                        onChange={(event) =>
                                            updateField(
                                                "summary",
                                                event.target.value,
                                            )
                                        }
                                        rows={4}
                                        placeholder="Short summary of the news..."
                                        className={textareaClass}
                                    />
                                </Field>

                                <Field
                                    label="Content"
                                    required
                                    hint="Separate paragraphs with a blank line. The public article page will render them as separate paragraphs."
                                >
                                    <textarea
                                        value={form.content}
                                        onChange={(event) =>
                                            updateField(
                                                "content",
                                                event.target.value,
                                            )
                                        }
                                        rows={16}
                                        placeholder={
                                            "First paragraph...\n\nSecond paragraph...\n\nThird paragraph..."
                                        }
                                        className={`${textareaClass} leading-7`}
                                    />
                                </Field>
                            </div>
                        </Surface>

                        {createdNewsId && (
                            <NewsMediaUploader
                                newsId={createdNewsId}
                                media={media}
                                onMediaChange={setMedia}
                                disabled={saving}
                            />
                        )}

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
                                <Field
                                    label="News Scope"
                                    required
                                >
                                    <select
                                        value={form.newsScope}
                                        onChange={(event) =>
                                            handleScopeChange(
                                                event.target.value as FormState["newsScope"],
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="STATE">
                                            State
                                        </option>

                                        <option value="DISTRICT">
                                            District
                                        </option>

                                        <option value="INDIA">
                                            India
                                        </option>

                                        <option value="WORLD">
                                            World
                                        </option>
                                    </select>
                                </Field>

                                <Field
                                    label="Category"
                                    required
                                >
                                    <select
                                        value={form.categoryId}
                                        onChange={(event) =>
                                            updateField(
                                                "categoryId",
                                                event.target.value,
                                            )
                                        }
                                        disabled={loadingMasterData}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select category
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.displayName}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </Field>

                                {(form.newsScope ===
                                    "INDIA" ||
                                    form.newsScope ===
                                    "STATE" ||
                                    form.newsScope ===
                                    "DISTRICT") && (
                                        <Field label="Country">
                                            <select
                                                value={form.countryId}
                                                onChange={(event) => {
                                                    updateField(
                                                        "countryId",
                                                        event.target.value,
                                                    );

                                                    updateField(
                                                        "stateId",
                                                        "",
                                                    );

                                                    updateField(
                                                        "districtId",
                                                        "",
                                                    );

                                                    setStates([]);
                                                    setDistricts([]);
                                                }}
                                                disabled={
                                                    loadingMasterData
                                                }
                                                className={inputClass}
                                            >
                                                <option value="">
                                                    Select country
                                                </option>

                                                {countries.map(
                                                    (country) => (
                                                        <option
                                                            key={country.id}
                                                            value={country.id}
                                                        >
                                                            {country.displayName}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </Field>
                                    )}

                                {(form.newsScope ===
                                    "STATE" ||
                                    form.newsScope ===
                                    "DISTRICT") && (
                                        <Field label="State">
                                            <select
                                                value={form.stateId}
                                                onChange={(event) => {
                                                    updateField(
                                                        "stateId",
                                                        event.target.value,
                                                    );

                                                    updateField(
                                                        "districtId",
                                                        "",
                                                    );

                                                    setDistricts([]);
                                                }}
                                                disabled={
                                                    !form.countryId ||
                                                    states.length === 0
                                                }
                                                className={inputClass}
                                            >
                                                <option value="">
                                                    Select state
                                                </option>

                                                {states.map(
                                                    (state) => (
                                                        <option
                                                            key={state.id}
                                                            value={state.id}
                                                        >
                                                            {state.displayName}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </Field>
                                    )}

                                {form.newsScope ===
                                    "DISTRICT" && (
                                        <Field label="District">
                                            <select
                                                value={
                                                    form.districtId
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "districtId",
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={
                                                    !form.stateId ||
                                                    districts.length === 0
                                                }
                                                className={
                                                    inputClass
                                                }
                                            >
                                                <option value="">
                                                    Select district
                                                </option>

                                                {districts.map(
                                                    (district) => (
                                                        <option
                                                            key={district.id}
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
                        </Surface>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Link to="/admin/news">
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
                                type="submit"
                                loading={saving}
                                disabled={createdNewsId !== null || saving}
                                leftIcon={<Save size={17} />}
                                fullWidth
                                className="sm:w-auto"
                            >
                                {createdNewsId !== null ? "Draft Saved" : "Save Draft"}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </MainLayout>
    );
    // }
}

const inputClass =
    "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100";

const textareaClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100";

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
//////////////////////////////
