import { BUSINESS_TIME_ZONE } from "@/helpers/businessTimeZone.helpers";
import { confirmDialog } from "@/components/ui/Dialog/confirmDialog";

import {
    AlertCircle,
    CheckCircle2,
    Code,
    FileCode2,
    FileText,
    Image as ImageIcon,
    Monitor,
    RefreshCw,
    Smartphone,
    Star,
    Video,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getAdvertisementCreatives,
    getAdvertisementCreativePreviews,
    setCreativeDeliveryEnabled,
} from "@/api/advertisements/creatives.api";

import type {
    AdvertisementCreative,
    AdvertisementCreativePreview,
    AdvertisementCreativePreviewResponse,
    AdvertisementCreativeStatus,
    AdvertisementCreativeType,
    AdvertisementCreativeVariant,
} from "@/api/advertisements/creatives.api";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

interface WorkspaceCreativeProps {
    advertisementId: number;
    workflowStatus: string;
    advertisementEndAt?: string | Date | null;
    advertisementStatus?: string;
}

type VariantFilter = "ALL" | AdvertisementCreativeVariant;
type StatusFilter = "ALL" | AdvertisementCreativeStatus;

const EMPTY_PREVIEWS: AdvertisementCreativePreviewResponse = {
    desktop: null,
    mobile: null,
};

const CREATIVE_TYPE_LABELS: Record<AdvertisementCreativeType, string> = {
    IMAGE: "Image",
    VIDEO: "Video",
    HTML: "HTML",
    TEXT: "Text",
};

const PREVIEW_STATUS_LABELS: Record<
    AdvertisementCreativePreview["status"],
    string
> = {
    EXACT_MATCH: "Exact dimension match",
    SLIGHTLY_DIFFERENT: "Within tolerance",
    DIMENSION_MISMATCH: "Dimension mismatch",
    ASPECT_RATIO_MISMATCH: "Aspect ratio mismatch",
    DIMENSIONS_NOT_AVAILABLE: "Dimensions unavailable",
    NO_EXPECTED_DIMENSIONS: "No fixed dimensions",
};

const PREVIEW_STATUS_STYLES: Record<
    AdvertisementCreativePreview["status"],
    string
> = {
    EXACT_MATCH: "border-green-200 bg-green-50 text-green-800",
    SLIGHTLY_DIFFERENT: "border-blue-200 bg-blue-50 text-blue-800",
    DIMENSION_MISMATCH: "border-red-200 bg-red-50 text-red-800",
    ASPECT_RATIO_MISMATCH: "border-red-200 bg-red-50 text-red-800",
    DIMENSIONS_NOT_AVAILABLE: "border-amber-200 bg-amber-50 text-amber-800",
    NO_EXPECTED_DIMENSIONS: "border-gray-200 bg-gray-50 text-gray-700",
};

const CREATIVE_TYPE_ICONS = {
    IMAGE: ImageIcon,
    VIDEO: Video,
    HTML: Code,
    TEXT: FileText,
} satisfies Record<AdvertisementCreativeType, typeof ImageIcon>;

const formatDimensions = (
    widthPx: number | null,
    heightPx: number | null,
): string => {
    if (widthPx === null || heightPx === null) {
        return "Not available";
    }

    return `${widthPx} × ${heightPx} px`;
};

const formatDate = (value: string | Date): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString("en-IN", {
        timeZone: BUSINESS_TIME_ZONE,
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const getErrorMessage = (error: unknown): string => {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (
            error as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            }
        ).response;

        if (response?.data?.message) {
            return response.data.message;
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return "The creative information could not be loaded.";
};

const InfoItem = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => (
    <div className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {label}
        </p>
        <p className="mt-1 wrap-break-words text-sm font-semibold text-gray-800">
            {value}
        </p>
    </div>
);

const VariantHeading = ({
    variant,
    count,
}: {
    variant: AdvertisementCreativeVariant;
    count: number;
}) => {
    const Icon = variant === "DESKTOP" ? Monitor : Smartphone;

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
                    <Icon size={18} aria-hidden="true" />
                </span>

                <div className="min-w-0">
                    <Typography
                        as="h3"
                        variant="headline"
                        className="text-base font-semibold text-gray-900"
                    >
                        {variant === "DESKTOP"
                            ? "Desktop Creative"
                            : "Mobile Creative"}
                    </Typography>

                    <Typography
                        as="p"
                        variant="body"
                        className="mt-0.5 text-xs text-gray-500"
                    >
                        {count} {count === 1 ? "asset" : "assets"}
                    </Typography>
                </div>
            </div>

            <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                {variant}
            </span>
        </div>
    );
};

const CreativeMediaPreview = ({
    creative,
}: {
    creative: AdvertisementCreative;
}) => {
    const mediaUrl = creative.mediaUrl;
    const posterUrl = creative.thumbnailUrl ?? undefined;

    return (
        <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
            {creative.creativeType === "IMAGE" ? (
                <img
                    src={mediaUrl}
                    alt={
                        creative.altText?.trim() ||
                        creative.title?.trim() ||
                        "Advertisement creative"
                    }
                    className="max-h-72 max-w-full object-contain"
                    loading="lazy"
                />
            ) : null}

            {creative.creativeType === "VIDEO" ? (
                <video
                    src={mediaUrl}
                    poster={posterUrl}
                    controls
                    preload="metadata"
                    className="max-h-72 max-w-full"
                >
                    Your browser does not support video playback.
                </video>
            ) : null}

            {creative.creativeType === "HTML" ? (
                <div className="w-full text-center">
                    <FileCode2
                        size={30}
                        className="mx-auto text-gray-500"
                        aria-hidden="true"
                    />

                    <p className="mt-2 text-sm font-semibold text-gray-800">
                        HTML creative
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        HTML is shown as a saved asset reference here.
                        It is not executed inside the management workspace.
                    </p>

                    <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-xs font-semibold text-green-700 underline underline-offset-2 hover:text-green-800"
                    >
                        Open creative resource
                    </a>
                </div>
            ) : null}

            {creative.creativeType === "TEXT" ? (
                <div className="w-full rounded-md border border-gray-200 bg-white p-4">
                    <FileText
                        size={24}
                        className="text-gray-500"
                        aria-hidden="true"
                    />

                    <p className="mt-2 wrap-break-words text-sm text-gray-800">
                        {mediaUrl}
                    </p>
                </div>
            ) : null}
        </div>
    );
};

const CreativeCard = ({
    creative,
    preview,
    onToggle,
    toggleDisabled,
    toggling,
}: {
    creative: AdvertisementCreative;
    preview: AdvertisementCreativePreview | null;
    onToggle: (creative: AdvertisementCreative) => void;
    toggleDisabled: boolean;
    toggling: boolean;
}) => {
    const TypeIcon = CREATIVE_TYPE_ICONS[creative.creativeType];
    const isActive = creative.status === "ACTIVE";

    return (
        <article
            className={[
                "overflow-hidden rounded-xl border bg-white",
                isActive ? "border-gray-200" : "border-amber-200",
            ].join(" ")}
        >
            <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                            <TypeIcon size={19} aria-hidden="true" />
                        </span>

                        <div className="min-w-0">
                            <h4 className="wrap-break-words text-sm font-semibold text-gray-900">
                                {creative.title?.trim() ||
                                    `${CREATIVE_TYPE_LABELS[creative.creativeType]} creative #${creative.id}`}
                            </h4>

                            <p className="mt-1 text-xs text-gray-500">
                                {CREATIVE_TYPE_LABELS[creative.creativeType]}
                                {" · "}
                                {creative.variant}
                                {" · "}
                                ID {creative.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {creative.isPrimary ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                                <Star size={12} aria-hidden="true" />
                                Primary
                            </span>
                        ) : null}

                        <span
                            className={[
                                "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                isActive
                                    ? "border-green-200 bg-green-50 text-green-800"
                                    : "border-amber-200 bg-amber-50 text-amber-800",
                            ].join(" ")}
                        >
                            {creative.status}
                        </span>
                        <button type="button" onClick={() => onToggle(creative)}
                            disabled={toggleDisabled || toggling}
                            title={toggleDisabled ? "Creative controls are frozen for this advertisement" : undefined}
                            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                            {toggling ? "Saving..." : isActive ? "Disable" : "Enable"}
                        </button>
                    </div>
                </div>

                {!isActive ? (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                        <AlertCircle
                            size={15}
                            className="mt-0.5 shrink-0 text-amber-700"
                            aria-hidden="true"
                        />
                        <p className="text-xs leading-5 text-amber-800">
                            This creative is inactive. It is displayed for
                            review but is not represented as an active asset.
                        </p>
                    </div>
                ) : null}

                <div className="mt-4">
                    <CreativeMediaPreview creative={creative} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoItem
                        label="Actual Dimensions"
                        value={formatDimensions(
                            creative.widthPx,
                            creative.heightPx,
                        )}
                    />

                    <InfoItem
                        label="Format ID"
                        value={
                            creative.formatId === null
                                ? "Not linked"
                                : String(creative.formatId)
                        }
                    />

                    <InfoItem
                        label="Display Order"
                        value={String(creative.displayOrder)}
                    />

                    <InfoItem
                        label="Last Updated"
                        value={formatDate(creative.updatedAt)}
                    />
                </div>

                {creative.altText?.trim() ? (
                    <div className="mt-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                            Alternative Text
                        </p>
                        <p className="mt-1 wrap-break-words text-sm text-gray-700">
                            {creative.altText}
                        </p>
                    </div>
                ) : null}

                {preview ? (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                        <div
                            className={[
                                "inline-flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold",
                                PREVIEW_STATUS_STYLES[preview.status],
                            ].join(" ")}
                        >
                            {preview.status === "EXACT_MATCH" ||
                                preview.status === "SLIGHTLY_DIFFERENT" ? (
                                <CheckCircle2
                                    size={15}
                                    className="shrink-0"
                                    aria-hidden="true"
                                />
                            ) : (
                                <AlertCircle
                                    size={15}
                                    className="shrink-0"
                                    aria-hidden="true"
                                />
                            )}

                            <span>{PREVIEW_STATUS_LABELS[preview.status]}</span>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-gray-600">
                            {preview.statusMessage}
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <InfoItem
                                label="Expected Dimensions"
                                value={formatDimensions(
                                    preview.expected.widthPx,
                                    preview.expected.heightPx,
                                )}
                            />

                            <InfoItem
                                label="Actual Dimensions"
                                value={formatDimensions(
                                    preview.actual.widthPx,
                                    preview.actual.heightPx,
                                )}
                            />
                        </div>

                        {preview.usesDesktopFallback ? (
                            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                                The backend is using the Desktop creative
                                as the Mobile preview fallback.
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </article>
    );
};

const WorkspaceCreative = ({
    advertisementId,
    workflowStatus,
    advertisementEndAt,
    advertisementStatus,
}: WorkspaceCreativeProps) => {
    const [creatives, setCreatives] = useState<AdvertisementCreative[]>([]);
    const [previews, setPreviews] =
        useState<AdvertisementCreativePreviewResponse>(EMPTY_PREVIEWS);

    const [variantFilter, setVariantFilter] = useState<VariantFilter>("ALL");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [togglingOrder, setTogglingOrder] = useState<number | null>(null);
    const [toggleError, setToggleError] = useState<string | null>(null);

    const [creativeError, setCreativeError] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);

    // A newer request invalidates every older request.
    const requestIdRef = useRef(0);

    const loadCreatives = useCallback(
        async (showRefreshState = false): Promise<void> => {
            const requestId = ++requestIdRef.current;

            if (showRefreshState) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setCreativeError(null);
            setPreviewError(null);

            try {
                const [creativeResult, previewResult] =
                    await Promise.allSettled([
                        getAdvertisementCreatives(advertisementId),
                        getAdvertisementCreativePreviews(advertisementId),
                    ]);

                if (requestId !== requestIdRef.current) {
                    return;
                }

                // Saved assets and dimension previews are independent.
                // A preview endpoint failure must not hide valid saved assets.
                if (creativeResult.status === "fulfilled") {
                    if (!Array.isArray(creativeResult.value)) {
                        setCreatives([]);
                        setCreativeError(
                            "The creative API did not return a list of creatives.",
                        );
                    } else {
                        setCreatives(creativeResult.value);
                    }
                } else {
                    setCreatives([]);
                    setCreativeError(
                        getErrorMessage(creativeResult.reason),
                    );
                }

                if (previewResult.status === "fulfilled") {
                    const result = previewResult.value;

                    setPreviews({
                        desktop: result?.desktop ?? null,
                        mobile: result?.mobile ?? null,
                    });
                } else {
                    // Do not leave old preview results visible after a failed
                    // refresh. Missing previews are not verified previews.
                    setPreviews(EMPTY_PREVIEWS);
                    setPreviewError(
                        getErrorMessage(previewResult.reason),
                    );
                }
            } catch (loadError) {
                if (requestId !== requestIdRef.current) {
                    return;
                }

                console.error(
                    "Failed to load advertisement creatives:",
                    loadError,
                );

                setCreatives([]);
                setPreviews(EMPTY_PREVIEWS);
                setCreativeError(getErrorMessage(loadError));
                setPreviewError(getErrorMessage(loadError));
            } finally {
                if (requestId === requestIdRef.current) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        },
        [advertisementId],
    );


    useEffect(() => {
        let isCurrent = true;
        const requestId = ++requestIdRef.current;

        const loadInitialCreatives = async (): Promise<void> => {
            try {
                const [creativeResult, previewResult] =
                    await Promise.allSettled([
                        getAdvertisementCreatives(advertisementId),
                        getAdvertisementCreativePreviews(advertisementId),
                    ]);

                if (!isCurrent || requestId !== requestIdRef.current) {
                    return;
                }

                if (creativeResult.status === "fulfilled") {
                    if (!Array.isArray(creativeResult.value)) {
                        setCreatives([]);
                        setCreativeError(
                            "The creative API did not return a list of creatives.",
                        );
                    } else {
                        setCreatives(creativeResult.value);
                        setCreativeError(null);
                    }
                } else {
                    setCreatives([]);
                    setCreativeError(
                        getErrorMessage(creativeResult.reason),
                    );
                }

                if (previewResult.status === "fulfilled") {
                    const result = previewResult.value;

                    setPreviews({
                        desktop: result?.desktop ?? null,
                        mobile: result?.mobile ?? null,
                    });
                    setPreviewError(null);
                } else {
                    setPreviews(EMPTY_PREVIEWS);
                    setPreviewError(
                        getErrorMessage(previewResult.reason),
                    );
                }
            } catch (loadError) {
                if (!isCurrent || requestId !== requestIdRef.current) {
                    return;
                }

                console.error(
                    "Failed to load advertisement creatives:",
                    loadError,
                );

                setCreatives([]);
                setPreviews(EMPTY_PREVIEWS);
                setCreativeError(getErrorMessage(loadError));
                setPreviewError(getErrorMessage(loadError));
            } finally {
                if (isCurrent && requestId === requestIdRef.current) {
                    setLoading(false);
                }
            }
        };

        void loadInitialCreatives();

        return () => {
            isCurrent = false;
            requestIdRef.current += 1;
        };
    }, [advertisementId]);

    // Keep the clock outside render and refresh it while the workspace is open.
    // The lazy initializer is evaluated only when this component mounts.
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setCurrentTime(Date.now());
        }, 15_000);
        return () => window.clearInterval(timer);
    }, []);

    const expiry = advertisementEndAt ? new Date(advertisementEndAt).getTime() : null;
    const expired = expiry !== null && Number.isFinite(expiry) && expiry <= currentTime;
    const controlsFrozen = expired || advertisementStatus === "COMPLETED" ||
        advertisementStatus === "ARCHIVED" || workflowStatus !== "APPROVED" ||
        (advertisementStatus !== "ACTIVE" && advertisementStatus !== "PAUSED");

    const toggleCreative = async (creative: AdvertisementCreative): Promise<void> => {
        if (controlsFrozen || togglingOrder !== null) return;
        const enabled = creative.status !== "ACTIVE";
        if (!await confirmDialog(`${enabled ? "Enable" : "Disable"} this creative slide (Desktop and Mobile) across all placements?`)) return;
        setToggleError(null);
        setTogglingOrder(creative.displayOrder);
        try {
            await setCreativeDeliveryEnabled(advertisementId, creative.id, enabled);
            await loadCreatives(true);
        } catch (error: unknown) {
            setToggleError(getErrorMessage(error));
        } finally { setTogglingOrder(null); }
    };

    const safeCreatives = creatives;

    const activeCount = safeCreatives.filter(
        (creative) => creative.status === "ACTIVE",
    ).length;

    const inactiveCount = safeCreatives.filter(
        (creative) => creative.status === "INACTIVE",
    ).length;

    const desktopCount = safeCreatives.filter(
        (creative) => creative.variant === "DESKTOP",
    ).length;

    const mobileCount = safeCreatives.filter(
        (creative) => creative.variant === "MOBILE",
    ).length;

    const filteredCreatives = safeCreatives.filter((creative) => {
        const matchesVariant =
            variantFilter === "ALL" ||
            creative.variant === variantFilter;

        const matchesStatus =
            statusFilter === "ALL" ||
            creative.status === statusFilter;

        return matchesVariant && matchesStatus;
    });

    const desktopCreatives = filteredCreatives.filter(
        (creative) => creative.variant === "DESKTOP",
    );

    const mobileCreatives = filteredCreatives.filter(
        (creative) => creative.variant === "MOBILE",
    );

    const desktopPreview = previews.desktop;
    const mobilePreview = previews.mobile;

    if (loading) {
        return (
            <Surface className="border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3">
                    <RefreshCw
                        size={18}
                        className="animate-spin text-green-700"
                        aria-hidden="true"
                    />
                    <Typography
                        as="p"
                        variant="body"
                        className="text-sm text-gray-600"
                    >
                        Loading saved creatives…
                    </Typography>
                </div>
            </Surface>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {toggleError ? <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{toggleError}</p> : null}
            {controlsFrozen ? <p className="mb-3 text-xs text-amber-700">Creative delivery controls are read-only for expired, closed, or non-operational advertisements.</p> : null}
            <Surface className="overflow-hidden border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
                                <ImageIcon size={20} aria-hidden="true" />
                            </span>

                            <div className="min-w-0">
                                <Typography
                                    as="h2"
                                    variant="headline"
                                    className="text-base font-semibold text-gray-900 sm:text-lg"
                                >
                                    Advertisement Creative
                                </Typography>
                                <Typography
                                    as="p"
                                    variant="body"
                                    className="mt-1 text-sm leading-6 text-gray-500"
                                >
                                    Saved creative assets, device variants,
                                    dimensions, status, and format compatibility.
                                </Typography>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => void loadCreatives(true)}
                            disabled={refreshing}
                            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                        >
                            <RefreshCw
                                size={15}
                                className={refreshing ? "animate-spin" : ""}
                                aria-hidden="true"
                            />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5 sm:p-6">
                    <InfoItem
                        label="Total Saved"
                        value={String(safeCreatives.length)}
                    />
                    <InfoItem
                        label="Active"
                        value={String(activeCount)}
                    />
                    <InfoItem
                        label="Inactive"
                        value={String(inactiveCount)}
                    />
                    <InfoItem
                        label="Desktop Assets"
                        value={String(desktopCount)}
                    />
                    <InfoItem
                        label="Mobile Assets"
                        value={String(mobileCount)}
                    />
                </div>

                <div className="mx-5 mb-5 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:mx-6 sm:mb-6">
                    <AlertCircle
                        size={17}
                        className="mt-0.5 shrink-0 text-blue-700"
                        aria-hidden="true"
                    />
                    <p className="text-xs leading-5 text-blue-800">
                        This workspace section is read-only. To add or change
                        creative assets, use the supported creative-management
                        workflow. Saved creatives are displayed here for review;
                        this view does not modify or activate them.
                    </p>
                </div>
            </Surface>

            {creativeError ? (
                <Surface className="border border-red-200 bg-red-50 p-5">
                    <div className="flex items-start gap-3">
                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0 text-red-700"
                            aria-hidden="true"
                        />
                        <div className="min-w-0">
                            <Typography
                                as="h3"
                                variant="headline"
                                className="text-sm font-semibold text-red-900"
                            >
                                Saved creatives could not be loaded
                            </Typography>
                            <p className="mt-1 wrap-break-words text-sm text-red-800">
                                {creativeError}
                            </p>
                            <button
                                type="button"
                                onClick={() => void loadCreatives(true)}
                                disabled={refreshing}
                                className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <RefreshCw
                                    size={14}
                                    className={refreshing ? "animate-spin" : ""}
                                    aria-hidden="true"
                                />
                                Try Again
                            </button>
                        </div>
                    </div>
                </Surface>
            ) : null}

            {!creativeError && previewError ? (
                <Surface className="border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0 text-amber-700"
                            aria-hidden="true"
                        />
                        <div className="min-w-0">
                            <Typography
                                as="h3"
                                variant="headline"
                                className="text-sm font-semibold text-amber-900"
                            >
                                Dimension preview verification unavailable
                            </Typography>
                            <p className="mt-1 break-words text-sm leading-5 text-amber-800">
                                Saved creative assets are displayed, but their
                                current dimension previews could not be verified.
                                This must not be treated as a successful preview
                                or as approval readiness.
                            </p>
                            <p className="mt-1 wrap-break-words text-xs text-amber-800">
                                {previewError}
                            </p>
                            <button
                                type="button"
                                onClick={() => void loadCreatives(true)}
                                disabled={refreshing}
                                className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                            >
                                <RefreshCw
                                    size={14}
                                    className={refreshing ? "animate-spin" : ""}
                                    aria-hidden="true"
                                />
                                Retry Verification
                            </button>
                        </div>
                    </div>
                </Surface>
            ) : null}

            {!creativeError && safeCreatives.length === 0 ? (
                <Surface className="border border-dashed border-gray-300 bg-white p-8 text-center sm:p-10">
                    <ImageIcon
                        size={32}
                        className="mx-auto text-gray-400"
                        aria-hidden="true"
                    />
                    <Typography
                        as="h3"
                        variant="headline"
                        className="mt-3 text-base font-semibold text-gray-900"
                    >
                        No saved creatives
                    </Typography>
                    <Typography
                        as="p"
                        variant="body"
                        className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500"
                    >
                        The creative API returned no saved creative records
                        for this advertisement. Use the supported creative
                        management workflow to add assets.
                    </Typography>
                </Surface>
            ) : null}

            {!creativeError && safeCreatives.length > 0 ? (
                <>
                    <Surface className="flex flex-col gap-4 border border-gray-200 bg-white p-4 sm:p-5">
                        <div>
                            <Typography
                                as="h3"
                                variant="headline"
                                className="text-base font-semibold text-gray-900"
                            >
                                Saved Creative Assets
                            </Typography>
                            <Typography
                                as="p"
                                variant="body"
                                className="mt-1 text-sm leading-5 text-gray-500"
                            >
                                Review all saved records. Inactive creatives
                                remain visible and are not automatically activated.
                            </Typography>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="creative-status-filter"
                                    className="mb-1.5 block text-xs font-semibold text-gray-600"
                                >
                                    Creative Status
                                </label>
                                <select
                                    id="creative-status-filter"
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value as StatusFilter,
                                        )
                                    }
                                    className="min-h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-1"
                                >
                                    <option value="ALL">
                                        All statuses ({safeCreatives.length})
                                    </option>
                                    <option value="ACTIVE">
                                        Active ({activeCount})
                                    </option>
                                    <option value="INACTIVE">
                                        Inactive ({inactiveCount})
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="creative-variant-filter"
                                    className="mb-1.5 block text-xs font-semibold text-gray-600"
                                >
                                    Device Variant
                                </label>
                                <select
                                    id="creative-variant-filter"
                                    value={variantFilter}
                                    onChange={(event) =>
                                        setVariantFilter(
                                            event.target.value as VariantFilter,
                                        )
                                    }
                                    className="min-h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-1"
                                >
                                    <option value="ALL">All variants</option>
                                    <option value="DESKTOP">Desktop</option>
                                    <option value="MOBILE">Mobile</option>
                                </select>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            Showing {filteredCreatives.length} of{" "}
                            {safeCreatives.length} saved{" "}
                            {safeCreatives.length === 1
                                ? "creative"
                                : "creatives"}.
                        </p>
                    </Surface>

                    {filteredCreatives.length === 0 ? (
                        <Surface className="border border-dashed border-gray-300 bg-white p-8 text-center">
                            <ImageIcon
                                size={28}
                                className="mx-auto text-gray-400"
                                aria-hidden="true"
                            />
                            <Typography
                                as="h3"
                                variant="headline"
                                className="mt-3 text-sm font-semibold text-gray-900"
                            >
                                No creatives match these filters
                            </Typography>
                            <Typography
                                as="p"
                                variant="body"
                                className="mt-1 text-sm text-gray-500"
                            >
                                Change the status or device variant to
                                view other saved creative records.
                            </Typography>
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusFilter("ALL");
                                    setVariantFilter("ALL");
                                }}
                                className="mt-4 inline-flex min-h-9 items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                            >
                                Clear Filters
                            </button>
                        </Surface>
                    ) : (
                        <>
                            {variantFilter === "ALL" ||
                                variantFilter === "DESKTOP" ? (
                                <Surface className="flex flex-col gap-4 border border-gray-200 bg-white p-4 sm:p-5">
                                    <VariantHeading
                                        variant="DESKTOP"
                                        count={desktopCreatives.length}
                                    />
                                    {desktopCreatives.length > 0 ? (
                                        <div className="grid gap-4 xl:grid-cols-2">
                                            {desktopCreatives.map((creative) => (
                                                <CreativeCard
                                                    key={creative.id}
                                                    creative={creative}
                                                    onToggle={(value) => { void toggleCreative(value); }}
                                                    toggleDisabled={controlsFrozen}
                                                    toggling={togglingOrder === creative.displayOrder}
                                                    preview={
                                                        desktopPreview?.creativeId ===
                                                            creative.id
                                                            ? desktopPreview
                                                            : null
                                                    }
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                                            No Desktop creatives match
                                            the selected filters.
                                        </p>
                                    )}
                                </Surface>
                            ) : null}

                            {variantFilter === "ALL" ||
                                variantFilter === "MOBILE" ? (
                                <Surface className="flex flex-col gap-4 border border-gray-200 bg-white p-4 sm:p-5">
                                    <VariantHeading
                                        variant="MOBILE"
                                        count={mobileCreatives.length}
                                    />
                                    {mobileCreatives.length > 0 ? (
                                        <div className="grid gap-4 xl:grid-cols-2">
                                            {mobileCreatives.map((creative) => (
                                                <CreativeCard
                                                    key={creative.id}
                                                    creative={creative}
                                                    onToggle={(value) => { void toggleCreative(value); }}
                                                    toggleDisabled={controlsFrozen}
                                                    toggling={togglingOrder === creative.displayOrder}
                                                    preview={
                                                        mobilePreview?.creativeId ===
                                                            creative.id
                                                            ? mobilePreview
                                                            : null
                                                    }
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                                            No Mobile creatives match
                                            the selected filters.
                                        </p>
                                    )}

                                    {mobilePreview?.usesDesktopFallback ? (
                                        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                            <AlertCircle
                                                size={16}
                                                className="mt-0.5 shrink-0 text-amber-700"
                                                aria-hidden="true"
                                            />
                                            <p className="text-xs leading-5 text-amber-800">
                                                The backend preview falls back
                                                to the Desktop creative because
                                                no Mobile creative is configured.
                                            </p>
                                        </div>
                                    ) : null}
                                </Surface>
                            ) : null}
                        </>
                    )}
                </>
            ) : null}
        </div>
    );
};

export default WorkspaceCreative;
