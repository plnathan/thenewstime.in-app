import {
    AlertCircle,
    CheckCircle2,
    CreditCard,
    Pencil,
    Save,
    WalletCards,
    X,
} from "lucide-react";
import { useState } from "react";

import {
    updateAdvertisement,
} from "@/api/advertisements/advertisement.api";
import type {
    AdvertisementDetails,
} from "@/api/advertisements/advertisement.api";

import Surface from "@/components/ui/Surface";

import {
    formatMoney,
    formatPercentage,
    getAdvanceStatus,
    getPricingStatus,
    getPricingSummary,
    parseNullableNumber,
} from "@/helpers/advertisementWorkspace.helpers";
import { getApiErrorMessage } from "@/utils/apiError";

interface WorkspacePricingProps {
    advertisement: AdvertisementDetails;
    canEditCommercials: boolean;
    onSaved: () => Promise<void>;
}

interface PricingValueProps {
    label: string;
    value: string;
    description?: string;
}

interface CommercialFormState {
    discountPercentage: string;
    advancePercentage: string;
    currencyCode: string;
}

interface ValidationErrors {
    standardAmount?: string;
    discountPercentage?: string;
    advancePercentage?: string;
    currencyCode?: string;
}

interface CommercialValidationResult {
    valid: boolean;
    advertisementAmount: number | null;
    standardAmount: number | null;
    discountPercentage: number | null;
    discountAmount: number | null;
    advancePercentage: number | null;
    advanceAmount: number | null;
}

const PricingValue = ({
    label,
    value,
    description,
}: PricingValueProps) => (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {label}
        </div>

        <div className="mt-1 break-words text-sm font-semibold leading-6 text-gray-900">
            {value}
        </div>

        {description ? (
            <div className="mt-1 text-[11px] leading-5 text-gray-500">
                {description}
            </div>
        ) : null}
    </div>
);

interface StatusBannerProps {
    state: "READY" | "REQUIRES_VERIFICATION" | "MISSING";
    label: string;
    description: string;
}

const StatusBanner = ({
    state,
    label,
    description,
}: StatusBannerProps) => {
    const isReady = state === "READY";
    const isMissing = state === "MISSING";
    const Icon = isReady ? CheckCircle2 : AlertCircle;

    const colorClasses = isReady
        ? "border-green-200 bg-green-50 text-green-900"
        : isMissing
            ? "border-red-200 bg-red-50 text-red-900"
            : "border-amber-200 bg-amber-50 text-amber-900";

    const descriptionClasses = isReady
        ? "text-green-800"
        : isMissing
            ? "text-red-800"
            : "text-amber-800";

    const iconClasses = isReady
        ? "text-green-700"
        : isMissing
            ? "text-red-700"
            : "text-amber-700";

    return (
        <div
            className={`flex items-start gap-3 rounded-lg border p-3 ${colorClasses}`}
            role={isReady ? "status" : "alert"}
        >
            <Icon
                size={17}
                className={`mt-0.5 shrink-0 ${iconClasses}`}
                aria-hidden="true"
            />

            <div className="min-w-0">
                <div className="text-xs font-semibold">
                    {label}
                </div>

                <div
                    className={`mt-0.5 text-[11px] leading-5 ${descriptionClasses}`}
                >
                    {description}
                </div>
            </div>
        </div>
    );
};

const getInitialCommercialForm = (
    advertisement: AdvertisementDetails,
): CommercialFormState => ({
    discountPercentage:
        advertisement.discountPercentage !== null &&
            advertisement.discountPercentage !== undefined
            ? String(advertisement.discountPercentage)
            : "",

    advancePercentage:
        advertisement.advancePercentage !== null &&
            advertisement.advancePercentage !== undefined
            ? String(advertisement.advancePercentage)
            : "",

    currencyCode: advertisement.currencyCode || "INR",
});

const parseNumber = (value: string): number | null => {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
        return null;
    }

    const parsed = Number(normalizedValue);

    return Number.isFinite(parsed) ? parsed : null;
};

const isValidPercentage = (
    percentage: number | null,
): percentage is number =>
    percentage !== null &&
    percentage >= 0 &&
    percentage <= 100;

const roundMoney = (amount: number): number =>
    Math.round((amount + Number.EPSILON) * 100) / 100;

const formatCommercialMoney = (
    amount: string | number | null | undefined,
    currencyCode: string,
): string =>
    formatMoney(
        parseNullableNumber(amount) ?? 0,
        currencyCode,
    );

const formatCommercialPercentage = (
    percentage: string | number | null | undefined,
): string =>
    formatPercentage(
        parseNullableNumber(percentage) ?? 0,
    );

const WorkspacePricing = ({
    advertisement,
    canEditCommercials,
    onSaved,
}: WorkspacePricingProps) => {
    const pricing = getPricingSummary(advertisement);
    const pricingStatus = getPricingStatus(advertisement);
    const advanceStatus = getAdvanceStatus(advertisement);

    const currencyCode = pricing.currencyCode;

    const [discountMode, setDiscountMode] = useState<"PERCENT" | "AMOUNT">("AMOUNT");
    const [advanceMode, setAdvanceMode] = useState<"PERCENT" | "AMOUNT">("AMOUNT");
    const [discountAmountInput, setDiscountAmountInput] = useState("");
    const [advanceAmountInput, setAdvanceAmountInput] = useState("");

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [validationErrors, setValidationErrors] =
        useState<ValidationErrors>({});

    const [form, setForm] = useState<CommercialFormState>(
        () => getInitialCommercialForm(advertisement),
    );

    const liveDiscountPercentage = discountMode === "AMOUNT"
        ? pricing.standardAmount && pricing.standardAmount > 0
            ? Number((((parseNumber(discountAmountInput) ?? 0) / pricing.standardAmount) * 100).toFixed(6))
            : null
        : parseNumber(form.discountPercentage);

    const liveAdvancePercentage = advanceMode === "AMOUNT"
        ? (() => {
            const standard = pricing.standardAmount;
            const discount = standard === null ? 0 : roundMoney(standard * ((liveDiscountPercentage ?? 0) / 100));
            const net = standard === null ? 0 : roundMoney(standard - discount);
            return net > 0 ? Number((((parseNumber(advanceAmountInput) ?? 0) / net) * 100).toFixed(6)) : null;
        })()
        : parseNumber(form.advancePercentage);

    /*
     * Commercial calculation rules:
     *
     * Standard Amount:
     *     System-derived; read-only.
     *
     * Discount Amount:
     *     Standard Amount × Discount Percentage / 100.
     *
     * Advertisement Amount:
     *     Standard Amount − Discount Amount.
     *
     * Advance Required:
     *     Advertisement Amount × Advance Percentage / 100.
     *
     * Commercial Balance Due:
     *     Advertisement Amount − Advance Required + Adjustment.
     *
     * Advance Required is a commercial collection target, not a
     * payment receipt. Actual outstanding in the Payments section
     * must instead be calculated using verified payments and refunds.
     */

    const hasValidStandardAmount =
        pricing.standardAmount !== null &&
        Number.isFinite(pricing.standardAmount) &&
        pricing.standardAmount > 0;

    const hasValidDiscountPercentage =
        isValidPercentage(liveDiscountPercentage);

    const hasValidAdvancePercentage =
        isValidPercentage(liveAdvancePercentage);

    const standardAmount = hasValidStandardAmount
        ? pricing.standardAmount
        : null;

    const liveDiscountAmount =
        standardAmount !== null &&
            hasValidDiscountPercentage
            ? discountMode === "AMOUNT"
                ? roundMoney(parseNumber(discountAmountInput) ?? 0)
                : roundMoney(standardAmount * (liveDiscountPercentage / 100))
            : 0;

    const liveAdvertisementAmount =
        standardAmount !== null &&
            hasValidDiscountPercentage
            ? roundMoney(
                standardAmount - liveDiscountAmount,
            )
            : null;

    const liveAdvanceAmount =
        liveAdvertisementAmount !== null &&
            hasValidAdvancePercentage
            ? advanceMode === "AMOUNT"
                ? roundMoney(parseNumber(advanceAmountInput) ?? 0)
                : roundMoney(liveAdvertisementAmount * (liveAdvancePercentage / 100))
            : 0;

    const displayCurrencyCode = editing
        ? form.currencyCode
        : currencyCode;

    const displayStandardAmount = pricing.standardAmount;

    const displayDiscountPercentage = editing
        ? liveDiscountPercentage
        : pricing.discountPercentage;

    const displayDiscountAmount = editing
        ? liveDiscountAmount
        : pricing.discountAmount;

    /*
     * During editing, show the calculated Advertisement Amount.
     * Outside editing, show the persisted amount returned by the API.
     *
     * Never use Standard Amount as a fallback for a missing persisted
     * Advertisement Amount. The two values are separate commercial
     * fields and must remain separate after a reload.
     */
    const displayAdvertisementAmount = editing
        ? liveAdvertisementAmount
        : pricing.advertisementAmount;

    const displayAdvancePercentage = editing
        ? liveAdvancePercentage
        : pricing.advancePercentage;

    const displayAdvanceAmount = editing
        ? liveAdvanceAmount
        : pricing.advanceAmount;

    const hasDiscount =
        displayDiscountPercentage !== null ||
        displayDiscountAmount !== null;

    const hasAdjustment = pricing.adjustmentAmount !== null;

    const hasAdvance =
        displayAdvancePercentage !== null ||
        displayAdvanceAmount !== null;

    /*
     * Commercial Balance Due is a pricing summary, not the actual
     * outstanding balance calculated by the Payments ledger.
     *
     * If Advertisement Amount is not available, preserve the missing
     * state instead of fabricating a balance.
     */
    const commercialBalanceDue =
        displayAdvertisementAmount === null ||
            displayAdvertisementAmount === undefined
            ? null
            : roundMoney(
                (parseNullableNumber(displayAdvertisementAmount) ?? 0) -
                (parseNullableNumber(displayAdvanceAmount) ?? 0) +
                (parseNullableNumber(pricing.adjustmentAmount) ?? 0),
            );

    const handleStartEdit = (): void => {
        if (!canEditCommercials || saving) {
            return;
        }

        setError(null);
        setValidationErrors({});
        setForm(getInitialCommercialForm(advertisement));
        setDiscountMode("AMOUNT");
        setAdvanceMode("AMOUNT");
        setDiscountAmountInput(String(roundMoney(parseNullableNumber(pricing.discountAmount) ?? 0)));
        setAdvanceAmountInput(String(roundMoney(parseNullableNumber(pricing.advanceAmount) ?? 0)));
        setEditing(true);
    };

    const handleCancelEdit = (): void => {
        if (saving) {
            return;
        }

        setError(null);
        setValidationErrors({});
        setForm(getInitialCommercialForm(advertisement));
        setEditing(false);
    };

    const validateCommercialForm = (): CommercialValidationResult => {
        const nextErrors: ValidationErrors = {};

        const standardAmount = pricing.standardAmount;

        const discountPercentage = liveDiscountPercentage;

        const advancePercentage = liveAdvancePercentage;

        /*
         * Keep Standard Amount validation separate from percentage
         * validation. This prevents a valid Discount % from
         * accidentally overwriting a Standard Amount validation error.
         */
        if (
            standardAmount === null ||
            !Number.isFinite(standardAmount) ||
            standardAmount <= 0
        ) {
            nextErrors.standardAmount =
                "A valid system-derived Standard Amount is required before commercials can be saved.";
        }

        if (discountMode === "AMOUNT" && (parseNumber(discountAmountInput) === null || (parseNumber(discountAmountInput) ?? -1) < 0)) {
            nextErrors.discountPercentage = "Enter a valid non-negative discount amount.";
        } else if (discountPercentage === null) {
            nextErrors.discountPercentage =
                "Discount percentage is required.";
        } else if (!isValidPercentage(discountPercentage)) {
            nextErrors.discountPercentage =
                "Discount percentage must be between 0 and 100.";
        }

        if (advanceMode === "AMOUNT" && (parseNumber(advanceAmountInput) === null || (parseNumber(advanceAmountInput) ?? -1) < 0)) {
            nextErrors.advancePercentage = "Enter a valid non-negative advance amount.";
        } else if (advancePercentage === null) {
            nextErrors.advancePercentage =
                "Advance percentage is required.";
        } else if (!isValidPercentage(advancePercentage)) {
            nextErrors.advancePercentage =
                "Advance percentage must be between 0 and 100.";
        }

        if (!form.currencyCode.trim()) {
            nextErrors.currencyCode =
                "Select a commercial currency.";
        }

        const discountAmount =
            standardAmount !== null &&
                Number.isFinite(standardAmount) &&
                standardAmount > 0 &&
                isValidPercentage(discountPercentage)
                ? discountMode === "AMOUNT"
                    ? roundMoney(parseNumber(discountAmountInput) ?? 0)
                    : roundMoney(standardAmount * (discountPercentage / 100))
                : null;

        const advertisementAmount =
            standardAmount !== null &&
                Number.isFinite(standardAmount) &&
                standardAmount > 0 &&
                discountAmount !== null
                ? roundMoney(standardAmount - discountAmount)
                : null;

        const advanceAmount =
            advertisementAmount !== null &&
                isValidPercentage(advancePercentage)
                ? advanceMode === "AMOUNT"
                    ? roundMoney(parseNumber(advanceAmountInput) ?? 0)
                    : roundMoney(advertisementAmount * (advancePercentage / 100))
                : null;

        setValidationErrors(nextErrors);

        return {
            valid: Object.keys(nextErrors).length === 0,
            standardAmount,
            advertisementAmount,
            discountPercentage,
            discountAmount,
            advancePercentage,
            advanceAmount,
        };
    };

    const handleSave = async (): Promise<void> => {
        if (saving) {
            return;
        }

        setError(null);

        /*
         * Recheck permission when saving, not only when rendering
         * the Edit button. This protects against a permission change
         * while the workspace is open.
         */
        if (!canEditCommercials) {
            setError(
                "You no longer have permission to edit these commercial details. Refresh the workspace and try again if access has changed.",
            );
            return;
        }

        const validation = validateCommercialForm();

        if (!validation.valid) {
            return;
        }

        const {
            advertisementAmount,
            discountPercentage,
            discountAmount,
            advancePercentage,
            advanceAmount,
        } = validation;

        if (
            advertisementAmount === null ||
            discountPercentage === null ||
            discountAmount === null ||
            advancePercentage === null ||
            advanceAmount === null
        ) {
            setError(
                "Commercial values could not be calculated. Please review the Standard Amount and entered percentages.",
            );
            return;
        }

        try {
            setSaving(true);

            /*
             * Persist commercial values using the correct API fields.
             *
             * advertisementAmount:
             *     The negotiated/calculated commercial amount.
             *
             * discountAmount:
             *     The discount calculated from Standard Amount.
             *
             * advanceAmount:
             *     Advance Required, not an actual payment receipt.
             *
             * standardAmount:
             *     Intentionally omitted. It is system-derived and
             *     must not be overwritten by this frontend update.
             *
             * agreedAmount:
             *     Intentionally omitted. Do not use it as a substitute
             *     for advertisementAmount.
             */
            const updatePayload = {
                advertisementAmount,
                discountPercentage,
                discountAmount,
                advancePercentage,
                advanceAmount,
                currencyCode: form.currencyCode.trim(),
            };

            await updateAdvertisement(
                advertisement.id,
                updatePayload,
            );

            setEditing(false);
            setValidationErrors({});

            /*
             * Reload the persisted advertisement so the workspace
             * displays the API/database values after saving.
             */
            await onSaved();
        } catch (saveError: unknown) {
            console.error(
                "Failed to update advertisement commercials:",
                saveError,
            );

            // setError(
            //     saveError instanceof Error
            //         ? saveError.message
            //         : "Unable to save commercial details. Please try again.",
            // );
            setError(
                getApiErrorMessage(
                    saveError,
                    "Unable to save threshold configuration.",
                ),
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDiscountModeChange = (mode: "PERCENT" | "AMOUNT"): void => {
        if (mode === discountMode) return;
        if (mode === "AMOUNT") {
            setDiscountAmountInput(String(liveDiscountAmount));
        } else {
            setForm((current) => ({ ...current, discountPercentage: String(liveDiscountPercentage ?? 0) }));
        }
        setDiscountMode(mode);
        setValidationErrors({});
    };

    const handleAdvanceModeChange = (mode: "PERCENT" | "AMOUNT"): void => {
        if (mode === advanceMode) return;
        if (mode === "AMOUNT") {
            setAdvanceAmountInput(String(liveAdvanceAmount));
        } else {
            setForm((current) => ({ ...current, advancePercentage: String(liveAdvancePercentage ?? 0) }));
        }
        setAdvanceMode(mode);
        setValidationErrors({});
    };

    const handleDiscountChange = (value: string): void => {
        setForm((current) => ({
            ...current,
            discountPercentage: value,
        }));

        setValidationErrors((current) => {
            const nextErrors = { ...current };

            delete nextErrors.discountPercentage;

            return nextErrors;
        });

        setError(null);
    };

    const handleAdvanceChange = (value: string): void => {
        setForm((current) => ({
            ...current,
            advancePercentage: value,
        }));

        setValidationErrors((current) => {
            const nextErrors = { ...current };

            delete nextErrors.advancePercentage;

            return nextErrors;
        });

        setError(null);
    };

    const handleCurrencyChange = (value: string): void => {
        setForm((current) => ({
            ...current,
            currencyCode: value,
        }));

        setValidationErrors((current) => {
            const nextErrors = { ...current };

            delete nextErrors.currencyCode;

            return nextErrors;
        });

        setError(null);
    };

    if (advertisement.isHouseAd === true) {
        return (
            <Surface className="border border-green-200 bg-green-50 p-5 sm:p-6">
                <h3 className="text-base font-semibold text-green-900">House Advertisement — Commercials Not Applicable</h3>
                <p className="mt-2 text-sm text-green-800">
                    This is TheNewsTime.in in-house advertising inventory. No paid rate card,
                    standard amount, discount, advance or customer payment is required.
                    Placement, creative, scheduling, approval and manual activation remain mandatory.
                </p>
            </Surface>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <Surface className="border border-gray-200 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <WalletCards
                                size={19}
                                className="shrink-0 text-green-700"
                                aria-hidden="true"
                            />

                            <h3 className="text-base font-semibold text-slate-900">
                                Commercial Review
                            </h3>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Review system-derived pricing and the calculated commercial terms.
                        </p>
                    </div>

                    {canEditCommercials && !editing ? (
                        <button
                            type="button"
                            onClick={handleStartEdit}
                            disabled={saving}
                            className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Pencil size={15} aria-hidden="true" />
                            Edit Commercials
                        </button>
                    ) : null}
                </div>

                <div className="mt-4">
                    <StatusBanner
                        state={pricingStatus.state}
                        label={pricingStatus.label}
                        description={pricingStatus.description}
                    />
                </div>

                {editing ? (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50/50 p-4 sm:p-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="min-w-0">
                                <CommercialField
                                    label="Standard Amount"
                                    value={formatCommercialMoney(
                                        pricing.standardAmount,
                                        form.currencyCode,
                                    )}
                                    description="System-derived and read-only"
                                    readOnly
                                />

                                {validationErrors.standardAmount ? (
                                    <p
                                        className="mt-1 text-xs text-red-600"
                                        role="alert"
                                    >
                                        {validationErrors.standardAmount}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <label
                                    htmlFor="workspace-commercial-currency"
                                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600"
                                >
                                    Currency
                                </label>

                                <select
                                    id="workspace-commercial-currency"
                                    value={form.currencyCode}
                                    onChange={(event) =>
                                        handleCurrencyChange(
                                            event.target.value,
                                        )
                                    }
                                    className={`min-h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 ${validationErrors.currencyCode
                                        ? "border-red-400"
                                        : "border-gray-300"
                                        }`}
                                    aria-invalid={Boolean(
                                        validationErrors.currencyCode,
                                    )}
                                    aria-describedby={
                                        validationErrors.currencyCode
                                            ? "workspace-commercial-currency-error"
                                            : undefined
                                    }
                                >
                                    {form.currencyCode !== "INR" ? (
                                        <option value={form.currencyCode}>
                                            {form.currencyCode}
                                        </option>
                                    ) : null}

                                    <option value="INR">
                                        INR — Indian Rupee
                                    </option>
                                </select>

                                {validationErrors.currencyCode ? (
                                    <p
                                        id="workspace-commercial-currency-error"
                                        className="mt-1 text-xs text-red-600"
                                    >
                                        {validationErrors.currencyCode}
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="workspace-discount-mode" className="block text-xs font-semibold text-gray-600">Discount entry method</label>
                                <select id="workspace-discount-mode" value={discountMode} onChange={(event) => handleDiscountModeChange(event.target.value as "PERCENT" | "AMOUNT")} className="min-h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                                    <option value="AMOUNT">Amount (₹)</option>
                                    <option value="PERCENT">Percentage (%)</option>
                                </select>
                                {discountMode === "PERCENT" ? (
                                    <CommercialInput id="workspace-commercial-discount" label="Discount %" value={form.discountPercentage} onChange={handleDiscountChange} suffix="%" error={validationErrors.discountPercentage} />
                                ) : (
                                    <CommercialInput id="workspace-commercial-discount-amount" label="Discount Amount" value={discountAmountInput} onChange={(value) => { setDiscountAmountInput(value); setValidationErrors({}); }} suffix="₹" error={validationErrors.discountPercentage} />
                                )}
                            </div>

                            <CommercialField
                                label="Discount Amount"
                                value={formatCommercialMoney(
                                    liveDiscountAmount,
                                    form.currencyCode,
                                )}
                                description="Calculated from Standard Amount × Discount %"
                                readOnly
                            />

                            <CommercialField
                                label="Advertisement Amount"
                                value={formatCommercialMoney(
                                    liveAdvertisementAmount,
                                    form.currencyCode,
                                )}
                                description="Calculated from Standard Amount − Discount Amount"
                                readOnly
                            />

                            <div className="space-y-2">
                                <label htmlFor="workspace-advance-mode" className="block text-xs font-semibold text-gray-600">Advance Required entry method</label>
                                <select id="workspace-advance-mode" value={advanceMode} onChange={(event) => handleAdvanceModeChange(event.target.value as "PERCENT" | "AMOUNT")} className="min-h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm">
                                    <option value="AMOUNT">Amount (₹)</option>
                                    <option value="PERCENT">Percentage (%)</option>
                                </select>
                                {advanceMode === "PERCENT" ? (
                                    <CommercialInput id="workspace-commercial-advance" label="Advance Required %" value={form.advancePercentage} onChange={handleAdvanceChange} suffix="%" error={validationErrors.advancePercentage} />
                                ) : (
                                    <CommercialInput id="workspace-commercial-advance-amount" label="Advance Required Amount" value={advanceAmountInput} onChange={(value) => { setAdvanceAmountInput(value); setValidationErrors({}); }} suffix="₹" error={validationErrors.advancePercentage} />
                                )}
                            </div>

                            <CommercialField
                                label="Advance Required"
                                value={formatCommercialMoney(
                                    liveAdvanceAmount,
                                    form.currencyCode,
                                )}
                                description="Required advance calculated from Advertisement Amount × Advance %; not a payment receipt"
                                readOnly
                            />

                            <CommercialField
                                label="Adjustment"
                                value={formatCommercialMoney(
                                    pricing.adjustmentAmount,
                                    form.currencyCode,
                                )}
                                description="Read-only commercial adjustment"
                                readOnly
                            />
                        </div>

                        {error ? (
                            <div
                                className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
                                role="alert"
                            >
                                {error}
                            </div>
                        ) : null}

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                            >
                                <X size={16} aria-hidden="true" />
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleSave()}
                                disabled={saving || !canEditCommercials}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                            >
                                <Save size={16} aria-hidden="true" />
                                {saving
                                    ? "Saving..."
                                    : "Save Commercials"}
                            </button>
                        </div>
                    </div>
                ) : null}

                {!editing && error ? (
                    <div
                        className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
                        role="alert"
                    >
                        {error}
                    </div>
                ) : null}
            </Surface>

            <Surface className="border border-gray-200 bg-gray-50 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                    <CreditCard
                        size={17}
                        className="shrink-0 text-green-700"
                        aria-hidden="true"
                    />

                    <h4 className="text-sm font-semibold text-gray-900">
                        Commercial Amount
                    </h4>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <PricingValue
                        label="Standard Amount"
                        value={formatCommercialMoney(
                            displayStandardAmount,
                            displayCurrencyCode,
                        )}
                        description="System-derived pricing basis"
                    />

                    <PricingValue
                        label="Discount"
                        value={
                            hasDiscount
                                ? formatCommercialPercentage(
                                    displayDiscountPercentage,
                                )
                                : formatCommercialPercentage(0)
                        }
                        description={`Discount amount: ${formatCommercialMoney(
                            displayDiscountAmount,
                            displayCurrencyCode,
                        )}`}
                    />

                    <PricingValue
                        label="Adjustment"
                        value={formatCommercialMoney(
                            pricing.adjustmentAmount,
                            displayCurrencyCode,
                        )}
                        description={
                            hasAdjustment
                                ? "Commercial adjustment"
                                : "No adjustment configured"
                        }
                    />

                    <PricingValue
                        label="Advertisement Amount"
                        value={formatCommercialMoney(
                            displayAdvertisementAmount,
                            displayCurrencyCode,
                        )}
                        description="Standard Amount minus Discount Amount"
                    />
                </div>
            </Surface>

            <Surface className="border border-gray-200 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <CreditCard
                                size={17}
                                className="shrink-0 text-green-700"
                                aria-hidden="true"
                            />

                            <h4 className="text-sm font-semibold text-gray-900">
                                Advance Requirement
                            </h4>
                        </div>

                        <p className="mt-1 text-[11px] leading-5 text-gray-500">
                            This section shows the agreed advance requirement. Record and verify actual receipts in Payments.
                        </p>
                    </div>

                    <div className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                        {displayCurrencyCode}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <PricingValue
                        label="Advance Percentage"
                        value={formatCommercialPercentage(
                            displayAdvancePercentage,
                        )}
                        description="Agreed advance percentage"
                    />

                    <PricingValue
                        label="Advance Required"
                        value={formatCommercialMoney(
                            displayAdvanceAmount,
                            displayCurrencyCode,
                        )}
                        description="Required amount; not a payment receipt"
                    />
                </div>

                <div className="mt-4">
                    <StatusBanner
                        state={advanceStatus.state}
                        label={advanceStatus.label}
                        description={advanceStatus.description}
                    />
                </div>

                {!hasAdvance ? (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                        No advance amount or percentage is currently configured.
                    </div>
                ) : null}
            </Surface>

            <Surface className="overflow-hidden border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-4 py-4 sm:px-5">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Commercial Summary
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                        Commercial terms derived from Standard Amount, discount, Advertisement Amount, advance requirement, and adjustment.
                    </p>
                </div>

                <div className="divide-y divide-gray-200">
                    <CommercialSummaryRow
                        label="Standard amount"
                        value={formatCommercialMoney(
                            displayStandardAmount,
                            displayCurrencyCode,
                        )}
                    />

                    <CommercialSummaryRow
                        label={`Discount (${formatCommercialPercentage(
                            displayDiscountPercentage,
                        )})`}
                        prefix="(-)"
                        value={formatCommercialMoney(
                            Math.abs(displayDiscountAmount ?? 0),
                            displayCurrencyCode,
                        )}
                    />

                    <CommercialSummaryRow
                        label="Advertisement amount"
                        value={formatCommercialMoney(
                            displayAdvertisementAmount,
                            displayCurrencyCode,
                        )}
                        highlighted
                    />

                    <CommercialSummaryRow
                        label={`Advance required (${formatCommercialPercentage(
                            displayAdvancePercentage,
                        )})`}
                        value={formatCommercialMoney(
                            Math.abs(displayAdvanceAmount ?? 0),
                            displayCurrencyCode,
                        )}
                    />

                    <CommercialSummaryRow
                        label="Adjustment"
                        prefix={
                            (pricing.adjustmentAmount ?? 0) > 0
                                ? "(+)"
                                : (pricing.adjustmentAmount ?? 0) < 0
                                    ? "(-)"
                                    : ""
                        }
                        value={formatCommercialMoney(
                            Math.abs(pricing.adjustmentAmount ?? 0),
                            displayCurrencyCode,
                        )}
                    />

                    <CommercialSummaryRow
                        label="Balance Due"
                        prefix="(=)"
                        value={
                            commercialBalanceDue === null
                                ? "Not configured"
                                : formatCommercialMoney(
                                    commercialBalanceDue,
                                    displayCurrencyCode,
                                )
                        }
                        highlighted
                    />
                </div>
            </Surface>
        </div>
    );
};

interface CommercialInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    prefix?: string;
    suffix?: string;
    error?: string;
}

const CommercialInput = ({
    id,
    label,
    value,
    onChange,
    prefix,
    suffix,
    error,
}: CommercialInputProps) => {
    const errorId = `${id}-error`;

    return (
        <div className="min-w-0">
            <label
                htmlFor={id}
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
                {label}
            </label>

            <div
                className={`flex min-h-10 overflow-hidden rounded-md border bg-white focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-600/20 ${error
                    ? "border-red-400"
                    : "border-gray-300"
                    }`}
            >
                {prefix ? (
                    <span className="inline-flex items-center border-r border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-gray-500">
                        {prefix}
                    </span>
                ) : null}

                <input
                    id={id}
                    type="number"
                    min="0"
                    max={suffix === "%" ? 100 : undefined}
                    step="0.01"
                    inputMode="decimal"
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none"
                />

                {suffix ? (
                    <span className="inline-flex items-center border-l border-gray-200 bg-gray-50 px-3 text-xs font-semibold text-gray-500">
                        {suffix}
                    </span>
                ) : null}
            </div>

            {error ? (
                <p
                    id={errorId}
                    className="mt-1 text-xs text-red-600"
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
};

interface CommercialFieldProps {
    label: string;
    value: string;
    description?: string;
    readOnly?: boolean;
}

const CommercialField = ({
    label,
    value,
    description,
}: CommercialFieldProps) => (
    <div className="min-w-0">
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
            {label}
        </div>

        <div
            aria-readonly="true"
            className="min-h-10 break-words rounded-md border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-700"
        >
            {value}
        </div>

        {description ? (
            <div className="mt-1 text-[11px] leading-5 text-gray-500">
                {description}
            </div>
        ) : null}
    </div>
);

interface CommercialSummaryRowProps {
    label: string;
    value: string;
    prefix?: string;
    highlighted?: boolean;
}

const CommercialSummaryRow = ({
    label,
    value,
    prefix,
    highlighted = false,
}: CommercialSummaryRowProps) => (
    <div
        className={`grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3 sm:px-5 ${highlighted ? "bg-gray-50" : ""
            }`}
    >
        <span
            className={`min-w-0 break-words text-sm ${highlighted
                ? "font-semibold text-gray-700"
                : "text-gray-600"
                }`}
        >
            {label}
        </span>

        <span className="min-w-8 text-right text-xs font-semibold tabular-nums text-gray-500">
            {prefix ?? ""}
        </span>

        <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-gray-900">
            {value}
        </span>
    </div>
);

export default WorkspacePricing;