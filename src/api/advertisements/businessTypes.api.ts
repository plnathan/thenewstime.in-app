import apiClient from "@/api/axios";
export interface BusinessTypeRecord {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  displayOrder: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}
export type BusinessTypePayload = Pick<
  BusinessTypeRecord,
  "code" | "displayName" | "description" | "displayOrder" | "status"
>;
const base = "/advertisements/clients/business-types";
export async function listBusinessTypes(): Promise<BusinessTypeRecord[]> {
  const response = await apiClient.get<{
    success: boolean;
    data: BusinessTypeRecord[];
  }>(base);
  return response.data.data;
}
export async function createBusinessType(
  payload: BusinessTypePayload,
): Promise<void> {
  await apiClient.post(base, payload);
}
export async function updateBusinessType(
  id: number,
  payload: BusinessTypePayload,
): Promise<void> {
  await apiClient.patch(`${base}/${id}`, payload);
}
export async function setBusinessTypeStatus(
  id: number,
  status: "ACTIVE" | "INACTIVE",
): Promise<void> {
  await apiClient.patch(`${base}/${id}/status`, { status });
}
