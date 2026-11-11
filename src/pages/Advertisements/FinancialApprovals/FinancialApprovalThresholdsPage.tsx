import AdvertisementAdminPageHeader from "@/components/ui/AdvertisementAdminPageHeader";
import AdminListPagination from "../../../components/ui/AdminListPagination";
import { Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { getApiErrorMessage } from "@/utils/apiError";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    CheckCircle2,
    CircleOff,
    LoaderCircle,
    Plus,
    Pencil,
    RefreshCw,
    Save,
    Settings2,
} from "lucide-react";

import {
    activateFinancialApprovalThreshold,
    createFinancialApprovalThreshold,
    deactivateFinancialApprovalThreshold,
    getFinancialApprovalThresholds,
    updateFinancialApprovalThreshold,
} from "@/api/advertisements/financial-approval-threshold.api";

import type {
    FinancialApprovalThreshold,
    FinancialApprovalThresholdInput,
    FinancialApprovalType,
} from "@/api/advertisements/financial-approval-threshold.api";

type ThresholdValueType = "AMOUNT" | "PERCENTAGE";

interface ThresholdForm {
    approvalType: FinancialApprovalType;
    valueType: ThresholdValueType;
    value: string;
}

const APPROVAL_TYPES: Array<{
    value: FinancialApprovalType;
    label: string;
    description: string;
}> = [
        {
            value: "DISCOUNT",
            label: "Discount",
            description: "Discount requests requiring financial approval.",
        },
        {
            value: "ADJUSTMENT",
            label: "Adjustment",
            description: "Financial adjustment requests.",
        },
        {
            value: "REFUND",
            label: "Refund",
            description: "Full refund approval threshold.",
        },
        {
            value: "PARTIAL_REFUND",
            label: "Partial refund",
            description: "Partial refund approval threshold.",
        },
        {
            value: "CREDIT_EXCEPTION",
            label: "Credit Exception",
            description:
                "Maximum deferred-payment exception amount requiring financial approval.",
        },
    ];

const EMPTY_FORM: ThresholdForm = {
    approvalType: "DISCOUNT",
    valueType: "PERCENTAGE",
    value: "",
};

const formatThreshold = (
    threshold: FinancialApprovalThreshold,
): string => {
    if (threshold.amountThreshold !== null) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(threshold.amountThreshold);
    }

    if (threshold.percentageThreshold !== null) {
        return `${threshold.percentageThreshold}%`;
    }

    return "Not configured";
};

const getErrorMessage = (
    error: unknown,
    fallback: string,
): string =>
    error instanceof Error ? error.message : fallback;

const FinancialApprovalThresholdsPage = () => {
    const [thresholds, setThresholds] = useState<
        FinancialApprovalThreshold[]
    >([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [form, setForm] = useState<ThresholdForm>(EMPTY_FORM);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const sortedThresholds = useMemo(() => [...thresholds].sort((a, b) => {
        if (a.status !== b.status) return a.status === "ACTIVE" ? -1 : 1;
        const aTime = Date.parse(a.createdAt) || 0;
        const bTime = Date.parse(b.createdAt) || 0;
        return bTime - aTime || b.id - a.id;
    }), [thresholds]);
    const totalPages = Math.max(1, Math.ceil(sortedThresholds.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pagedThresholds = sortedThresholds.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // State updates are asynchronous. Refs prevent rapid repeated clicks
    // from starting overlapping save or activation/deactivation requests.
    const savingRef = useRef(false);
    const actionInProgressRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        const fetchInitialThresholds = async (): Promise<void> => {
            try {
                const items = await getFinancialApprovalThresholds();

                if (!cancelled) {
                    setThresholds(items);
                }
            } catch (loadError: unknown) {
                if (!cancelled) {
                    setError(
                        getErrorMessage(
                            loadError,
                            "Unable to load financial approval thresholds.",
                        ),
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void fetchInitialThresholds();

        return () => {
            cancelled = true;
        };
    }, []);

    const loadThresholds = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const items = await getFinancialApprovalThresholds();
            setThresholds(items);
        } catch (loadError: unknown) {
            setError(
                getErrorMessage(
                    loadError,
                    "Unable to load financial approval thresholds.",
                ),
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const resetForm = (): void => {
        if (savingRef.current || actionInProgressRef.current) {
            return;
        }

        setForm(EMPTY_FORM);
        setEditingId(null);
        setError(null);
        setNotice(null);
    };

    const startEditing = (
        threshold: FinancialApprovalThreshold,
    ): void => {
        if (savingRef.current || actionInProgressRef.current) {
            return;
        }

        setEditingId(threshold.id);

        setForm({
            approvalType: threshold.approvalType,
            valueType:
                threshold.approvalType === "CREDIT_EXCEPTION"
                    ? "AMOUNT"
                    : threshold.amountThreshold !== null
                        ? "AMOUNT"
                        : "PERCENTAGE",
            value: String(
                threshold.amountThreshold ??
                threshold.percentageThreshold ??
                "",
            ),
        });

        setError(null);
        setNotice(null);
    };

    const handleSave = async (): Promise<void> => {
        if (savingRef.current || actionInProgressRef.current) {
            return;
        }

        setError(null);
        setNotice(null);

        const trimmedValue = form.value.trim();
        const value = Number(trimmedValue);

        if (trimmedValue === "" || !Number.isFinite(value)) {
            setError("Enter a valid threshold value.");
            return;
        }

        if (
            form.valueType === "AMOUNT" &&
            value <= 0
        ) {
            setError("The amount threshold must be greater than zero.");
            return;
        }

        if (
            form.valueType === "PERCENTAGE" &&
            (value < 0 || value > 100)
        ) {
            setError("The percentage threshold must be between 0 and 100.");
            return;
        }

        if (
            Math.abs(value * 100 - Math.round(value * 100)) >= 1e-9
        ) {
            setError("Use no more than two decimal places.");
            return;
        }

        if (
            form.approvalType === "CREDIT_EXCEPTION" &&
            form.valueType !== "AMOUNT"
        ) {
            setError("Credit Exception thresholds must use an amount.");
            return;
        }

        // Send only the selected unit. Never submit a stale value from
        // the other unit.
        const payload: FinancialApprovalThresholdInput = {
            approvalType: form.approvalType,
            ...(form.valueType === "AMOUNT"
                ? { amountThreshold: value }
                : { percentageThreshold: value }),
        };

        savingRef.current = true;
        setSaving(true);

        try {
            if (editingId === null) {
                await createFinancialApprovalThreshold(payload);
                setNotice("Threshold configuration created.");
            } else {
                await updateFinancialApprovalThreshold(
                    editingId,
                    payload,
                );
                setNotice("Threshold configuration updated.");
            }

            setForm(EMPTY_FORM);
            setEditingId(null);

            await loadThresholds();
        } catch (saveError: unknown) {
            setError(
                getApiErrorMessage(
                    saveError,
                    "Unable to save threshold configuration.",
                ),
            );
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    };

    const handleStatusChange = async (
        threshold: FinancialApprovalThreshold,
    ): Promise<void> => {
        if (savingRef.current || actionInProgressRef.current) {
            return;
        }

        actionInProgressRef.current = true;
        setActionId(threshold.id);
        setError(null);
        setNotice(null);

        try {
            if (threshold.status === "ACTIVE") {
                await deactivateFinancialApprovalThreshold(threshold.id);
                setNotice("Threshold configuration deactivated.");
            } else {
                await activateFinancialApprovalThreshold(threshold.id);
                setNotice("Threshold configuration activated.");
            }

            await loadThresholds();
        } catch (actionError: unknown) {
            setError(
                getErrorMessage(
                    actionError,
                    "Unable to change threshold status.",
                ),
            );
        } finally {
            actionInProgressRef.current = false;
            setActionId(null);
        }
    };

    const isCreditException =
        form.approvalType === "CREDIT_EXCEPTION";

    const isOperationInProgress =
        saving || actionId !== null;

    return (
        <MainLayout>
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
                <Link to="/admin/advertisements" className="inline-flex text-sm font-semibold text-green-700 hover:underline">← Back to Advertisement Administration</Link>
                <AdvertisementAdminPageHeader title="Financial Approval Thresholds" description="Configure the amount or percentage threshold for each type of financial approval. Only one active configuration is allowed per approval type." actions={<>                    <button
                    type="button"
                    onClick={() => void loadThresholds()}
                    disabled={loading || isOperationInProgress}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw size={16} aria-hidden="true" />
                    Refresh
                </button>
                </>} />

                {error !== null && (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                        {error}
                    </div>
                )}

                {notice !== null && (
                    <div
                        role="status"
                        className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                    >
                        {notice}
                    </div>
                )}

                <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-green-100 p-2 text-green-800">
                            <Plus size={19} aria-hidden="true" />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingId === null
                                    ? "Add threshold configuration"
                                    : `Edit threshold #${editingId}`}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Choose whether the threshold is a currency amount
                                or a percentage. The two value types cannot be
                                combined.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-gray-700">
                                Approval type
                            </span>

                            <select
                                value={form.approvalType}
                                onChange={(event) => {
                                    const approvalType =
                                        event.target.value as FinancialApprovalType;

                                    setForm((current) => ({
                                        ...current,
                                        approvalType,
                                        valueType:
                                            approvalType === "CREDIT_EXCEPTION"
                                                ? "AMOUNT"
                                                : current.valueType,
                                        // A value entered for one approval type
                                        // must not carry over to another type.
                                        value: "",
                                    }));

                                    setError(null);
                                    setNotice(null);
                                }}
                                disabled={isOperationInProgress}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                            >
                                {APPROVAL_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-gray-700">
                                Threshold type
                            </span>

                            <select
                                value={form.valueType}
                                onChange={(event) => {
                                    const valueType =
                                        event.target.value as ThresholdValueType;

                                    if (
                                        isCreditException &&
                                        valueType !== "AMOUNT"
                                    ) {
                                        return;
                                    }

                                    setForm((current) => ({
                                        ...current,
                                        valueType,
                                        // Never reinterpret the old number in
                                        // the newly selected unit.
                                        value: "",
                                    }));

                                    setError(null);
                                    setNotice(null);
                                }}
                                disabled={
                                    isOperationInProgress || isCreditException
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="PERCENTAGE">
                                    Percentage (%)
                                </option>
                                <option value="AMOUNT">Amount (INR)</option>
                            </select>

                            {isCreditException && (
                                <span className="mt-1.5 block text-xs text-gray-500">
                                    Credit Exception thresholds must be configured
                                    as an amount in INR.
                                </span>
                            )}
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-gray-700">
                                Threshold value
                            </span>

                            <div className="relative">
                                <input
                                    type="number"
                                    min={
                                        form.valueType === "AMOUNT" ? "0.01" : "0"
                                    }
                                    max={
                                        form.valueType === "PERCENTAGE"
                                            ? "100"
                                            : undefined
                                    }
                                    step="0.01"
                                    inputMode="decimal"
                                    value={form.value}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            value: event.target.value,
                                        }))
                                    }
                                    disabled={isOperationInProgress}
                                    placeholder={
                                        form.valueType === "AMOUNT"
                                            ? "e.g. 10000"
                                            : "e.g. 10"
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-12 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                                />

                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                                    {form.valueType === "AMOUNT" ? "₹" : "%"}
                                </span>
                            </div>
                        </label>
                    </div>

                    <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        {editingId !== null && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={isOperationInProgress}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel edit
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => void handleSave()}
                            disabled={isOperationInProgress}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? (
                                <LoaderCircle
                                    size={16}
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            ) : (
                                <Save size={16} aria-hidden="true" />
                            )}

                            {saving
                                ? "Saving..."
                                : editingId === null
                                    ? "Save threshold"
                                    : "Update threshold"}
                        </button>
                    </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                        <h2 className="font-semibold text-gray-900">
                            Configured thresholds
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Review each approval type and its current activation
                            status.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500">
                            <LoaderCircle
                                size={18}
                                className="animate-spin"
                                aria-hidden="true"
                            />
                            Loading threshold configurations…
                        </div>
                    ) : thresholds.length === 0 ? (
                        <div className="p-10 text-center">
                            <Settings2
                                size={28}
                                className="mx-auto text-gray-400"
                                aria-hidden="true"
                            />

                            <p className="mt-3 font-medium text-gray-800">
                                No threshold configurations found
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Add a configuration above to get started.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">
                                                Approval type
                                            </th>
                                            <th className="px-5 py-3 font-semibold">
                                                Threshold
                                            </th>
                                            <th className="px-5 py-3 font-semibold">
                                                Status
                                            </th>
                                            <th className="px-5 py-3 font-semibold">
                                                Updated
                                            </th>
                                            <th className="px-5 py-3 text-right font-semibold">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {pagedThresholds.map((threshold) => {
                                            const type = APPROVAL_TYPES.find(
                                                (item) =>
                                                    item.value === threshold.approvalType,
                                            );

                                            const isActive =
                                                threshold.status === "ACTIVE";

                                            return (
                                                <tr
                                                    key={threshold.id}
                                                    className="hover:bg-gray-50/70"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-gray-900">
                                                            {type?.label ??
                                                                threshold.approvalType}
                                                        </div>

                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {type?.description}
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 font-semibold text-gray-800">
                                                        {formatThreshold(threshold)}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={
                                                                isActive
                                                                    ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800"
                                                                    : "inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600"
                                                            }
                                                        >
                                                            {threshold.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-gray-600">
                                                        {new Date(
                                                            threshold.updatedAt,
                                                        ).toLocaleString("en-IN")}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    startEditing(threshold)
                                                                }
                                                                disabled={isOperationInProgress}
                                                                title="Edit threshold"
                                                                aria-label={`Edit ${threshold.approvalType} threshold`}
                                                                className="rounded-lg p-2 text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <Pencil size={17} aria-hidden="true" />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void handleStatusChange(
                                                                        threshold,
                                                                    )
                                                                }
                                                                disabled={isOperationInProgress}
                                                                title={isActive ? "Deactivate threshold" : "Activate threshold"}
                                                                aria-label={`${isActive ? "Deactivate" : "Activate"} ${threshold.approvalType} threshold`}
                                                                className="rounded-lg p-2 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {actionId ===
                                                                    threshold.id ? (
                                                                    <LoaderCircle
                                                                        size={14}
                                                                        className="animate-spin"
                                                                        aria-hidden="true"
                                                                    />
                                                                ) : isActive ? (
                                                                    <CircleOff
                                                                        size={14}
                                                                        aria-hidden="true"
                                                                    />
                                                                ) : (
                                                                    <CheckCircle2
                                                                        size={14}
                                                                        aria-hidden="true"
                                                                    />
                                                                )}

                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <AdminListPagination
                                page={currentPage}
                                pageSize={pageSize}
                                total={sortedThresholds.length}
                                onPageChange={(nextPage) => setPage(nextPage)}
                                onPageSizeChange={(nextSize) => { setPageSize(nextSize); setPage(1); }}
                            />
                        </>
                    )}
                </section>
            </main>
        </MainLayout>
    );
};

export default FinancialApprovalThresholdsPage;