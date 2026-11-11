import apiClient from "@/api/axios";
import type { ApiResponse } from "@/types/api";

export type PlacementPageType = "HOME" | "NEWS_LIST" | "NEWS_DETAIL";

export type AdvertisementPlacementType =
  | "HOME_BANNER"
  | "HOME_TOP"
  | "HOME_BETWEEN_SECTIONS"
  | "HOME_SIDEBAR"
  | "HOME_BOTTOM"
  | "HOME_MODAL"
  | "NEWS_LIST_TOP"
  | "NEWS_LIST_BANNER"
  | "NEWS_LIST_BETWEEN"
  | "NEWS_LIST_BOTTOM"
  | "NEWS_LIST_SIDEBAR"
  | "NEWS_LIST_MODAL"
  | "NEWS_DETAIL_TOP"
  | "NEWS_DETAIL_BANNER"
  | "NEWS_DETAIL_BETWEEN"
  | "NEWS_DETAIL_SIDEBAR"
  | "NEWS_DETAIL_BOTTOM"
  | "NEWS_DETAIL_MODAL";

export type PlacementInsertionType =
  | "FIXED"
  | "AFTER_N_ITEMS"
  | "BETWEEN_SECTIONS";
export type PlacementFallbackBehavior = "HIDE" | "HOUSE_AD";
export type PlacementDisplayFrequency =
  | "EVERY_VISIT"
  | "ONCE_PER_SESSION"
  | "ONCE_PER_DAY"
  | "ONCE_PER_PERIOD";
export type PlacementStatus = "ACTIVE" | "INACTIVE";

export interface AdvertisementPlacementFormat {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  widthPx: number | null;
  heightPx: number | null;
  mobileWidthPx?: number | null;
  mobileHeightPx?: number | null;
  isResponsive: boolean;
}

export interface AdvertisementPlacement {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  pageType: PlacementPageType;
  placementType: AdvertisementPlacementType;
  insertionType: PlacementInsertionType;
  displayOrder: number;
  isEnabled: boolean;
  collapseWhenEmpty: boolean;
  fallbackBehavior: PlacementFallbackBehavior;
  fallbackAdvertisementId?: number | null;
  displayFrequency: PlacementDisplayFrequency | null;
  frequencyValue: number | null;
  autoCloseEnabled: boolean;
  autoCloseSeconds: number | null;
  closeButtonEnabled: boolean;
  closeOnOverlayClick: boolean;
  status: PlacementStatus;
  formatId: number | null;
  format: AdvertisementPlacementFormat | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateAdvertisementPlacementInput {
  code: string;
  displayName: string;
  description?: string;
  pageType: PlacementPageType;
  placementType: AdvertisementPlacementType;
  insertionType?: PlacementInsertionType;
  displayOrder?: number;
  isEnabled?: boolean;
  formatId?: number | null;
  collapseWhenEmpty?: boolean;
  fallbackBehavior?: PlacementFallbackBehavior;
  fallbackAdvertisementId?: number | null;
  displayFrequency?: PlacementDisplayFrequency | null;
  frequencyValue?: number | null;
  autoCloseEnabled?: boolean;
  autoCloseSeconds?: number | null;
  closeButtonEnabled?: boolean;
  closeOnOverlayClick?: boolean;
  status?: PlacementStatus;
}

export type UpdateAdvertisementPlacementInput = Partial<
  Omit<CreateAdvertisementPlacementInput, "code">
>;

export const getAdvertisementPlacements = async (): Promise<
  ApiResponse<AdvertisementPlacement[]>
> => {
  const response = await apiClient.get<ApiResponse<AdvertisementPlacement[]>>(
    "/advertisements/placements",
  );
  return response.data;
};

export const getAdvertisementPlacementById = async (
  id: number,
): Promise<ApiResponse<AdvertisementPlacement>> => {
  const response = await apiClient.get<ApiResponse<AdvertisementPlacement>>(
    `/advertisements/placements/${id}`,
  );
  return response.data;
};

export const createAdvertisementPlacement = async (
  payload: CreateAdvertisementPlacementInput,
): Promise<ApiResponse<AdvertisementPlacement>> => {
  const response = await apiClient.post<ApiResponse<AdvertisementPlacement>>(
    "/advertisements/placements",
    payload,
  );
  return response.data;
};

export const updateAdvertisementPlacement = async (
  id: number,
  payload: UpdateAdvertisementPlacementInput,
): Promise<ApiResponse<AdvertisementPlacement>> => {
  const response = await apiClient.patch<ApiResponse<AdvertisementPlacement>>(
    `/advertisements/placements/${id}`,
    payload,
  );
  return response.data;
};

export const enableAdvertisementPlacement = async (
  id: number,
): Promise<ApiResponse<AdvertisementPlacement>> => {
  const response = await apiClient.post<ApiResponse<AdvertisementPlacement>>(
    `/advertisements/placements/${id}/enable`,
  );
  return response.data;
};

export const disableAdvertisementPlacement = async (
  id: number,
): Promise<ApiResponse<AdvertisementPlacement>> => {
  const response = await apiClient.post<ApiResponse<AdvertisementPlacement>>(
    `/advertisements/placements/${id}/disable`,
  );
  return response.data;
};

export const deactivateAdvertisementPlacement = async (
  id: number,
): Promise<ApiResponse<AdvertisementPlacement>> => {
  const response = await apiClient.delete<ApiResponse<AdvertisementPlacement>>(
    `/advertisements/placements/${id}`,
  );
  return response.data;
};
