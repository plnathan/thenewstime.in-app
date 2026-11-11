import NewsCard from "@/components/news/NewsCard";
import FeaturedNewsCard from "@/components/news/FeaturedNewsCard";
import SidebarNewsCard from "@/components/news/SidebarNewsCard";
import type { ReactNode } from "react";
import Section from "@/components/home/Section";
import type { NewsView } from "@/types";

type LayoutType = "list" | "featured" | "grid" | "compact";

interface Props {
    title: string;
    advertisementAfterTitle?: ReactNode;
    news: NewsView[];
    actionLabel?: string;
    onActionClick?: () => void;
    layout?: LayoutType;
}

const MAX_HOME_SECTION_ARTICLES = 10;

export default function HomeNewsSection({
    title,
    advertisementAfterTitle,
    news,
    actionLabel,
    onActionClick,
    layout = "list",
}: Props) {
    const visibleNews = news.slice(0, MAX_HOME_SECTION_ARTICLES);

    return (
        <div className="space-y-[3px]">
            <div className="mt-1">
                <Section title={title} className="mb-2">
                    {advertisementAfterTitle}
                    {visibleNews.length === 0 ? (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-7 text-center">
                            <p className="text-sm text-gray-500">
                                இந்தப் பிரிவில் தற்போது செய்திகள் இல்லை.
                            </p>
                        </div>
                    ) : (
                        <>
                            {layout === "list" && (
                                <div className="space-y-5">
                                    {visibleNews.map((item) => (
                                        <NewsCard key={item.id} news={item} />
                                    ))}
                                </div>
                            )}
                            {layout === "featured" && (
                                <div className="space-y-5">
                                    <FeaturedNewsCard news={visibleNews[0]} />
                                    <div className="space-y-4">
                                        {visibleNews.slice(1).map((item) => (
                                            <SidebarNewsCard key={item.id} news={item} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {layout === "grid" && (
                                <div className="grid gap-5 md:grid-cols-2">
                                    {visibleNews.map((item) => (
                                        <NewsCard key={item.id} news={item} />
                                    ))}
                                </div>
                            )}
                            {layout === "compact" && (
                                <div className="space-y-3">
                                    {visibleNews.map((item) => (
                                        <SidebarNewsCard key={item.id} news={item} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    {actionLabel && onActionClick && (
                        <div className="mt-5 flex justify-end border-t border-gray-100 pt-3">
                            <button
                                type="button"
                                onClick={onActionClick}
                                className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                            >
                                {actionLabel} <span aria-hidden="true">&gt;</span>
                            </button>
                        </div>
                    )}
                </Section>
            </div>
        </div>
    );
}
