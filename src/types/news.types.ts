import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";

/**
 * News status values returned by the API.
 */
export type NewsStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED"
  | "REJECTED";

/**
 * News geographical scope.
 */
export type NewsScope = "WORLD" | "INDIA" | "STATE" | "DISTRICT";

/**
 * Category information returned by the API.
 */
export interface NewsCategory {
  id: number;
  code: string;
  displayName: string;
  urlName: string;
}

/**
 * Country information returned by the API.
 */
export interface NewsCountry {
  id: number;
  code: string;
  displayName: string;
  urlName: string;
  isoCode: string | null;
}

/**
 * State information returned by the API.
 */
export interface NewsState {
  id: number;
  countryId: number;
  code: string;
  displayName: string;
  urlName: string;
}

/**
 * District information returned by the API.
 */
export interface NewsDistrict {
  id: number;
  stateId: number;
  code: string;
  displayName: string;
  urlName: string;
}

/**
 * API News model.
 *
 * This mirrors the backend News response.
 */
export interface News {
  id: number;
  newsNumber: number;

  title: string;
  slug: string;
  summary: string | null;
  content: string;

  newsScope: NewsScope;

  media?: NewsMedia[];

  countryId: number | null;
  stateId: number | null;
  districtId: number | null;
  categoryId: number;

  category: NewsCategory;

  country: NewsCountry | null;
  state: NewsState | null;
  district: NewsDistrict | null;

  status: NewsStatus;

  /**
   * Admin display ordering / promotion.
   *
   * displayPriority > 0 means the article has a
   * temporary promoted position.
   */
  displayPriority: number;

  /**
   * Promotion expiration timestamp.
   *
   * null means the article is not currently promoted.
   */
  displayPriorityUntil: string | null;

  draftedBy: number;
  approvedBy: number | null;
  publishedBy: number | null;
  archivedBy: number | null;

  draftedAt: string | null;
  approvedAt: string | null;
  publishedAt: string | null;

  createdBy: number;
  updatedBy: number | null;

  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * UI-facing news model.
 *
 * IMPORTANT:
 * This is intentionally different from the complete
 * backend News model.
 *
 * Components should consume NewsView instead of
 * depending directly on the complete API structure.
 */
export interface NewsView {
  id: number;

  newsNumber?: number;

  slug: string;

  title: string;

  summary: string | null;

  content?: string;

  newsScope?: NewsScope;

  media?: NewsMedia[];

  countryId?: number | null;
  stateId?: number | null;
  districtId?: number | null;
  categoryId?: number;

  /**
   * Human-readable category name.
   *
   * Example:
   * தமிழ்நாடு
   * இந்தியா
   * உலகம்
   */
  categoryName: string;

  /**
   * URL-friendly category name.
   *
   * Example:
   * politics
   * education
   * health
   */
  categoryUrlName?: string;

  /**
   * Geographical information.
   */
  country?: NewsCountry | null;
  state?: NewsState | null;
  district?: NewsDistrict | null;

  /**
   * URL-friendly geographical names.
   */
  countryUrlName?: string | null;
  stateUrlName?: string | null;
  districtUrlName?: string | null;

  status?: NewsStatus;

  displayPriority?: number;

  displayPriorityUntil?: string | null;

  draftedBy?: number;
  approvedBy?: number | null;
  publishedBy?: number | null;
  archivedBy?: number | null;

  draftedAt?: string | null;
  approvedAt?: string | null;

  /**
   * Published date can legitimately be null
   * for draft/unpublished news.
   */
  publishedAt: string | null;

  createdBy?: number;
  updatedBy?: number | null;

  createdAt?: string | null;
  updatedAt?: string | null;

  /**
   * UI-specific fields.
   *
   * These are not currently stored directly
   * in the news table.
   */
  thumbnailUrl: string;

  views?: number;

  comments?: number;

  audioAvailable?: boolean;

  featured?: boolean;

  breaking?: boolean;
}

/**
 * Create News payload.
 */
export interface CreateNewsInput {
  title: string;

  slug: string;

  summary?: string;

  content: string;

  newsScope: NewsScope;

  countryId?: number;

  stateId?: number;

  districtId?: number;

  categoryId: number;

  draftedBy: number;

  createdBy: number;
}

/**
 * Update News payload.
 */
export interface UpdateNewsInput {
  title?: string;

  slug?: string;

  summary?: string;

  content?: string;

  newsScope?: NewsScope;

  countryId?: number | null;

  stateId?: number | null;

  districtId?: number | null;

  categoryId?: number;

  updatedBy: number;
}
