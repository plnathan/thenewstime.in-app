import apiClient from "@/api/axios";
import type { ApiResponse, PaginationMeta } from "@/types/api";

export type AdvertisementScheduleStatus =
  | "SCHEDULED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";
export interface AdvertisementSchedule {
  id: number;
  advertisementId: number;
  placementId: number;
  placementRuleId: number | null;
  startAt: string | Date;
  endAt: string | Date;
  status: AdvertisementScheduleStatus;
  priority: number;
  rescheduledFromId: number | null;
  notes: string | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
export interface AdvertisementScheduleQuery {
  advertisementId?: number;
  placementId?: number;
  placementRuleId?: number;
  status?: AdvertisementScheduleStatus;
}
export interface CreateAdvertisementScheduleInput {
  advertisementId: number;
  placementId: number;
  placementRuleId?: number | null;
  startAt: string;
  endAt: string;
  status?: "SCHEDULED";
  priority?: number;
  rescheduledFromId?: number | null;
  notes?: string | null;
}
export interface UpdateAdvertisementScheduleInput {
  placementRuleId?: number | null;
  startAt?: string;
  endAt?: string;
  priority?: number;
  rescheduledFromId?: number | null;
  notes?: string | null;
}
interface ScheduleListResponse {
  success: boolean;
  message: string;
  data: AdvertisementSchedule[];
  errors: unknown;
  meta: PaginationMeta | null;
}

export const getAdvertisementSchedules = async (
  query: AdvertisementScheduleQuery = {},
): Promise<AdvertisementSchedule[]> => {
  const response = await apiClient.get<ScheduleListResponse>(
    "/advertisements/schedules",
    { params: query },
  );
  return response.data.data ?? [];
};
export const createAdvertisementSchedule = async (
  payload: CreateAdvertisementScheduleInput,
): Promise<ApiResponse<AdvertisementSchedule>> => {
  const response = await apiClient.post<ApiResponse<AdvertisementSchedule>>(
    "/advertisements/schedules",
    payload,
  );
  return response.data;
};
export const updateAdvertisementSchedule = async (
  id: number,
  payload: UpdateAdvertisementScheduleInput,
): Promise<ApiResponse<AdvertisementSchedule>> => {
  const response = await apiClient.patch<ApiResponse<AdvertisementSchedule>>(
    `/advertisements/schedules/${id}`,
    payload,
  );
  return response.data;
};
export const pauseAdvertisementSchedule = async (
  id: number,
): Promise<ApiResponse<AdvertisementSchedule>> => {
  const response = await apiClient.post<ApiResponse<AdvertisementSchedule>>(
    `/advertisements/schedules/${id}/pause`,
  );
  return response.data;
};
export const resumeAdvertisementSchedule = async (
  id: number,
): Promise<ApiResponse<AdvertisementSchedule>> => {
  const response = await apiClient.post<ApiResponse<AdvertisementSchedule>>(
    `/advertisements/schedules/${id}/resume`,
  );
  return response.data;
};
export const cancelAdvertisementSchedule = async (
  id: number,
): Promise<ApiResponse<AdvertisementSchedule>> => {
  const response = await apiClient.post<ApiResponse<AdvertisementSchedule>>(
    `/advertisements/schedules/${id}/cancel`,
  );
  return response.data;
};
