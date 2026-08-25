import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";
import type { News, NewsView } from "@/types";

/**
 * Temporary image used until media/image API integration
 * is completed.
 */
const NEWS_PLACEHOLDER_IMAGE = "/assets/images/news-placeholder.jpg";

function getPrimaryMedia(media: NewsMedia[] | undefined) {
  if (!media?.length) {
    return null;
  }

  return [...media].sort((a, b) => a.displayOrder - b.displayOrder)[0] ?? null;
}

/**
 * Convert API News into the UI NewsView model.
 */
export function toNewsView(news: News): NewsView {
  const primaryMedia = getPrimaryMedia(news.media);

  return {
    id: news.id,

    newsNumber: news.newsNumber,

    slug: news.slug,

    title: news.title,

    summary: news.summary,

    content: news.content,

    newsScope: news.newsScope,

    countryId: news.countryId,

    stateId: news.stateId,

    districtId: news.districtId,

    categoryId: news.categoryId,

    /**
     * IMPORTANT
     *
     * The backend now returns the complete category object.
     *
     * We use displayName for the UI.
     */
    categoryName: news.category.displayName,

    categoryUrlName: news.category.urlName,

    country: news.country,

    state: news.state,

    district: news.district,

    countryUrlName: news.country?.urlName ?? null,

    stateUrlName: news.state?.urlName ?? null,

    districtUrlName: news.district?.urlName ?? null,

    status: news.status,

    displayPriority: news.displayPriority,

    displayPriorityUntil: news.displayPriorityUntil,

    draftedBy: news.draftedBy,

    approvedBy: news.approvedBy,

    publishedBy: news.publishedBy,

    archivedBy: news.archivedBy,

    draftedAt: news.draftedAt,

    approvedAt: news.approvedAt,

    publishedAt: news.publishedAt,

    createdBy: news.createdBy,

    updatedBy: news.updatedBy,

    createdAt: news.createdAt,

    updatedAt: news.updatedAt,

    /**
     * UI-only values.
     *
     * These will later come from the media/analytics
     * APIs instead of being hardcoded here.
     */
    thumbnailUrl: primaryMedia?.fileUrl ?? NEWS_PLACEHOLDER_IMAGE,

    media: news.media ?? [],

    views: news.views,

    comments: 0,

    audioAvailable: false,

    featured: false,

    breaking: false,
  };
}

/**
 * Convert API News list into UI NewsView list.
 */
export function toNewsViewList(news: News[]): NewsView[] {
  return news.map(toNewsView);
}
