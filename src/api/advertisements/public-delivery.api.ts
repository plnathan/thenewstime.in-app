import apiClient from "@/api/axios";
import type { ApiResponse } from "@/types/api";
import type { PublicPlacementCode } from "@/constants/publicPlacementSizes";

export interface PublicCreative {
  id: number;
  displayOrder: number;
  creativeType: "IMAGE" | "VIDEO" | "HTML" | "TEXT";
  variant: "DESKTOP" | "MOBILE";
  mediaUrl: string;
  altText: string | null;
  title: string | null;
}
export interface PublicDeliveryItem {
  advertisementId: number;
  scheduleId?: number;
  placementRuleId?: number;
  name: string;
  destinationUrl: string | null;
  isClickable: boolean;
  openInNewTab: boolean;
  isHouseAd: boolean;
  creative: PublicCreative | null;
  creatives: PublicCreative[];
  creativeRotation?: {
    enabled: boolean;
    intervalSeconds: number;
    strategy: "ROUND_ROBIN";
  };
}
export interface PublicDeliveryResponse {
  placement: {
    id: number;
    code: string;
    fallbackBehavior: "HIDE" | "HOUSE_AD";
    collapseWhenEmpty: boolean;
    rotationEnabled?: boolean;
    rotationIntervalSeconds?: number;
    displayFrequency?:
      | "EVERY_VISIT"
      | "ONCE_PER_SESSION"
      | "ONCE_PER_DAY"
      | "ONCE_PER_PERIOD"
      | null;
    frequencyValue?: number | null;
    autoCloseEnabled?: boolean;
    autoCloseSeconds?: number | null;
    closeButtonEnabled?: boolean;
    closeOnOverlayClick?: boolean;
  } | null;
  advertisements: PublicDeliveryItem[];
  fallbackApplied: boolean;
}
const pageTypeFor = (
  code: PublicPlacementCode,
): "HOME" | "NEWS_LIST" | "NEWS_DETAIL" =>
  code.startsWith("HOME_")
    ? "HOME"
    : code.startsWith("NEWS_LIST_")
      ? "NEWS_LIST"
      : "NEWS_DETAIL";

export interface PublicPlacementSlot {
  id: number;
  code: string;
  placementType: PublicPlacementCode;
  displayOrder: number;
  fallbackBehavior: "HIDE" | "HOUSE_AD";
}

interface PublicPageDeliveryResponse {
  pageType: "HOME" | "NEWS_LIST" | "NEWS_DETAIL";
  slots: PublicPlacementSlot[];
  deliveries: Record<string, PublicDeliveryResponse>;
}

/**
 * One shared request per route view. All placement components (including modal
 * and dynamic sidebars) read the same response. No timer or background polling.
 * Route changes invalidate the cache via PublicDeliveryRouteReset.
 */
const pageRequests = new Map<string, Promise<PublicPageDeliveryResponse>>();

export function resetPublicPageDeliveryCache(): void {
  pageRequests.clear();
}

function getPageDelivery(
  pageType: "HOME" | "NEWS_LIST" | "NEWS_DETAIL",
  newsId?: number,
): Promise<PublicPageDeliveryResponse> {
  const key = `${pageType}:${newsId ?? "none"}`;
  const cached = pageRequests.get(key);
  if (cached) return cached;

  const request = apiClient
    .get<ApiResponse<PublicPageDeliveryResponse>>(
      "/advertisements/delivery/page",
      { params: { pageType, ...(newsId === undefined ? {} : { newsId }) } },
    )
    .then((response) => response.data.data)
    .catch((error: unknown) => {
      if (pageRequests.get(key) === request) pageRequests.delete(key);
      throw error;
    });
  pageRequests.set(key, request);
  return request;
}

/**
 * True only when the current page has an eligible, renderable advertisement
 * in a TOP/BANNER placement. Empty enabled slots do not affect the header.
 * Shares the page delivery request with the advertisement components.
 */
export async function hasConfiguredHeaderAdvertisementSlot(
  pageType: "HOME" | "NEWS_LIST" | "NEWS_DETAIL",
  newsId?: number,
): Promise<boolean> {
  const page = await getPageDelivery(pageType, newsId);
  // Defensively require the response to match the requested page.
  if (page.pageType !== pageType) return false;

  const types: readonly string[] =
    pageType === "HOME"
      ? ["HOME_TOP", "HOME_BANNER"]
      : pageType === "NEWS_LIST"
        ? ["NEWS_LIST_TOP", "NEWS_LIST_BANNER"]
        : ["NEWS_DETAIL_TOP", "NEWS_DETAIL_BANNER"];

  return page.slots.some((slot) => {
    if (!types.includes(slot.placementType)) return false;
    const delivery = page.deliveries[String(slot.id)];
    if (!delivery?.placement) return false;
    return delivery.advertisements.some(
      (ad) =>
        (ad.creative?.mediaUrl?.trim() ?? "") !== "" ||
        ad.creatives?.some((creative) => creative.mediaUrl?.trim()) === true,
    );
  });
}

export async function getPublicPlacementDelivery(
  placementCode: PublicPlacementCode,
  placementId?: number,
  newsId?: number,
): Promise<PublicDeliveryResponse> {
  const page = await getPageDelivery(pageTypeFor(placementCode), newsId);
  const slots = page.slots
    .filter((slot) => slot.placementType === placementCode)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
  const selected =
    placementId === undefined
      ? slots[0]
      : slots.find((slot) => slot.id === placementId);
  if (!selected)
    return { placement: null, advertisements: [], fallbackApplied: false };
  return (
    page.deliveries[String(selected.id)] ?? {
      placement: null,
      advertisements: [],
      fallbackApplied: false,
    }
  );
}

export async function getPublicPlacementSlots(
  placementCode: PublicPlacementCode,
  newsId?: number,
): Promise<PublicPlacementSlot[]> {
  const page = await getPageDelivery(pageTypeFor(placementCode), newsId);
  return page.slots.filter((slot) => slot.placementType === placementCode);
}
