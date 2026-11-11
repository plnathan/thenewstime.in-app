import { useCallback, useEffect, useRef, useState } from "react";

import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    History,
    LoaderCircle,
    RefreshCw,
    ShieldCheck,
    XCircle,
} from "lucide-react";

import type {
    AdvertisementDetails,
    AdvertisementPayment,
    AdvertisementFinancialApproval,
    AdvertisementFinancialApprovalHistory,
    AdvertisementFinancialApprovalListMeta,
    AdvertisementFinancialApprovalStatus,
    AdvertisementFinancialApprovalType,
} from "@/api/advertisements/advertisement.api";

import {
    approveAdvertisementFinancialApproval,
    createAdvertisementFinancialApproval,
    getAdvertisementFinancialApprovalHistory,
    getAdvertisementFinancialApprovals,
    getAdvertisementPayments,
    holdAdvertisementFinancialApproval,
    rejectAdvertisementFinancialApproval,
    resubmitAdvertisementFinancialApproval,
    updateAdvertisementFinancialApprovalRemarks,
} from "@/api/advertisements/advertisement.api";

interface WorkspaceFinancialApprovalProps {
    advertisement: AdvertisementDetails;
    canRequest?: boolean;
    canReview?: boolean;
    /** Refresh parent payment/credit-exception readiness after a saved action. */
    onChanged?: () => void | Promise<void>;
}

type RequestValueType = "AMOUNT" | "PERCENTAGE";

type ReviewAction = "APPROVE" | "HOLD" | "REJECT" | null;

const APPROVAL_TYPES: Array<{
    value: AdvertisementFinancialApprovalType;
    label: string;
}> = [
        { value: "DISCOUNT", label: "Discount" },
        { value: "ADJUSTMENT", label: "Adjustment" },
        { value: "REFUND", label: "Refund" },
        { value: "PARTIAL_REFUND", label: "Partial refund" },
        { value: "CREDIT_EXCEPTION", label: "Credit exception" },
    ];

const formatMoney = (
    value: number | string | null | undefined,
    currencyCode: string,
): string => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "—";
    }

    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currencyCode || "INR",
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currencyCode || "INR"} ${amount.toLocaleString("en-IN")}`;
    }
};

const formatDateTime = (
    value: string | Date | null | undefined,
): string => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (!Number.isFinite(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const formatDate = (
    value: string | Date | null | undefined,
): string => {
    if (!value) {
        return "—";
    }

    // Parse YYYY-MM-DD as a local calendar date to avoid UTC timezone shifts.
    const date = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value);

    if (!Number.isFinite(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        dateStyle: "medium",
    });
};

const formatLabel = (value: string): string =>
    value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase());

const statusClasses = (
    status: AdvertisementFinancialApprovalStatus,
): string => {
    switch (status) {
        case "APPROVED":
            return "bg-green-50 text-green-800 ring-green-200";
        case "REJECTED":
            return "bg-red-50 text-red-800 ring-red-200";
        case "HOLD":
            return "bg-amber-50 text-amber-800 ring-amber-200";
        case "SUBMITTED":
        default:
            return "bg-blue-50 text-blue-800 ring-blue-200";
    }
};

const getErrorMessage = (error: unknown): string => {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
    ) {
        const response = (
            error as {
                response?: {
                    data?: {
                        message?: string;
                        errors?: unknown;
                    };
                };
            }
        ).response;

        if (response?.data?.message) {
            return response.data.message;
        }

        const responseErrors = response?.data?.errors;
        if (Array.isArray(responseErrors)) {
            const messages = responseErrors
                .map((item) => {
                    if (typeof item === "string") return item;
                    if (typeof item === "object" && item !== null && "message" in item) {
                        const message = (item as { message?: unknown }).message;
                        return typeof message === "string" ? message : "";
                    }
                    return "";
                })
                .filter(Boolean);
            if (messages.length > 0) return messages.join(" ");
        }

        if (typeof responseErrors === "string" && responseErrors.trim()) {
            return responseErrors;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "The financial approval operation failed. Please try again.";
};

const inputClassName =
    "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100";

const labelClassName = "block text-sm font-medium text-gray-700";

const buttonClassName =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

const cardClassName =
    "rounded-xl border border-gray-200 bg-white p-5 shadow-sm";

const WorkspaceFinancialApproval = ({
    advertisement,
    canRequest = true,
    canReview = true,
    onChanged,
}: WorkspaceFinancialApprovalProps) => {
    const [approval, setApproval] =
        useState<AdvertisementFinancialApproval | null>(null);
    const [approvals, setApprovals] = useState<AdvertisementFinancialApproval[]>([]);
    const [approvalPage, setApprovalPage] = useState(1);
    const [approvalMeta, setApprovalMeta] = useState<AdvertisementFinancialApprovalListMeta | null>(null);
    const [pendingApprovalExists, setPendingApprovalExists] = useState(false);

    const [history, setHistory] = useState<
        AdvertisementFinancialApprovalHistory[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const [approvalType, setApprovalType] =
        useState<AdvertisementFinancialApprovalType>("DISCOUNT");

    const [requestValueType, setRequestValueType] =
        useState<RequestValueType>("AMOUNT");

    const [requestedValue, setRequestedValue] = useState("");
    const [refundPaymentId, setRefundPaymentId] = useState("");
    const [refundPayments, setRefundPayments] = useState<AdvertisementPayment[]>([]);
    const [refundPaymentsLoading, setRefundPaymentsLoading] = useState(false);
    const isRefundRequest = approvalType === "REFUND" || approvalType === "PARTIAL_REFUND";
    const [requestRemarks, setRequestRemarks] = useState("");
    const [creditExceptionReason, setCreditExceptionReason] = useState("");
    const [expectedPaymentDueDate, setExpectedPaymentDueDate] = useState("");
    const [approvedCreditExceptionAmount, setApprovedCreditExceptionAmount] = useState("");
    const [editRemarks, setEditRemarks] = useState("");
    const [holdReason, setHoldReason] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [reviewRemarks, setReviewRemarks] = useState("");
    const [reviewAction, setReviewAction] = useState<ReviewAction>(null);
    const requestVersion = useRef(0);

    const currencyCode = advertisement.currencyCode || "INR";
    const isCreditException = approvalType === "CREDIT_EXCEPTION";

    useEffect(() => {
        if (!isRefundRequest) return;
        let cancelled = false;
        const loadRefundPayments = async (): Promise<void> => {
            await Promise.resolve();
            if (cancelled) return;
            setRefundPaymentsLoading(true);
            try {
                const response = await getAdvertisementPayments(advertisement.id);
                if (!cancelled) setRefundPayments((response.data ?? []).filter((payment) => (payment.paymentStatus ?? payment.status) === "VERIFIED"));
            } catch (loadError) {
                if (!cancelled) {
                    setRefundPayments([]);
                    setError(getErrorMessage(loadError));
                }
            } finally {
                if (!cancelled) setRefundPaymentsLoading(false);
            }
        };
        void loadRefundPayments();
        return () => { cancelled = true; };
    }, [advertisement.id, isRefundRequest]);

    const loadHistory = useCallback(
        async (approvalId: number, version: number): Promise<void> => {
            setHistoryLoading(true);
            setHistoryError(null);

            try {
                const response =
                    await getAdvertisementFinancialApprovalHistory(approvalId);
                if (version !== requestVersion.current) return;
                setHistory(response.data ?? []);
            } catch (loadError) {
                if (version !== requestVersion.current) return;
                setHistory([]);
                setHistoryError(getErrorMessage(loadError));
            } finally {
                if (version === requestVersion.current) setHistoryLoading(false);
            }
        },
        [],
    );

    const loadApproval = useCallback(async (): Promise<void> => {
        const version = ++requestVersion.current;
        setLoading(true);
        setError(null);
        setHistoryError(null);

        try {
            const [response, submittedResponse, heldResponse] = await Promise.all([
                getAdvertisementFinancialApprovals({
                    advertisementId: advertisement.id,
                    page: approvalPage,
                    pageSize: 20,
                }),
                getAdvertisementFinancialApprovals({
                    advertisementId: advertisement.id,
                    status: "SUBMITTED",
                    page: 1,
                    pageSize: 1,
                }),
                getAdvertisementFinancialApprovals({
                    advertisementId: advertisement.id,
                    status: "HOLD",
                    page: 1,
                    pageSize: 1,
                }),
            ]);
            if (version !== requestVersion.current) return;
            setPendingApprovalExists(
                (submittedResponse.data?.length ?? 0) > 0 ||
                (heldResponse.data?.length ?? 0) > 0,
            );

            const requests = (response.data ?? [])
                .sort((a, b) =>
                    new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
                );

            setApprovals(requests);
            setApprovalMeta(response.meta ?? null);

            const current = requests[0] ?? null;
            setApproval(current);
            setEditRemarks(current?.approvalRemarks ?? "");

            if (current) {
                await loadHistory(current.id, version);
            } else {
                setHistory([]);
                setHistoryLoading(false);
            }
        } catch (loadError) {
            if (version !== requestVersion.current) return;
            setApproval(null);
            setApprovals([]);
            setApprovalMeta(null);
            setPendingApprovalExists(false);
            setHistory([]);
            setHistoryError(null);
            setError(getErrorMessage(loadError));
        } finally {
            if (version === requestVersion.current) setLoading(false);
        }
    }, [advertisement.id, approvalPage, loadHistory]);

    const selectApproval = async (item: AdvertisementFinancialApproval): Promise<void> => {
        const version = ++requestVersion.current;
        setApproval(item);
        setEditRemarks(item.approvalRemarks ?? "");
        setReviewAction(null);
        setError(null);
        await loadHistory(item.id, version);
    };

    useEffect(() => {
        let cancelled = false;

        const fetchApproval = async (): Promise<void> => {
            // Defer the call so state updates inside loadApproval
            // do not run synchronously within the effect.
            await Promise.resolve();

            if (cancelled) {
                return;
            }

            await loadApproval();
        };

        void fetchApproval();

        return () => {
            cancelled = true;
            requestVersion.current += 1;
        };
    }, [loadApproval]);

    const runAction = async (
        action: () => Promise<unknown>,
        successMessage: string,
    ): Promise<void> => {
        setSaving(true);
        setError(null);
        setNotice(null);

        try {
            await action();
            setNotice(successMessage);
            await loadApproval();
            await onChanged?.();
        } catch (actionError) {
            setError(getErrorMessage(actionError));
        } finally {
            setSaving(false);
        }
    };

    const handleCreateRequest = async (
        event: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        if (!advertisement.clientId) {
            setError("A client must be associated with this advertisement.");
            return;
        }

        if (isRefundRequest && !refundPayments.some((payment) => payment.id === Number(refundPaymentId))) {
            setError("Select a verified payment for this refund request.");
            return;
        }

        const numericValue = Number(requestedValue);

        if (
            !Number.isFinite(numericValue) ||
            numericValue <= 0 ||
            requestedValue.trim() === ""
        ) {
            setError("Enter a valid requested amount or percentage.");
            return;
        }

        if (isCreditException) {
            if (requestValueType !== "AMOUNT") {
                setError("Credit exceptions must be requested as an amount.");
                return;
            }
            if (!creditExceptionReason.trim()) {
                setError("Enter the reason for the Credit Exception.");
                return;
            }
            if (!expectedPaymentDueDate) {
                setError("Select the expected payment due date.");
                return;
            }
        }

        if (requestValueType === "PERCENTAGE") {
            if (approvalType !== "DISCOUNT") {
                setError("Only discount requests can use a percentage.");
                return;
            }
            if (numericValue > 100) {
                setError("A discount percentage cannot exceed 100%.");
                return;
            }
        }

        if (approvalType === "DISCOUNT" && requestValueType === "AMOUNT") {
            const standardAmount = Number(advertisement.standardAmount);
            if (Number.isFinite(standardAmount) && standardAmount > 0 && numericValue > standardAmount) {
                setError("A discount amount cannot exceed the standard advertisement amount.");
                return;
            }
        }

        const payload = {
            advertisementId: advertisement.id,
            clientId: advertisement.clientId,
            approvalType,
            ...(isRefundRequest ? { paymentId: Number(refundPaymentId) } : {}),
            ...(requestValueType === "AMOUNT"
                ? { requestedAmount: numericValue }
                : { requestedPercentage: numericValue }),
            approvalRemarks: requestRemarks.trim() || null,
            ...(isCreditException
                ? { creditExceptionReason: creditExceptionReason.trim(), expectedPaymentDueDate }
                : {}),
        };

        await runAction(
            async () => {
                await createAdvertisementFinancialApproval(payload);
                setRequestedValue("");
                setRefundPaymentId("");
                setRequestRemarks("");
                setCreditExceptionReason("");
                setExpectedPaymentDueDate("");
            },
            "Financial approval request created successfully.",
        );
    };

    const handleSaveRemarks = async (): Promise<void> => {
        if (!approval || (!canRequest && !canReview)) {
            setError("You do not have permission to update approval remarks.");
            return;
        }

        await runAction(
            () =>
                updateAdvertisementFinancialApprovalRemarks(approval.id, {
                    approvalRemarks: editRemarks.trim() || null,
                }),
            "Approval remarks updated.",
        );
    };

    const handleResubmit = async (): Promise<void> => {
        if (!approval || !canRequest) {
            setError("This request cannot be resubmitted with your current permissions.");
            return;
        }

        await runAction(
            () =>
                resubmitAdvertisementFinancialApproval(approval.id, {
                    approvalRemarks: editRemarks.trim() || null,
                }),
            "Financial approval request resubmitted.",
        );
    };

    const handleReview = async (): Promise<void> => {
        if (!approval || !reviewAction) {
            return;
        }

        if (!canReview) {
            setError("You are not authorized to review this request here.");
            return;
        }

        if (reviewAction === "HOLD" && !holdReason.trim()) {
            setError("Enter a reason for placing the request on hold.");
            return;
        }

        if (reviewAction === "REJECT" && !rejectionReason.trim()) {
            setError("Enter a reason for rejecting the request.");
            return;
        }

        if (reviewAction === "APPROVE" && approval.approvalType === "CREDIT_EXCEPTION") {
            const amount = Number(approvedCreditExceptionAmount || approval.requestedAmount || 0);
            const requestedAmount = Number(approval.requestedAmount ?? 0);
            if (!Number.isFinite(amount) || amount <= 0 || amount > requestedAmount) {
                setError("The approved credit exception amount must be greater than zero and cannot exceed the requested amount.");
                return;
            }
        }

        if (reviewAction === "APPROVE") {
            await runAction(
                () =>
                    approveAdvertisementFinancialApproval(approval.id, {
                        approvalRemarks: reviewRemarks.trim() || null,
                        ...(approval.approvalType === "CREDIT_EXCEPTION"
                            ? { approvedAmount: Number(approvedCreditExceptionAmount || approval.requestedAmount || 0) }
                            : {}),
                    }),
                "Financial approval decision submitted.",
            );
        }

        if (reviewAction === "HOLD") {
            await runAction(
                () =>
                    holdAdvertisementFinancialApproval(approval.id, {
                        holdReason: holdReason.trim(),
                        remarks: reviewRemarks.trim() || null,
                    }),
                "Financial approval request placed on hold.",
            );
        }

        if (reviewAction === "REJECT") {
            await runAction(
                () =>
                    rejectAdvertisementFinancialApproval(approval.id, {
                        rejectionReason: rejectionReason.trim(),
                        remarks: reviewRemarks.trim() || null,
                    }),
                "Financial approval request rejected.",
            );
        }

        setReviewAction(null);
        setReviewRemarks("");
        setHoldReason("");
        setRejectionReason("");
    };

    const canResubmit =
        approval !== null &&
        (approval.status === "HOLD" || approval.status === "REJECTED");

    const canReviewCurrent =
        approval !== null &&
        canReview &&
        (approval.status === "SUBMITTED" || approval.status === "HOLD");

    const canCreateNewRequest = !pendingApprovalExists;

    const requestedValueText = (item: AdvertisementFinancialApproval): string => {
        if (item.requestedPercentage !== null) {
            return `${item.requestedPercentage}%`;
        }

        return formatMoney(item.requestedAmount, currencyCode);
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-green-700" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Financial Approval
                        </h2>
                    </div>

                    <p className="mt-1 max-w-3xl text-sm text-gray-600">
                        Manage discount, adjustment, refund and credit exception requests. Approval decisions are separate from payment transactions, and the server must enforce approved commercial terms before saving changes.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadApproval()}
                    disabled={loading || saving}
                    className={`${buttonClassName} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
                >
                    <RefreshCw
                        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </button>
            </header>

            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {notice && (
                <div
                    role="status"
                    className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{notice}</p>
                </div>
            )}

            <section className={cardClassName}>
                <h3 className="text-base font-semibold text-gray-900">
                    Advertisement financial summary
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Standard amount
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            {formatMoney(advertisement.standardAmount, currencyCode)}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Advertisement amount
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            {formatMoney(advertisement.advertisementAmount, currencyCode)}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Adjustment amount
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            {formatMoney(advertisement.adjustmentAmount, currencyCode)}
                        </p>
                    </div>
                </div>
            </section>

            {loading ? (
                <div className={`${cardClassName} flex items-center gap-3 text-sm text-gray-600`}>
                    <LoaderCircle className="h-5 w-5 animate-spin text-green-700" />
                    Loading financial approval details…
                </div>
            ) : (
                <>
                    <section className={cardClassName}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">
                                    Financial approval requests
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    All discount, adjustment, refund and credit exception requests for this advertisement.
                                </p>
                            </div>
                            <span className="text-sm text-gray-500">
                                {approvals.length} request(s) on this page
                            </span>
                        </div>

                        {approvals.length === 0 ? (
                            <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-6 text-center">
                                <ShieldCheck className="mx-auto h-8 w-8 text-gray-400" />
                                <p className="mt-2 font-medium text-gray-800">No financial approval request exists</p>
                                <p className="mt-1 text-sm text-gray-500">Create a discount, adjustment, refund or credit exception request.</p>
                            </div>
                        ) : (
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                        <tr>
                                            <th className="px-3 py-3 font-semibold">Request</th>
                                            <th className="px-3 py-3 font-semibold">Type</th>
                                            <th className="px-3 py-3 font-semibold">Requested value</th>
                                            <th className="px-3 py-3 font-semibold">Requested at</th>
                                            <th className="px-3 py-3 font-semibold">Status</th>
                                            <th className="px-3 py-3 font-semibold">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {approvals.map((item) => (
                                            <tr key={item.id} className={approval?.id === item.id ? "bg-green-50/70" : ""}>
                                                <td className="whitespace-nowrap px-3 py-3 font-semibold text-gray-900">FA-{item.id}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-gray-700">{formatLabel(item.approvalType)}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-gray-700">{requestedValueText(item)}</td>
                                                <td className="whitespace-nowrap px-3 py-3 text-gray-600">{formatDateTime(item.requestedAt)}</td>
                                                <td className="whitespace-nowrap px-3 py-3">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses(item.status)}`}>{formatLabel(item.status)}</span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-3">
                                                    <button type="button" onClick={() => void selectApproval(item)} disabled={saving} className="font-semibold text-green-700 hover:text-green-900 disabled:opacity-50">
                                                        {approval?.id === item.id ? "Selected" : "View details"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <p className="text-xs text-gray-500">
                                Page {approvalMeta?.page ?? approvalPage}{approvalMeta?.totalPages ? ` of ${approvalMeta.totalPages}` : ""}
                            </p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setApprovalPage((page) => Math.max(1, page - 1))} disabled={loading || saving || !(approvalMeta?.hasPrevious ?? approvalPage > 1)} className={`${buttonClassName} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>Previous</button>
                                <button type="button" onClick={() => setApprovalPage((page) => page + 1)} disabled={loading || saving || !(approvalMeta?.hasNext ?? false)} className={`${buttonClassName} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}>Next</button>
                            </div>
                        </div>
                    </section>

                    <section className={cardClassName}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">
                                    Selected request details
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Review request values, audit timestamps, remarks and workflow history.
                                </p>
                            </div>

                            {approval && (
                                <span
                                    className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClasses(
                                        approval.status,
                                    )}`}
                                >
                                    {formatLabel(approval.status)}
                                </span>
                            )}
                        </div>

                        {!approval ? (
                            <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-6 text-center">
                                <ShieldCheck className="mx-auto h-8 w-8 text-gray-400" />
                                <p className="mt-2 font-medium text-gray-800">
                                    Select a financial approval request
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Select a request from the list above to view its details and workflow history.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Request ID
                                        </p>
                                        <p className="mt-1 font-semibold text-gray-900">
                                            FA-{approval.id}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Request type
                                        </p>
                                        <p className="mt-1 font-medium text-gray-900">
                                            {formatLabel(approval.approvalType)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Requested value
                                        </p>
                                        <p className="mt-1 font-medium text-gray-900">
                                            {requestedValueText(approval)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Requested at
                                        </p>
                                        <p className="mt-1 text-sm text-gray-800">
                                            {formatDateTime(approval.requestedAt)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Requested by (user ID)
                                        </p>
                                        <p className="mt-1 text-sm text-gray-800">
                                            {approval.requestedBy}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Reviewed at
                                        </p>
                                        <p className="mt-1 text-sm text-gray-800">
                                            {formatDateTime(approval.reviewedAt)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Reviewed by (user ID)
                                        </p>
                                        <p className="mt-1 text-sm text-gray-800">
                                            {approval.reviewedBy ?? "—"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Last updated
                                        </p>
                                        <p className="mt-1 text-sm text-gray-800">
                                            {formatDateTime(approval.updatedAt)}
                                        </p>
                                    </div>

                                    {approval.paymentId !== null && (
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Related payment ID
                                            </p>
                                            <p className="mt-1 text-sm text-gray-800">
                                                {approval.paymentId}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {approval.approvalType === "CREDIT_EXCEPTION" && (
                                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Credit exception reason</p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm text-blue-950">{approval.creditExceptionReason || "—"}</p>
                                        </div>
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Expected payment due date</p>
                                            <p className="mt-1 text-sm text-blue-950">{formatDate(approval.expectedPaymentDueDate)}</p>
                                            {approval.overdueAt && <p className="mt-1 text-xs text-red-700">Overdue since {formatDateTime(approval.overdueAt)}</p>}
                                        </div>
                                    </div>
                                )}

                                {approval.holdReason && (
                                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                        <p className="text-sm font-semibold text-amber-900">
                                            Hold reason
                                        </p>
                                        <p className="mt-1 whitespace-pre-wrap text-sm text-amber-900">
                                            {approval.holdReason}
                                        </p>
                                    </div>
                                )}

                                {approval.rejectionReason && (
                                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                                        <p className="text-sm font-semibold text-red-900">
                                            Rejection reason
                                        </p>
                                        <p className="mt-1 whitespace-pre-wrap text-sm text-red-900">
                                            {approval.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-5">
                                    <label className={labelClassName} htmlFor="financial-remarks">
                                        Approval remarks
                                    </label>
                                    <textarea
                                        id="financial-remarks"
                                        value={editRemarks}
                                        onChange={(event) => setEditRemarks(event.target.value)}
                                        rows={3}
                                        maxLength={4000}
                                        disabled={saving || (!canRequest && !canReview)}
                                        readOnly={!canRequest && !canReview}
                                        className={inputClassName}
                                        placeholder="Enter the reason, supporting context or decision remarks."
                                    />

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => void handleSaveRemarks()}
                                            disabled={saving || (!canRequest && !canReview)}
                                            className={`${buttonClassName} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
                                        >
                                            Save remarks
                                        </button>

                                        {canRequest && canResubmit && (
                                            <button
                                                type="button"
                                                onClick={() => void handleResubmit()}
                                                disabled={saving}
                                                className={`${buttonClassName} bg-green-700 text-white hover:bg-green-800`}
                                            >
                                                {saving && (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                )}
                                                Resubmit request
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {canReviewCurrent && (
                                    <div className="mt-6 border-t border-gray-200 pt-5">
                                        <h4 className="font-semibold text-gray-900">
                                            Review actions
                                        </h4>

                                        <p className="mt-1 text-sm text-gray-500">
                                            The API must authorize every action and validate current commercial terms. This screen is not a substitute for server-side enforcement.
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setReviewAction("APPROVE")}
                                                disabled={saving}
                                                className={`${buttonClassName} bg-green-700 text-white hover:bg-green-800`}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Approve
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setReviewAction("HOLD")}
                                                disabled={saving}
                                                className={`${buttonClassName} bg-amber-600 text-white hover:bg-amber-700`}
                                            >
                                                <Clock3 className="h-4 w-4" />
                                                Place on hold
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setReviewAction("REJECT")}
                                                disabled={saving}
                                                className={`${buttonClassName} bg-red-700 text-white hover:bg-red-800`}
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Reject
                                            </button>
                                        </div>

                                        {reviewAction && (
                                            <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                <h5 className="font-semibold text-gray-900">
                                                    {reviewAction === "APPROVE"
                                                        ? "Approve request"
                                                        : reviewAction === "HOLD"
                                                            ? "Place request on hold"
                                                            : "Reject request"}
                                                </h5>

                                                {reviewAction === "APPROVE" && approval.approvalType === "CREDIT_EXCEPTION" && (
                                                    <div className="mt-4">
                                                        <label className={labelClassName} htmlFor="approved-credit-exception-amount">Approved credit exception amount ({currencyCode})</label>
                                                        <input id="approved-credit-exception-amount" type="number" min="0.01" max={approval.requestedAmount ?? undefined} step="0.01" value={approvedCreditExceptionAmount || String(approval.requestedAmount ?? "")} onChange={(event) => setApprovedCreditExceptionAmount(event.target.value)} className={inputClassName} disabled={saving} required />
                                                        <p className="mt-1 text-xs text-gray-500">The approved amount authorizes temporary credit only; it is not recorded as a payment or deducted from the outstanding balance.</p>
                                                    </div>
                                                )}

                                                {reviewAction === "HOLD" && (
                                                    <div className="mt-4">
                                                        <label
                                                            className={labelClassName}
                                                            htmlFor="financial-hold-reason"
                                                        >
                                                            Hold reason
                                                        </label>
                                                        <textarea
                                                            id="financial-hold-reason"
                                                            value={holdReason}
                                                            onChange={(event) =>
                                                                setHoldReason(event.target.value)
                                                            }
                                                            rows={2}
                                                            maxLength={2000}
                                                            className={inputClassName}
                                                            disabled={saving}
                                                            required
                                                        />
                                                    </div>
                                                )}

                                                {reviewAction === "REJECT" && (
                                                    <div className="mt-4">
                                                        <label
                                                            className={labelClassName}
                                                            htmlFor="financial-rejection-reason"
                                                        >
                                                            Rejection reason
                                                        </label>
                                                        <textarea
                                                            id="financial-rejection-reason"
                                                            value={rejectionReason}
                                                            onChange={(event) =>
                                                                setRejectionReason(event.target.value)
                                                            }
                                                            rows={2}
                                                            maxLength={2000}
                                                            className={inputClassName}
                                                            disabled={saving}
                                                            required
                                                        />
                                                    </div>
                                                )}

                                                <div className="mt-4">
                                                    <label
                                                        className={labelClassName}
                                                        htmlFor="financial-review-remarks"
                                                    >
                                                        Additional remarks
                                                    </label>
                                                    <textarea
                                                        id="financial-review-remarks"
                                                        value={reviewRemarks}
                                                        onChange={(event) =>
                                                            setReviewRemarks(event.target.value)
                                                        }
                                                        rows={2}
                                                        maxLength={4000}
                                                        className={inputClassName}
                                                        disabled={saving}
                                                    />
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleReview()}
                                                        disabled={saving}
                                                        className={`${buttonClassName} ${reviewAction === "REJECT"
                                                            ? "bg-red-700 text-white hover:bg-red-800"
                                                            : reviewAction === "HOLD"
                                                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                                                : "bg-green-700 text-white hover:bg-green-800"
                                                            }`}
                                                    >
                                                        {saving && (
                                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                                        )}
                                                        Confirm decision
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setReviewAction(null)}
                                                        disabled={saving}
                                                        className={`${buttonClassName} border border-gray-300 bg-white text-gray-700 hover:bg-gray-100`}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    {canRequest && canCreateNewRequest && (
                        <section className={cardClassName}>
                            <h3 className="text-base font-semibold text-gray-900">
                                Create financial approval request
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Submit one request for the commercial or financial action that
                                requires authorization.
                            </p>

                            <form
                                className="mt-5 space-y-4"
                                onSubmit={(event) => void handleCreateRequest(event)}
                            >
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className={labelClassName} htmlFor="approval-type">
                                            Approval type
                                        </label>
                                        <select
                                            id="approval-type"
                                            value={approvalType}
                                            onChange={(event) => {
                                                const nextType =
                                                    event.target.value as AdvertisementFinancialApprovalType;

                                                setApprovalType(nextType);
                                                setRequestedValue("");
                                                setRefundPaymentId("");
                                                if (nextType !== "DISCOUNT") setRequestValueType("AMOUNT");
                                            }}
                                            className={inputClassName}
                                            disabled={saving}
                                        >
                                            {APPROVAL_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            className={labelClassName}
                                            htmlFor="request-value-type"
                                        >
                                            Requested value type
                                        </label>
                                        <select
                                            id="request-value-type"
                                            value={requestValueType}
                                            onChange={(event) =>
                                                setRequestValueType(
                                                    event.target.value as RequestValueType,
                                                )
                                            }
                                            className={inputClassName}
                                            disabled={saving}
                                        >
                                            <option value="AMOUNT">Amount ({currencyCode})</option>
                                            {approvalType === "DISCOUNT" && (
                                                <option value="PERCENTAGE">Percentage (%)</option>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            className={labelClassName}
                                            htmlFor="requested-value"
                                        >
                                            {requestValueType === "PERCENTAGE"
                                                ? "Requested percentage (%)"
                                                : `Requested amount (${currencyCode})`}
                                        </label>
                                        <input
                                            id="requested-value"
                                            type="number"
                                            min="0.01"
                                            max={requestValueType === "PERCENTAGE" ? "100" : undefined}
                                            step="0.01"
                                            value={requestedValue}
                                            onChange={(event) => setRequestedValue(event.target.value)}
                                            className={inputClassName}
                                            disabled={saving}
                                            required
                                        />
                                    </div>

                                    {isRefundRequest && (
                                        <div className="sm:col-span-2">
                                            <label className={labelClassName} htmlFor="refund-approval-payment">Verified payment *</label>
                                            <select
                                                id="refund-approval-payment"
                                                required
                                                value={refundPaymentId}
                                                onChange={(event) => setRefundPaymentId(event.target.value)}
                                                disabled={saving || refundPaymentsLoading}
                                                className={inputClassName}
                                            >
                                                <option value="">{refundPaymentsLoading ? "Loading verified payments…" : "Select a verified payment"}</option>
                                                {refundPayments.map((payment) => (
                                                    <option key={payment.id} value={payment.id}>
                                                        Payment #{payment.id} · {formatMoney(payment.amount, currencyCode)}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-xs text-gray-500">Refund requests must reference a verified payment and specify an amount, not a percentage. The backend checks the refundable balance.</p>
                                        </div>
                                    )}

                                    {isCreditException && (
                                        <>
                                            <div className="sm:col-span-2">
                                                <label className={labelClassName} htmlFor="credit-exception-reason">Credit exception reason</label>
                                                <textarea id="credit-exception-reason" value={creditExceptionReason} onChange={(event) => setCreditExceptionReason(event.target.value)} rows={3} maxLength={2000} className={inputClassName} disabled={saving} required placeholder="Explain why the client needs temporary credit terms." />
                                            </div>
                                            <div>
                                                <label className={labelClassName} htmlFor="expected-payment-due-date">Expected payment due date</label>
                                                <input id="expected-payment-due-date" type="date" value={expectedPaymentDueDate} onChange={(event) => setExpectedPaymentDueDate(event.target.value)} className={inputClassName} disabled={saving} required />
                                            </div>
                                        </>
                                    )}

                                    <div className="sm:col-span-2">
                                        <label
                                            className={labelClassName}
                                            htmlFor="new-approval-remarks"
                                        >
                                            Request remarks
                                        </label>
                                        <textarea
                                            id="new-approval-remarks"
                                            value={requestRemarks}
                                            onChange={(event) =>
                                                setRequestRemarks(event.target.value)
                                            }
                                            rows={3}
                                            maxLength={4000}
                                            className={inputClassName}
                                            disabled={saving}
                                            placeholder="Explain why this request is needed and include supporting context."
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`${buttonClassName} bg-green-700 text-white hover:bg-green-800`}
                                    >
                                        {saving && (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        )}
                                        Submit request
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    <section className={cardClassName}>
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-gray-500" />
                            <h3 className="text-base font-semibold text-gray-900">
                                Selected request workflow history
                            </h3>
                        </div>

                        {historyError && (
                            <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                Workflow history could not be loaded: {historyError}
                            </div>
                        )}

                        {historyLoading ? (
                            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Loading approval history…
                            </div>
                        ) : history.length === 0 ? (
                            <p className="mt-4 text-sm text-gray-500">
                                No workflow history is available for this request yet.
                            </p>
                        ) : (
                            <ol className="mt-5 space-y-4">
                                {history.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="relative border-l-2 border-gray-200 pl-5"
                                    >
                                        <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-green-600" />

                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {entry.fromStatus
                                                        ? `${formatLabel(entry.fromStatus)} → `
                                                        : ""}
                                                    {formatLabel(entry.toStatus)}
                                                </p>

                                                {entry.remarks && (
                                                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                                                        {entry.remarks}
                                                    </p>
                                                )}

                                                {entry.holdReason && (
                                                    <p className="mt-1 whitespace-pre-wrap text-sm text-amber-800">
                                                        Hold reason: {entry.holdReason}
                                                    </p>
                                                )}

                                                {entry.rejectionReason && (
                                                    <p className="mt-1 whitespace-pre-wrap text-sm text-red-800">
                                                        Rejection reason: {entry.rejectionReason}
                                                    </p>
                                                )}
                                            </div>

                                            <time className="shrink-0 text-xs text-gray-500">
                                                {formatDateTime(entry.actionAt)}
                                            </time>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default WorkspaceFinancialApproval;
