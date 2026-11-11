
import {
    BadgeCheck,
    CheckCircle2,
    CircleAlert,
    LoaderCircle,
    Megaphone,
    Send,
    ShieldCheck,
} from "lucide-react";

import type {
    AdvertisementListItem,
    AdvertisementWorkflowStatus,
} from "@/api/advertisements/advertisement.api";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import {
    formatDate,
} from "@/helpers/advertisementManagement.helpers";

import {
    formatMoney,
    getApprovalMessage,
} from "@/helpers/advertisementWorkspace.helpers";

import type {
    ReadinessItem,
} from "@/types/advertisementWorkspace.types";

interface AdvertisementWorkspaceOverviewProps {
    advertisement: AdvertisementListItem;
    readiness: ReadinessItem[];
    readinessReady: number;
    readinessTotal: number;

    canApprove: boolean;
    canSubmit: boolean;

    submitting: boolean;
    submitError: string | null;
    submitSuccess: string | null;
    onSubmitForApproval: () => Promise<void>;

    approving?: boolean;
    approveError?: string | null;
    approveSuccess?: string | null;
    onApproveAdvertisement?: () => Promise<void>;
}

const WORKFLOW_STATUSES: readonly AdvertisementWorkflowStatus[] = [
    "DRAFT",
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "ON_HOLD",
    "ARCHIVED",
];

const normalizeWorkflowStatus = (
    status: unknown,
): AdvertisementWorkflowStatus => {
    if (
        typeof status === "string" &&
        WORKFLOW_STATUSES.some(
            (workflowStatus) => workflowStatus === status,
        )
    ) {
        return status as AdvertisementWorkflowStatus;
    }

    return "DRAFT";
};

const AdvertisementWorkspaceOverview = ({
    advertisement,
    readiness,
    readinessReady,
    readinessTotal,
    canApprove,
    canSubmit,
    submitting,
    submitError,
    submitSuccess,
    onSubmitForApproval,
    approving = false,
    approveError = null,
    approveSuccess = null,
    onApproveAdvertisement,
}: AdvertisementWorkspaceOverviewProps) => {
    const workflowStatus = normalizeWorkflowStatus(
        advertisement.workflowStatus,
    );

    const isDraft = workflowStatus === "DRAFT";
    const isSubmitted = workflowStatus === "SUBMITTED";
    const isApproved = workflowStatus === "APPROVED";
    const isRejected = workflowStatus === "REJECTED";
    const isOnHold = workflowStatus === "ON_HOLD";
    const isArchived = workflowStatus === "ARCHIVED";

    const hasReadinessData =
        readinessTotal > 0 &&
        readiness.length > 0;

    const actualReadyCount = readiness.filter(
        (item) => item.state === "READY",
    ).length;

    const readinessCountConsistent =
        readiness.length === readinessTotal &&
        actualReadyCount === readinessReady;

    const readinessComplete =
        hasReadinessData &&
        readinessCountConsistent &&
        readinessReady === readinessTotal &&
        readiness.every((item) => item.state === "READY");

    const approvalAllowed =
        canApprove &&
        isSubmitted &&
        readinessComplete;

    const submissionChecks = readiness.filter(
        (item) => item.label !== "Financial Approval",
    );

    const submissionChecksComplete =
        submissionChecks.length > 0 &&
        readinessCountConsistent &&
        submissionChecks.every(
            (item) => item.state === "READY",
        );

    const positiveStatus =
        hasReadinessData &&
        readinessCountConsistent &&
        (
            (isDraft && submissionChecksComplete) ||
            approvalAllowed ||
            isApproved
        );

    let approvalTitle: string;
    let approvalDescription: string;

    if (!hasReadinessData) {
        approvalTitle = "Readiness information is unavailable.";
        approvalDescription =
            "Refresh the advertisement workspace to load its readiness information.";
    } else if (!readinessCountConsistent) {
        approvalTitle = "Readiness information needs to be refreshed.";
        approvalDescription =
            "The readiness summary does not match the displayed checks. Refresh the workspace before proceeding.";
    } else if (isDraft) {
        approvalTitle = submissionChecksComplete
            ? "Submission readiness checks are complete."
            : "Complete the required submission checks.";

        approvalDescription = submissionChecksComplete
            ? "The advertisement can be submitted for review. Financial Approval follows its applicable workflow rules."
            : "Resolve all missing or unverified submission checks before submitting this advertisement.";
    } else if (isApproved) {
        approvalTitle = "Advertisement approved.";
        approvalDescription =
            "Final advertisement approval is complete. Verify the campaign schedule and delivery eligibility to determine when the advertisement can go live.";
    } else if (isRejected) {
        approvalTitle = getApprovalMessage(workflowStatus);
        approvalDescription =
            "Review the rejection remarks and follow the permitted resubmission workflow.";
    } else if (isOnHold) {
        approvalTitle = getApprovalMessage(workflowStatus);
        approvalDescription =
            "Resolve the advertisement hold and verify its delivery eligibility before it can serve.";
    } else if (isArchived) {
        approvalTitle = getApprovalMessage(workflowStatus);
        approvalDescription =
            "This advertisement is archived. It cannot proceed through normal delivery while archived.";
    } else if (!isSubmitted) {
        approvalTitle = getApprovalMessage(workflowStatus);
        approvalDescription =
            "Submit the advertisement for review before final approval can proceed.";
    } else if (!readinessComplete) {
        approvalTitle = getApprovalMessage(workflowStatus);
        approvalDescription =
            "Complete and verify every required readiness check before final approval.";
    } else if (!canApprove) {
        approvalTitle = "Readiness checks are complete.";
        approvalDescription =
            "Your current role may not have permission to approve this advertisement.";
    } else {
        approvalTitle = "Advertisement is ready for approval.";
        approvalDescription =
            "All readiness checks are complete. You have the required permission to proceed with approval.";
    }

    const handleApprove = async (): Promise<void> => {
        if (
            !onApproveAdvertisement ||
            !approvalAllowed ||
            approving
        ) {
            return;
        }

        await onApproveAdvertisement();
    };

    return (
        <div className="flex flex-col gap-6">
            <Surface className="border border-gray-200 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <BadgeCheck
                                size={20}
                                className="shrink-0 text-green-700"
                                aria-hidden="true"
                            />

                            <Typography
                                as="h2"
                                variant="headline"
                                className="text-base font-semibold text-slate-900"
                            >
                                Approval Readiness
                            </Typography>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            Review the commercial and operational readiness
                            checks before submitting an advertisement.
                            Applicable financial approval is handled
                            according to the financial workflow rules.
                        </p>
                    </div>

                    <div
                        className="shrink-0 rounded-lg bg-gray-50 px-4 py-3 text-center"
                        aria-label={`${readinessReady} of ${readinessTotal} readiness checks ready`}
                        role="status"
                    >
                        <div className="text-xl font-bold text-gray-900">
                            {readinessReady}/{readinessTotal}
                        </div>

                        <div className="mt-0.5 text-xs font-medium text-gray-500">
                            checks ready
                        </div>
                    </div>
                </div>

                {!hasReadinessData ? (
                    <div
                        className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4"
                        role="status"
                    >
                        <div className="flex items-start gap-3">
                            <CircleAlert
                                size={20}
                                className="mt-0.5 shrink-0 text-amber-700"
                                aria-hidden="true"
                            />

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-amber-900">
                                    Readiness checks are unavailable
                                </p>

                                <p className="mt-1 text-xs leading-5 text-amber-800">
                                    Refresh the advertisement workspace to
                                    load its readiness information.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {readiness.map((item, index) => (
                                <ReadinessRow
                                    key={`${item.label}-${index}`}
                                    item={item}
                                />
                            ))}
                        </div>

                        {!readinessCountConsistent && (
                            <div
                                className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
                                role="status"
                            >
                                <div className="flex items-start gap-2">
                                    <CircleAlert
                                        size={18}
                                        className="mt-0.5 shrink-0 text-amber-700"
                                        aria-hidden="true"
                                    />

                                    <p className="text-xs leading-5 text-amber-800">
                                        The readiness summary and displayed
                                        checks are out of sync. Refresh the
                                        workspace before proceeding.
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div
                    className={`mt-6 rounded-lg border px-4 py-4 ${positiveStatus
                            ? "border-green-200 bg-green-50"
                            : "border-amber-200 bg-amber-50"
                        }`}
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-start gap-3">
                        {positiveStatus ? (
                            <CheckCircle2
                                size={20}
                                className="mt-0.5 shrink-0 text-green-700"
                                aria-hidden="true"
                            />
                        ) : (
                            <CircleAlert
                                size={20}
                                className="mt-0.5 shrink-0 text-amber-700"
                                aria-hidden="true"
                            />
                        )}

                        <div className="min-w-0">
                            <p
                                className={`text-sm font-semibold ${positiveStatus
                                        ? "text-green-900"
                                        : "text-amber-900"
                                    }`}
                            >
                                {approvalTitle}
                            </p>

                            <p
                                className={`mt-1 text-xs leading-5 ${positiveStatus
                                        ? "text-green-800"
                                        : "text-amber-800"
                                    }`}
                            >
                                {approvalDescription}
                            </p>
                        </div>
                    </div>
                </div>

                {isDraft && (
                    <div className="mt-5 border-t border-gray-200 pt-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                    Submit for Approval
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-600">
                                    Submit this draft to the Ad Manager
                                    for review after the required checks
                                    are ready.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => void onSubmitForApproval()}
                                disabled={
                                    !canSubmit ||
                                    !submissionChecksComplete ||
                                    submitting
                                }
                                className="
                                    inline-flex min-h-10 shrink-0
                                    items-center justify-center gap-2
                                    rounded-md bg-green-700 px-4 py-2
                                    text-sm font-semibold text-white
                                    transition hover:bg-green-800
                                    disabled:cursor-not-allowed
                                    disabled:bg-gray-300
                                    disabled:text-gray-600
                                    focus:outline-none focus:ring-2
                                    focus:ring-green-600
                                    focus:ring-offset-2
                                "
                            >
                                {submitting ? (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Send size={16} aria-hidden="true" />
                                )}

                                {submitting
                                    ? "Submitting..."
                                    : "Submit for Approval"}
                            </button>
                        </div>

                        {!canSubmit && !submitting && (
                            <p className="mt-3 text-xs leading-5 text-gray-500">
                                The button becomes available when all
                                required submission checks are ready and
                                verification has finished.
                            </p>
                        )}

                        {submitError && (
                            <div
                                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                                role="alert"
                            >
                                <div className="flex items-start gap-2">
                                    <CircleAlert
                                        size={18}
                                        className="mt-0.5 shrink-0 text-red-600"
                                        aria-hidden="true"
                                    />

                                    <p className="text-sm leading-5 text-red-800">
                                        {submitError}
                                    </p>
                                </div>
                            </div>
                        )}

                        {submitSuccess && (
                            <div
                                className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3"
                                role="status"
                            >
                                <div className="flex items-start gap-2">
                                    <CheckCircle2
                                        size={18}
                                        className="mt-0.5 shrink-0 text-green-700"
                                        aria-hidden="true"
                                    />

                                    <p className="text-sm leading-5 text-green-800">
                                        {submitSuccess}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isSubmitted && (
                    <div className="mt-5 border-t border-gray-200 pt-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                    Final Advertisement Approval
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-600">
                                    Approve this submitted advertisement
                                    only after all required readiness checks
                                    have been verified.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => void handleApprove()}
                                disabled={
                                    !approvalAllowed ||
                                    approving ||
                                    !onApproveAdvertisement
                                }
                                className="
                                    inline-flex min-h-10 shrink-0
                                    items-center justify-center gap-2
                                    rounded-md bg-green-700 px-4 py-2
                                    text-sm font-semibold text-white
                                    transition hover:bg-green-800
                                    disabled:cursor-not-allowed
                                    disabled:bg-gray-300
                                    disabled:text-gray-600
                                    focus:outline-none focus:ring-2
                                    focus:ring-green-600
                                    focus:ring-offset-2
                                "
                            >
                                {approving ? (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <ShieldCheck
                                        size={16}
                                        aria-hidden="true"
                                    />
                                )}

                                {approving
                                    ? "Approving..."
                                    : "Approve Advertisement"}
                            </button>
                        </div>

                        {!approvalAllowed && !approving && (
                            <p className="mt-3 text-xs leading-5 text-gray-500">
                                Final approval becomes available when the
                                readiness checks are consistent and every
                                required check is ready, and your role has
                                the required approval permission.
                            </p>
                        )}

                        {approveError && (
                            <div
                                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                                role="alert"
                            >
                                <div className="flex items-start gap-2">
                                    <CircleAlert
                                        size={18}
                                        className="mt-0.5 shrink-0 text-red-600"
                                        aria-hidden="true"
                                    />

                                    <p className="text-sm leading-5 text-red-800">
                                        {approveError}
                                    </p>
                                </div>
                            </div>
                        )}

                        {approveSuccess && (
                            <div
                                className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3"
                                role="status"
                            >
                                <div className="flex items-start gap-2">
                                    <CheckCircle2
                                        size={18}
                                        className="mt-0.5 shrink-0 text-green-700"
                                        aria-hidden="true"
                                    />

                                    <p className="text-sm leading-5 text-green-800">
                                        {approveSuccess}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {approveSuccess && !isSubmitted && (
                    <div
                        className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3"
                        role="status"
                        aria-live="polite"
                    >
                        <div className="flex items-start gap-2">
                            <CheckCircle2
                                size={18}
                                className="mt-0.5 shrink-0 text-green-700"
                                aria-hidden="true"
                            />

                            <p className="text-sm leading-5 text-green-800">
                                {approveSuccess}
                            </p>
                        </div>
                    </div>
                )}
            </Surface>

            <Surface className="border border-gray-200 p-5 sm:p-6">
                <div className="flex items-center gap-2">
                    <Megaphone
                        size={19}
                        className="text-green-700"
                        aria-hidden="true"
                    />

                    <Typography
                        as="h2"
                        variant="headline"
                        className="text-base font-semibold text-gray-900"
                    >
                        Advertisement Summary
                    </Typography>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <SummaryField
                        label="Advertisement Name"
                        value={advertisement.name}
                    />

                    <SummaryField
                        label="Internal Name"
                        value={
                            advertisement.internalName?.trim() ||
                            "Not configured"
                        }
                    />

                    <SummaryField
                        label="Advertisement Type"
                        value={advertisement.advertisementType}
                    />

                    <SummaryField
                        label="Priority"
                        value={String(advertisement.priority)}
                    />

                    <SummaryField
                        label="Start Date"
                        value={formatDate(advertisement.startAt)}
                    />

                    <SummaryField
                        label="End Date"
                        value={formatDate(advertisement.endAt)}
                    />

                    <SummaryField
                        label="Currency"
                        value={advertisement.currencyCode}
                    />

                    <SummaryField
                        label="Advertisement Amount"
                        value={formatMoney(
                            advertisement.advertisementAmount,
                            advertisement.currencyCode,
                        )}
                    />
                </div>
            </Surface>
        </div>
    );
};

const SummaryField = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => (
    <div className="min-w-0">
        <Typography
            as="p"
            variant="body"
            className="text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
            {label}
        </Typography>

        <Typography
            as="p"
            variant="body"
            className="mt-1 wrap-break-word text-sm font-medium text-gray-900"
        >
            {value}
        </Typography>
    </div>
);

const ReadinessRow = ({
    item,
}: {
    item: ReadinessItem;
}) => {
    const ready = item.state === "READY";
    const missing = item.state === "MISSING";

    const statusLabel = ready
        ? "Ready"
        : missing
            ? "Missing"
            : "Requires Verification";

    const containerClass = ready
        ? "border-green-200 bg-green-50/60"
        : missing
            ? "border-red-200 bg-red-50/60"
            : "border-amber-200 bg-amber-50/60";

    const statusClass = ready
        ? "bg-green-100 text-green-800"
        : missing
            ? "bg-red-100 text-red-800"
            : "bg-amber-100 text-amber-800";

    return (
        <div
            className={`rounded-lg border px-4 py-3 ${containerClass}`}
            aria-label={`${item.label}: ${statusLabel}`}
        >
            <div className="flex items-start gap-3">
                {ready ? (
                    <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-green-700"
                        aria-hidden="true"
                    />
                ) : (
                    <CircleAlert
                        size={18}
                        className={`mt-0.5 shrink-0 ${missing
                                ? "text-red-600"
                                : "text-amber-700"
                            }`}
                        aria-hidden="true"
                    />
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                            {item.label}
                        </p>

                        <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                        >
                            {statusLabel}
                        </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-gray-600">
                        {item.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdvertisementWorkspaceOverview;
