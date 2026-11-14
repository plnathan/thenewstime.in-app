import { useCallback, useEffect, useState } from "react";
import { getDistrictSections, getDistrictSectionNews } from "@/api/news.api";
import type { DistrictNewsSection } from "@/api/news.api";
import { toNewsViewList } from "@/utils/news";
import NewsCard from "@/components/news/NewsCard";
import LiveAdvertisementSlot from "@/components/advertisements/Advertisement/LiveAdvertisementSlot";
import PublicAdvertisementModal from "@/components/advertisements/Advertisement/PublicAdvertisementModal";
import DynamicNewsListSidebar from "@/components/advertisements/Advertisement/DynamicNewsListSidebar";
import AppContainer from "@/components/container/AppContainer";
import MainContent from "@/components/container/MainContent";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
import MainLayout from "@/layouts/MainLayout";
import { usePageTitle } from "@/hooks/usePageTitle";

interface SectionState extends DistrictNewsSection {
    loadingMore?: boolean;
    error?: string;
}

export default function DistrictNewsPage() {
    usePageTitle();
    const [sections, setSections] = useState<SectionState[]>([]);
    const [nextOffset, setNextOffset] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingSections, setLoadingSections] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let active = true;
        void getDistrictSections().then((result) => {
            if (!active) return;
            setSections(result.sections);
            setNextOffset(result.nextSectionOffset);
            setError(null);
        }).catch(() => {
            if (active) setError("மாவட்டச் செய்திகளை ஏற்ற முடியவில்லை.");
        }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [version]);

    const loadSections = useCallback(async () => {
        if (loadingSections || nextOffset === null) return;
        setLoadingSections(true);
        try {
            const result = await getDistrictSections(nextOffset);
            setSections((current) => {
                const keys = new Set(current.map((section) => section.key));
                return [...current, ...result.sections.filter((section) => !keys.has(section.key))];
            });
            setNextOffset(result.nextSectionOffset);
            setError(null);
        } catch { setError("மேலும் மாவட்டங்களை ஏற்ற முடியவில்லை."); }
        finally { setLoadingSections(false); }
    }, [loadingSections, nextOffset]);

    const loadMore = useCallback(async (section: SectionState) => {
        if (section.loadingMore || (section.nextNewsCursor == null && section.nextNewsOffset === null)) return;
        setSections((current) => current.map((item) => item.key === section.key ?
            { ...item, loadingMore: true, error: undefined } : item));
        try {
            const result = await getDistrictSectionNews(section.key, section.nextNewsOffset ?? 0, section.nextNewsCursor);
            setSections((current) => current.map((item) => {
                if (item.key !== section.key) return item;
                const existing = new Set(item.news.map((news) => news.id));
                return {
                    ...item, loadingMore: false,
                    news: [...item.news, ...result.news.filter((news) => !existing.has(news.id))],
                    hasMoreNews: result.hasMoreNews, nextNewsOffset: result.nextNewsOffset,
                    nextNewsCursor: result.nextNewsCursor
                };
            }));
        } catch {
            setSections((current) => current.map((item) => item.key === section.key ?
                { ...item, loadingMore: false, error: "மேலும் செய்திகளை ஏற்ற முடியவில்லை." } : item));
        }
    }, []);

    if (loading) return <MainLayout><AppContainer><PageLoader message="மாவட்டச் செய்திகள் பெறப்படுகின்றன..." variant="page" /></AppContainer></MainLayout>;
    if (error && sections.length === 0) return <MainLayout><AppContainer>
        <p className="py-8 text-center text-red-600">{error}</p>
        <div className="text-center"><button className="rounded bg-green-700 px-4 py-2 text-white" onClick={() => { setLoading(true); setVersion((n) => n + 1); }}>மீண்டும் முயற்சிக்கவும்</button></div>
    </AppContainer></MainLayout>;

    // Pure render-time prefix counts: one pass over sections, no mutations inside JSX.
    const sectionStartPositions = sections.map((_, index) =>
        sections.slice(0, index).reduce((total, previous) => total + previous.news.length, 0),
    );

    // Slot numbering follows the existing page-level five-slot inventory.
    return <MainLayout><AppContainer>
        <div className="pt-[18px] pb-[18px]">
            <div className="mb-[18px] flex justify-center"><LiveAdvertisementSlot placementCode="NEWS_LIST_TOP" slotNumber={1} /></div>
            <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_300px]">
                <MainContent>
                    <h1 className="mb-5 text-xl font-bold text-gray-900">மாவட்ட செய்திகள்</h1>
                    {sections.map((section, sectionIndex) => <section key={section.key} className="mb-8">
                        <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-bold text-green-800">{section.title}</h2>
                        <div className="space-y-[18px]">
                            {toNewsViewList(section.news).map((item, newsIndex) => {
                                const articlePosition = sectionStartPositions[sectionIndex] + newsIndex + 1;
                                const slot = Math.floor(articlePosition / 5);
                                return <div key={item.id}><NewsCard news={item} />
                                    {articlePosition % 5 === 0 && slot <= 5 && <div className="my-[18px]">
                                        <LiveAdvertisementSlot placementCode="NEWS_LIST_BETWEEN"
                                            slotNumber={slot} configuredCode={`NEWS_LIST_BETWEEN_SLOT_${slot}`} />
                                    </div>}
                                </div>;
                            })}
                        </div>
                        {section.hasMoreNews && <div className="mt-4 text-right">
                            <button type="button" disabled={section.loadingMore}
                                onClick={() => void loadMore(section)}
                                className="rounded-md bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-60">
                                {section.loadingMore ? "பெறப்படுகிறது..." : "மேலும் ›"}
                            </button>
                        </div>}
                        {section.error && <p role="alert" className="mt-2 text-sm text-red-600">{section.error}</p>}
                    </section>)}
                    {nextOffset !== null && <div className="my-6 text-center"><button
                        disabled={loadingSections} onClick={() => void loadSections()}
                        className="rounded-md bg-green-700 px-5 py-2 font-semibold text-white disabled:opacity-60">
                        {loadingSections ? "பெறப்படுகிறது..." : "மேலும் மாவட்டங்கள் ›"}
                    </button></div>}
                    {error && <p role="alert" className="text-center text-sm text-red-600">{error}</p>}
                    <div className="mt-[18px] flex justify-center"><LiveAdvertisementSlot placementCode="NEWS_LIST_BOTTOM" slotNumber={1} /></div>
                </MainContent>
                <aside aria-label="News list sidebar"><DynamicNewsListSidebar importantNews={[]} additionalNews={[]} /></aside>
            </div>
        </div>
        <PublicAdvertisementModal placementCode="NEWS_LIST_MODAL" />
    </AppContainer></MainLayout>;
}
