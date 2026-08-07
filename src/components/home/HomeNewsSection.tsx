import NewsCard from "@/components/news/NewsCard";
import FeaturedNewsCard from "@/components/news/FeaturedNewsCard";
import SidebarNewsCard from "@/components/news/SidebarNewsCard";

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
        <Section
            title={title}
            actionLabel={actionLabel}
            onActionClick={onActionClick}
        >
            {news.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
                    <p className="text-base font-medium text-gray-500">
                        📰 செய்திகள் இல்லை.
                    </p>

                    <p className="mt-2 text-sm text-gray-400">
                        இந்த பிரிவில் தற்போது எந்த செய்தியும் இல்லை.
                    </p>
                </div>
            ) : (
                <>
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
    );
}