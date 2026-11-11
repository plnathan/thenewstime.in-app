
import {
    useEffect,
    useMemo,
    useState,
} from "react";

type CreativeType = "IMAGE" | "VIDEO" | "HTML" | "TEXT";
type CreativeVariant = "DESKTOP" | "MOBILE";
type RotationMode = "TIME_BASED";
type RotationStrategy = "ROUND_ROBIN";

export interface AdvertisementRendererCreative {
    id: number;
    formatId: number | null;
    creativeType: CreativeType;
    variant: CreativeVariant;
    title: string | null;
    altText: string | null;
    mediaUrl: string;
    thumbnailUrl: string | null;
    widthPx: number | null;
    heightPx: number | null;
    displayOrder: number;
    isPrimary: boolean;
}

export interface AdvertisementRendererItem {
    advertisementId: number;
    name: string;
    advertisementType: string;
    destinationUrl: string | null;
    priority: number;
    openInNewTab: boolean;
    isClickable: boolean;
    isHouseAd: boolean;
    schedulePriority: number;
    placementRuleId: number;
    placementDisplayOrder: number;
    insertionType: string;
    insertionPosition: number | null;
    maxImpressions: number | null;
    creative: AdvertisementRendererCreative | null;
    format: {
        id: number;
        code: string;
        displayName: string;
        widthPx: number | null;
        heightPx: number | null;
        mobileWidthPx: number | null;
        mobileHeightPx: number | null;
        isResponsive: boolean;
    } | null;
    creatives: AdvertisementRendererCreative[];
}

export interface AdvertisementRendererPlacement {
    id: number;
    code: string;
    displayName: string;
    description: string | null;
    pageType: string;
    placementType: string;
    insertionType: string;
    displayOrder: number;
    collapseWhenEmpty: boolean;
    fallbackBehavior: "HIDE" | "HOUSE_AD";
    displayFrequency: string | null;
    frequencyValue: number | null;
    autoCloseEnabled: boolean;
    autoCloseSeconds: number | null;
    closeButtonEnabled: boolean;
    closeOnOverlayClick: boolean;
    rotationEnabled: boolean;
    rotationMode: RotationMode;
    rotationIntervalSeconds: number;
    rotationStrategy: RotationStrategy;
}

export interface AdvertisementRendererResponse {
    placement: AdvertisementRendererPlacement | null;
    advertisements: AdvertisementRendererItem[];
    fallbackApplied: boolean;
}

export interface AdvertisementRendererProps {
    response: AdvertisementRendererResponse;
    deviceType?: CreativeVariant;
    className?: string;
    onAdvertisementChange?: (
        advertisement: AdvertisementRendererItem,
        creative: AdvertisementRendererCreative,
    ) => void;
    onClose?: () => void;
}

interface RendererState {
    key: string;
    advertisementIndex: number;
    creativeIndex: number;
    isClosed: boolean;
}

const DEFAULT_ROTATION_INTERVAL_SECONDS = 10;

function getUsableCreatives(
    advertisement: AdvertisementRendererItem,
): AdvertisementRendererCreative[] {
    const source = [
        ...(advertisement.creatives ?? []),
        ...(advertisement.creative ? [advertisement.creative] : []),
    ];

    const seen = new Set<number>();

    return source
        .filter((creative) => {
            if (
                !Number.isFinite(creative.id) ||
                !creative.mediaUrl.trim() ||
                seen.has(creative.id)
            ) {
                return false;
            }

            seen.add(creative.id);
            return true;
        })
        .sort((a, b) => {
            // The primary creative takes precedence over display order.
            if (a.isPrimary !== b.isPrimary) {
                return a.isPrimary ? -1 : 1;
            }

            if (a.displayOrder !== b.displayOrder) {
                return a.displayOrder - b.displayOrder;
            }

            return a.id - b.id;
        });
}

function selectCreativesForDevice(
    creatives: AdvertisementRendererCreative[],
    deviceType: CreativeVariant,
): AdvertisementRendererCreative[] {
    const preferred = creatives.filter(
        (creative) => creative.variant === deviceType,
    );

    if (preferred.length > 0) {
        return preferred;
    }

    // Only fall back to the opposite supported device variant.
    const fallbackVariant: CreativeVariant =
        deviceType === "DESKTOP" ? "MOBILE" : "DESKTOP";

    return creatives.filter(
        (creative) => creative.variant === fallbackVariant,
    );
}

function normalizeInterval(seconds: number | null | undefined): number {
    if (
        seconds === null ||
        seconds === undefined ||
        !Number.isFinite(seconds) ||
        seconds <= 0
    ) {
        return DEFAULT_ROTATION_INTERVAL_SECONDS * 1000;
    }

    return Math.max(1, seconds) * 1000;
}

function safeDestinationUrl(value: string | null): string | null {
    if (!value?.trim()) {
        return null;
    }

    try {
        const isRelativeUrl =
            value.startsWith("/") &&
            !value.startsWith("//");

        const baseUrl =
            typeof window !== "undefined"
                ? window.location.origin
                : "https://renderer.invalid";

        const url = new URL(value, baseUrl);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return null;
        }

        // Keep relative destinations relative for server-rendered environments.
        return isRelativeUrl ? value : url.href;
    } catch {
        return null;
    }
}

function safeMediaUrl(value: string): string | null {
    if (!value.trim()) {
        return null;
    }

    try {
        const isRelativeUrl =
            value.startsWith("/") &&
            !value.startsWith("//");

        const baseUrl =
            typeof window !== "undefined"
                ? window.location.origin
                : "https://renderer.invalid";

        const url = new URL(value, baseUrl);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return null;
        }

        return isRelativeUrl ? value : url.href;
    } catch {
        return null;
    }
}

function getInitialState(key: string): RendererState {
    return {
        key,
        advertisementIndex: 0,
        creativeIndex: 0,
        isClosed: false,
    };
}

export default function AdvertisementRenderer({
    response,
    deviceType,
    className,
    onAdvertisementChange,
    onClose,
}: AdvertisementRendererProps) {
    const placement = response.placement;

    const [detectedDeviceType, setDetectedDeviceType] =
        useState<CreativeVariant>("DESKTOP");

    useEffect(() => {
        if (deviceType) {
            return;
        }

        const mediaQuery = window.matchMedia(
            "(max-width: 767px)",
        );

        const updateDeviceType = () => {
            setDetectedDeviceType(
                mediaQuery.matches ? "MOBILE" : "DESKTOP",
            );
        };

        updateDeviceType();
        mediaQuery.addEventListener("change", updateDeviceType);

        return () => {
            mediaQuery.removeEventListener(
                "change",
                updateDeviceType,
            );
        };
    }, [deviceType]);

    const effectiveDeviceType =
        deviceType ?? detectedDeviceType;

    const advertisements = useMemo(
        () =>
            (response.advertisements ?? [])
                .map((advertisement) => ({
                    advertisement,
                    creatives: getUsableCreatives(advertisement),
                }))
                .filter((entry) => entry.creatives.length > 0),
        [response.advertisements],
    );

    const rendererKey = useMemo(
        () =>
            JSON.stringify({
                placementId: placement?.id ?? null,
                fallbackApplied: response.fallbackApplied,
                deviceType: effectiveDeviceType,
                advertisements: advertisements.map((entry) => ({
                    id: entry.advertisement.advertisementId,
                    creatives: entry.creatives.map((creative) => ({
                        id: creative.id,
                        variant: creative.variant,
                        mediaUrl: creative.mediaUrl,
                        isPrimary: creative.isPrimary,
                    })),
                })),
            }),
        [
            advertisements,
            effectiveDeviceType,
            placement?.id,
            response.fallbackApplied,
        ],
    );

    const [rendererState, setRendererState] =
        useState<RendererState>(() => getInitialState(""));

    // Derive fresh state for a changed response without synchronously
    // setting React state during an effect.
    const activeState =
        rendererState.key === rendererKey
            ? rendererState
            : getInitialState(rendererKey);

    const updateRendererState = (
        updater: (current: RendererState) => RendererState,
    ) => {
        setRendererState((previous) => {
            const current =
                previous.key === rendererKey
                    ? previous
                    : getInitialState(rendererKey);

            return updater(current);
        });
    };

    const rotationEnabled =
        placement?.rotationEnabled === true &&
        placement.rotationMode === "TIME_BASED" &&
        placement.rotationStrategy === "ROUND_ROBIN";

    const rotationIntervalMs = normalizeInterval(
        placement?.rotationIntervalSeconds,
    );

    const advertisementCount = advertisements.length;

    const advertisementIndex =
        advertisementCount > 0
            ? (
                (activeState.advertisementIndex % advertisementCount) +
                advertisementCount
            ) % advertisementCount
            : 0;

    const currentEntry = advertisements[advertisementIndex];
    const currentAdvertisement = currentEntry?.advertisement;

    const deviceCreatives = useMemo(
        () =>
            currentEntry
                ? selectCreativesForDevice(
                    currentEntry.creatives,
                    effectiveDeviceType,
                )
                : [],
        [currentEntry, effectiveDeviceType],
    );

    const creativeCount = deviceCreatives.length;

    const creativeIndex =
        creativeCount > 0
            ? (
                (activeState.creativeIndex % creativeCount) +
                creativeCount
            ) % creativeCount
            : 0;

    const currentCreative = deviceCreatives[creativeIndex] ?? null;

    const rotateAdvertisements =
        rotationEnabled && advertisementCount > 1;

    const rotateCreatives =
        creativeCount > 1 && !rotateAdvertisements;

    useEffect(() => {
        if (
            activeState.isClosed ||
            !currentAdvertisement ||
            !currentCreative
        ) {
            return;
        }

        onAdvertisementChange?.(
            currentAdvertisement,
            currentCreative,
        );
    }, [
        activeState.isClosed,
        currentAdvertisement,
        currentCreative,
        onAdvertisementChange,
    ]);

    useEffect(() => {
        if (
            activeState.isClosed ||
            !currentAdvertisement ||
            !currentCreative ||
            (!rotateAdvertisements && !rotateCreatives)
        ) {
            return;
        }

        const timer = window.setInterval(() => {
            updateRendererState((current) => {
                if (rotateAdvertisements) {
                    return {
                        ...current,
                        advertisementIndex:
                            (current.advertisementIndex + 1) %
                            advertisementCount,
                        creativeIndex: 0,
                    };
                }

                if (rotateCreatives) {
                    return {
                        ...current,
                        creativeIndex:
                            (current.creativeIndex + 1) %
                            creativeCount,
                    };
                }

                return current;
            });
        }, rotationIntervalMs);

        return () => {
            window.clearInterval(timer);
        };
    }, [
        activeState.isClosed,
        advertisementCount,
        creativeCount,
        currentAdvertisement,
        currentCreative,
        rotateAdvertisements,
        rotateCreatives,
        rotationIntervalMs,
    ]);

    useEffect(() => {
        if (
            activeState.isClosed ||
            !placement?.autoCloseEnabled ||
            placement.autoCloseSeconds === null ||
            placement.autoCloseSeconds <= 0
        ) {
            return;
        }

        const timer = window.setTimeout(() => {
            updateRendererState((current) => ({
                ...current,
                isClosed: true,
            }));

            onClose?.();
        }, placement.autoCloseSeconds * 1000);

        return () => {
            window.clearTimeout(timer);
        };
    }, [
        activeState.isClosed,
        onClose,
        placement?.autoCloseEnabled,
        placement?.autoCloseSeconds,
        placement?.id,
    ]);

    if (
        activeState.isClosed ||
        !placement ||
        !currentAdvertisement ||
        !currentCreative
    ) {
        return null;
    }

    const mediaUrl = safeMediaUrl(currentCreative.mediaUrl);

    if (!mediaUrl) {
        return null;
    }

    const destinationUrl = currentAdvertisement.isClickable
        ? safeDestinationUrl(currentAdvertisement.destinationUrl)
        : null;

    const accessibleLabel =
        currentCreative.title?.trim() ||
        currentAdvertisement.name ||
        placement.displayName ||
        "Advertisement";

    const linkProps = destinationUrl
        ? {
            href: destinationUrl,
            target: currentAdvertisement.openInNewTab
                ? "_blank" as const
                : undefined,
            rel: currentAdvertisement.openInNewTab
                ? "noopener noreferrer"
                : undefined,
        }
        : null;

    const content = (() => {
        switch (currentCreative.creativeType) {
            case "IMAGE":
                return (
                    <img
                        src={mediaUrl}
                        alt={
                            currentCreative.altText ??
                            currentCreative.title ??
                            currentAdvertisement.name
                        }
                        width={currentCreative.widthPx ?? undefined}
                        height={currentCreative.heightPx ?? undefined}
                        loading="lazy"
                        decoding="async"
                        style={{
                            display: "block",
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                        }}
                    />
                );

            case "VIDEO":
                return (
                    <video
                        src={mediaUrl}
                        poster={
                            currentCreative.thumbnailUrl
                                ? safeMediaUrl(
                                    currentCreative.thumbnailUrl,
                                ) ?? undefined
                                : undefined
                        }
                        controls
                        playsInline
                        preload="metadata"
                        aria-label={accessibleLabel}
                        style={{
                            display: "block",
                            width: "100%",
                            height: "auto",
                        }}
                    >
                        Your browser does not support video playback.
                    </video>
                );

            case "HTML":
                return (
                    <iframe
                        src={mediaUrl}
                        title={accessibleLabel}
                        sandbox="allow-scripts"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        style={{
                            display: "block",
                            width: "100%",
                            height: currentCreative.heightPx
                                ? `${currentCreative.heightPx}px`
                                : "250px",
                            border: 0,
                        }}
                    />
                );

            case "TEXT":
                return (
                    <span className="block p-3 text-sm">
                        {currentCreative.title ??
                            currentAdvertisement.name}
                    </span>
                );

            default:
                return null;
        }
    })();

    if (!content) {
        return null;
    }

    const handleClose = () => {
        updateRendererState((current) => ({
            ...current,
            isClosed: true,
        }));

        onClose?.();
    };

    const canWrapContentInLink =
        linkProps !== null &&
        currentCreative.creativeType !== "HTML";

    return (
        <div
            className={className}
            data-advertisement-placement={placement.code}
            data-advertisement-id={
                currentAdvertisement.advertisementId
            }
            data-advertisement-creative-id={currentCreative.id}
            data-fallback-applied={
                response.fallbackApplied ? "true" : "false"
            }
            role="region"
            aria-label={placement.displayName || "Advertisement"}
            style={{
                position: "relative",
                width: "100%",
            }}
        >
            {canWrapContentInLink && linkProps ? (
                <a
                    {...linkProps}
                    aria-label={accessibleLabel}
                    style={{ display: "block" }}
                >
                    {content}
                </a>
            ) : (
                content
            )}

            {placement.closeButtonEnabled && (
                <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close advertisement"
                    className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-sm text-white"
                >
                    ×
                </button>
            )}
        </div>
    );
}
