import NewsCard from "@/components/news/NewsCard";
import FeaturedNewsCard from "@/components/news/FeaturedNewsCard";
import SidebarNewsCard from "@/components/news/SidebarNewsCard";
import Advertisement from "@/components/advertisement/Advertisement";
import Section from "@/components/home/Section";

import type { NewsView } from "@/types";

type LayoutType =
    | "list"
    | "featured"
    | "grid"
    | "compact";

interface Props {
    title: string;
    news: NewsView[];
    actionLabel?: string;
    onActionClick?: () => void;
    layout?: LayoutType;
}

export default function HomeNewsSection({
    title,
    news,
    actionLabel,
    onActionClick,
    layout = "list",
}: Props) {
    return (
        <div className="space-y-[3px]">
            {/* Section */}
            <div className="mt-1">
                <Section
                    title={title}
                    actionLabel={actionLabel}
                    onActionClick={onActionClick}
                    className="mb-2"
                >
                    {!news.length ? (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-7 text-center">
                            <p className="text-sm text-gray-500">
                                இந்தப் பிரிவில் தற்போது செய்திகள் இல்லை.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* List layout */}
                            {layout === "list" && (
                                <div className="space-y-5">
                                    {news.map((item) => (
                                        <NewsCard
                                            key={item.id}
                                            news={item}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Featured layout */}
                            {layout === "featured" && (
                                <div className="space-y-5">
                                    <FeaturedNewsCard news={news[0]} />

                                    <div className="space-y-4">
                                        {news.slice(1, 4).map((item) => (
                                            <SidebarNewsCard
                                                key={item.id}
                                                news={item}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Grid layout */}
                            {layout === "grid" && (
                                <div className="grid gap-5 md:grid-cols-2">
                                    {news.map((item) => (
                                        <NewsCard
                                            key={item.id}
                                            news={item}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Compact layout */}
                            {layout === "compact" && (
                                <div className="space-y-3">
                                    {news.map((item) => (
                                        <SidebarNewsCard
                                            key={item.id}
                                            news={item}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </Section>
            </div>
            {/* Advertisement */}
            <Advertisement className="min-h-[96px]" />
        </div>
    );
}