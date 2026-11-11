import { useEffect, useState } from "react";

import {
    getPublicPlacementSlots,
    type PublicPlacementSlot,
} from "@/api/advertisements/public-delivery.api";
import LiveAdvertisementPlacement from "@/components/advertisements/Advertisement/LiveAdvertisementPlacement";
import SidebarNewsCard from "@/components/news/SidebarNewsCard";
import type { NewsView } from "@/types";

interface Props {
    popularNews: NewsView[];
    popularLoading: boolean;
    otherNews: NewsView[];
    otherLoading: boolean;
    otherError: string | null;
}

interface NewsBlockProps {
    title: string;
    items: NewsView[];
    loading: boolean;
}

function NewsBlock({ title, items, loading }: NewsBlockProps) {
    return (
        <section className="w-full min-w-0" aria-label={title}>
            <h2 className="mb-3 break-words text-lg font-bold leading-snug text-gray-900">
                {title}
            </h2>
            {loading ? (
                <p className="text-sm text-gray-500">செய்திகள் பெறப்படுகின்றன...</p>
            ) : items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((item) => (
                        <SidebarNewsCard key={item.id} news={item} compact />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">விரைவில்...</p>
            )}
        </section>
    );
}

/**
 * The homepage owns Popular News selection and reserves those articles before
 * assigning category sections. This component only renders that selection.
 */
export default function DynamicHomeSidebar({
    popularNews,
    popularLoading,
    otherNews,
    otherLoading,
    otherError,
}: Props) {
    const [slots, setSlots] = useState<PublicPlacementSlot[]>([]);

    useEffect(() => {
        let active = true;

        void getPublicPlacementSlots("HOME_SIDEBAR")
            .then((result) => {
                if (!active) return;
                setSlots(
                    result
                        .filter((slot) => slot.placementType === "HOME_SIDEBAR")
                        .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id),
                );
            })
            .catch((error: unknown) => {
                console.error("Unable to load homepage sidebar placements", error);
                if (active) setSlots([]);
            });

        return () => {
            active = false;
        };
    }, []);

    const advertisement = (position: number) => {
        const slot = slots.find((item) => item.displayOrder === position);
        if (!slot) return null;
        return (
            <LiveAdvertisementPlacement
                key={slot.id}
                placementCode="HOME_SIDEBAR"
                placementId={slot.id}
            />
        );
    };

    return (
        <aside className="flex w-full min-w-0 flex-col gap-[18px]" aria-label="Homepage sidebar">
            {advertisement(1)}
            {otherError ? (
                <p role="alert" className="text-sm text-red-600">{otherError}</p>
            ) : (
                <NewsBlock
                    title="பிற நடப்புச் செய்திகள்"
                    items={otherNews}
                    loading={otherLoading}
                />
            )}
            {advertisement(2)}
            <NewsBlock title="பிரபலமானவை" items={popularNews} loading={popularLoading} />
            {advertisement(3)}
        </aside>
    );
}
