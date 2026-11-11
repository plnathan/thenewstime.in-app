import apiClient from "@/api/axios";
import type { ApiResponse } from "@/types/api";
export type FormatStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export interface AdvertisementFormat {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  widthPx: number | null;
  heightPx: number | null;
  mobileWidthPx: number | null;
  mobileHeightPx: number | null;
  isResponsive: boolean;
  isSystemFormat: boolean;
  status: FormatStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  updatedBy: number | null;
}
export interface FormatInput {
  code: string;
  displayName: string;
  description: string | null;
  widthPx: number | null;
  heightPx: number | null;
  mobileWidthPx: number | null;
  mobileHeightPx: number | null;
  isResponsive: boolean;
  displayOrder: number;
}
const base = "/advertisements/formats";
export async function listFormats() {
  return (await apiClient.get<ApiResponse<AdvertisementFormat[]>>(base)).data
    .data;
}
export async function createFormat(input: FormatInput) {
  return (await apiClient.post<ApiResponse<AdvertisementFormat>>(base, input))
    .data.data;
}
export async function updateFormat(id: number, input: FormatInput) {
  return (
    await apiClient.patch<ApiResponse<AdvertisementFormat>>(
      `${base}/${id}`,
      input,
    )
  ).data.data;
}
export async function setFormatStatus(id: number, status: FormatStatus) {
  return (
    await apiClient.post<ApiResponse<AdvertisementFormat>>(
      `${base}/${id}/${status === "ACTIVE" ? "activate" : "deactivate"}`,
    )
  ).data.data;
}

export async function archiveFormat(id: number) {
  return (
    await apiClient.post<ApiResponse<AdvertisementFormat>>(
      `${base}/${id}/archive`,
    )
  ).data.data;
}
