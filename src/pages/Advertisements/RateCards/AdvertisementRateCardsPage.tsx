import AdvertisementAdminPageHeader from "@/components/ui/AdvertisementAdminPageHeader";
import AdminListPagination from "../../../components/ui/AdminListPagination";
import { Link } from "react-router-dom";
import { confirmDialog } from "@/components/ui/Dialog/confirmDialog";
import MainLayout from "@/layouts/MainLayout";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Archive,
    CalendarClock,
    CheckCircle2,

    LoaderCircle,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    ShieldAlert,
    X,
} from "lucide-react";

import {
    archiveAdvertisementRateCard,
    createAdvertisementRateCard,
    deactivateAdvertisementRateCard,
    getAdvertisementRateCards,
    updateAdvertisementRateCard,
} from "@/api/advertisements/rate-cards.api";

import type {
    AdvertisementRateCard,
    AdvertisementRateCardPricingUnit,
    AdvertisementRateCardSearchFilters,
    AdvertisementRateCardStatus,
    CreateAdvertisementRateCardInput,
    UpdateAdvertisementRateCardInput,
} from "@/api/advertisements/rate-cards.api";

import type {
    AdvertisementPlacement,
} from "@/api/advertisements/placements.api";

import {
    getAdvertisementPlacements,
} from "@/api/advertisements/placements.api";

type RateCardFormValues = {
    placementId: string;
    pricingUnit: AdvertisementRateCardPricingUnit;
    rateAmount: string;
    currencyCode: string;
    effectiveFrom: string;
    effectiveTo: string;
    status: AdvertisementRateCardStatus;
};

type ApiErrorShape = {
    response?: {
        data?: {
            message?: string;
            errors?: unknown;
        };
    };
    message?: string;
};

const PRICING_UNITS: {
    value: AdvertisementRateCardPricingUnit;
    label: string;
}[] = [
        { value: "DAY", label: "Per day" },
        { value: "WEEK", label: "Per week" },
        { value: "MONTH", label: "Per month" },
        { value: "IMPRESSION", label: "Per impression" },
        { value: "CAMPAIGN", label: "Per campaign" },
        { value: "FIXED", label: "Fixed rate" },
    ];

const RATE_CARD_STATUSES: AdvertisementRateCardStatus[] = [
    "ACTIVE",
    "INACTIVE",
    "ARCHIVED",
];

const EMPTY_FORM: RateCardFormValues = {
    placementId: "",
    pricingUnit: "DAY",
    rateAmount: "",
    currencyCode: "INR",
    effectiveFrom: "",
    effectiveTo: "",
    status: "ACTIVE",
};

const getErrorMessage = (
    error: unknown,
    fallback: string,
): string => {
    const apiError = error as ApiErrorShape;

    return (
        apiError.response?.data?.message ??
        apiError.message ??
        fallback
    );
};

const toDateTimeLocal = (
    value: string | Date | null | undefined,
): string => {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const pad = (part: number): string => String(part).padStart(2, "0");

    return [
        date.getFullYear(),
        "-",
        pad(date.getMonth() + 1),
        "-",
        pad(date.getDate()),
        "T",
        pad(date.getHours()),
        ":",
        pad(date.getMinutes()),
    ].join("");
};

const formatDateTime = (
    value: string | Date | null | undefined,
): string => {
    if (value === null || value === undefined || value === "") {
        return "No end date";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const formatAmount = (
    amount: number,
    currencyCode: string,
): string => {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currencyCode,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currencyCode} ${amount.toFixed(2)}`;
    }
};

const getStatusClasses = (
    status: AdvertisementRateCardStatus,
): string => {
    switch (status) {
        case "ACTIVE":
            return "bg-green-50 text-green-800 ring-green-600/20";
        case "INACTIVE":
            return "bg-gray-100 text-gray-700 ring-gray-500/20";
        case "ARCHIVED":
            return "bg-amber-50 text-amber-800 ring-amber-600/20";
        default:
            return "bg-gray-100 text-gray-700 ring-gray-500/20";
    }
};

const getPlacementLabel = (
    placement: AdvertisementPlacement,
): string => `${placement.displayName} (${placement.code})`;

const createFormFromRateCard = (
    rateCard: AdvertisementRateCard,
): RateCardFormValues => ({
    placementId: String(rateCard.placementId),
    pricingUnit: rateCard.pricingUnit,
    rateAmount: String(rateCard.rateAmount),
    currencyCode: rateCard.currencyCode,
    effectiveFrom: toDateTimeLocal(rateCard.effectiveFrom),
    effectiveTo: toDateTimeLocal(rateCard.effectiveTo),
    status: rateCard.status,
});

const AdvertisementRateCardsPage = () => {
    const [rateCards, setRateCards] = useState<AdvertisementRateCard[]>([]);
    const [placements, setPlacements] = useState<AdvertisementPlacement[]>([]);

    const [loading, setLoading] = useState(true);
    const [placementsLoading, setPlacementsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState<number | null>(null);

    const [pageError, setPageError] = useState("");
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [searchText, setSearchText] = useState("");
    const [filterPlacementId, setFilterPlacementId] = useState("");
    const [filterPricingUnit, setFilterPricingUnit] = useState("");
    const [filterStatus, setFilterStatus] =
        useState<AdvertisementRateCardStatus | "">("");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRateCard, setEditingRateCard] =
        useState<AdvertisementRateCard | null>(null);
    const [form, setForm] = useState<RateCardFormValues>(EMPTY_FORM);

    useEffect(() => {
        let active = true;

        const load = async (): Promise<void> => {
            try {
                const response = await getAdvertisementPlacements();

                if (!active) {
                    return;
                }

                setPlacements(
                    response.data.filter(
                        (placement) =>
                            placement.status === "ACTIVE" &&
                            placement.isEnabled,
                    ),
                );
            } catch (error) {
                if (active) {
                    setPageError(
                        getErrorMessage(
                            error,
                            "Unable to load advertisement placements.",
                        ),
                    );
                }
            } finally {
                if (active) {
                    setPlacementsLoading(false);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const load = async (): Promise<void> => {
            setPageError("");

            const filters: AdvertisementRateCardSearchFilters = {};

            if (filterPlacementId !== "") {
                filters.placementId = Number(filterPlacementId);
            }

            if (filterPricingUnit !== "") {
                filters.pricingUnit =
                    filterPricingUnit as AdvertisementRateCardPricingUnit;
            }

            if (filterStatus !== "") {
                filters.status = filterStatus;
            }

            try {
                const results = await getAdvertisementRateCards(filters);

                if (active) {
                    setRateCards(results);
                }
            } catch (error) {
                if (active) {
                    setPageError(
                        getErrorMessage(
                            error,
                            "Unable to load advertisement rate cards.",
                        ),
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [filterPlacementId, filterPricingUnit, filterStatus]);


    const refreshData = (): void => {
        setLoading(true);
        setPlacementsLoading(true);

        void Promise.allSettled([
            getAdvertisementPlacements().then((response) => {
                setPlacements(
                    response.data.filter(
                        (placement) =>
                            placement.status === "ACTIVE" &&
                            placement.isEnabled,
                    ),
                );
            }),
            getAdvertisementRateCards({
                ...(filterPlacementId !== ""
                    ? { placementId: Number(filterPlacementId) }
                    : {}),
                ...(filterPricingUnit !== ""
                    ? {
                        pricingUnit:
                            filterPricingUnit as AdvertisementRateCardPricingUnit,
                    }
                    : {}),
                ...(filterStatus !== "" ? { status: filterStatus } : {}),
            }).then(setRateCards),
        ]).then((results) => {
            const failures = results.filter(
                (result) => result.status === "rejected",
            );

            if (failures.length > 0) {
                setPageError("Unable to refresh all advertisement rate card data.");
            }

            setLoading(false);
            setPlacementsLoading(false);
        });
    };

    const placementById = useMemo(
        () =>
            new Map(
                placements.map((placement) => [placement.id, placement]),
            ),
        [placements],
    );

    const visibleRateCards = useMemo(() => {
        const search = searchText.trim().toLowerCase();

        if (!search) {
            return rateCards;
        }

        return rateCards.filter((rateCard) => {
            const placement = placementById.get(rateCard.placementId);
            const placementText = placement
                ? `${placement.displayName} ${placement.code} ${placement.pageType}`
                : String(rateCard.placementId);

            return [
                String(rateCard.id),
                placementText,
                rateCard.pricingUnit,
                rateCard.currencyCode,
                rateCard.status,
                String(rateCard.rateAmount),
            ].some((value) => value.toLowerCase().includes(search));
        });
    }, [placementById, rateCards, searchText]);

    const openCreateForm = (): void => {
        setEditingRateCard(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setSuccessMessage("");
        setIsFormOpen(true);
    };

    const openEditForm = (rateCard: AdvertisementRateCard): void => {
        setEditingRateCard(rateCard);
        setForm(createFormFromRateCard(rateCard));
        setFormError("");
        setSuccessMessage("");
        setIsFormOpen(true);
    };

    const closeForm = (): void => {
        if (saving) {
            return;
        }

        setIsFormOpen(false);
        setEditingRateCard(null);
        setForm(EMPTY_FORM);
        setFormError("");
    };

    const updateFormField = <K extends keyof RateCardFormValues>(
        field: K,
        value: RateCardFormValues[K],
    ): void => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const validateForm = (): string | null => {
        const placementId = Number(form.placementId);
        const rateAmount = Number(form.rateAmount);
        const currencyCode = form.currencyCode.trim().toUpperCase();

        if (!Number.isInteger(placementId) || placementId <= 0) {
            return "Choose an advertisement placement.";
        }

        if (form.rateAmount.trim() === "" || !Number.isFinite(rateAmount)) {
            return "Enter a valid rate amount.";
        }

        if (rateAmount < 0) {
            return "Rate amount cannot be negative.";
        }

        if (!/^[A-Z]{3}$/.test(currencyCode)) {
            return "Enter a three-letter currency code, such as INR.";
        }

        if (!form.effectiveFrom) {
            return "Choose the effective-from date and time.";
        }

        const effectiveFrom = new Date(form.effectiveFrom);

        if (Number.isNaN(effectiveFrom.getTime())) {
            return "The effective-from date is invalid.";
        }

        if (form.effectiveTo) {
            const effectiveTo = new Date(form.effectiveTo);

            if (Number.isNaN(effectiveTo.getTime())) {
                return "The effective-to date is invalid.";
            }

            if (effectiveTo <= effectiveFrom) {
                return "The effective-to date must be later than the effective-from date.";
            }
        }

        if (
            !editingRateCard &&
            form.status === "ARCHIVED"
        ) {
            return "Create the rate card first, then archive it.";
        }

        return null;
    };

    const handleSave = async (
        event: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();
        setFormError("");
        setSuccessMessage("");

        const validationError = validateForm();

        if (validationError) {
            setFormError(validationError);
            return;
        }

        const input: CreateAdvertisementRateCardInput = {
            placementId: Number(form.placementId),
            pricingUnit: form.pricingUnit,
            rateAmount: Number(form.rateAmount),
            currencyCode: form.currencyCode.trim().toUpperCase(),
            effectiveFrom: new Date(form.effectiveFrom).toISOString(),
            effectiveTo: form.effectiveTo
                ? new Date(form.effectiveTo).toISOString()
                : null,
            status: form.status,
        };

        setSaving(true);

        try {
            if (editingRateCard) {
                const updateInput: UpdateAdvertisementRateCardInput = {
                    ...input,
                };

                await updateAdvertisementRateCard(
                    editingRateCard.id,
                    updateInput,
                );

                setSuccessMessage("Rate card updated successfully.");
            } else {
                await createAdvertisementRateCard(input);
                setSuccessMessage("Rate card created successfully.");
            }

            setIsFormOpen(false);
            setEditingRateCard(null);
            setForm(EMPTY_FORM);
            refreshData();
        } catch (error) {
            setFormError(
                getErrorMessage(
                    error,
                    "Unable to save the rate card. Check the entered values and try again.",
                ),
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (
        rateCard: AdvertisementRateCard,
    ): Promise<void> => {
        const confirmed = await confirmDialog(
            `Deactivate rate card #${rateCard.id}? It will no longer be selected as an active rate.`,
        );

        if (!confirmed) {
            return;
        }

        setActionId(rateCard.id);
        setPageError("");
        setSuccessMessage("");

        try {
            await deactivateAdvertisementRateCard(rateCard.id);
            setSuccessMessage(`Rate card #${rateCard.id} was deactivated.`);
            refreshData();
        } catch (error) {
            setPageError(
                getErrorMessage(error, "Unable to deactivate this rate card."),
            );
        } finally {
            setActionId(null);
        }
    };

    const handleArchive = async (
        rateCard: AdvertisementRateCard,
    ): Promise<void> => {
        const confirmed = await confirmDialog(
            `Archive rate card #${rateCard.id}? This action is intended for a rate card that should no longer be used.`,
        );

        if (!confirmed) {
            return;
        }

        setActionId(rateCard.id);
        setPageError("");
        setSuccessMessage("");

        try {
            await archiveAdvertisementRateCard(rateCard.id);
            setSuccessMessage(`Rate card #${rateCard.id} was archived.`);
            refreshData();
        } catch (error) {
            setPageError(
                getErrorMessage(error, "Unable to archive this rate card."),
            );
        } finally {
            setActionId(null);
        }
    };

    const activeCount = rateCards.filter(
        (rateCard) => rateCard.status === "ACTIVE",
    ).length;

    const [gridPage, setGridPage] = useState(1);
    const [gridPageSize, setGridPageSize] = useState(10);
    const gridTotalPages = Math.max(1, Math.ceil(visibleRateCards.length / gridPageSize));
    const gridCurrentPage = Math.min(gridPage, gridTotalPages);
    const pagedRateCards = visibleRateCards.slice((gridCurrentPage - 1) * gridPageSize, gridCurrentPage * gridPageSize);

    const uniquePlacementCount = new Set(
        rateCards.map((rateCard) => rateCard.placementId),
    ).size;

    return (
        <MainLayout>
            <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <Link to="/admin/advertisements" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:underline">← Back to Advertisement Administration</Link>
                <AdvertisementAdminPageHeader title="Rate Card Configuration" description="Configure system-defined rates for advertisement placements, including pricing units, effective dates, and lifecycle status. Standard advertisement amounts are calculated from these rates." actions={<>                        <button
                    type="button"
                    onClick={() => {
                        refreshData();
                    }}
                    disabled={loading || placementsLoading}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                        aria-hidden="true"
                    />
                    Refresh
                </button>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                    >
                        <Plus size={17} aria-hidden="true" />
                        Add Rate Card
                    </button>
                </>} />

                {pageError && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    >
                        <ShieldAlert
                            size={18}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">{pageError}</div>
                        <button
                            type="button"
                            onClick={() => setPageError("")}
                            aria-label="Dismiss error"
                            className="rounded p-1 hover:bg-red-100"
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                    </div>
                )}

                {successMessage && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                    >
                        <CheckCircle2
                            size={18}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">{successMessage}</div>
                        <button
                            type="button"
                            onClick={() => setSuccessMessage("")}
                            aria-label="Dismiss success message"
                            className="rounded p-1 hover:bg-green-100"
                        >
                            <X size={16} aria-hidden="true" />
                        </button>
                    </div>
                )}

                <section
                    aria-label="Rate card summary"
                    className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                >
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm font-medium text-gray-500">
                            Rate cards listed
                        </div>
                        <div className="mt-2 text-2xl font-bold tabular-nums text-gray-900">
                            {loading ? "—" : rateCards.length}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm font-medium text-gray-500">
                            Active rate cards
                        </div>
                        <div className="mt-2 text-2xl font-bold tabular-nums text-green-700">
                            {loading ? "—" : activeCount}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="text-sm font-medium text-gray-500">
                            Placements with rate cards
                        </div>
                        <div className="mt-2 text-2xl font-bold tabular-nums text-gray-900">
                            {loading ? "—" : uniquePlacementCount}
                        </div>
                    </div>
                </section>

                {isFormOpen && (
                    <section
                        aria-labelledby="rate-card-form-heading"
                        className="rounded-xl border border-green-200 bg-white shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
                            <div>
                                <h2
                                    id="rate-card-form-heading"
                                    className="text-base font-semibold text-gray-900"
                                >
                                    {editingRateCard ? "Edit Rate Card" : "Create Rate Card"}
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    {editingRateCard
                                        ? `Updating rate card #${editingRateCard.id}.`
                                        : "Set the system rate for a placement and pricing unit."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                                aria-label="Close rate card form"
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-5 p-5">
                            {formError && (
                                <div
                                    role="alert"
                                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                                >
                                    {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <div>
                                    <label
                                        htmlFor="rate-card-placement"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Advertisement placement <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        id="rate-card-placement"
                                        value={form.placementId}
                                        onChange={(event) =>
                                            updateFormField("placementId", event.target.value)
                                        }
                                        required
                                        disabled={placementsLoading || saving}
                                        className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                                    >
                                        <option value="">Choose a placement</option>
                                        {placements.map((placement) => (
                                            <option
                                                key={placement.id}
                                                value={String(placement.id)}
                                            >
                                                {getPlacementLabel(placement)}
                                            </option>
                                        ))}
                                        {editingRateCard &&
                                            !placements.some(
                                                (placement) =>
                                                    placement.id === editingRateCard.placementId,
                                            ) && (
                                                <option value={String(editingRateCard.placementId)}>
                                                    Placement #{editingRateCard.placementId} (currently
                                                    assigned)
                                                </option>
                                            )}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Only active, enabled placements are available for new
                                        configuration.
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="rate-card-unit"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Pricing unit <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        id="rate-card-unit"
                                        value={form.pricingUnit}
                                        onChange={(event) =>
                                            updateFormField(
                                                "pricingUnit",
                                                event.target.value as AdvertisementRateCardPricingUnit,
                                            )
                                        }
                                        required
                                        disabled={saving}
                                        className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                                    >
                                        {PRICING_UNITS.map((unit) => (
                                            <option key={unit.value} value={unit.value}>
                                                {unit.label} ({unit.value})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="rate-card-amount"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Rate amount <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="rate-card-amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        inputMode="decimal"
                                        value={form.rateAmount}
                                        onChange={(event) =>
                                            updateFormField("rateAmount", event.target.value)
                                        }
                                        required
                                        disabled={saving}
                                        placeholder="e.g. 5000.00"
                                        className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="rate-card-currency"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Currency code <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="rate-card-currency"
                                        type="text"
                                        minLength={3}
                                        maxLength={3}
                                        autoCapitalize="characters"
                                        value={form.currencyCode}
                                        onChange={(event) =>
                                            updateFormField(
                                                "currencyCode",
                                                event.target.value.toUpperCase(),
                                            )
                                        }
                                        required
                                        disabled={saving}
                                        placeholder="INR"
                                        className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="rate-card-effective-from"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Effective from <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        id="rate-card-effective-from"
                                        type="datetime-local"
                                        value={form.effectiveFrom}
                                        onChange={(event) =>
                                            updateFormField("effectiveFrom", event.target.value)
                                        }
                                        required
                                        disabled={saving}
                                        className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="rate-card-effective-to"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Effective to
                                    </label>
                                    <input
                                        id="rate-card-effective-to"
                                        type="datetime-local"
                                        value={form.effectiveTo}
                                        onChange={(event) =>
                                            updateFormField("effectiveTo", event.target.value)
                                        }
                                        disabled={saving}
                                        className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave blank for no scheduled end.
                                    </p>
                                </div>

                                {editingRateCard && (
                                    <div>
                                        <label
                                            htmlFor="rate-card-status"
                                            className="mb-1.5 block text-sm font-medium text-gray-700"
                                        >
                                            Status
                                        </label>
                                        <select
                                            id="rate-card-status"
                                            value={form.status}
                                            onChange={(event) =>
                                                updateFormField(
                                                    "status",
                                                    event.target.value as AdvertisementRateCardStatus,
                                                )
                                            }
                                            disabled={saving}
                                            className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                                        >
                                            {RATE_CARD_STATUSES.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                                <div className="font-semibold">Pricing rule</div>
                                <p className="mt-1 leading-5">
                                    Standard amount is calculated from the selected rate and
                                    advertisement quantity. When an active rate is already
                                    configured for an overlapping period and the same placement
                                    and pricing unit, the database will reject the conflict.
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    disabled={saving}
                                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving || placementsLoading}
                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving && (
                                        <LoaderCircle
                                            size={16}
                                            className="animate-spin"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {saving
                                        ? "Saving..."
                                        : editingRateCard
                                            ? "Save Changes"
                                            : "Create Rate Card"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-4 sm:p-5">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Configured Rate Cards
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Review current and historical rates. Archived rates remain
                                    visible for audit and historical pricing reference.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <div className="relative">
                                    <Search
                                        size={16}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                        aria-hidden="true"
                                    />
                                    <input
                                        type="search"
                                        value={searchText}
                                        onChange={(event) => setSearchText(event.target.value)}
                                        placeholder="Search rate cards..."
                                        aria-label="Search rate cards"
                                        className="min-h-10 w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                                    />
                                </div>

                                <select
                                    value={filterPlacementId}
                                    onChange={(event) => setFilterPlacementId(event.target.value)}
                                    aria-label="Filter by placement"
                                    className="min-h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                                >
                                    <option value="">All placements</option>
                                    {placements.map((placement) => (
                                        <option key={placement.id} value={String(placement.id)}>
                                            {placement.displayName}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={filterPricingUnit}
                                    onChange={(event) => setFilterPricingUnit(event.target.value)}
                                    aria-label="Filter by pricing unit"
                                    className="min-h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                                >
                                    <option value="">All pricing units</option>
                                    {PRICING_UNITS.map((unit) => (
                                        <option key={unit.value} value={unit.value}>
                                            {unit.value}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={filterStatus}
                                    onChange={(event) =>
                                        setFilterStatus(
                                            event.target.value as AdvertisementRateCardStatus | "",
                                        )
                                    }
                                    aria-label="Filter by status"
                                    className="min-h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                                >
                                    <option value="">All statuses</option>
                                    {RATE_CARD_STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-gray-500">
                            <LoaderCircle
                                size={20}
                                className="animate-spin text-green-700"
                                aria-hidden="true"
                            />
                            Loading rate cards...
                        </div>
                    ) : visibleRateCards.length === 0 ? (
                        <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
                            <div className="mb-3 rounded-full bg-gray-100 p-3 text-gray-500">
                                <CalendarClock size={23} aria-hidden="true" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">
                                No rate cards found
                            </h3>
                            <p className="mt-1 max-w-md text-sm text-gray-500">
                                {rateCards.length === 0
                                    ? "Create a rate card to define the system pricing for an advertisement placement."
                                    : "Try changing the search text or filters."}
                            </p>
                            {rateCards.length === 0 && (
                                <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
                                >
                                    <Plus size={16} aria-hidden="true" />
                                    Add Rate Card
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-[1050px] w-full border-collapse text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 font-semibold">
                                                Rate Card
                                            </th>
                                            <th scope="col" className="px-4 py-3 font-semibold">
                                                Placement
                                            </th>
                                            <th scope="col" className="px-4 py-3 font-semibold">
                                                Pricing
                                            </th>
                                            <th scope="col" className="px-4 py-3 font-semibold">
                                                Effective Period
                                            </th>
                                            <th scope="col" className="px-4 py-3 font-semibold">
                                                Status
                                            </th>
                                            <th scope="col" className="px-4 py-3 font-semibold">
                                                Audit
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right font-semibold">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {pagedRateCards.map((rateCard) => {
                                            const placement = placementById.get(
                                                rateCard.placementId,
                                            );
                                            const busy = actionId === rateCard.id;

                                            return (
                                                <tr
                                                    key={rateCard.id}
                                                    className="align-top hover:bg-gray-50/70"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="font-semibold text-gray-900">
                                                            #{rateCard.id}
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {rateCard.currencyCode}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="font-medium text-gray-900">
                                                            {placement?.displayName ??
                                                                `Placement #${rateCard.placementId}`}
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {placement
                                                                ? `${placement.code} · ${placement.pageType}`
                                                                : `Placement ID ${rateCard.placementId}`}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="font-semibold tabular-nums text-gray-900">
                                                            {formatAmount(
                                                                rateCard.rateAmount,
                                                                rateCard.currencyCode,
                                                            )}
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {rateCard.pricingUnit}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="text-gray-800">
                                                            {formatDateTime(rateCard.effectiveFrom)}
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            To: {formatDateTime(rateCard.effectiveTo)}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(rateCard.status)}`}
                                                        >
                                                            {rateCard.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="text-xs text-gray-700">
                                                            Created by: {rateCard.createdBy}
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {formatDateTime(rateCard.createdAt)}
                                                        </div>
                                                        {rateCard.updatedBy !== null && (
                                                            <div className="mt-2 text-xs text-gray-500">
                                                                Updated by: {rateCard.updatedBy}
                                                                <div className="mt-1">
                                                                    {formatDateTime(rateCard.updatedAt)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditForm(rateCard)}
                                                                title={`Edit rate card ${rateCard.id}`}
                                                                aria-label={`Edit rate card ${rateCard.id}`}
                                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50 hover:text-green-800"
                                                            >
                                                                <Pencil size={16} aria-hidden="true" />
                                                            </button>

                                                            {rateCard.status === "ACTIVE" && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => void handleDeactivate(rateCard)}
                                                                    disabled={busy}
                                                                    title={`Deactivate rate card ${rateCard.id}`}
                                                                    aria-label={`Deactivate rate card ${rateCard.id}`}
                                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50"
                                                                >
                                                                    {busy ? (
                                                                        <LoaderCircle
                                                                            size={16}
                                                                            className="animate-spin"
                                                                            aria-hidden="true"
                                                                        />
                                                                    ) : (
                                                                        <ShieldAlert
                                                                            size={16}
                                                                            aria-hidden="true"
                                                                        />
                                                                    )}
                                                                </button>
                                                            )}

                                                            {rateCard.status !== "ARCHIVED" && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => void handleArchive(rateCard)}
                                                                    disabled={busy}
                                                                    title={`Archive rate card ${rateCard.id}`}
                                                                    aria-label={`Archive rate card ${rateCard.id}`}
                                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
                                                                >
                                                                    <Archive size={16} aria-hidden="true" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <AdminListPagination
                                page={gridCurrentPage}
                                pageSize={gridPageSize}
                                total={visibleRateCards.length}
                                onPageChange={(nextPage) => setGridPage(nextPage)}
                                onPageSizeChange={(nextSize) => { setGridPageSize(nextSize); setGridPage(1); }}
                            />
                        </>
                    )}
                </section>
            </main>
        </MainLayout>
    );
};

export default AdvertisementRateCardsPage;
