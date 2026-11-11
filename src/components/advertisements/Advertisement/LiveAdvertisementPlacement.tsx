import {
    useEffect,
    useState,
    useRef,
} from "react";

import {
    PUBLIC_PLACEMENT_SIZES,
    type PublicPlacementCode,
} from "@/constants/publicPlacementSizes";

import {
    getPublicPlacementDelivery,
    type PublicDeliveryItem,
} from "@/api/advertisements/public-delivery.api";

import { useAdvertisementEnquiry } from "@/contexts/AdvertisementEnquiryContext";
import { queueAdvertisementImpression, recordPublicAdvertisementEvent } from "@/api/advertisements/public-tracking.api";

interface Props {
    placementCode: PublicPlacementCode;
    placementId?: number;
    newsId?: number;
    className?: string;
}

/** Desktop creatives define logical slides; MOBILE is a responsive variant. */
function getDesktopSlides(item: PublicDeliveryItem) {
    return item.creatives
        .filter((creative) =>
            creative.variant === "DESKTOP" &&
            creative.mediaUrl.trim().length > 0,
        )
        .sort((a, b) =>
            a.displayOrder - b.displayOrder || a.id - b.id,
        );
}

function selectCreative(
    item: PublicDeliveryItem,
    turn: number,
    mobile: boolean,
) {
    const slides = getDesktopSlides(item);
    if (slides.length === 0) {
        return item.creative ?? null;
    }

    const creativeRotationEnabled = item.creativeRotation?.enabled === true;
    const slide = slides[
        creativeRotationEnabled ? turn % slides.length : 0
    ]!;

    if (!mobile) return slide;

    return item.creatives.find((creative) =>
        creative.variant === "MOBILE" &&
        creative.displayOrder === slide.displayOrder &&
        creative.mediaUrl.trim().length > 0,
    ) ?? slide;
}

function isRenderable(item: PublicDeliveryItem): boolean {
    return getDesktopSlides(item).length > 0 || item.creative !== null;
}

function validSeconds(value: number | undefined, fallback = 10): number {
    return typeof value === "number" &&
        Number.isFinite(value) && value >= 1
        ? Math.min(3600, Math.floor(value))
        : fallback;
}

/**
 * Public advertisement renderer.
 *
 * Responsibilities:
 *
 * - Fetch eligible advertisements.
 * - Preserve placement identity.
 * - Select responsive creative.
 * - Keep empty placements hidden during delivery.
 * - Reveal image creatives only after the image has loaded.
 * - Respect collapseWhenEmpty.
 *
 * Backend delivery remains the eligibility authority.
 */
function LiveAdvertisementPlacementContent({
    placementCode,
    placementId,
    newsId,
    className = "",
}: Props) {
    const { openEnquiry } = useAdvertisementEnquiry();
    const placementElement = useRef<HTMLElement | null>(null);
    const [visible, setVisible] = useState(false);
    const [items, setItems] = useState<PublicDeliveryItem[]>([]);
    const [adTurn, setAdTurn] = useState(0);
    const [singleCreativeTurn, setSingleCreativeTurn] = useState(0);

    const [loading, setLoading] = useState(true);

    const [rotationIntervalSeconds, setRotationIntervalSeconds] = useState(10);
    const [rotationEnabled, setRotationEnabled] = useState(false);

    const [hideEmpty, setHideEmpty] = useState(false);

    const [mobile, setMobile] = useState(
        () =>
            typeof window !== "undefined" &&
            window.innerWidth < 768,
    );

    const [loadedMediaUrl, setLoadedMediaUrl] = useState<
        string | null
    >(null);

    const [failedMediaUrl, setFailedMediaUrl] = useState<
        string | null
    >(null);

    const [imageDimensions, setImageDimensions] = useState<{
        url: string;
        width: number;
        height: number;
    } | null>(null);

    /**
     * Responsive viewport detection.
     */
    useEffect(() => {
        const query = window.matchMedia(
            "(max-width: 767px)",
        );

        const update = () => {
            setMobile(query.matches);
        };

        update();

        query.addEventListener("change", update);

        return () => {
            query.removeEventListener("change", update);
        };
    }, []);

    /**
     * Delivery is the sole authority for approval, manual activation,
     * schedules, targeting, placement membership and house-ad fallback.
     * Fetch on mount or when placement identity changes.
     * Do not poll while the visitor remains on the page.
     */
    useEffect(() => {
        let active = true;
        const loadDelivery = async () => {

            try {
                const result = await getPublicPlacementDelivery(
                    placementCode,
                    placementId,
                    newsId,
                );
                if (!active) return;

                if (
                    placementId !== undefined &&
                    result.placement?.id !== placementId
                ) {
                    console.warn("Public advertisement placement mismatch", {
                        requestedPlacementId: placementId,
                        returnedPlacementId: result.placement?.id,
                    });
                    setItems([]);
                    setHideEmpty(true);
                    return;
                }

                const paid = result.advertisements.filter(
                    (advertisement) =>
                        !advertisement.isHouseAd && isRenderable(advertisement),
                );
                const house =
                    result.placement?.fallbackBehavior === "HOUSE_AD" &&
                        result.fallbackApplied
                        ? result.advertisements.filter(
                            (advertisement) =>
                                advertisement.isHouseAd && isRenderable(advertisement),
                        )
                        : [];
                const nextItems = paid.length > 0 ? paid : house;
                setItems(nextItems);
                setRotationEnabled(result.placement?.rotationEnabled === true);
                setRotationIntervalSeconds(
                    validSeconds(result.placement?.rotationIntervalSeconds),
                );
                setHideEmpty(result.placement?.collapseWhenEmpty ?? false);
            } catch (error: unknown) {
                if (!active) return;
                console.error("Public advertisement delivery failed", {
                    placementCode,
                    placementId,
                    newsId,
                    error,
                });
                // Fail closed: never continue showing potentially expired ads.
                setItems([]);
                setHideEmpty(true);
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadDelivery();
        return () => {
            active = false;
        };
    }, [placementCode, placementId, newsId]);

    // Equal advertisement share: one turn per advertisement, not per creative.
    const multiAdRotation = rotationEnabled && items.length > 1;
    const selectedIndex = multiAdRotation ? adTurn % items.length : 0;
    const item = items[selectedIndex] ?? null;

    // Each advertisement advances its own slide after its complete round.
    // Disabled creative rotation always selects that advertisement's first slide.
    const creativeTurn = multiAdRotation
        ? Math.floor(adTurn / items.length)
        : singleCreativeTurn;
    const creative = item ? selectCreative(item, creativeTurn, mobile) : null;

    useEffect(() => {
        if (!multiAdRotation) return;
        const interval = window.setInterval(() => {
            setAdTurn((current) => current + 1);
        }, rotationIntervalSeconds * 1000);
        return () => window.clearInterval(interval);
    }, [multiAdRotation, rotationIntervalSeconds]);

    const singleAdId = item?.advertisementId;
    const singleAdCreativeEnabled = item?.creativeRotation?.enabled === true;
    const singleAdCreativeInterval = validSeconds(
        item?.creativeRotation?.intervalSeconds,
    );
    const singleAdSlideCount = item ? getDesktopSlides(item).length : 0;

    useEffect(() => {
        if (
            multiAdRotation ||
            singleAdId === undefined ||
            !singleAdCreativeEnabled ||
            singleAdSlideCount < 2
        ) return;

        const interval = window.setInterval(() => {
            setSingleCreativeTurn((current) => current + 1);
        }, singleAdCreativeInterval * 1000);
        return () => window.clearInterval(interval);
    }, [
        multiAdRotation,
        singleAdId,
        singleAdCreativeEnabled,
        singleAdCreativeInterval,
        singleAdSlideCount,
    ]);

    useEffect(() => {
        const node = placementElement.current;
        if (!node || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(([entry]) => {
            setVisible(entry?.isIntersecting === true && (entry.intersectionRatio ?? 0) >= 0.5);
        }, { threshold: [0, 0.5, 1] });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const trackingEvent = item && creative && placementId !== undefined &&
        item.scheduleId && item.placementRuleId
        ? {
            advertisementId: item.advertisementId,
            placementId,
            placementRuleId: item.placementRuleId,
            scheduleId: item.scheduleId,
            creativeId: creative.id,
            pageType: (placementCode.startsWith("HOME_") ? "HOME" : placementCode.startsWith("NEWS_LIST_") ? "NEWS_LIST" : "NEWS_DETAIL") as "HOME" | "NEWS_LIST" | "NEWS_DETAIL",
            placementType: placementCode,
            pageUrl: window.location.href,
            ...(newsId ? { context: { newsId } } : {}),
        }
        : null;
    const trackingKey = trackingEvent
        ? `${trackingEvent.advertisementId}:${trackingEvent.scheduleId}:${trackingEvent.creativeId}:${adTurn}:${singleCreativeTurn}`
        : "";
    const readyForTracking = !loading && !!creative &&
        (creative.creativeType !== "IMAGE" || loadedMediaUrl === creative.mediaUrl);
    useEffect(() => {
        if (!visible || !readyForTracking || !trackingEvent) return;
        // Count only a qualifying visible exposure, not every render.
        // The shared queue batches impressions across all page placements.
        const timer = window.setTimeout(() => {
            if (document.visibilityState === "visible") {
                queueAdvertisementImpression(trackingEvent);
            }
        }, 1000);
        return () => window.clearTimeout(timer);
        // Each visible rotation turn is one impression, not each polling refresh.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, readyForTracking, trackingKey]);

    const handleAdClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        if (item?.isHouseAd) {
            event.preventDefault();
            openEnquiry({
                source: "HOUSE_AD",
                sourceAdvertisementId: item.advertisementId,
                ...(placementId !== undefined ? { sourcePlacementId: placementId } : {}),
            });
        }
        if (!trackingEvent) return;
        void recordPublicAdvertisementEvent("click", trackingEvent)
            .catch((error: unknown) => console.warn("Advertisement click tracking failed", error));
    };

    const dimensions =
        PUBLIC_PLACEMENT_SIZES[placementCode];

    const display = mobile
        ? dimensions.mobile
        : dimensions.desktop;

    const isImage =
        creative?.creativeType === "IMAGE";

    const isVideo =
        creative?.creativeType === "VIDEO";

    // Preserve square PNG edges across every placement; JPEG retains rounded corners.
    const isPngCreative = isImage && /\.png(?:[?#]|$)/i.test(creative?.mediaUrl ?? "");

    const isImageReady =
        isImage &&
        loadedMediaUrl === creative?.mediaUrl;

    const isImageFailed =
        isImage &&
        failedMediaUrl === creative?.mediaUrl;

    /**
     * Hide an empty placement only after the backend
     * delivery request has completed.
     */
    if (
        !loading &&
        !creative &&
        hideEmpty
    ) {
        return null;
    }

    /**
     * Do not leave an empty placeholder after the
     * request completes without an eligible creative.
     *
     * A separate HOUSE_AD fallback, if configured,
     * must be returned by the backend delivery API.
     */
    if (
        !loading &&
        (!creative || !item)
    ) {
        return null;
    }

    /**
     * Media presentation.
     */
    let content = null;

    if (creative && item) {
        if (isImage) {
            content = (
                <>
                    {!isImageFailed && (
                        <img
                            key={creative.mediaUrl}
                            src={creative.mediaUrl}
                            alt={
                                creative.altText ??
                                item.name
                            }
                            loading="eager"
                            decoding="async"
                            onLoad={(event) => {
                                const image = event.currentTarget;
                                setImageDimensions({
                                    url: creative.mediaUrl,
                                    width: image.naturalWidth,
                                    height: image.naturalHeight,
                                });
                                setLoadedMediaUrl(
                                    creative.mediaUrl,
                                );

                                setFailedMediaUrl(null);
                            }}
                            onError={() => {
                                setFailedMediaUrl(
                                    creative.mediaUrl,
                                );
                            }}
                            className={[
                                "block h-auto w-full",
                                "object-contain bg-white",
                                isPngCreative ? "rounded-none" : "rounded-lg",
                                "transition-opacity",
                                "duration-200",
                                isImageReady
                                    ? "opacity-100"
                                    : "opacity-0",
                            ].join(" ")}
                        />
                    )}
                </>
            );
        } else if (isVideo) {
            content = (
                <video
                    src={creative.mediaUrl}
                    className="h-full w-full object-contain"
                    controls
                    playsInline
                    preload="metadata"
                />
            );
        } else {
            content = (
                <span className="p-3 text-sm">
                    {creative.creativeType === "TEXT"
                        ? creative.mediaUrl
                        : creative.title ?? item.name}
                </span>
            );
        }
    }

    const actualImageDimensions = isImageReady &&
        imageDimensions?.url === creative?.mediaUrl &&
        imageDimensions.width > 0 && imageDimensions.height > 0
        ? imageDimensions
        : null;

    // HOME_TOP commonly serves either a 970x90 or 728x90 banner.
    // Use the banner dimensions until the actual image dimensions are known.
    const reservedDisplay = placementCode === "HOME_TOP"
        ? { width: 970, height: 90 }
        : display;

    // Apply media-specific corners consistently to every public placement.
    // Cloudinary URLs can include transformations and query strings.
    const isBottomPlacement = placementCode === "NEWS_DETAIL_BOTTOM";

    const isClickable = Boolean(item?.isHouseAd) || (
        Boolean(item?.isClickable) && Boolean(item?.destinationUrl)
    );

    // Keep the media mounted so the browser can load it, but do not expose
    // a blank placement while delivery or the image request is pending.
    // For video and text creatives, preserve the existing display behavior.
    const revealPlacement = !loading && Boolean(item && creative) &&
        (!isImage || (isImageReady && !isImageFailed));

    return (
        <aside
            ref={placementElement}
            aria-label={`${placementCode} advertisement`}
            className={[revealPlacement ? "flex" : "hidden", "w-full min-w-0 justify-center", className].filter(Boolean).join(" ")}
            aria-busy={loading}
        >
            <div
                className={[
                    "relative mx-auto min-w-0 max-w-full shrink",
                    isPngCreative
                        ? "w-full overflow-visible rounded-none border-0 bg-transparent shadow-none"
                        : isBottomPlacement
                            ? "w-full overflow-hidden rounded-lg bg-white"
                            : "w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm",
                ].join(" ")}
                style={{
                    maxWidth: actualImageDimensions?.width ?? reservedDisplay.width,
                    aspectRatio: actualImageDimensions
                        ? `${actualImageDimensions.width} / ${actualImageDimensions.height}`
                        : `${reservedDisplay.width} / ${reservedDisplay.height}`,
                }}
            >
                {isClickable && item ? (
                    <a
                        href={item.isHouseAd ? "#advertisement-enquiry" : item.destinationUrl!}
                        onClick={handleAdClick}
                        target={
                            !item.isHouseAd && item.openInNewTab
                                ? "_blank"
                                : undefined
                        }
                        rel={
                            !item.isHouseAd && item.openInNewTab
                                ? "noopener noreferrer"
                                : undefined
                        }
                        className={[
                            "relative block",
                            "w-full",
                            isImage && isImageReady ? "h-auto" : "h-full",
                        ].join(" ")}
                    >
                        {content}
                    </a>
                ) : (
                    <div
                        className={[
                            "relative flex",
                            "w-full",
                            isImage && isImageReady ? "h-auto" : "h-full",
                            "items-center justify-center",
                        ].join(" ")}
                    >
                        {content}
                    </div>
                )}
            </div>
        </aside>
    );
}

/**
 * Remount delivery request state whenever the
 * advertisement placement identity changes.
 */
export default function LiveAdvertisementPlacement(
    props: Props,
) {
    const key = [
        props.placementCode,
        props.placementId ?? "default",
        props.newsId ?? "none",
    ].join(":");

    return (
        <LiveAdvertisementPlacementContent
            key={key}
            {...props}
        />
    );
}
