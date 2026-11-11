import { useEffect, useState } from "react";
import LiveAdvertisementPlacement from "./LiveAdvertisementPlacement";
import { getPublicPlacementSlots } from "@/api/advertisements/public-delivery.api";
import type { PublicPlacementCode } from "@/constants/publicPlacementSizes";

interface Props { placementCode: PublicPlacementCode; slotNumber: number; newsId?: number; configuredCode?: string; }

/** Resolves each independently configured placement ID before requesting delivery. */
function LiveAdvertisementSlotContent({ placementCode, slotNumber, newsId, configuredCode }: Props) {
    const [placementId, setPlacementId] = useState<number | null>(null);
    useEffect(() => {
        let active = true;
        getPublicPlacementSlots(placementCode, newsId)
            .then((slots) => {
                if (!active) return;
                const ordered = [...slots].sort((a, b) =>
                    a.displayOrder - b.displayOrder || a.id - b.id,
                );
                const selected = configuredCode
                    ? ordered.find((slot) => slot.code === configuredCode)
                    : ordered[slotNumber - 1];
                if (!selected) {
                    console.warn("No enabled public advertisement placement slot found", {
                        placementCode,
                        slotNumber,
                        returnedSlots: ordered.length,
                    });
                }
                setPlacementId(selected?.id ?? null);
            })
            .catch((error: unknown) => {
                if (!active) return;
                console.error("Failed to resolve public advertisement placement slot", {
                    placementCode,
                    slotNumber,
                    error,
                });
                setPlacementId(null);
            });
        return () => { active = false; };
    }, [placementCode, slotNumber, newsId, configuredCode]);
    // Never fall back to an unscoped delivery request: it could duplicate another slot.
    if (placementId === null) return null;
    return (
        <div className="flex w-full min-w-0 justify-center" data-placement-code={placementCode}>
            <LiveAdvertisementPlacement
                placementCode={placementCode}
                placementId={placementId}
                newsId={newsId}
            />
        </div>
    );
}

/** Remount slot discovery when its identity changes, preventing stale slot IDs. */
export default function LiveAdvertisementSlot(props: Props) {
    const key = `${props.placementCode}:${props.slotNumber}:${props.configuredCode ?? ""}`;
    return <LiveAdvertisementSlotContent key={key} {...props} />;
}
