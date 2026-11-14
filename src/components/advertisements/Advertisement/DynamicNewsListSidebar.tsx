import { useEffect, useState } from "react";
import SidebarNewsCard from "@/components/news/SidebarNewsCard";
import Section from "@/components/home/Section/Section";
import { getPublicPlacementSlots, type PublicPlacementSlot } from "@/api/advertisements/public-delivery.api";
import LiveAdvertisementPlacement from "./LiveAdvertisementPlacement";
import type { NewsView } from "@/types";

interface Props {
    importantNews: NewsView[];
    additionalNews: NewsView[];
}

function SidebarNewsSection({
    title,
    news,
    loading,
    error,
    emptyMessage = "விரைவில்...",
}: {
    title: string;
    news: NewsView[];
    loading: boolean;
    error: string | null;
    emptyMessage?: string;
}) {
    return (
        <Section title={title} className="mb-0 min-w-0 w-full">
            {loading ? (
                <p className="mt-3 text-sm text-gray-500">செய்திகள் பெறப்படுகின்றன...</p>
            ) : error ? (
                <p className="mt-3 text-sm text-red-600">செய்திகளை பெற முடியவில்லை.</p>
            ) : news.length ? (
                <div className="min-w-0 space-y-4">
                    {news.map((item) => (
                        <SidebarNewsCard key={item.id} news={item} compact />
                    ))}
                </div>
            ) : (
                <p className="mt-3 text-sm text-gray-500">{emptyMessage}</p>
            )}
        </Section>
    );
}

/** Fixed sidebar slots with a reserved, non-overlapping news stream. */
export default function DynamicNewsListSidebar({ importantNews, additionalNews }: Props) {
    const [slots, setSlots] = useState<PublicPlacementSlot[]>([]);

    useEffect(() => {
        let active = true;
        void getPublicPlacementSlots("NEWS_LIST_SIDEBAR")
            .then((result) => {
                if (!active) return;
                setSlots(
                    [...result].sort(
                        (a, b) => a.displayOrder - b.displayOrder || a.id - b.id,
                    ),
                );
            })
            .catch((error: unknown) => {
                if (!active) return;
                console.error("Unable to load News List sidebar placements", error);
                setSlots([]);
            });
        return () => {
            active = false;
        };
    }, []);

    const renderAd = (index: number) => {
        const slot = slots[index];
        return slot ? (
            <LiveAdvertisementPlacement
                key={slot.id}
                placementCode="NEWS_LIST_SIDEBAR"
                placementId={slot.id}
            />
        ) : null;
    };

    return (
        <aside
            aria-label="News list sidebar"
            className="flex w-full min-w-0 flex-col gap-[18px]"
        >
            {renderAd(0)}
            <SidebarNewsSection
                title="முக்கியச் செய்திகள்"
                news={importantNews}
                loading={false}
                error={null}
            />
            {renderAd(1)}
            <SidebarNewsSection
                title="மேலும் செய்திகள்"
                emptyMessage="விரைவில்..."
                news={additionalNews}
                loading={false}
                error={null}
            />
            {renderAd(2)}

        </aside>
    );
}
