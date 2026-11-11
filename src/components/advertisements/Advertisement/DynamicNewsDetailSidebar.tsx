import {
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    getPublicPlacementSlots,
    type PublicPlacementSlot,
} from "@/api/advertisements/public-delivery.api";

import LiveAdvertisementPlacement from "@/components/advertisements/Advertisement/LiveAdvertisementPlacement";

interface Props {
    newsId: number;
    popularNews: ReactNode;
    importantNews: ReactNode;
    className?: string;
}

type SlotState =
    | {
        status: "loading";
        slots: PublicPlacementSlot[];
    }
    | {
        status: "ready";
        slots: PublicPlacementSlot[];
    };

const sortSlots = (
    slots: PublicPlacementSlot[],
): PublicPlacementSlot[] =>
    [...slots].sort(
        (a, b) =>
            a.displayOrder - b.displayOrder ||
            a.id - b.id,
    );

/**
 * Loading skeleton for the first sidebar advertisement.
 *
 * This reserves the advertisement area while the backend
 * placement discovery request is in progress.
 */
function SidebarAdvertisementSkeleton() {
    return (
        <div
            className="w-full min-w-0"
            role="status"
            aria-label="Loading sidebar advertisement"
        >
            <div
                className={[
                    "relative mx-auto w-full",
                    "max-w-[300px]",
                    "overflow-hidden rounded-lg",
                    "bg-gray-100",
                    "animate-pulse",
                ].join(" ")}
                style={{
                    aspectRatio: "300 / 600",
                }}
            >
                <div
                    className={[
                        "absolute inset-0",
                        "flex items-center justify-center",
                    ].join(" ")}
                >
                    <span className="text-xs text-gray-400">
                        Advertisement
                    </span>
                </div>
            </div>
        </div>
    );
}

/**
 * News Details dynamic sidebar.
 *
 * Rendering order:
 *
 * 1. First configured advertisement
 * 2. Important News
 * 3. Second configured advertisement
 * 4. Popular News
 * 5. Third configured advertisement
 *
 * During placement discovery:
 *
 * 1. Advertisement skeleton
 * 2. Important News
 *
 * This prevents Important News from initially appearing
 * at the top and moving downward when advertisements load.
 */
function SidebarContent({
    newsId,
    popularNews,
    importantNews,
    className,
}: Props) {
    const [result, setResult] = useState<SlotState>({
        status: "loading",
        slots: [],
    });

    useEffect(() => {
        let active = true;

        getPublicPlacementSlots("NEWS_DETAIL_SIDEBAR", newsId)
            .then((slots) => {
                if (!active) {
                    return;
                }

                setResult({
                    status: "ready",
                    slots: sortSlots(slots),
                });
            })
            .catch((error: unknown) => {
                if (!active) {
                    return;
                }

                console.error(
                    "Failed to discover News Details sidebar placements",
                    error,
                );

                setResult({
                    status: "ready",
                    slots: [],
                });
            });

        return () => {
            active = false;
        };
    }, [newsId]);

    const isLoading = result.status === "loading";

    const slots = result.slots;

    const renderAd = (index: number) => {
        const slot = slots[index];
        return slot ? (
            <LiveAdvertisementPlacement
                key={slot.id}
                placementCode="NEWS_DETAIL_SIDEBAR"
                placementId={slot.id}
                newsId={newsId}
            />
        ) : null;
    };

    return (
        <aside className={className} aria-label="News detail sidebar" aria-busy={isLoading}>
            {isLoading ? <SidebarAdvertisementSkeleton /> : renderAd(0)}
            <div className="w-full min-w-0">{importantNews}</div>
            {!isLoading && renderAd(1)}
            <div className="w-full min-w-0">{popularNews}</div>
            {!isLoading && renderAd(2)}
        </aside>
    );
}

/**
 * Remount sidebar request state when the news article changes.
 */
export default function DynamicNewsDetailSidebar(
    props: Props,
) {
    return (
        <SidebarContent
            key={props.newsId}
            {...props}
        />
    );
}