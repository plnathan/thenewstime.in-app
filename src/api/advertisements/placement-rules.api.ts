import apiClient from "@/api/axios";
import type { ApiResponse, PaginationMeta } from "@/types/api";
import type { PlacementInsertionType } from "./placements.api";

export type PlacementRuleStatus = "ACTIVE" | "INACTIVE";

export interface AdvertisementPlacementRule {
  id: number;
  advertisementId: number;
  placementId: number;
  displayOrder: number;
  insertionType: PlacementInsertionType | null;
  insertionPosition: number | null;
  maxImpressions: number | null;
  status: PlacementRuleStatus;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PlacementRuleQuery {
  advertisementId?: number;
  placementId?: number;
  status?: PlacementRuleStatus;
}

export interface CreatePlacementRuleInput {
  advertisementId: number;
  placementId: number;
  displayOrder?: number;
  insertionType?: PlacementInsertionType;
  insertionPosition?: number | null;
  maxImpressions?: number | null;
  status?: PlacementRuleStatus;
}

export interface UpdatePlacementRuleInput {
  displayOrder?: number;
  insertionType?: PlacementInsertionType | null;
  insertionPosition?: number | null;
  maxImpressions?: number | null;
  status?: PlacementRuleStatus;
}

interface PlacementRuleListResponse {
  success: boolean;
  message: string;
  data: AdvertisementPlacementRule[];
  errors: unknown;
  meta: PaginationMeta | null;
}

export const getAdvertisementPlacementRules = async (
  query: PlacementRuleQuery = {},
): Promise<AdvertisementPlacementRule[]> => {
  const response = await apiClient.get<PlacementRuleListResponse>(
    "/advertisements/placement-rules",
    { params: query },
  );
  return response.data.data ?? [];
};

export const createAdvertisementPlacementRule = async (
  payload: CreatePlacementRuleInput,
): Promise<ApiResponse<AdvertisementPlacementRule>> => {
  const response = await apiClient.post<
    ApiResponse<AdvertisementPlacementRule>
  >("/advertisements/placement-rules", payload);
  return response.data;
};

export const updateAdvertisementPlacementRule = async (
  id: number,
  payload: UpdatePlacementRuleInput,
): Promise<ApiResponse<AdvertisementPlacementRule>> => {
  const response = await apiClient.patch<
    ApiResponse<AdvertisementPlacementRule>
  >(`/advertisements/placement-rules/${id}`, payload);
  return response.data;
};

export const deactivateAdvertisementPlacementRule = async (
  id: number,
): Promise<ApiResponse<AdvertisementPlacementRule>> => {
  const response = await apiClient.delete<
    ApiResponse<AdvertisementPlacementRule>
  >(`/advertisements/placement-rules/${id}`);
  return response.data;
};
