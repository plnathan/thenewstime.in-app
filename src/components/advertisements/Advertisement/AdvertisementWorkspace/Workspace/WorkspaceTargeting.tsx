import { BUSINESS_TIME_ZONE } from "@/helpers/businessTimeZone.helpers";
import { confirmDialog } from "@/components/ui/Dialog/confirmDialog";
import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    AlertCircle,
    Check,
    LoaderCircle,
    Plus,
    RefreshCw,
    Save,
    Trash2,
    X,
} from "lucide-react";

import {
    createAdvertisementTarget,
    deleteAdvertisementTarget,
    getAdvertisementTargets,
    updateAdvertisementTarget,
} from "@/api/advertisements/advertisement.api";

import type {
    AdvertisementTarget,
    AdvertisementTargetType,
    CreateAdvertisementTargetInput,
    AdvertisementDetails,
} from "@/api/advertisements/advertisement.api";

import {
    getApiErrorMessage,
} from "@/helpers/advertisementManagement.helpers";

interface WorkspaceTargetingProps {
    advertisement: AdvertisementDetails;
    canEditTargeting?: boolean;
    onSaved?: () => void | Promise<void>;
}

interface TargetDraft {
    targetType: AdvertisementTargetType;
    targetValue: string;
    isInclude: boolean;
}

interface TargetTypeOption {
    value: AdvertisementTargetType;
    label: string;
    placeholder: string;
    description: string;
}

const TARGET_TYPES: readonly TargetTypeOption[] = [
    {
        value: "SITE",
        label: "Site",
        placeholder: "e.g. thenewstime.in",
        description: "Target a website or site identifier.",
    },
    {
        value: "NEWS",
        label: "News",
        placeholder: "Enter a news article ID",
        description: "Target a specific news article by its numeric ID.",
    },
    {
        value: "CATEGORY",
        label: "Category",
        placeholder: "e.g. Politics",
        description: "Target news belonging to a category.",
    },
    {
        value: "STATE",
        label: "State",
        placeholder: "e.g. Tamil Nadu",
        description: "Target news associated with a state.",
    },
    {
        value: "DISTRICT",
        label: "District",
        placeholder: "e.g. Chengalpattu",
        description: "Target news associated with a district.",
    },
    {
        value: "COUNTRY",
        label: "Country",
        placeholder: "e.g. India",
        description: "Target news associated with a country.",
    },
];

const EMPTY_DRAFT: TargetDraft = {
    targetType: "CATEGORY",
    targetValue: "",
    isInclude: true,
};

const inputClassName = `
    block
    min-h-10
    w-full
    rounded-md
    border
    border-gray-300
    bg-white
    px-3
    py-2
    text-sm
    text-gray-900
    shadow-sm
    outline-none
    placeholder:text-gray-400
    focus:border-green-600
    focus:ring-2
    focus:ring-green-600/20
    disabled:cursor-not-allowed
    disabled:bg-gray-100
    disabled:text-gray-500
`;

const buttonClassName = `
    inline-flex
    min-h-10
    items-center
    justify-center
    gap-2
    rounded-md
    px-4
    py-2
    text-sm
    font-semibold
    transition
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:cursor-not-allowed
    disabled:opacity-60
`;

function getTargetTypeLabel(
    targetType: AdvertisementTargetType,
): string {
    return (
        TARGET_TYPES.find(
            (type) => type.value === targetType,
        )?.label ?? targetType
    );
}

function getTargetTypePlaceholder(
    targetType: AdvertisementTargetType,
): string {
    return (
        TARGET_TYPES.find(
            (type) => type.value === targetType,
        )?.placeholder ?? "Enter a target value"
    );
}

function getTargetTypeDescription(
    targetType: AdvertisementTargetType,
): string {
    return (
        TARGET_TYPES.find(
            (type) => type.value === targetType,
        )?.description ?? ""
    );
}

function validateDraft(
    draft: TargetDraft,
): string | null {
    const value = draft.targetValue.trim();

    if (!value) {
        return "Enter a target value.";
    }

    if (value.length > 255) {
        return "The target value cannot exceed 255 characters.";
    }

    if (
        !TARGET_TYPES.some(
            (type) => type.value === draft.targetType,
        )
    ) {
        return "Select a valid target type.";
    }

    if (draft.targetType === "NEWS") {
        if (!/^[1-9]\d*$/.test(value)) {
            return "A news target must be a positive integer ID.";
        }

        const newsId = Number(value);

        if (!Number.isSafeInteger(newsId)) {
            return "Enter a valid news article ID.";
        }
    }

    return null;
}

function toTargetPayload(
    draft: TargetDraft,
): CreateAdvertisementTargetInput {
    return {
        targetType: draft.targetType,
        targetValue: draft.targetValue.trim(),
        isInclude: draft.isInclude,
    };
}

/**
 * Formats an audit timestamp without throwing when the API
 * returns a missing or invalid date.
 */
function formatAuditDate(
    value: string | null | undefined,
): string {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
        timeZone: BUSINESS_TIME_ZONE,
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

/**
 * Resolve an audit user's display name.
 *
 * Prefer the backend-provided name. Do not present a numeric
 * database user ID as if it were the user's name.
 */
function getAuditUserName(
    name: string | null | undefined,
): string {
    const normalizedName = name?.trim();

    return normalizedName || "Not available";
}

const WorkspaceTargeting = ({
    advertisement,
    canEditTargeting = true,
    onSaved,
}: WorkspaceTargetingProps) => {
    const [targets, setTargets] = useState<AdvertisementTarget[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(
        null,
    );

    const [draft, setDraft] = useState<TargetDraft>({
        ...EMPTY_DRAFT,
    });

    const [editingTargetId, setEditingTargetId] = useState<number | null>(
        null,
    );

    const [editDraft, setEditDraft] = useState<TargetDraft>({
        ...EMPTY_DRAFT,
    });

    const loadTargets = useCallback(
        async (
            showLoadingState = true,
        ): Promise<void> => {
            if (showLoadingState) {
                setLoading(true);
            }

            setError(null);

            try {
                const response = await getAdvertisementTargets(
                    advertisement.id,
                );

                if (
                    !response.success ||
                    !Array.isArray(response.data)
                ) {
                    throw new Error(
                        response.message ||
                        "The server returned invalid targeting data.",
                    );
                }

                setTargets(response.data);
            } catch (loadError) {
                setError(
                    getApiErrorMessage(loadError),
                );
            } finally {
                setLoading(false);
            }
        },
        [
            advertisement.id,
        ],
    );

    /**
     * Load rules through the same callback used by Refresh and
     * retry actions, avoiding duplicate initial API requests.
     */
    useEffect(() => {
        let cancelled = false;

        const fetchTargets = async (): Promise<void> => {
            setLoading(true);
            setError(null);

            try {
                const response = await getAdvertisementTargets(
                    advertisement.id,
                );

                if (cancelled) {
                    return;
                }

                if (
                    !response.success ||
                    !Array.isArray(response.data)
                ) {
                    throw new Error(
                        response.message ||
                        "Unable to load advertisement targeting rules.",
                    );
                }

                setTargets(response.data);
            } catch (loadError) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Unable to load advertisement targeting rules:",
                    loadError,
                );

                setError(
                    getApiErrorMessage(loadError),
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void fetchTargets();

        return () => {
            cancelled = true;
        };
    }, [
        advertisement.id,
    ]);

    const resetMessages = (): void => {
        setError(null);
        setFormError(null);
        setSuccessMessage(null);
    };

    const cancelEdit = (): void => {
        setEditingTargetId(null);
        setEditDraft({
            ...EMPTY_DRAFT,
        });
        setFormError(null);
    };

    const handleAddTarget = async (): Promise<void> => {
        resetMessages();

        if (!canEditTargeting) {
            setFormError(
                "You do not have permission to edit targeting.",
            );
            return;
        }

        const validationError = validateDraft(draft);

        if (validationError) {
            setFormError(validationError);
            return;
        }

        setSaving(true);

        try {
            const response = await createAdvertisementTarget(
                advertisement.id,
                toTargetPayload(draft),
            );

            if (
                !response.success ||
                !response.data
            ) {
                throw new Error(
                    response.message ||
                    "Failed to create the targeting rule.",
                );
            }

            setDraft({
                ...EMPTY_DRAFT,
            });

            setSuccessMessage(
                "Targeting rule added successfully.",
            );

            /*
             * Reload the persisted record so the displayed
             * audit name and timestamps come from the server.
             */
            await loadTargets(false);
            await onSaved?.();
        } catch (saveError) {
            setError(
                getApiErrorMessage(saveError),
            );
        } finally {
            setSaving(false);
        }
    };

    const beginEdit = (
        target: AdvertisementTarget,
    ): void => {
        if (!canEditTargeting || saving) {
            return;
        }

        resetMessages();

        setEditingTargetId(target.id);

        setEditDraft({
            targetType: target.targetType,
            targetValue: target.targetValue,
            isInclude: target.isInclude,
        });
    };

    const handleUpdateTarget = async (
        targetId: number,
    ): Promise<void> => {
        resetMessages();

        if (!canEditTargeting) {
            setFormError(
                "You do not have permission to edit targeting.",
            );
            return;
        }

        const validationError = validateDraft(editDraft);

        if (validationError) {
            setFormError(validationError);
            return;
        }

        setSaving(true);

        try {
            const response = await updateAdvertisementTarget(
                advertisement.id,
                targetId,
                toTargetPayload(editDraft),
            );

            if (
                !response.success ||
                !response.data
            ) {
                throw new Error(
                    response.message ||
                    "Failed to update the targeting rule.",
                );
            }

            cancelEdit();

            setSuccessMessage(
                "Targeting rule updated successfully.",
            );

            await loadTargets(false);
            await onSaved?.();
        } catch (saveError) {
            setError(
                getApiErrorMessage(saveError),
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTarget = async (
        target: AdvertisementTarget,
    ): Promise<void> => {
        if (!canEditTargeting || saving) {
            return;
        }

        const confirmed = await confirmDialog(
            `Delete the ${getTargetTypeLabel(target.targetType)} targeting rule "${target.targetValue}"?`,
        );

        if (!confirmed) {
            return;
        }

        resetMessages();
        setSaving(true);

        try {
            const response = await deleteAdvertisementTarget(
                advertisement.id,
                target.id,
            );

            if (!response.success) {
                throw new Error(
                    response.message ||
                    "Failed to delete the targeting rule.",
                );
            }

            if (editingTargetId === target.id) {
                cancelEdit();
            }

            setSuccessMessage(
                "Targeting rule deleted successfully.",
            );

            await loadTargets(false);
            await onSaved?.();
        } catch (deleteError) {
            setError(
                getApiErrorMessage(deleteError),
            );
        } finally {
            setSaving(false);
        }
    };

    const renderTargetForm = (
        value: TargetDraft,
        onChange: (nextValue: TargetDraft) => void,
        onSubmit: () => void,
        submitLabel: string,
        submitIcon: "add" | "save",
        formId: string,
    ) => (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label
                    htmlFor={`${formId}-type`}
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                    Target type
                </label>

                <select
                    id={`${formId}-type`}
                    className={inputClassName}
                    value={value.targetType}
                    disabled={saving || !canEditTargeting}
                    onChange={(event) => {
                        onChange({
                            ...value,
                            targetType: event.target.value as AdvertisementTargetType,
                        });
                    }}
                >
                    {TARGET_TYPES.map((type) => (
                        <option
                            key={type.value}
                            value={type.value}
                        >
                            {type.label}
                        </option>
                    ))}
                </select>

                <p className="mt-1 text-xs text-gray-500">
                    {getTargetTypeDescription(value.targetType)}
                </p>
            </div>

            <div>
                <label
                    htmlFor={`${formId}-value`}
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                    Target value
                </label>

                <input
                    id={`${formId}-value`}
                    className={inputClassName}
                    value={value.targetValue}
                    maxLength={255}
                    placeholder={getTargetTypePlaceholder(
                        value.targetType,
                    )}
                    disabled={saving || !canEditTargeting}
                    onChange={(event) => {
                        onChange({
                            ...value,
                            targetValue: event.target.value,
                        });
                    }}
                />

                {value.targetType === "NEWS" && (
                    <p className="mt-1 text-xs text-gray-500">
                        Enter the positive numeric ID of the news article.
                    </p>
                )}
            </div>

            <div className="md:col-span-2">
                <fieldset>
                    <legend className="mb-2 text-sm font-medium text-gray-700">
                        Targeting behavior
                    </legend>

                    <div className="flex flex-wrap gap-3">
                        <label
                            className={`
                                flex
                                cursor-pointer
                                items-center
                                gap-2
                                rounded-md
                                border
                                px-3
                                py-2
                                text-sm
                                ${value.isInclude
                                    ? "border-green-300 bg-green-50 text-green-800"
                                    : "border-gray-200 bg-white text-gray-600"
                                }
                            `}
                        >
                            <input
                                type="radio"
                                name={`${formId}-behavior`}
                                checked={value.isInclude}
                                disabled={saving || !canEditTargeting}
                                onChange={() =>
                                    onChange({
                                        ...value,
                                        isInclude: true,
                                    })
                                }
                            />

                            Include
                        </label>

                        <label
                            className={`
                                flex
                                cursor-pointer
                                items-center
                                gap-2
                                rounded-md
                                border
                                px-3
                                py-2
                                text-sm
                                ${!value.isInclude
                                    ? "border-amber-300 bg-amber-50 text-amber-800"
                                    : "border-gray-200 bg-white text-gray-600"
                                }
                            `}
                        >
                            <input
                                type="radio"
                                name={`${formId}-behavior`}
                                checked={!value.isInclude}
                                disabled={saving || !canEditTargeting}
                                onChange={() =>
                                    onChange({
                                        ...value,
                                        isInclude: false,
                                    })
                                }
                            />

                            Exclude
                        </label>
                    </div>
                </fieldset>
            </div>

            <div className="md:col-span-2">
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={saving || !canEditTargeting}
                    className={`
                        ${buttonClassName}
                        bg-green-700
                        text-white
                        hover:bg-green-800
                        focus:ring-green-600
                    `}
                >
                    {submitIcon === "add" ? (
                        <Plus
                            size={16}
                            aria-hidden="true"
                        />
                    ) : (
                        <Save
                            size={16}
                            aria-hidden="true"
                        />
                    )}

                    {submitLabel}
                </button>
            </div>
        </div>
    );

    const includeCount = targets.filter(
        (target) => target.isInclude,
    ).length;

    const excludeCount = targets.length - includeCount;

    return (
        <section className="space-y-6">
            <header className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Targeting
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                            Control which site, news article, category, state,
                            district, or country this advertisement targets.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadTargets()}
                        disabled={loading || saving}
                        className={`
                            ${buttonClassName}
                            border
                            border-gray-300
                            bg-white
                            text-gray-700
                            hover:bg-gray-50
                            focus:ring-green-600
                        `}
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading ? "animate-spin" : ""
                            }
                            aria-hidden="true"
                        />

                        Refresh
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Total rules
                        </p>

                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                            {targets.length}
                        </p>
                    </div>

                    <div className="rounded-lg bg-green-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                            Include
                        </p>

                        <p className="mt-1 text-2xl font-semibold text-green-800">
                            {includeCount}
                        </p>
                    </div>

                    <div className="rounded-lg bg-amber-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                            Exclude
                        </p>

                        <p className="mt-1 text-2xl font-semibold text-amber-800">
                            {excludeCount}
                        </p>
                    </div>
                </div>
            </header>

            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                    <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                    />

                    <div className="min-w-0 flex-1">
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => void loadTargets()}
                            disabled={loading || saving}
                            className="mt-2 font-semibold underline underline-offset-2 hover:text-red-900 disabled:opacity-60"
                        >
                            Try loading again
                        </button>
                    </div>
                </div>
            )}

            {successMessage && (
                <div
                    role="status"
                    className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                >
                    <Check
                        size={18}
                        aria-hidden="true"
                    />

                    {successMessage}
                </div>
            )}

            {!canEditTargeting && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Targeting is displayed in read-only mode because editing
                    is not permitted in the current workflow state.
                </div>
            )}

            {canEditTargeting && (
                <section className="rounded-xl border border-gray-200 bg-white p-5">
                    <h3 className="text-base font-semibold text-gray-900">
                        Add targeting rule
                    </h3>

                    <p className="mb-4 mt-1 text-sm text-gray-600">
                        Add a rule to include or exclude matching content.
                    </p>

                    {renderTargetForm(
                        draft,
                        setDraft,
                        () => void handleAddTarget(),
                        "Add Targeting Rule",
                        "add",
                        "new-target",
                    )}

                    {formError && editingTargetId === null && (
                        <p
                            className="mt-3 text-sm text-red-600"
                            role="alert"
                        >
                            {formError}
                        </p>
                    )}
                </section>
            )}

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-4">
                    <h3 className="text-base font-semibold text-gray-900">
                        Saved targeting rules
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Rules saved for Advertisement #{advertisement.id}.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500">
                        <LoaderCircle
                            size={18}
                            className="animate-spin"
                            aria-hidden="true"
                        />

                        Loading targeting rules...
                    </div>
                ) : error && targets.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm font-medium text-gray-700">
                            Targeting rules could not be loaded
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Use the retry action above to try again.
                        </p>
                    </div>
                ) : targets.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            <AlertCircle
                                size={22}
                                aria-hidden="true"
                            />
                        </div>

                        <p className="mt-3 text-sm font-medium text-gray-700">
                            No targeting rules configured
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            This advertisement currently has no saved
                            targeting criteria.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {targets.map((target) => {
                            const isEditing =
                                editingTargetId === target.id;

                            return (
                                <article
                                    key={target.id}
                                    className="p-5"
                                >
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900">
                                                    Edit targeting rule
                                                </h4>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Rule Configured By:{" "}
                                                    <span className="font-medium text-gray-700">
                                                        {getAuditUserName(
                                                            target.createdByName,
                                                        )}
                                                    </span>
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Configured At:{" "}
                                                    <span className="font-medium text-gray-700">
                                                        {formatAuditDate(
                                                            target.createdAt,
                                                        )}
                                                    </span>
                                                </p>
                                            </div>

                                            {renderTargetForm(
                                                editDraft,
                                                setEditDraft,
                                                () =>
                                                    void handleUpdateTarget(
                                                        target.id,
                                                    ),
                                                "Save Changes",
                                                "save",
                                                `edit-target-${target.id}`,
                                            )}

                                            {formError && (
                                                <p
                                                    className="text-sm text-red-600"
                                                    role="alert"
                                                >
                                                    {formError}
                                                </p>
                                            )}

                                            <button
                                                type="button"
                                                onClick={cancelEdit}
                                                disabled={saving}
                                                className={`
                                                    ${buttonClassName}
                                                    border
                                                    border-gray-300
                                                    bg-white
                                                    text-gray-700
                                                    hover:bg-gray-50
                                                    focus:ring-green-600
                                                `}
                                            >
                                                <X
                                                    size={16}
                                                    aria-hidden="true"
                                                />

                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                                        {getTargetTypeLabel(
                                                            target.targetType,
                                                        )}
                                                    </span>

                                                    <span
                                                        className={`
                                                            rounded-md
                                                            px-2.5
                                                            py-1
                                                            text-xs
                                                            font-semibold
                                                            ${target.isInclude
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-amber-100 text-amber-800"
                                                            }
                                                        `}
                                                    >
                                                        {target.isInclude
                                                            ? "Include"
                                                            : "Exclude"}
                                                    </span>
                                                </div>

                                                <p className="mt-2 wrap-break-word text-sm font-semibold text-gray-900">
                                                    {target.targetValue}
                                                </p>

                                                <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                                                    <div>
                                                        <dt className="text-xs text-gray-500">
                                                            Rule Configured By
                                                        </dt>

                                                        <dd className="mt-0.5 wrap-break-word text-sm font-medium text-gray-800">
                                                            {getAuditUserName(
                                                                target.createdByName,
                                                            )}
                                                        </dd>
                                                    </div>

                                                    <div>
                                                        <dt className="text-xs text-gray-500">
                                                            Configured At
                                                        </dt>

                                                        <dd className="mt-0.5 text-sm text-gray-700">
                                                            {formatAuditDate(
                                                                target.createdAt,
                                                            )}
                                                        </dd>
                                                    </div>

                                                    <div>
                                                        <dt className="text-xs text-gray-500">
                                                            Last Updated By
                                                        </dt>

                                                        <dd className="mt-0.5 wrap-break-word text-sm text-gray-700">
                                                            {getAuditUserName(
                                                                target.updatedByName,
                                                            )}
                                                        </dd>
                                                    </div>

                                                    <div>
                                                        <dt className="text-xs text-gray-500">
                                                            Last Updated At
                                                        </dt>

                                                        <dd className="mt-0.5 text-sm text-gray-700">
                                                            {formatAuditDate(
                                                                target.updatedAt,
                                                            )}
                                                        </dd>
                                                    </div>
                                                </dl>
                                            </div>

                                            {canEditTargeting && (
                                                <div className="flex shrink-0 flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            beginEdit(target)
                                                        }
                                                        disabled={saving}
                                                        className={`
                                                            ${buttonClassName}
                                                            border
                                                            border-gray-300
                                                            bg-white
                                                            text-gray-700
                                                            hover:bg-gray-50
                                                            focus:ring-green-600
                                                        `}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void handleDeleteTarget(
                                                                target,
                                                            )
                                                        }
                                                        disabled={saving}
                                                        className={`
                                                            ${buttonClassName}
                                                            border
                                                            border-red-200
                                                            bg-white
                                                            text-red-700
                                                            hover:bg-red-50
                                                            focus:ring-red-500
                                                        `}
                                                    >
                                                        <Trash2
                                                            size={16}
                                                            aria-hidden="true"
                                                        />

                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {saving && (
                <p
                    className="flex items-center gap-2 text-sm text-gray-500"
                    role="status"
                >
                    <LoaderCircle
                        size={16}
                        className="animate-spin"
                        aria-hidden="true"
                    />

                    Saving targeting changes...
                </p>
            )}
        </section>
    );
};

export default WorkspaceTargeting;