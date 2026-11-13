import { BUSINESS_TIME_ZONE } from "@/helpers/businessTimeZone.helpers";
import { confirmDialog, reasonDialog } from "@/components/ui/Dialog/confirmDialog";
import {
    AlertCircle,
    CheckCircle2,
    CircleDollarSign,
    CreditCard,
    FileText,
    LoaderCircle,
    Plus,
    RefreshCw,
    RotateCcw,
    ShieldCheck,
    Wallet,
    X,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    cancelAdvertisementPayment,
    createAdvertisementPayment,
    createAdvertisementPaymentRefund,
    getAdvertisementPaymentRefunds,
    getAdvertisementPaymentSummary,
    getAdvertisementPayments,
    getAdvertisementFinancialApprovals,
    getAdvertisementRefundCommercialMatches,
    matchAdvertisementRefundToDiscount,
    verifyAdvertisementPayment,
} from "@/api/advertisements/advertisement.api";

import type {
    AdvertisementPayment,
    AdvertisementPaymentMethod,
    AdvertisementPaymentRefund,
    AdvertisementRefundCommercialMatch,
    AdvertisementFinancialApproval,
    AdvertisementPaymentStatus,
    AdvertisementPaymentSummary,
    AdvertisementPaymentType,
    CreateAdvertisementPaymentInput,
} from "@/api/advertisements/advertisement.api";

import {
    getApiErrorMessage,
} from "@/helpers/advertisementManagement.helpers";

import { getIstCalendarDate, istCalendarDateToUtcIso } from "@/helpers/businessTimeZone.helpers";

import Surface from "@/components/ui/Surface";

import Typography from "@/components/ui/Typography";

type PaymentReadinessVerificationStatus = "LOADING" | "VERIFIED" | "ERROR";

export interface PaymentReadinessSnapshot {
    payments: AdvertisementPayment[] | null;
    summary: AdvertisementPaymentSummary | null;
    verificationStatus: PaymentReadinessVerificationStatus;
}

interface WorkspacePaymentsProps {
    advertisementId: number;
    currencyCode: string;
    canManagePayments: boolean;
    onPaymentReadinessChange?: (snapshot: PaymentReadinessSnapshot) => void;
}

interface PaymentFormState {
    paymentType: AdvertisementPaymentType;
    amount: string;
    paymentDate: string;
    paymentMethod: AdvertisementPaymentMethod;
    transactionReference: string;
    notes: string;
}

interface RefundFormState {
    financialApprovalId: string;
    amount: string;
    refundDate: string;
    refundReference: string;
    refundReason: string;
}

type PaymentStatusValue = AdvertisementPaymentStatus | "UNKNOWN";

type PaymentWithOptionalStatus = AdvertisementPayment & {
    paymentStatus?: AdvertisementPaymentStatus | null;
};

const PAYMENT_TYPES: AdvertisementPaymentType[] = [
    "ADVANCE",
    "REGULAR",
    "INSTALLMENT",
    "FINAL",
];

const PAYMENT_METHODS: AdvertisementPaymentMethod[] = [
    "BANK_TRANSFER",
    "UPI",
    "CARD",
    "CHEQUE",
    "DEMAND_DRAFT",
    "CASH",
    "OTHER",
];

const createInitialPaymentForm = (): PaymentFormState => ({
    paymentType: "REGULAR",
    amount: "",
    paymentDate: getIstCalendarDate(),
    paymentMethod: "BANK_TRANSFER",
    transactionReference: "",
    notes: "",
});

const createInitialRefundForm = (): RefundFormState => ({
    financialApprovalId: "",
    amount: "",
    refundDate: getIstCalendarDate(),
    refundReference: "",
    refundReason: "",
});

const toNumber = (
    value: string | number | null | undefined,
): number => {
    if (value === null || value === undefined || value === "") {
        return 0;
    }

    const result = Number(value);

    return Number.isFinite(result) ? result : 0;
};

/**
 * Unlike toNumber(), this helper preserves the difference between
 * a legitimate zero and a missing or invalid financial amount.
 */
const toValidNumber = (
    value: string | number | null | undefined,
): number | null => {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        (typeof value === "string" && value.trim() === "")
    ) {
        return null;
    }

    const result = Number(value);

    return Number.isFinite(result) ? result : null;
};

const isValidPaymentSummary = (
    value: AdvertisementPaymentSummary | null,
): value is AdvertisementPaymentSummary => {
    if (value === null) {
        return false;
    }

    const requiredAmounts = [
        value.advertisementAmount,
        value.discountAmount,
        value.adjustmentAmount,
        value.verifiedPaymentAmount,
        value.refundedAmount,
        value.netPaidAmount,
        value.outstandingAmount,
    ];

    return requiredAmounts.every(
        (amount) => toValidNumber(amount) !== null,
    );
};

const formatSummaryCurrency = (
    value: string | number | null | undefined,
    currencyCode: string,
): string => {
    const amount = toValidNumber(value);

    return amount === null
        ? "Not available"
        : formatCurrency(amount, currencyCode);
};

const formatCurrency = (
    value: string | number | null | undefined,
    currencyCode: string,
): string => {
    const amount = toNumber(value);

    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currencyCode || "INR",
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currencyCode || "INR"} ${amount.toFixed(2)}`;
    }
};

const formatDate = (
    value: string | null | undefined,
): string => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        timeZone: BUSINESS_TIME_ZONE,
        dateStyle: "medium",
    }).format(date);
};

const formatDateTime = (
    value: string | null | undefined,
): string => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        timeZone: BUSINESS_TIME_ZONE,
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const formatLabel = (
    value: string | null | undefined,
): string => {
    if (typeof value !== "string" || value.trim() === "") {
        return "Not available";
    }

    return value
        .trim()
        .toLowerCase()
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map(
            (part) =>
                part.charAt(0).toUpperCase() + part.slice(1),
        )
        .join(" ");
};

/**
 * Some API responses expose the status as `status`, while others
 * expose it as `paymentStatus`. Normalize both without changing
 * the shared API interface.
 */
const getPaymentStatus = (
    payment: AdvertisementPayment,
): PaymentStatusValue => {
    const paymentWithOptionalStatus =
        payment as PaymentWithOptionalStatus;

    const status =
        paymentWithOptionalStatus.status ??
        paymentWithOptionalStatus.paymentStatus;

    if (
        typeof status === "string" &&
        [
            "PENDING",
            "RECEIVED",
            "VERIFIED",
            "CANCELLED",
            "REFUNDED",
        ].includes(status)
    ) {
        return status as AdvertisementPaymentStatus;
    }

    return "UNKNOWN";
};

const getStatusClassName = (
    status: PaymentStatusValue,
): string => {
    switch (status) {
        case "VERIFIED":
            return "border-green-200 bg-green-50 text-green-800";

        case "RECEIVED":
            return "border-blue-200 bg-blue-50 text-blue-800";

        case "PENDING":
            return "border-amber-200 bg-amber-50 text-amber-800";

        case "CANCELLED":
            return "border-red-200 bg-red-50 text-red-800";

        case "REFUNDED":
            return "border-purple-200 bg-purple-50 text-purple-800";

        default:
            return "border-gray-200 bg-gray-50 text-gray-700";
    }
};

const isVerifiable = (
    payment: AdvertisementPayment,
): boolean => {
    const status = getPaymentStatus(payment);

    return status === "PENDING" || status === "RECEIVED";
};

const isCancellable = (
    payment: AdvertisementPayment,
): boolean => {
    const status = getPaymentStatus(payment);

    return status === "PENDING" || status === "RECEIVED";
};

/**
 * The backend permits refunds only for VERIFIED payments.
 * A fully refunded payment must not offer another refund action.
 */
const isRefundable = (
    payment: AdvertisementPayment,
): boolean => getPaymentStatus(payment) === "VERIFIED";

const WorkspacePayments = ({
    advertisementId,
    currencyCode,
    canManagePayments,
    onPaymentReadinessChange,
}: WorkspacePaymentsProps) => {
    const paymentsHeadingRef = useRef<HTMLHeadingElement>(null);

    const [payments, setPayments] = useState<
        AdvertisementPayment[]
    >([]);

    const [summary, setSummary] =
        useState<AdvertisementPaymentSummary | null>(null);

    const [refundsByPayment, setRefundsByPayment] =
        useState<Record<number, AdvertisementPaymentRefund[]>>({});

    const [expandedPaymentId, setExpandedPaymentId] =
        useState<number | null>(null);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [notice, setNotice] = useState<string | null>(null);

    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const [refundPaymentId, setRefundPaymentId] =
        useState<number | null>(null);

    const [paymentForm, setPaymentForm] =
        useState<PaymentFormState>(createInitialPaymentForm);

    const [refundForm, setRefundForm] =
        useState<RefundFormState>(createInitialRefundForm);
    const [refundApprovals, setRefundApprovals] = useState<AdvertisementFinancialApproval[]>([]);
    const [loadingRefundApprovals, setLoadingRefundApprovals] = useState(false);

    const [commercialMatches, setCommercialMatches] = useState<AdvertisementRefundCommercialMatch[]>([]);
    const [matchRefunds, setMatchRefunds] = useState<AdvertisementPaymentRefund[]>([]);
    const [matchDiscountApprovals, setMatchDiscountApprovals] = useState<AdvertisementFinancialApproval[]>([]);
    const [matchRefundId, setMatchRefundId] = useState("");
    const [matchDiscountApprovalId, setMatchDiscountApprovalId] = useState("");
    const [matchPanelOpen, setMatchPanelOpen] = useState(false);
    const [matchLoading, setMatchLoading] = useState(false);


    /*
     * New payments are permitted only when the backend summary confirms
     * a positive outstanding balance. A missing summary is not treated as
     * a zero balance or as permission to record a payment.
     */
    const summaryIsValid = isValidPaymentSummary(summary);

    const outstandingAmount = summaryIsValid
        ? toValidNumber(summary.outstandingAmount)
        : null;

    const hasOutstandingBalance =
        summaryIsValid &&
        outstandingAmount !== null &&
        outstandingAmount > 0;

    const canRecordPayment =
        canManagePayments &&
        !loading &&
        !refreshing &&
        hasOutstandingBalance;

    /**
     * When the Payments tab mounts, bring its heading into view
     * and focus it. This prevents the section from opening below
     * the visible viewport after tab navigation.
     */
    useEffect(() => {
        const timerId = window.setTimeout(() => {
            paymentsHeadingRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

            paymentsHeadingRef.current?.focus({
                preventScroll: true,
            });
        }, 0);

        return () => {
            window.clearTimeout(timerId);
        };
    }, []);

    const loadPayments = useCallback(
        async (
            showRefreshState = false,
        ): Promise<void> => {
            onPaymentReadinessChange?.({
                payments: null,
                summary: null,
                verificationStatus: "LOADING",
            });

            if (
                !Number.isInteger(advertisementId) ||
                advertisementId <= 0
            ) {
                onPaymentReadinessChange?.({
                    payments: null,
                    summary: null,
                    verificationStatus: "ERROR",
                });
                setError("The advertisement ID is invalid.");
                setLoading(false);
                setRefreshing(false);
                return;
            }

            try {
                if (showRefreshState) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError(null);

                const [
                    paymentsResponse,
                    summaryResponse,
                ] = await Promise.all([
                    getAdvertisementPayments(advertisementId),
                    getAdvertisementPaymentSummary(advertisementId),
                ]);

                const loadedPayments = paymentsResponse.data ?? [];
                const loadedSummary = summaryResponse.data ?? null;

                setPayments(loadedPayments);
                setSummary(loadedSummary);
                onPaymentReadinessChange?.({
                    payments: loadedPayments,
                    summary: loadedSummary,
                    verificationStatus: isValidPaymentSummary(loadedSummary)
                        ? "VERIFIED"
                        : "ERROR",
                });
            } catch (loadError) {
                console.error(
                    "Failed to load advertisement payments:",
                    loadError,
                );

                onPaymentReadinessChange?.({
                    payments: null,
                    summary: null,
                    verificationStatus: "ERROR",
                });
                setError(getApiErrorMessage(loadError));
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [advertisementId, onPaymentReadinessChange],
    );

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            void loadPayments();
        }, 0);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [loadPayments]);

    const loadRefunds = useCallback(
        async (paymentId: number): Promise<void> => {
            try {
                const response =
                    await getAdvertisementPaymentRefunds(paymentId);

                setRefundsByPayment((current) => ({
                    ...current,
                    [paymentId]: response.data ?? [],
                }));
            } catch (loadError) {
                setError(getApiErrorMessage(loadError));
            }
        },
        [],
    );

    const handleToggleRefunds = async (
        paymentId: number,
    ): Promise<void> => {
        if (expandedPaymentId === paymentId) {
            setExpandedPaymentId(null);
            return;
        }

        setExpandedPaymentId(paymentId);

        if (
            !Object.prototype.hasOwnProperty.call(
                refundsByPayment,
                paymentId,
            )
        ) {
            await loadRefunds(paymentId);
        }
    };

    const handleCreatePayment = async (
        event: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        if (!canManagePayments || saving) {
            return;
        }

        if (!isValidPaymentSummary(summary)) {
            setError(
                "The payment summary is missing valid financial amounts. Refresh the Payments section before recording a payment.",
            );
            return;
        }

        const amount = Number(paymentForm.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Enter a valid payment amount greater than zero.");
            return;
        }

        if (!/^\d+(\.\d{1,2})?$/.test(paymentForm.amount.trim())) {
            setError(
                "Payment amount can have a maximum of two decimal places.",
            );
            return;
        }

        const currentOutstandingAmount = toValidNumber(
            summary.outstandingAmount,
        );

        if (currentOutstandingAmount === null) {
            setError(
                "The current outstanding balance is unavailable. Refresh the payment summary before recording a payment.",
            );
            return;
        }

        if (currentOutstandingAmount <= 0) {
            setShowPaymentForm(false);
            setError(
                "No outstanding balance remains. Additional payments cannot be recorded.",
            );
            return;
        }

        if (amount > currentOutstandingAmount) {
            setError(
                `Payment amount cannot exceed the outstanding balance of ${formatCurrency(
                    currentOutstandingAmount,
                    currencyCode,
                )}.`,
            );
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setNotice(null);

            /*
             * Re-fetch the authoritative backend summary immediately
             * before creating the payment. The displayed summary may be
             * stale if another payment was recorded in another session.
             */
            const latestSummaryResponse =
                await getAdvertisementPaymentSummary(advertisementId);
            const latestSummary = latestSummaryResponse.data ?? null;

            setSummary(latestSummary);

            if (!isValidPaymentSummary(latestSummary)) {
                setShowPaymentForm(false);
                setError(
                    "Unable to confirm the current outstanding balance. Refresh the Payments section and try again.",
                );
                return;
            }

            const latestOutstandingAmount = toValidNumber(
                latestSummary.outstandingAmount,
            );

            if (latestOutstandingAmount === null) {
                setShowPaymentForm(false);
                setError(
                    "The latest outstanding balance is unavailable. Refresh the Payments section and try again.",
                );
                return;
            }

            if (latestOutstandingAmount <= 0) {
                setShowPaymentForm(false);
                setPaymentForm(createInitialPaymentForm());
                setError(
                    "No outstanding balance remains. Additional payments cannot be recorded.",
                );
                return;
            }

            if (amount > latestOutstandingAmount) {
                setError(
                    `Payment amount exceeds the current outstanding balance of ${formatCurrency(
                        latestOutstandingAmount,
                        currencyCode,
                    )}. Reduce the payment amount and try again.`,
                );
                return;
            }

            const payload: CreateAdvertisementPaymentInput = {
                advertisementId,
                paymentType: paymentForm.paymentType,
                amount,
                paymentDate: paymentForm.paymentDate
                    ? istCalendarDateToUtcIso(paymentForm.paymentDate)
                    : new Date().toISOString(),
                paymentMethod: paymentForm.paymentMethod,
                ...(paymentForm.transactionReference.trim()
                    ? {
                        transactionReference:
                            paymentForm.transactionReference.trim(),
                    }
                    : {}),
                ...(paymentForm.notes.trim()
                    ? {
                        notes: paymentForm.notes.trim(),
                    }
                    : {}),
            };

            await createAdvertisementPayment(payload);

            setPaymentForm(createInitialPaymentForm());
            setShowPaymentForm(false);

            setNotice("Payment recorded successfully.");

            await loadPayments(true);
        } catch (saveError) {
            setError(getApiErrorMessage(saveError));
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyPayment = async (
        payment: AdvertisementPayment,
    ): Promise<void> => {
        if (!canManagePayments || saving) {
            return;
        }

        const confirmed = await confirmDialog(
            `Verify payment #${payment.id} for ${formatCurrency(
                payment.amount,
                currencyCode,
            )}?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setNotice(null);

            await verifyAdvertisementPayment(payment.id);

            setNotice(`Payment #${payment.id} verified successfully.`);

            await loadPayments(true);
        } catch (verifyError) {
            setError(getApiErrorMessage(verifyError));
        } finally {
            setSaving(false);
        }
    };

    const handleCancelPayment = async (
        payment: AdvertisementPayment,
    ): Promise<void> => {
        if (!canManagePayments || saving) {
            return;
        }

        const reason = await reasonDialog(
            `Enter the cancellation reason for payment #${payment.id}:`,
        );

        if (reason === null) {
            return;
        }

        if (!reason.trim()) {
            setError("A cancellation reason is required.");
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setNotice(null);

            await cancelAdvertisementPayment(payment.id, {
                cancellationReason: reason.trim(),
            });

            setNotice(`Payment #${payment.id} cancelled successfully.`);

            await loadPayments(true);
        } catch (cancelError) {
            setError(getApiErrorMessage(cancelError));
        } finally {
            setSaving(false);
        }
    };

    const loadCommercialMatching = async (): Promise<void> => {
        setMatchLoading(true);
        setError(null);
        try {
            const [matchesResponse, paymentsResponse] = await Promise.all([
                getAdvertisementRefundCommercialMatches(advertisementId),
                getAdvertisementPayments(advertisementId),
            ]);
            const existing = matchesResponse.data ?? [];
            const allPayments = paymentsResponse.data ?? [];
            const refundResponses = await Promise.all(
                allPayments.map((payment) => getAdvertisementPaymentRefunds(payment.id)),
            );
            const allRefunds = refundResponses.flatMap((response) => response.data ?? []);
            const discounts: AdvertisementFinancialApproval[] = [];
            for (let page = 1; page <= 100; page += 1) {
                const result = await getAdvertisementFinancialApprovals({
                    advertisementId,
                    status: "APPROVED",
                    page,
                    pageSize: 100,
                });
                const items = result.data ?? [];
                discounts.push(...items.filter((item) =>
                    item.approvalType === "DISCOUNT" &&
                    item.status === "APPROVED" &&
                    item.revokedAt == null &&
                    Number(item.approvedAmount) > 0,
                ));
                if (items.length < 100 || (result.meta?.totalPages !== undefined && page >= result.meta.totalPages)) break;
            }
            setCommercialMatches(existing);
            setMatchRefunds(allRefunds.filter((refund) => !existing.some((match) => match.refundId === refund.id)));
            setMatchDiscountApprovals(discounts.filter((approval) => !existing.some((match) => match.discountApprovalId === approval.id)));
            setMatchRefundId("");
            setMatchDiscountApprovalId("");
        } catch (loadError) {
            setError(getApiErrorMessage(loadError));
        } finally {
            setMatchLoading(false);
        }
    };

    const submitCommercialMatch = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        if (!canManagePayments || saving) return;
        const refund = matchRefunds.find((item) => item.id === Number(matchRefundId));
        const approval = matchDiscountApprovals.find((item) => item.id === Number(matchDiscountApprovalId));
        if (!refund || !approval) {
            setError("Select an executed refund and an approved discount request.");
            return;
        }
        if (Number(approval.approvedAmount) < Number(refund.amount)) {
            setError("The approved discount must cover the full executed refund.");
            return;
        }
        try {
            setSaving(true);
            setError(null);
            setNotice(null);
            await matchAdvertisementRefundToDiscount(refund.id, approval.id);
            setNotice(`Refund #${refund.id} matched to approved discount #${approval.id}. No additional refund was executed.`);
            await Promise.all([loadCommercialMatching(), loadPayments(true)]);
        } catch (matchError) {
            setError(getApiErrorMessage(matchError));
        } finally {
            setSaving(false);
        }
    };

    const openRefundForm = async (paymentId: number): Promise<void> => {
        setRefundPaymentId(paymentId);
        setRefundForm(createInitialRefundForm());
        setRefundApprovals([]);
        setError(null);
        setNotice(null);
        setLoadingRefundApprovals(true);
        try {
            // Read persisted refund executions before offering an approval for reuse.
            const refundsResponse = await getAdvertisementPaymentRefunds(paymentId);
            const executedRefunds = refundsResponse.data ?? [];
            setRefundsByPayment((current) => ({ ...current, [paymentId]: executedRefunds }));
            const executedApprovalIds = new Set(
                executedRefunds
                    .map((refund) => refund.financialApprovalId)
                    .filter((id): id is number => typeof id === "number" && Number.isSafeInteger(id)),
            );
            const payment = payments.find((item) => item.id === paymentId);
            const paymentAmount = payment ? Number(payment.amount) : 0;
            const refundedAmount = executedRefunds.reduce((total, refund) => total + Number(refund.amount), 0);
            const remainingRefundable = Math.round((paymentAmount - refundedAmount) * 100) / 100;
            const eligible: AdvertisementFinancialApproval[] = [];
            // The list is paginated. Do not hide older approved requests.
            for (let page = 1; page <= 100; page += 1) {
                const result = await getAdvertisementFinancialApprovals({
                    advertisementId,
                    paymentId,
                    status: "APPROVED",
                    page,
                    pageSize: 100,
                });
                const items = result.data ?? [];
                eligible.push(...items.filter((item) =>
                    (item.approvalType === "REFUND" || item.approvalType === "PARTIAL_REFUND") &&
                    item.paymentId === paymentId && item.status === "APPROVED" &&
                    !executedApprovalIds.has(item.id) &&
                    Number(item.approvedAmount ?? item.requestedAmount) > 0 &&
                    Math.round(Number(item.approvedAmount ?? item.requestedAmount) * 100) <= Math.round(remainingRefundable * 100),
                ));
                if (items.length < 100 || (result.meta?.totalPages !== undefined && page >= result.meta.totalPages)) break;
            }
            setRefundApprovals(eligible);
            if (eligible.length === 0) {
                setNotice(remainingRefundable <= 0
                    ? "This payment has no remaining refundable balance."
                    : "No unused approved refund request fits the remaining refundable balance. Create and approve a refund request in Financial Approval first.");
            }
        } catch (loadError) {
            setError(getApiErrorMessage(loadError));
        } finally {
            setLoadingRefundApprovals(false);
        }
    };

    const handleCreateRefund = async (
        event: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();

        if (!canManagePayments || saving || refundPaymentId === null) {
            return;
        }

        const selectedApproval = refundApprovals.find((item) =>
            item.id === Number(refundForm.financialApprovalId),
        );
        if (!selectedApproval || selectedApproval.paymentId !== refundPaymentId) {
            setError("Select an approved refund request linked to this payment.");
            return;
        }
        const approvedAmount = Number(selectedApproval.approvedAmount ?? selectedApproval.requestedAmount);
        if (!Number.isFinite(approvedAmount) || approvedAmount <= 0) {
            setError("The selected approval does not have a valid approved refund amount.");
            return;
        }
        // The refund amount is determined by the approved request, never by editable form state.
        const amount = approvedAmount;
        const currentPayment = payments.find((payment) => payment.id === refundPaymentId);
        const executedRefunds = refundsByPayment[refundPaymentId] ?? [];
        const refundableBalance = currentPayment
            ? Math.round((Number(currentPayment.amount) - executedRefunds.reduce((sum, refund) => sum + Number(refund.amount), 0)) * 100)
            : 0;
        if (Math.round(approvedAmount * 100) > refundableBalance) {
            setError("The approved refund exceeds the remaining refundable balance. Refresh the payment and request a new approval if necessary.");
            return;
        }
        if (executedRefunds.some((refund) => refund.financialApprovalId === selectedApproval.id)) {
            setError("This financial approval has already been used to execute a refund.");
            return;
        }

        // Validate the authorized amount before sending it to the backend.
        if (!/^\d+(\.\d{1,2})?$/.test(String(amount))) {
            setError("The approved refund amount must have no more than two decimal places.");
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setNotice(null);

            await createAdvertisementPaymentRefund(
                refundPaymentId,
                {
                    paymentId: refundPaymentId,
                    financialApprovalId: selectedApproval.id,
                    amount,
                    refundDate: refundForm.refundDate
                        ? istCalendarDateToUtcIso(refundForm.refundDate)
                        : new Date().toISOString(),
                    ...(refundForm.refundReference.trim()
                        ? {
                            refundReference:
                                refundForm.refundReference.trim(),
                        }
                        : {}),
                    ...(refundForm.refundReason.trim()
                        ? {
                            refundReason: refundForm.refundReason.trim(),
                        }
                        : {}),
                },
            );

            const completedPaymentId = refundPaymentId;

            setRefundForm(createInitialRefundForm());
            setRefundPaymentId(null);

            setNotice(
                `Refund recorded for payment #${completedPaymentId}.`,
            );

            await Promise.all([
                loadPayments(true),
                loadRefunds(completedPaymentId),
            ]);

            setExpandedPaymentId(completedPaymentId);
        } catch (refundError) {
            setError(getApiErrorMessage(refundError));
        } finally {
            setSaving(false);
        }
    };

    const summaryCards = [
        {
            label: "Advertisement Amount",
            value: summary?.advertisementAmount,
            icon: CircleDollarSign,
            description: "Agreed commercial amount",
            iconClassName: "bg-emerald-100 text-emerald-700",
            valueClassName: "text-gray-900",
        },
        {
            label: "Verified Payments",
            value: summary?.verifiedPaymentAmount,
            icon: ShieldCheck,
            description: "Payments confirmed",
            iconClassName: "bg-blue-100 text-blue-700",
            valueClassName: "text-blue-800",
        },
        {
            label: "Refunded Amount",
            value: summary?.refundedAmount,
            icon: RotateCcw,
            description: "Refunds recorded",
            iconClassName: "bg-purple-100 text-purple-700",
            valueClassName: "text-purple-800",
        },
        {
            label: "Outstanding Balance",
            value: summary?.outstandingAmount,
            icon: Wallet,
            description: "Remaining amount due",
            iconClassName: "bg-amber-100 text-amber-700",
            valueClassName: "text-amber-800",
        },
    ];

    if (loading) {
        return (
            <Surface className="border border-gray-200 p-6">
                <div
                    className="flex items-center gap-3 text-gray-600"
                    role="status"
                    aria-live="polite"
                >
                    <LoaderCircle
                        size={20}
                        className="animate-spin text-green-700"
                        aria-hidden="true"
                    />

                    <Typography as="p" variant="body" className="text-sm">
                        Loading payment records…
                    </Typography>
                </div>
            </Surface>
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-6">
            <section
                aria-labelledby="payments-heading"
                className="scroll-mt-6 flex flex-col gap-5"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div
                            ref={paymentsHeadingRef}
                            id="payments-heading"
                            tabIndex={-1}
                            className="scroll-mt-24 focus:outline-none"
                        >
                            <Typography
                                as="h2"
                                variant="headline"
                                className="text-gray-900"
                            >
                                Payments
                            </Typography>
                        </div>

                        <Typography
                            as="p"
                            variant="body"
                            className="mt-1.5 max-w-2xl text-sm text-gray-600"
                        >
                            Review payment transactions, verification history,
                            refunds, and the outstanding balance for this
                            advertisement.
                        </Typography>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadPayments(true)}
                        disabled={refreshing || saving}
                        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                            aria-hidden="true"
                        />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />

                        <div className="min-w-0 flex-1">{error}</div>

                        <button
                            type="button"
                            onClick={() => setError(null)}
                            className="rounded p-1 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Dismiss error"
                        >
                            <X size={15} aria-hidden="true" />
                        </button>
                    </div>
                )}

                {notice && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                    >
                        <CheckCircle2
                            size={18}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />

                        <div className="min-w-0 flex-1">{notice}</div>

                        <button
                            type="button"
                            onClick={() => setNotice(null)}
                            className="rounded p-1 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                            aria-label="Dismiss message"
                        >
                            <X size={15} aria-hidden="true" />
                        </button>
                    </div>
                )}

                {summaryIsValid && !hasOutstandingBalance && (
                    <div
                        role="status"
                        className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                    >
                        <CheckCircle2
                            size={18}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <div>
                            <div className="font-semibold">
                                No outstanding balance
                            </div>
                            <p className="mt-1 text-xs leading-5">
                                The outstanding balance is zero or below. Additional payments cannot be recorded for this advertisement.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Surface
                                key={card.label}
                                className="group relative overflow-hidden border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-200" />

                                <div className="relative min-w-0">
                                    <span
                                        className={`absolute right-0 top-0 inline-flex shrink-0 rounded-xl p-3 ${card.iconClassName}`}
                                    >
                                        <Icon size={21} aria-hidden="true" />
                                    </span>

                                    <Typography
                                        as="p"
                                        variant="body"
                                        className="min-h-10 pr-12 text-xs font-semibold uppercase leading-4 tracking-wider text-gray-500"
                                    >
                                        {card.label}
                                    </Typography>

                                    <Typography
                                        as="p"
                                        variant="body"
                                        className={`mt-3 w-full whitespace-nowrap text-left text-base font-bold leading-tight tracking-tight tabular-nums sm:text-lg ${card.valueClassName}`}
                                    >
                                        {formatSummaryCurrency(
                                            card.value,
                                            currencyCode,
                                        )}
                                    </Typography>

                                    <Typography
                                        as="p"
                                        variant="body"
                                        className="mt-2 text-xs leading-5 text-gray-500"
                                    >
                                        {card.description}
                                    </Typography>
                                </div>
                            </Surface>
                        );
                    })}
                </div>

                {summary && (
                    <Surface className="overflow-hidden border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50/80 px-5 py-4">
                            <span className="inline-flex rounded-lg bg-green-100 p-2 text-green-800">
                                <FileText size={18} aria-hidden="true" />
                            </span>

                            <div>
                                <Typography
                                    as="h3"
                                    variant="headline"
                                    className="text-sm font-semibold text-gray-900"
                                >
                                    Payment Reconciliation
                                </Typography>

                                <Typography
                                    as="p"
                                    variant="body"
                                    className="mt-1 text-xs text-gray-500"
                                >
                                    Breakdown of discounts, adjustments, and
                                    payments received.
                                </Typography>
                            </div>
                        </div>

                        <dl className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
                            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Discount Amount
                                </dt>

                                <dd className="mt-2 break-words text-lg font-semibold text-gray-900">
                                    {formatSummaryCurrency(
                                        summary.discountAmount,
                                        currencyCode,
                                    )}
                                </dd>

                                <p className="mt-1 text-xs text-gray-500">
                                    Commercial discount
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Adjustment Amount
                                </dt>

                                <dd className="mt-2 break-words text-lg font-semibold text-gray-900">
                                    {formatSummaryCurrency(
                                        summary.adjustmentAmount,
                                        currencyCode,
                                    )}
                                </dd>

                                <p className="mt-1 text-xs text-gray-500">
                                    Additional financial adjustment
                                </p>
                            </div>

                            <div className="rounded-xl border border-green-200 bg-green-50/70 p-4">
                                <dt className="text-xs font-semibold uppercase tracking-wide text-green-800">
                                    Net Paid Amount
                                </dt>

                                <dd className="mt-2 break-words text-lg font-bold text-green-800">
                                    {formatSummaryCurrency(
                                        summary.netPaidAmount,
                                        currencyCode,
                                    )}
                                </dd>

                                <p className="mt-1 text-xs text-green-700">
                                    Net amount after refunds
                                </p>
                            </div>
                        </dl>
                    </Surface>
                )}
            </section>

            <Surface className="border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Refund-to-Discount Matching</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-600">
                            Match an already executed refund to an approved and applied commercial discount.
                            Matching is an audit link only: it does not execute another refund or change the commercial amount.
                        </p>
                    </div>
                    <button type="button" disabled={matchLoading || saving} onClick={() => {
                        if (matchPanelOpen) setMatchPanelOpen(false);
                        else { setMatchPanelOpen(true); void loadCommercialMatching(); }
                    }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        {matchPanelOpen ? "Close matching" : "View refund matching"}
                    </button>
                </div>
                {matchPanelOpen && (
                    <div className="mt-5 space-y-4">
                        <button type="button" disabled={matchLoading || saving} onClick={() => void loadCommercialMatching()} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 disabled:opacity-50">
                            <RefreshCw size={14} aria-hidden="true" /> {matchLoading ? "Loading…" : "Refresh matches and approvals"}
                        </button>
                        {commercialMatches.length > 0 && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                <p className="text-sm font-semibold text-green-900">Existing matched refunds</p>
                                <ul className="mt-2 space-y-1 text-sm text-green-900">
                                    {commercialMatches.map((match) => <li key={match.id}>Refund #{match.refundId} · Discount approval #{match.discountApprovalId} · {formatCurrency(match.matchedAmount, currencyCode)}</li>)}
                                </ul>
                            </div>
                        )}
                        {canManagePayments && (
                            <form onSubmit={(event) => void submitCommercialMatch(event)} className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                    Executed refund *
                                    <select required disabled={matchLoading || saving} value={matchRefundId} onChange={(event) => { setMatchRefundId(event.target.value); setMatchDiscountApprovalId(""); }} className="min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2">
                                        <option value="">Select unmatched refund</option>
                                        {matchRefunds.map((refund) => <option key={refund.id} value={refund.id}>Refund #{refund.id} — {formatCurrency(refund.amount, currencyCode)}</option>)}
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                                    Approved discount request *
                                    <select required disabled={matchLoading || saving || !matchRefundId} value={matchDiscountApprovalId} onChange={(event) => setMatchDiscountApprovalId(event.target.value)} className="min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2">
                                        <option value="">Select unused approved discount</option>
                                        {matchDiscountApprovals.filter((approval) => Number(approval.approvedAmount) >= Number(matchRefunds.find((refund) => refund.id === Number(matchRefundId))?.amount ?? Infinity)).map((approval) => <option key={approval.id} value={approval.id}>Approval #{approval.id} — {formatCurrency(approval.approvedAmount, currencyCode)}</option>)}
                                    </select>
                                </label>
                                <p className="text-xs text-gray-600 sm:col-span-2">The approved discount must already be applied in Pricing & Commercial. The backend verifies eligibility and prevents duplicate matching.</p>
                                <div className="sm:col-span-2">
                                    <button type="submit" disabled={saving || matchLoading || !matchRefundId || !matchDiscountApprovalId} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : "Match existing refund"}</button>
                                </div>
                            </form>
                        )}
                        {!matchLoading && matchRefunds.length === 0 && <p className="text-sm text-gray-600">No unmatched executed refunds are available.</p>}
                    </div>
                )}
            </Surface>

            {showPaymentForm && canRecordPayment && (
                <Surface className="border border-green-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="inline-flex rounded-lg bg-green-100 p-2.5 text-green-800">
                            <Plus size={19} aria-hidden="true" />
                        </span>

                        <div>
                            <Typography
                                as="h3"
                                variant="headline"
                                className="text-base font-semibold text-gray-900"
                            >
                                Record a Payment
                            </Typography>

                            <Typography
                                as="p"
                                variant="body"
                                className="mt-1 text-sm text-gray-600"
                            >
                                Enter the transaction details. Verification is
                                a separate action and is recorded in the audit
                                history.
                            </Typography>
                        </div>
                    </div>

                    <form
                        onSubmit={(event) => void handleCreatePayment(event)}
                        className="mt-5 flex flex-col gap-4"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-gray-700">
                                    Payment Type{" "}
                                    <span className="text-red-600">*</span>
                                </span>

                                <select
                                    required
                                    value={paymentForm.paymentType}
                                    onChange={(event) =>
                                        setPaymentForm((current) => ({
                                            ...current,
                                            paymentType: event.target
                                                .value as AdvertisementPaymentType,
                                        }))
                                    }
                                    className="min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                                >
                                    {PAYMENT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {formatLabel(type)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-gray-700">
                                    Amount ({currencyCode}){" "}
                                    <span className="text-red-600">*</span>
                                </span>

                                <input
                                    required
                                    type="number"
                                    min="0.01"
                                    max={hasOutstandingBalance ? outstandingAmount ?? undefined : undefined}
                                    step="0.01"
                                    inputMode="decimal"
                                    value={paymentForm.amount}
                                    onChange={(event) =>
                                        setPaymentForm((current) => ({
                                            ...current,
                                            amount: event.target.value,
                                        }))
                                    }
                                    placeholder="Enter payment amount"
                                    aria-describedby="payment-amount-limit"
                                    className="min-h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                                />
                                <span
                                    id="payment-amount-limit"
                                    className="text-xs text-gray-500"
                                >
                                    Maximum payable: {outstandingAmount === null
                                        ? "Not available"
                                        : formatCurrency(outstandingAmount, currencyCode)}
                                </span>
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-gray-700">
                                    Payment Date{" "}
                                    <span className="text-red-600">*</span>
                                </span>

                                <input
                                    required
                                    type="date"
                                    value={paymentForm.paymentDate}
                                    onChange={(event) =>
                                        setPaymentForm((current) => ({
                                            ...current,
                                            paymentDate: event.target.value,
                                        }))
                                    }
                                    className="min-h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                                />
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-gray-700">
                                    Payment Method{" "}
                                    <span className="text-red-600">*</span>
                                </span>

                                <select
                                    required
                                    value={paymentForm.paymentMethod}
                                    onChange={(event) =>
                                        setPaymentForm((current) => ({
                                            ...current,
                                            paymentMethod: event.target
                                                .value as AdvertisementPaymentMethod,
                                        }))
                                    }
                                    className="min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                                >
                                    {PAYMENT_METHODS.map((method) => (
                                        <option key={method} value={method}>
                                            {formatLabel(method)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-sm font-medium text-gray-700">
                                    Transaction Reference
                                </span>

                                <input
                                    type="text"
                                    maxLength={150}
                                    value={paymentForm.transactionReference}
                                    onChange={(event) =>
                                        setPaymentForm((current) => ({
                                            ...current,
                                            transactionReference:
                                                event.target.value,
                                        }))
                                    }
                                    placeholder="UTR, cheque number, receipt reference"
                                    className="min-h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 md:col-span-2 xl:col-span-1">
                                <span className="text-sm font-medium text-gray-700">
                                    Notes
                                </span>

                                <input
                                    type="text"
                                    maxLength={1000}
                                    value={paymentForm.notes}
                                    onChange={(event) =>
                                        setPaymentForm((current) => ({
                                            ...current,
                                            notes: event.target.value,
                                        }))
                                    }
                                    placeholder="Optional payment notes"
                                    className="min-h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                                />
                            </label>
                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPaymentForm(false);
                                    setPaymentForm(createInitialPaymentForm());
                                }}
                                disabled={saving}
                                className="inline-flex min-h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                            >
                                {saving && (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                        aria-hidden="true"
                                    />
                                )}

                                Save Payment
                            </button>
                        </div>
                    </form>
                </Surface>
            )}

            <Surface className="min-w-0 overflow-hidden border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Typography
                            as="h3"
                            variant="headline"
                            className="text-base font-semibold text-gray-900"
                        >
                            Payment History
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="mt-1 text-sm text-gray-600"
                        >
                            {payments.length}{" "}
                            {payments.length === 1
                                ? "transaction"
                                : "transactions"}
                        </Typography>
                    </div>

                    {canManagePayments && hasOutstandingBalance && (
                        <button
                            type="button"
                            onClick={() => {
                                setError(null);
                                setNotice(null);
                                setShowPaymentForm((current) => !current);
                            }}
                            disabled={refreshing || saving}
                            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 sm:self-auto"
                        >
                            {showPaymentForm ? (
                                <X size={16} aria-hidden="true" />
                            ) : (
                                <Plus size={16} aria-hidden="true" />
                            )}

                            {showPaymentForm
                                ? "Close Form"
                                : "Record Payment"}
                        </button>
                    )}
                </div>

                {payments.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <span className="mx-auto inline-flex rounded-2xl bg-gray-100 p-4 text-gray-500">
                            <CreditCard size={30} aria-hidden="true" />
                        </span>

                        <Typography
                            as="h4"
                            variant="headline"
                            className="mt-4 text-sm font-semibold text-gray-900"
                        >
                            No payments recorded
                        </Typography>

                        <Typography
                            as="p"
                            variant="body"
                            className="mt-1 text-sm text-gray-600"
                        >
                            Payment transactions for this advertisement will
                            appear here.
                        </Typography>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1150px] table-fixed border-collapse text-left text-sm">
                            <colgroup>
                                <col className="w-44" />
                                <col className="w-40" />
                                <col className="w-36" />
                                <col className="w-44" />
                                <col className="w-32" />
                                <col className="w-60" />
                                <col className="w-52" />
                                <col className="w-56" />
                            </colgroup>

                            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold"
                                    >
                                        Actions
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold"
                                    >
                                        Payment
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold"
                                    >
                                        Date
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-3 py-3 font-semibold"
                                    >
                                        Transaction Reference
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-right font-semibold"
                                    >
                                        Amount
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold"
                                    >
                                        Status
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold"
                                    >
                                        Audit Information
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-4 py-3 font-semibold"
                                    >
                                        Notes
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {payments.map((payment) => {
                                    const paymentStatus =
                                        getPaymentStatus(payment);

                                    return (
                                        <tr
                                            key={payment.id}
                                            className="align-top transition-colors hover:bg-gray-50/70"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col items-start gap-2">
                                                    {canManagePayments &&
                                                        isVerifiable(payment) && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void handleVerifyPayment(
                                                                        payment,
                                                                    )
                                                                }
                                                                disabled={saving}
                                                                className="inline-flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-600"
                                                            >
                                                                <ShieldCheck
                                                                    size={14}
                                                                    aria-hidden="true"
                                                                />
                                                                Verify
                                                            </button>
                                                        )}

                                                    {canManagePayments &&
                                                        isCancellable(payment) && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void handleCancelPayment(
                                                                        payment,
                                                                    )
                                                                }
                                                                disabled={saving}
                                                                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                            >
                                                                <X
                                                                    size={14}
                                                                    aria-hidden="true"
                                                                />
                                                                Cancel
                                                            </button>
                                                        )}

                                                    {canManagePayments &&
                                                        isRefundable(payment) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    void openRefundForm(payment.id);
                                                                }}
                                                                disabled={saving}
                                                                className="inline-flex items-center gap-1.5 rounded-md border border-purple-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                            >
                                                                <RotateCcw
                                                                    size={14}
                                                                    aria-hidden="true"
                                                                />
                                                                Execute Approved Refund
                                                            </button>
                                                        )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void handleToggleRefunds(
                                                                payment.id,
                                                            )
                                                        }
                                                        className="text-left text-xs font-semibold text-green-800 underline decoration-green-300 underline-offset-2 hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-600"
                                                    >
                                                        {expandedPaymentId ===
                                                            payment.id
                                                            ? "Hide refunds"
                                                            : "View refunds"}
                                                    </button>
                                                </div>

                                                {refundPaymentId ===
                                                    payment.id &&
                                                    canManagePayments && (
                                                        <form
                                                            onSubmit={(event) =>
                                                                void handleCreateRefund(
                                                                    event,
                                                                )
                                                            }
                                                            className="mt-3 min-w-64 space-y-3 rounded-lg border border-purple-200 bg-purple-50 p-3"
                                                        >
                                                            <Typography
                                                                as="h4"
                                                                variant="body"
                                                                className="text-base font-semibold text-purple-900"
                                                            >
                                                                Execute Approved Refund
                                                            </Typography>

                                                            <p className="text-xs text-purple-900">Refund execution requires an approved REFUND or PARTIAL_REFUND request linked to this verified payment. Each approval can be executed only once.</p>
                                                            <label className="flex flex-col gap-1">
                                                                <span className="text-xs font-medium text-gray-700">Approved refund request *</span>
                                                                <select
                                                                    required
                                                                    disabled={saving || loadingRefundApprovals}
                                                                    value={refundForm.financialApprovalId}
                                                                    onChange={(event) => {
                                                                        const selected = refundApprovals.find((item) => item.id === Number(event.target.value));
                                                                        setRefundForm((current) => ({
                                                                            ...current,
                                                                            financialApprovalId: event.target.value,
                                                                            amount: selected ? String(selected.approvedAmount ?? selected.requestedAmount ?? "") : "",
                                                                        }));
                                                                    }}
                                                                    className="min-h-9 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
                                                                >
                                                                    <option value="">{loadingRefundApprovals ? "Loading approvals…" : "Select an approved refund"}</option>
                                                                    {refundApprovals.map((item) => (
                                                                        <option key={item.id} value={item.id}>
                                                                            #{item.id} · {item.approvalType} · {currencyCode} {Number(item.approvedAmount ?? item.requestedAmount).toFixed(2)}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </label>
                                                            <label className="flex flex-col gap-1">
                                                                <span className="text-xs font-medium text-gray-700">
                                                                    Refund Amount (
                                                                    {currencyCode}
                                                                    ) *
                                                                </span>

                                                                <input
                                                                    required
                                                                    type="number"
                                                                    min="0.01"
                                                                    step="0.01"
                                                                    value={
                                                                        refundForm.amount
                                                                    }
                                                                    readOnly
                                                                    aria-readonly="true"
                                                                    title="This amount is fixed by the selected approved refund request."
                                                                    className="min-h-9 cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-2 py-1.5 text-sm text-gray-700"
                                                                />
                                                            </label>

                                                            <label className="flex flex-col gap-1">
                                                                <span className="text-xs font-medium text-gray-700">
                                                                    Refund Date *
                                                                </span>

                                                                <input
                                                                    required
                                                                    type="date"
                                                                    value={
                                                                        refundForm.refundDate
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        setRefundForm(
                                                                            (
                                                                                current,
                                                                            ) => ({
                                                                                ...current,
                                                                                refundDate:
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                    className="min-h-9 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100"
                                                                />
                                                            </label>

                                                            <label className="flex flex-col gap-1">
                                                                <span className="text-xs font-medium text-gray-700">
                                                                    Refund Reference
                                                                </span>

                                                                <input
                                                                    type="text"
                                                                    maxLength={150}
                                                                    value={
                                                                        refundForm.refundReference
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        setRefundForm(
                                                                            (
                                                                                current,
                                                                            ) => ({
                                                                                ...current,
                                                                                refundReference:
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                    className="min-h-9 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100"
                                                                />
                                                            </label>

                                                            <label className="flex flex-col gap-1">
                                                                <span className="text-xs font-medium text-gray-700">
                                                                    Refund Reason
                                                                </span>

                                                                <textarea
                                                                    rows={2}
                                                                    maxLength={1000}
                                                                    value={
                                                                        refundForm.refundReason
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        setRefundForm(
                                                                            (
                                                                                current,
                                                                            ) => ({
                                                                                ...current,
                                                                                refundReason:
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                    className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-100"
                                                                />
                                                            </label>

                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="submit"
                                                                    disabled={saving || loadingRefundApprovals || !refundForm.financialApprovalId}
                                                                    className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                                                >
                                                                    {saving && (
                                                                        <LoaderCircle
                                                                            size={13}
                                                                            className="animate-spin"
                                                                            aria-hidden="true"
                                                                        />
                                                                    )}

                                                                    Execute Refund
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setRefundPaymentId(
                                                                            null,
                                                                        )
                                                                    }
                                                                    disabled={saving}
                                                                    className="inline-flex min-h-9 items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-600"
                                                                >
                                                                    Close
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}

                                                {expandedPaymentId ===
                                                    payment.id && (
                                                        <div className="mt-3 min-w-64 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                            <Typography
                                                                as="h4"
                                                                variant="body"
                                                                className="text-sm font-semibold uppercase tracking-wide text-gray-600"
                                                            >
                                                                Refund History
                                                            </Typography>
                                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                                                <div className="text-xs text-gray-600">
                                                                    {Object.prototype.hasOwnProperty.call(refundsByPayment, payment.id) ? (
                                                                        <>
                                                                            <span className="font-semibold">Total refunded:</span>{" "}
                                                                            {formatCurrency(
                                                                                (refundsByPayment[payment.id] ?? []).reduce((total, refund) => total + Number(refund.amount), 0),
                                                                                currencyCode,
                                                                            )}
                                                                            <span className="mx-2 text-gray-300">|</span>
                                                                            <span className="font-semibold">Remaining refundable:</span>{" "}
                                                                            {formatCurrency(
                                                                                Math.max(0, Number(payment.amount) - (refundsByPayment[payment.id] ?? []).reduce((total, refund) => total + Number(refund.amount), 0)),
                                                                                currencyCode,
                                                                            )}
                                                                        </>
                                                                    ) : "Load refund transactions to view the balance."}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => void loadRefunds(payment.id)}
                                                                    disabled={saving}
                                                                    className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                                                    aria-label={`Refresh refund history for payment ${payment.id}`}
                                                                >
                                                                    <RefreshCw size={13} aria-hidden="true" />
                                                                    Refresh refunds
                                                                </button>
                                                            </div>

                                                            {!Object.prototype.hasOwnProperty.call(
                                                                refundsByPayment,
                                                                payment.id,
                                                            ) ? (
                                                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                                                                    <LoaderCircle
                                                                        size={14}
                                                                        className="animate-spin"
                                                                        aria-hidden="true"
                                                                    />
                                                                    Loading refunds…
                                                                </div>
                                                            ) : refundsByPayment[
                                                                payment.id
                                                            ].length === 0 ? (
                                                                <Typography
                                                                    as="p"
                                                                    variant="body"
                                                                    className="mt-2 text-xs text-gray-600"
                                                                >
                                                                    No refunds
                                                                    recorded.
                                                                </Typography>
                                                            ) : (
                                                                <ul className="mt-2 space-y-3">
                                                                    {refundsByPayment[
                                                                        payment.id
                                                                    ].map(
                                                                        (refund) => (
                                                                            <li
                                                                                key={
                                                                                    refund.id
                                                                                }
                                                                                className="border-t border-gray-200 pt-2 first:border-0 first:pt-0"
                                                                            >
                                                                                <div className="flex items-start justify-between gap-3">
                                                                                    <span className="text-xs text-gray-600">
                                                                                        {formatDate(
                                                                                            refund.refundDate,
                                                                                        )}
                                                                                    </span>

                                                                                    <span className="whitespace-nowrap text-xs font-semibold text-gray-900">
                                                                                        {formatSummaryCurrency(
                                                                                            refund.amount,
                                                                                            currencyCode,
                                                                                        )}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                                                                                    <span>Refund #{refund.id}</span>
                                                                                    {refund.financialApprovalId != null && (
                                                                                        <span>Financial approval #{refund.financialApprovalId}</span>
                                                                                    )}
                                                                                    {refund.refundedBy != null && (
                                                                                        <span>Processed by user #{refund.refundedBy}</span>
                                                                                    )}
                                                                                </div>

                                                                                {refund.refundReference && (
                                                                                    <div className="mt-1 break-all text-xs text-gray-600">
                                                                                        Reference:{" "}
                                                                                        {
                                                                                            refund.refundReference
                                                                                        }
                                                                                    </div>
                                                                                )}

                                                                                {refund.refundReason && (
                                                                                    <div className="mt-1 whitespace-normal text-xs text-gray-600">
                                                                                        {
                                                                                            refund.refundReason
                                                                                        }
                                                                                    </div>
                                                                                )}

                                                                                <div className="mt-1 text-xs text-gray-500">
                                                                                    Recorded:{" "}
                                                                                    {formatDateTime(
                                                                                        refund.createdAt,
                                                                                    )}
                                                                                </div>
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {formatLabel(
                                                        payment.paymentType ??
                                                        "UNKNOWN",
                                                    )}
                                                </div>

                                                <div className="mt-1 text-xs text-gray-600">
                                                    {formatLabel(
                                                        payment.paymentMethod ??
                                                        "UNKNOWN",
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="whitespace-nowrap font-medium text-gray-800">
                                                    {formatDate(
                                                        payment.paymentDate,
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-3 py-4">
                                                <div
                                                    className="break-all text-xs leading-5 text-gray-700"
                                                    title={
                                                        payment.transactionReference ||
                                                        undefined
                                                    }
                                                >
                                                    {payment.transactionReference ||
                                                        "—"}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-gray-900">
                                                {formatSummaryCurrency(
                                                    payment.amount,
                                                    currencyCode,
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClassName(
                                                        paymentStatus,
                                                    )}`}
                                                >
                                                    {formatLabel(paymentStatus)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-xs leading-5 text-gray-600">
                                                <div>
                                                    Recorded:{" "}
                                                    {formatDateTime(
                                                        payment.recordedAt,
                                                    )}
                                                </div>

                                                {payment.recordedByName && (
                                                    <div className="mt-1">
                                                        By{" "}
                                                        {payment.recordedByName}
                                                    </div>
                                                )}

                                                {payment.verifiedAt && (
                                                    <div className="mt-2 text-green-800">
                                                        Verified:{" "}
                                                        {formatDateTime(
                                                            payment.verifiedAt,
                                                        )}
                                                    </div>
                                                )}

                                                {payment.verifiedByName && (
                                                    <div className="mt-1 text-green-800">
                                                        By{" "}
                                                        {payment.verifiedByName}
                                                    </div>
                                                )}

                                                {payment.cancelledAt && (
                                                    <div className="mt-2 text-red-700">
                                                        Cancelled:{" "}
                                                        {formatDateTime(
                                                            payment.cancelledAt,
                                                        )}
                                                    </div>
                                                )}

                                                {payment.cancellationReason && (
                                                    <div className="mt-1 whitespace-normal text-red-700">
                                                        Reason:{" "}
                                                        {
                                                            payment.cancellationReason
                                                        }
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="whitespace-normal break-words text-xs leading-5 text-gray-600">
                                                    {payment.notes || "—"}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">
                    <Typography
                        as="p"
                        variant="body"
                        className="text-xs leading-5 text-gray-500"
                    >
                        Payment totals are supplied by the backend. Only
                        verified payments count toward verified receipts;
                        refunds are tracked separately. Financial Approval is
                        a separate workflow.
                    </Typography>
                </div>
            </Surface>
        </div>
    );
};

export default WorkspacePayments;
