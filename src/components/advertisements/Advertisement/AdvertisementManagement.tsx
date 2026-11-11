import {
    Activity,
    ArrowLeft,
    ArrowRight,
    BarChart3,
    CalendarDays,
    FileText,
    Megaphone,
    Plus,
    Search,
    Clock3,
    History,
    CheckCircle2,
    PauseCircle,
    Hand,
    StopCircle,
    CircleHelp,
    X,
} from "lucide-react";
import {
    Link,
    useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "@/api/axios";
import { getAdvertisementById, type AdvertisementDetails } from "@/api/advertisements/advertisement.api";
import { getAdvertisementCreatives } from "@/api/advertisements/creatives.api";
import { getAdvertisementPlacementRules } from "@/api/advertisements/placement-rules.api";
import { getAdvertisementPlacements } from "@/api/advertisements/placements.api";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import AdvertisementStatusBadge from "@/components/advertisements/Advertisement/AdvertisementStatusBadge/AdvertisementStatusBadge";

import type {
    AdvertisementManagementRowProps,
    AdvertisementPaginationProps,
    OverviewCardProps,
    QuickActionCardProps,
} from "@/types/advertisementManagement.types";

import {
    formatDateTime,
    getVisiblePageNumbers,
    getWorkflowStatus,
} from "@/helpers/advertisementManagement.helpers";

export const OverviewCard = ({
    icon,
    label,
    value,
    description,
}: OverviewCardProps) => {
    return (
        <Surface
            className="
                min-w-0
                border
                border-gray-200
                p-4
                sm:p-5
            "
        >
            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-3
                "
            >
                <div className="min-w-0 flex-1">
                    <Typography
                        as="p"
                        variant="body"
                        className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-gray-500
                        "
                    >
                        {label}
                    </Typography>

                    <Typography
                        as="p"
                        variant="body"
                        className="
                            mt-2
                            min-w-0
                            wrap-break-words
                            text-base
                            font-semibold
                            leading-6
                            text-gray-900
                            sm:text-lg
                            sm:leading-7
                        "
                        title={value}
                    >
                        {value}
                    </Typography>
                </div>

                <div
                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-green-50
                        text-green-700
                        sm:h-10
                        sm:w-10
                    "
                    aria-hidden="true"
                >
                    {icon}
                </div>
            </div>

            <Typography
                as="p"
                variant="body"
                className="
                    mt-1
                    text-xs
                    leading-5
                    text-gray-500
                "
            >
                {description}
            </Typography>
        </Surface>
    );
};

export const QuickActionCard = ({
    to,
    icon,
    title,
    description,
}: QuickActionCardProps) => {
    return (
        <Link
            to={to}
            className="
                group
                block
                rounded-lg
                border
                border-gray-200
                bg-white
                p-5
                transition
                hover:border-green-300
                hover:shadow-sm
                focus:outline-none
                focus:ring-2
                focus:ring-green-600
                focus:ring-offset-2
            "
        >
            <div
                className="
                    flex
                    items-start
                    gap-4
                "
            >
                <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-green-50
                        text-green-700
                        transition
                        group-hover:bg-green-100
                    "
                >
                    {icon}
                </div>

                <div className="min-w-0">
                    <Typography
                        as="h3"
                        variant="body"
                        className="
                            text-sm
                            font-semibold
                            text-gray-900
                        "
                    >
                        {title}
                    </Typography>

                    <Typography
                        as="p"
                        variant="body"
                        className="
                            mt-2
                            text-sm
                            text-gray-600
                        "
                    >
                        {description}
                    </Typography>
                </div>
            </div>
        </Link>
    );
};

export const AdvertisementManagementRow = ({
    advertisement,
}: AdvertisementManagementRowProps) => {
    const navigate = useNavigate();
    const workflowStatus = getWorkflowStatus(advertisement);
    const [activationNoticeOpen, setActivationNoticeOpen] = useState(false);
    const [auditOpen, setAuditOpen] = useState(false);
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditError, setAuditError] = useState<string | null>(null);
    const [history, setHistory] = useState<Array<{ toStatus: string; performedBy: number | null; performedAt: string }>>([]);
    const [auditDetails, setAuditDetails] = useState<AdvertisementDetails | null>(null);
    const [operationalHistory, setOperationalHistory] = useState<Array<{ eventType: string; performedBy: number | null; performedAt: string | null }>>([]);
    // The persisted COMPLETED status is shared by natural completion and Stop
    // Delivery. Only the recorded operational event can distinguish them.
    const [isExplicitlyStopped, setIsExplicitlyStopped] = useState(false);
    // Capture the current time without accessing a ref or calling Date.now() during render.
    const [evaluatedAt] = useState(() => Date.now());

    useEffect(() => {
        if (advertisement.status !== "COMPLETED") return;
        let cancelled = false;
        void apiClient.get<{ data: Array<{ eventType: string }> }>(
            `/advertisements/${advertisement.id}/operational-history`,
        ).then(response => {
            if (cancelled) return;
            const events = response.data.data ?? [];
            // API history order is not assumed: the operational history endpoint
            // returns most recent first; do not classify without audit evidence.
            setIsExplicitlyStopped(events[0]?.eventType?.toUpperCase() === "STOPPED");
        }).catch(() => { if (!cancelled) setIsExplicitlyStopped(false); });
        return () => { cancelled = true; };
    }, [advertisement.id, advertisement.status]);

    const [summary, setSummary] = useState<{ placements: string[]; pages: string[]; images: number } | null>(null);

    useEffect(() => {
        let cancelled = false;
        void Promise.all([
            getAdvertisementPlacementRules({ advertisementId: advertisement.id }),
            getAdvertisementPlacements(),
            getAdvertisementCreatives(advertisement.id),
        ]).then(([rules, placements, creatives]) => {
            if (cancelled) return;
            const placementIds = new Set(rules.map(rule => rule.placementId));
            const matched = placements.data.filter(placement => placementIds.has(placement.id));
            const pageNames: Record<string, string> = { HOME: "Home", NEWS_LIST: "News List", NEWS_DETAIL: "News Details" };
            setSummary({
                placements: [...new Set(matched.map(placement => placement.displayName || placement.placementType.replaceAll("_", " ")))],
                pages: [...new Set(matched.map(placement => pageNames[placement.pageType] ?? placement.pageType))],
                images: creatives.filter(creative => creative.creativeType === "IMAGE" && Boolean(creative.mediaUrl) && creative.status === "ACTIVE").length,
            });
        }).catch(() => { if (!cancelled) setSummary(null); });
        return () => { cancelled = true; };
    }, [advertisement.id]);

    const openAudit = async () => {
        setAuditOpen(true);
        setAuditLoading(true);
        setAuditError(null);
        setHistory([]);
        setAuditDetails(null);
        setOperationalHistory([]);
        const [workflowResult, detailResult, operationalResult] = await Promise.allSettled([
            apiClient.get<{ data: Array<{ toStatus: string; performedBy: number | null; performedAt: string }> }>(
                `/advertisements/${advertisement.id}/workflow-history`,
            ),
            getAdvertisementById(advertisement.id),
            apiClient.get<{ data: Array<{ eventType: string; performedBy: number | null; performedAt: string | null }> }>(
                `/advertisements/${advertisement.id}/operational-history`,
            ),
        ]);
        if (workflowResult.status === "fulfilled") {
            setHistory(workflowResult.value.data.data ?? []);
        }
        if (detailResult.status === "fulfilled") {
            setAuditDetails(detailResult.value.data);
        }
        if (operationalResult.status === "fulfilled") {
            setOperationalHistory(operationalResult.value.data.data ?? []);
        }
        if (workflowResult.status === "rejected" && detailResult.status === "rejected" && operationalResult.status === "rejected") {
            setAuditError("Unable to retrieve advertisement audit information.");
        }
        setAuditLoading(false);
    };

    // Use recorded operational events, workflow transitions, then persisted timestamps.
    // Never infer an activation timestamp from campaign start or approval.
    const latestAction = (status: string): { by: number | null; at: string | null } => {
        const operationalEventTypes: Record<string, string[]> = {
            ACTIVATED: ["ACTIVATED", "ACTIVATE", "ACTIVE"],
            PAUSED: ["PAUSED", "PAUSE"],
            STOPPED: ["STOPPED", "STOP"],
            ARCHIVED: ["ARCHIVED", "ARCHIVE"],
            ON_HOLD: ["ON_HOLD", "HOLD", "HELD"],
        };
        const event = operationalHistory
            .filter(item => (operationalEventTypes[status] ?? []).includes(item.eventType.toUpperCase()))
            .sort((a, b) => new Date(b.performedAt ?? 0).getTime() - new Date(a.performedAt ?? 0).getTime())[0];
        if (event) return { by: event.performedBy, at: event.performedAt };
        const entry = history.filter(item => item.toStatus === status)
            .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0];
        if (entry) return { by: entry.performedBy, at: entry.performedAt };
        const details = auditDetails;
        if (!details) {
            return { by: null, at: status === "DRAFT" ? advertisement.createdAt : null };
        }
        switch (status) {
            case "DRAFT": return { by: details.createdBy, at: details.createdAt };
            case "SUBMITTED": return { by: details.submittedBy, at: details.submittedAt };
            case "APPROVED": return { by: details.approvedBy, at: details.approvedAt };
            case "ON_HOLD": return { by: details.onHoldBy, at: details.onHoldAt };
            case "REJECTED": return { by: details.rejectedBy, at: details.rejectedAt };
            default: return { by: null, at: null };
        }
    };

    // Mirror the repository's effective natural-completion rule for the row badge.
    // An explicit Stop Delivery event takes precedence over an expired campaign.
    const campaignEnd = advertisement.endAt
        ? new Date(advertisement.endAt).getTime()
        : Number.NaN;
    const naturallyCompleted =
        workflowStatus === "APPROVED" &&
        (advertisement.status === "ACTIVE" ||
            advertisement.status === "PAUSED" ||
            advertisement.status === "COMPLETED") &&
        !isExplicitlyStopped &&
        Number.isFinite(campaignEnd) &&
        campaignEnd <= evaluatedAt;

    const operationalLabel = isExplicitlyStopped && advertisement.status === "COMPLETED"
        ? "Stopped"
        : advertisement.status === "ARCHIVED"
            ? "Archived"
            : workflowStatus === "ON_HOLD"
                ? "On Hold"
                : naturallyCompleted
                    ? "Completed"
                    : advertisement.status === "PAUSED"
                        ? "Paused"
                        : advertisement.status === "ACTIVE"
                            ? "Activated"
                            : advertisement.status === "COMPLETED"
                                ? "Completed"
                                : "Not Activated";
    const OperationalIcon = operationalLabel === "Activated" ? CheckCircle2
        : operationalLabel === "Paused" ? PauseCircle
            : operationalLabel === "On Hold" ? Hand
                : operationalLabel === "Completed" ? CheckCircle2
                    : operationalLabel === "Stopped" || operationalLabel === "Archived" ? StopCircle
                        : CircleHelp;

    const auditActions = [
        { label: "Drafted", status: "DRAFT" },
        { label: "Submitted", status: "SUBMITTED" },
        { label: "Approved", status: "APPROVED" },
        { label: "Activated", status: "ACTIVATED" },
        { label: "Paused", status: "PAUSED" },
        { label: "Hold", status: "ON_HOLD" },
        { label: "Stopped", status: "STOPPED" },
        { label: "Archived", status: "ARCHIVED" },
        { label: "Rejected", status: "REJECTED" },
    ];


    const isCampaignExpired = (
        endAt: string | null | undefined,
        currentTime: number,
    ): boolean => {
        if (!endAt) {
            return false;
        }

        const endTime = new Date(endAt).getTime();

        return (
            Number.isFinite(endTime) &&
            endTime <= currentTime
        );
    };


    const canActivate =
        workflowStatus === "APPROVED" &&
        advertisement.status !== "ACTIVE" &&
        advertisement.status !== "ARCHIVED";

    const workspaceUrl =
        `/admin/advertisements/${advertisement.id}`;

    return (
        <article
            className="
                px-5
                py-4
                transition
                hover:bg-gray-50
                sm:px-6
            "
        >
            <div
                className="
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                "
            >
                <div className="min-w-0 flex-1">
                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                        "
                    >
                        <Typography
                            as="h3"
                            variant="body"
                            className="
                                min-w-0
                                truncate
                                text-sm
                                font-semibold
                                text-gray-900
                            "
                        >
                            <span className="mr-2 text-gray-500">#{advertisement.id}</span>{advertisement.name}
                        </Typography>

                        <AdvertisementStatusBadge
                            status={workflowStatus}
                            size="sm"
                        />
                        {(workflowStatus === "APPROVED" || workflowStatus === "ON_HOLD") && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${operationalLabel === "Activated" ? "bg-green-100 text-green-800" : operationalLabel === "On Hold" ? "bg-amber-100 text-amber-800" : operationalLabel === "Paused" ? "bg-yellow-100 text-yellow-800" : operationalLabel === "Completed" || operationalLabel === "Stopped" || operationalLabel === "Archived" ? "bg-gray-200 text-gray-700" : "bg-gray-100 text-gray-600"}`}>
                                <OperationalIcon size={13} aria-hidden="true" />{operationalLabel}
                            </span>
                        )}
                    </div>

                    <div className="mt-2 text-xs text-gray-600">
                        Client: <span className="font-medium text-gray-800">{advertisement.clientName ?? "Client not available"}{advertisement.clientCode ? ` (${advertisement.clientCode})` : ""}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-600">
                        <span>Placement: <span className="font-medium text-gray-800">{summary ? (summary.placements.length ? `${summary.placements[0]}${summary.placements.length > 1 ? ` +${summary.placements.length - 1} more` : ""}` : "—") : "Loading…"}</span></span>
                        <span aria-hidden="true">·</span>
                        <span>Page: <span className="font-medium text-gray-800">{summary ? (summary.pages.join(", ") || "—") : "Loading…"}</span></span>
                        <span aria-hidden="true">·</span>
                        <span>Creatives: <span className="font-medium text-gray-800">{summary ? `${summary.images} images` : "Loading…"}</span></span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
                        <CalendarDays size={14} aria-hidden="true" />
                        <span>Campaign: {formatDateTime(advertisement.startAt)} – {formatDateTime(advertisement.endAt)}</span>
                    </div>
                    <button type="button" onClick={() => void openAudit()} className="mt-3 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                        <History size={15} aria-hidden="true" /> Audit History
                    </button>
                </div>

                <div
                    className="
                        flex
                        w-full
                        flex-col
                        gap-2
                        sm:flex-row
                        lg:w-auto
                    "
                >
                    <Link
                        to={workspaceUrl}
                        className="
                            inline-flex
                            min-h-9
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-gray-700
                            transition
                            hover:bg-gray-50
                            focus:outline-none
                            focus:ring-2
                            focus:ring-green-600
                            focus:ring-offset-2
                            sm:min-w-20
                        "
                    >
                        Open
                    </Link>

                    {canActivate && (
                        <button
                            type="button"
                            onClick={() => {
                                if (isCampaignExpired(advertisement.endAt, Date.now())) {
                                    setActivationNoticeOpen(true);
                                    return;
                                }

                                navigate(`${workspaceUrl}?action=activate`);
                            }}
                            aria-label={`Activate ${advertisement.name}`}
                            className="
                                inline-flex
                                min-h-9
                                items-center
                                justify-center
                                gap-2
                                rounded-md
                                bg-green-700
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-white
                                transition
                                hover:bg-green-800
                                focus:outline-none
                                focus:ring-2
                                focus:ring-green-600
                                focus:ring-offset-2
                                sm:min-w-24
                            "
                        >
                            <Activity
                                size={14}
                                aria-hidden="true"
                            />
                            Activate
                        </button>
                    )}

                    {workflowStatus === "DRAFT" && (
                        <Link
                            to={`/admin/advertisements/${advertisement.id}/edit`}
                            className="
                                inline-flex
                                min-h-9
                                items-center
                                justify-center
                                gap-2
                                rounded-md
                                bg-green-700
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-white
                                transition
                                hover:bg-green-800
                                focus:outline-none
                                focus:ring-2
                                focus:ring-green-600
                                focus:ring-offset-2
                                sm:min-w-28
                            "
                        >
                            Continue Draft
                        </Link>
                    )}
                </div>
            </div>
            {auditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setAuditOpen(false); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby={`audit-history-${advertisement.id}`} className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <h3 id={`audit-history-${advertisement.id}`} className="text-lg font-semibold">Audit History · #{advertisement.id}</h3>
                            <button type="button" onClick={() => setAuditOpen(false)} aria-label="Close audit history" className="rounded p-2 hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto p-5">
                            <p className="mb-3 text-xs text-gray-500">Recorded workflow and operational audit events are shown below. Where a user name is unavailable, the recorded user ID is displayed; missing events show —.</p>
                            <div className="hidden border-b border-gray-200 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid sm:grid-cols-3"><span>Action</span><span>Performed By</span><span>Performed On</span></div>
                            {auditLoading ? <p role="status">Loading history…</p> : auditError ? <p role="alert" className="text-red-700">{auditError}</p> : (
                                <div className="divide-y divide-gray-100">
                                    {auditActions.map(action => {
                                        const { by, at: when } = latestAction(action.status);
                                        const actor = by !== null ? `User #${by}` : "—";
                                        return <div key={action.status} className="grid grid-cols-1 gap-2 py-3 text-sm sm:grid-cols-3">
                                            <span className="font-semibold text-gray-800">{action.label}</span>
                                            <span>{actor}</span>
                                            <span>{when ? formatDateTime(when) : "—"}</span>
                                        </div>;
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end border-t border-gray-200 px-5 py-3"><button type="button" onClick={() => setAuditOpen(false)} className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white">Close</button></div>
                    </section>
                </div>
            )}
            {activationNoticeOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActivationNoticeOpen(false); }}>
                    <section role="dialog" aria-modal="true" aria-labelledby={`activation-expired-${advertisement.id}`} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-3">
                            <h3 id={`activation-expired-${advertisement.id}`} className="text-lg font-semibold text-gray-900">Campaign period has ended</h3>
                            <button type="button" onClick={() => setActivationNoticeOpen(false)} aria-label="Close notice" className="rounded p-1 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-700">This advertisement cannot be activated because its campaign end date has passed ({formatDateTime(advertisement.endAt!)}). A valid future campaign window and eligible delivery schedule are required before activation.</p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button type="button" onClick={() => setActivationNoticeOpen(false)} className="rounded-md border px-4 py-2 text-sm">Close</button>
                            <Link to={workspaceUrl} className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">View advertisement</Link>
                        </div>
                    </section>
                </div>
            )}
        </article>
    );
};

export const AdvertisementPagination = ({
    currentPage,
    totalPages,
    totalRecords,
    pageSize,
    firstRecord,
    lastRecord,
    onPageSizeChange,
    onPrevious,
    onNext,
    onPageChange,
}: AdvertisementPaginationProps) => {

    const visiblePages = getVisiblePageNumbers(
        currentPage,
        totalPages,
    );

    return (
        <div
            className="
                flex
                flex-col
                gap-3
                border-t
                border-gray-200
                px-5
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-6
            "
        >
            <div className="text-xs text-gray-500">
                Showing <strong>{firstRecord}</strong> to <strong>{lastRecord}</strong> of <strong>{totalRecords}</strong>
                <span className="ml-2">· Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
            </div>
            <nav
                aria-label="Advertisement pagination"
                className="
                    flex
                    items-center
                    justify-center
                    gap-1
                    overflow-x-auto
                "
            >
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={currentPage <= 1}
                    className="
                        inline-flex
                        min-h-9
                        min-w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        border
                        border-gray-300
                        bg-white
                        px-2
                        text-sm
                        font-semibold
                        text-gray-700
                        transition
                        hover:bg-gray-50
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                        focus:outline-none
                        focus:ring-2
                        focus:ring-green-600
                        focus:ring-offset-2
                    "
                    aria-label="Previous page"
                >
                    <ArrowLeft
                        size={16}
                        aria-hidden="true"
                    />
                </button>

                {visiblePages.map((page, index) =>
                    page === "ellipsis" ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="
                                inline-flex
                                min-h-9
                                min-w-9
                                shrink-0
                                items-center
                                justify-center
                                px-1
                                text-sm
                                text-gray-500
                            "
                            aria-hidden="true"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            aria-current={
                                page === currentPage
                                    ? "page"
                                    : undefined
                            }
                            className={`inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 ${page === currentPage
                                ? "border-green-700 bg-green-700 text-white"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {page}
                        </button>
                    ),
                )}

                <button
                    type="button"
                    onClick={onNext}
                    disabled={currentPage >= totalPages}
                    className="
                        inline-flex
                        min-h-9
                        min-w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        border
                        border-gray-300
                        bg-white
                        px-2
                        text-sm
                        font-semibold
                        text-gray-700
                        transition
                        hover:bg-gray-50
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                        focus:outline-none
                        focus:ring-2
                        focus:ring-green-600
                        focus:ring-offset-2
                    "
                    aria-label="Next page"
                >
                    <ArrowRight
                        size={16}
                        aria-hidden="true"
                    />
                </button>
            </nav>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">Rows per page
                <select aria-label="Rows per page" value={pageSize} onChange={event => onPageSizeChange(Number(event.target.value))} className="rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-800">
                    {[10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
            </label>
        </div>
    );
};

export const RecentAdvertisementsLoading = () => {
    return (
        <div className="divide-y divide-gray-100">
            {Array.from({ length: 3 }).map((_, index) => (
                <div
                    key={index}
                    className="px-5 py-5 sm:px-6"
                >
                    <div className="animate-pulse">
                        <div className="h-4 w-2/5 rounded bg-gray-200" />

                        <div className="mt-3 h-3 w-3/5 rounded bg-gray-100" />

                        <div className="mt-3 h-3 w-4/5 rounded bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const EmptyAdvertisements = () => {
    return (
        <div className="px-5 py-10 sm:px-6">
            <div
                className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                "
            >
                <div
                    className="
                        mb-3
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-green-50
                        text-green-700
                    "
                >
                    <Megaphone
                        size={22}
                        aria-hidden="true"
                    />
                </div>

                <Typography
                    as="h3"
                    variant="headline"
                    className="
                        text-sm
                        font-medium
                        sm:text-lg
                    "
                >
                    No advertisements found
                </Typography>

                <Typography
                    as="p"
                    variant="body"
                    className="
                        mt-2
                        max-w-xl
                        text-sm
                        text-gray-600
                    "
                >
                    Create an advertisement or use
                    Search Advertisements to find
                    existing records.
                </Typography>

                <div
                    className="
                        mt-5
                        flex
                        flex-col
                        gap-2
                        sm:flex-row
                    "
                >
                    <Link
                        to="/admin/advertisements/create"
                        className="
                            inline-flex
                            min-h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-md
                            bg-green-700
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-green-800
                            focus:outline-none
                            focus:ring-2
                            focus:ring-green-600
                            focus:ring-offset-2
                        "
                    >
                        <Plus
                            size={17}
                            aria-hidden="true"
                        />

                        Create Advertisement
                    </Link>

                    <Link
                        to="/admin/advertisements/search"
                        className="
                            inline-flex
                            min-h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-md
                            border
                            border-gray-300
                            bg-white
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-gray-700
                            transition
                            hover:bg-gray-50
                            focus:outline-none
                            focus:ring-2
                            focus:ring-green-600
                            focus:ring-offset-2
                        "
                    >
                        <Search
                            size={17}
                            aria-hidden="true"
                        />

                        Search
                    </Link>
                </div>
            </div>
        </div>
    );
};

export const ManagementOverviewCards = ({
    draft,
    pendingApproval,
    active,
    completed,
    loading,
}: {
    draft: number;
    pendingApproval: number;
    active: number;
    completed: number;
    loading: boolean;
}) => {
    return (
        <>
            <OverviewCard
                icon={<FileText size={20} />}
                label="Draft Advertisements"
                value={loading ? "…" : String(draft)}
                description="Advertisements being prepared"
            />

            <OverviewCard
                icon={<Clock3 size={20} />}
                label="Pending Approval"
                value={loading ? "…" : String(pendingApproval)}
                description="Submitted for manager review"
            />

            <OverviewCard
                icon={<Activity size={20} />}
                label="Active Campaigns"
                value={loading ? "…" : String(active)}
                description="Currently active advertisements"
            />

            <OverviewCard
                icon={<BarChart3 size={20} />}
                label="Completed"
                value={loading ? "…" : String(completed)}
                description="Archived campaign activity"
            />
        </>
    );
};