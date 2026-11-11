
import { useEffect, useState } from "react";

import {
    getPublicPlacementSlots,
} from "@/api/advertisements/public-delivery.api";

import LiveAdvertisementPlacement from "./LiveAdvertisementPlacement";

import type {
    PublicPlacementCode,
} from "@/constants/publicPlacementSizes";

type SidebarCode = Extract<
    PublicPlacementCode,
    "HOME_SIDEBAR" | "NEWS_LIST_SIDEBAR"
>;

interface Props {
    placementCode: SidebarCode;
}

interface SlotState {
    placementCode: SidebarCode;
    ids: number[];
    error: string | null;
}

export default function DynamicAdvertisementSidebar({
    placementCode,
}: Props) {
    const [state, setState] = useState<SlotState | null>(
        null,
    );

    useEffect(() => {
        let active = true;

        void getPublicPlacementSlots(placementCode)
            .then((slots) => {
                if (!active) return;

                const ids = [
                    ...new Set(
                        slots
                            .map((slot) => slot.id)
                            .filter(
                                (id) =>
                                    Number.isInteger(id) &&
                                    id > 0,
                            ),
                    ),
                ];

                setState({
                    placementCode,
                    ids,
                    error: null,
                });
            })
            .catch((error: unknown) => {
                if (!active) return;

                console.error(
                    "Unable to load sidebar placements",
                    {
                        placementCode,
                        error,
                    },
                );

                setState({
                    placementCode,
                    ids: [],
                    error: "Unable to load placements.",
                });
            });

        return () => {
            active = false;
        };
    }, [placementCode]);

    const ids =
        state?.placementCode === placementCode
            ? state.ids
            : [];

    if (ids.length === 0) {
        return null;
    }

    return (
        <div
            className="flex flex-col items-center gap-[18px]"
            data-placement-code={placementCode}
        >
            {ids.map((placementId) => (
                <LiveAdvertisementPlacement
                    key={placementId}
                    placementCode={placementCode}
                    placementId={placementId}
                />
            ))}
        </div>
    );
}
