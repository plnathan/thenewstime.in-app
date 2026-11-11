import PublicAdvertisementModal from "@/components/advertisements/Advertisement/PublicAdvertisementModal";
import LiveAdvertisementSlot from "@/components/advertisements/Advertisement/LiveAdvertisementSlot";
import DynamicHomeSidebar from "@/components/advertisements/Advertisement/DynamicHomeSidebar";
import { useEffect, useMemo, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

import AppContainer from "@/components/container/AppContainer";
import MainContent from "@/components/container/MainContent";
import Hero from "@/components/home/Hero/Hero";
import HomeGrid from "@/components/home/HomeGrid";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import Sidebar from "@/components/home/Sidebar";
import PageLoader from "@/components/ui/PageLoader/PageLoader";
import MainLayout from "@/layouts/MainLayout";
import { useNews } from "@/hooks/useNews";
import type { NewsView } from "@/types";
import { getPublishedNewsList } from "@/api/news.api";
import { toNewsViewList } from "@/utils/news";

const HOME_PAGE_SIZE = 10;
const HOME_CATEGORY_PAGE_SIZE = 10;
const POPULAR_CANDIDATE_PAGE_SIZE = 100;
const POPULAR_NEWS_LIMIT = 5;
const OTHER_NEWS_LIMIT = 5;
const POPULAR_NEWS_MINIMUM = 2;
const POPULAR_WINDOW_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
// A stable clock value avoids calling Date.now() during React rendering.
const POPULAR_REFERENCE_TIME = Date.now();

function publicationTime(item: NewsView): number {
  if (!item.publishedAt) return 0;
  const timestamp = new Date(item.publishedAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function viewCount(item: NewsView): number {
  const value = (item as NewsView & { views?: number | string | null }).views;
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export default function HomePage() {
  const navigate = useNavigate();
  usePageTitle();

  const { news, loading, error, refresh } = useNews({
    publishedOnly: true,
    homepageOnly: true,
    page: 1,
    pageSize: HOME_PAGE_SIZE,
    sortBy: "published_at",
    sortOrder: "DESC",
  });

  const tamilNaduStateIdFromLatest = news.find(
    (item) => item.stateUrlName === "tamil-nadu" && item.stateId != null,
  )?.stateId;

  const tamilNaduQuery = useNews({
    enabled: !loading,
    publishedOnly: true,
    homepageOnly: true,
    page: 1,
    pageSize: HOME_CATEGORY_PAGE_SIZE,
    scope: "STATE",
    stateId: tamilNaduStateIdFromLatest ?? undefined,
    sortBy: "published_at",
    sortOrder: "DESC",
  });

  const indiaQuery = useNews({
    publishedOnly: true,
    homepageOnly: true,
    page: 1,
    pageSize: HOME_CATEGORY_PAGE_SIZE,
    scope: "INDIA",
    sortBy: "published_at",
    sortOrder: "DESC",
  });

  const worldQuery = useNews({
    publishedOnly: true,
    homepageOnly: true,
    page: 1,
    pageSize: HOME_CATEGORY_PAGE_SIZE,
    scope: "WORLD",
    sortBy: "published_at",
    sortOrder: "DESC",
  });

  const districtQuery = useNews({
    publishedOnly: true,
    homepageOnly: true,
    page: 1,
    pageSize: HOME_CATEGORY_PAGE_SIZE,
    scope: "DISTRICT",
    sortBy: "published_at",
    sortOrder: "DESC",
  });

  // This is the same public popularity feed used by the previous sidebar.
  // Selection now happens here, BEFORE category lists claim articles.
  const popularQuery = useNews({
    publishedOnly: true,
    popular: true,
    page: 1,
    pageSize: POPULAR_CANDIDATE_PAGE_SIZE,
  });

  // Load non-hot news once in the parent. Both sidebar sections must share
  // the same reserved IDs, rather than independently selecting candidates.
  const [nonHotCandidates, setNonHotCandidates] = useState<NewsView[]>([]);
  const [nonHotLoading, setNonHotLoading] = useState(true);
  const [nonHotError, setNonHotError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const candidates: NewsView[] = [];
        const seen = new Set<NewsView["id"]>();
        let page = 1;
        let hasMore = true;
        while (hasMore && candidates.length < 30 && page <= 30) {
          const response = await getPublishedNewsList({
            page,
            pageSize: 20,
            sortBy: "published_at",
            sortOrder: "DESC",
          });
          const records = response.data.filter((item) => item.showOnHomepage === false);
          for (const item of toNewsViewList(records)) {
            if (seen.has(item.id)) continue;
            seen.add(item.id);
            candidates.push(item);
          }
          hasMore = response.meta?.hasNext ?? response.data.length === 20;
          page += 1;
        }
        if (active) setNonHotCandidates(candidates);
      } catch (err) {
        console.error("Unable to load non-hot homepage sidebar news", err);
        if (active) setNonHotError("செய்திகளை பெற முடியவில்லை.");
      } finally {
        if (active) setNonHotLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const otherNews = useMemo(() => {
    const seenIds = new Set<NewsView["id"]>();
    const seenSlugs = new Set<string>();
    const result: NewsView[] = [];
    for (const item of [...nonHotCandidates].sort(
      (a, b) => publicationTime(b) - publicationTime(a),
    )) {
      if (seenIds.has(item.id) || seenSlugs.has(item.slug)) continue;
      result.push(item);
      seenIds.add(item.id);
      seenSlugs.add(item.slug);
      if (result.length === OTHER_NEWS_LIMIT) break;
    }
    return result;
  }, [nonHotCandidates]);

  const hotNews = news.filter((item) => item.showOnHomepage === true);
  const featuredNews = hotNews.slice(0, 5);
  const latestNews = hotNews.slice(5, 10);

  const alreadyDisplayedIds = useMemo(
    () => new Set([...featuredNews, ...latestNews].map((item) => item.id)),
    [news],
  );

  const otherIds = useMemo(() => new Set(otherNews.map((item) => item.id)), [otherNews]);
  const otherSlugs = useMemo(() => new Set(otherNews.map((item) => item.slug)), [otherNews]);

  const popularNews = useMemo(() => {
    const cutoff = POPULAR_REFERENCE_TIME - POPULAR_WINDOW_DAYS * MILLISECONDS_PER_DAY;
    const seenIds = new Set<NewsView["id"]>();
    const seenSlugs = new Set<string>();
    const candidates = [...popularQuery.news]
      .filter((item) =>
        !alreadyDisplayedIds.has(item.id) &&
        !otherIds.has(item.id) &&
        !otherSlugs.has(item.slug),
      )
      .sort(
        (a, b) =>
          viewCount(b) - viewCount(a) ||
          publicationTime(b) - publicationTime(a),
      );

    const result: NewsView[] = [];
    const add = (item: NewsView) => {
      if (seenIds.has(item.id) || seenSlugs.has(item.slug)) return;
      seenIds.add(item.id);
      seenSlugs.add(item.slug);
      result.push(item);
    };

    // Prefer articles published within the last 30 days.
    for (const item of candidates) {
      const published = publicationTime(item);
      if (published > 0 && published >= cutoff && published <= POPULAR_REFERENCE_TIME) {
        add(item);
      }
      if (result.length >= POPULAR_NEWS_LIMIT) break;
    }

    // If fewer than two recent articles qualify, allow older published
    // articles as a fallback. Never duplicate the hero or latest section.
    if (result.length < POPULAR_NEWS_MINIMUM) {
      for (const item of candidates) {
        add(item);
        if (result.length >= POPULAR_NEWS_MINIMUM) break;
      }
    }

    return result;
  }, [alreadyDisplayedIds, otherIds, otherSlugs, popularQuery.news]);

  const popularIds = useMemo(
    () => new Set(popularNews.map((item) => item.id)),
    [popularNews],
  );

  // Hero / Recent News take priority, then Popular News, then the category
  // sections. A popular article is suppressed from all homepage category lists.
  const { tamilNaduNews, indiaNews, worldNews, districtNews } = useMemo(() => {
    const displayed = new Set([...alreadyDisplayedIds, ...popularIds]);
    const takeUnique = (
      items: NewsView[],
      predicate: (item: NewsView) => boolean,
    ) =>
      items.filter((item) => {
        if (!item.showOnHomepage || !predicate(item) || displayed.has(item.id)) {
          return false;
        }
        displayed.add(item.id);
        return true;
      });

    return {
      tamilNaduNews: takeUnique(
        tamilNaduQuery.news,
        (item) => item.stateUrlName === "tamil-nadu",
      ),
      indiaNews: takeUnique(indiaQuery.news, () => true),
      worldNews: takeUnique(worldQuery.news, () => true),
      districtNews: takeUnique(districtQuery.news, () => true),
    };
  }, [
    alreadyDisplayedIds,
    popularIds,
    tamilNaduQuery.news,
    indiaQuery.news,
    worldQuery.news,
    districtQuery.news,
  ]);

  const tamilNaduStateId = tamilNaduStateIdFromLatest;

  if (loading) {
    return (
      <MainLayout>
        <AppContainer>
          <PageLoader message="செய்திகள் பெறப்படுகின்றன..." />
        </AppContainer>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <AppContainer>
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              className="mt-4 rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
              onClick={() => void refresh()}
            >
              மீண்டும் முயற்சிக்கவும்
            </button>
          </div>
        </AppContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <AppContainer>
        <div className="mt-[18px]">
          <HomeGrid
            sidebar={
              <Sidebar>
                <DynamicHomeSidebar
                  popularNews={popularNews}
                  popularLoading={popularQuery.loading || nonHotLoading}
                  otherNews={otherNews}
                  otherLoading={nonHotLoading}
                  otherError={nonHotError}
                />
              </Sidebar>
            }
          >
            <MainContent>
              <Hero featured={featuredNews} />

              <HomeNewsSection
                title="சமீபத்திய செய்திகள்"
                advertisementAfterTitle={<div className="my-[18px]"><LiveAdvertisementSlot placementCode="HOME_BETWEEN_SECTIONS" slotNumber={1} /></div>}
                news={latestNews}
                actionLabel="மேலும் சமீபத்திய செய்திகள்"
                onActionClick={() => navigate("/news")}
                layout="list"
              />

              <HomeNewsSection
                title="தமிழ்நாடு"
                advertisementAfterTitle={<div className="my-[18px]"><LiveAdvertisementSlot placementCode="HOME_BETWEEN_SECTIONS" slotNumber={2} /></div>}
                news={tamilNaduNews}
                actionLabel="தமிழ்நாடு செய்திகள்"
                onActionClick={() => {
                  if (tamilNaduStateId != null) {
                    navigate(`/news?scope=STATE&stateId=${tamilNaduStateId}`);
                  } else {
                    navigate("/news?scope=STATE&state=tamil-nadu");
                  }
                }}
                layout="featured"
              />

              <HomeNewsSection
                title="இந்தியா"
                advertisementAfterTitle={<div className="my-[18px]"><LiveAdvertisementSlot placementCode="HOME_BETWEEN_SECTIONS" slotNumber={3} /></div>}
                news={indiaNews}
                actionLabel="இந்திய செய்திகள்"
                onActionClick={() => navigate("/news?scope=INDIA")}
                layout="list"
              />

              <HomeNewsSection
                title="உலகம்"
                advertisementAfterTitle={<div className="my-[18px]"><LiveAdvertisementSlot placementCode="HOME_BETWEEN_SECTIONS" slotNumber={4} /></div>}
                news={worldNews}
                actionLabel="உலக செய்திகள்"
                onActionClick={() => navigate("/news?scope=WORLD")}
                layout="list"
              />

              <HomeNewsSection
                title="மாவட்ட செய்திகள்"
                advertisementAfterTitle={<div className="my-[18px]"><LiveAdvertisementSlot placementCode="HOME_BETWEEN_SECTIONS" slotNumber={5} /></div>}
                news={districtNews}
                actionLabel="மாவட்ட செய்திகள்"
                onActionClick={() => navigate("/news?scope=DISTRICT")}
                layout="compact"
              />

              <div className="my-[18px] flex w-full min-w-0 justify-center">
                <LiveAdvertisementSlot placementCode="HOME_BOTTOM" slotNumber={1} />
              </div>
            </MainContent>
          </HomeGrid>
        </div>
      </AppContainer>
      <PublicAdvertisementModal placementCode="HOME_MODAL" />
    </MainLayout>
  );
}
