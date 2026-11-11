import apiClient from "@/api/axios";
import type { ApiResponse } from "@/types/api";

export interface CreativeRotationConfig {
  advertisementId: number;
  rotationEnabled: boolean;
  rotationIntervalSeconds: number;
  rotationStrategy: "ROUND_ROBIN";
}

export interface UpdateCreativeRotationConfigInput {
  rotationEnabled: boolean;
  rotationIntervalSeconds: number;
  rotationStrategy: "ROUND_ROBIN";
}

export const getCreativeRotationConfig = async (
  advertisementId: number,
): Promise<ApiResponse<CreativeRotationConfig>> => {
  const response = await apiClient.get<ApiResponse<CreativeRotationConfig>>(
    `/advertisements/rotation/advertisements/${advertisementId}/creatives`,
  );
  return response.data;
};

export const updateCreativeRotationConfig = async (
  advertisementId: number,
  payload: UpdateCreativeRotationConfigInput,
): Promise<ApiResponse<CreativeRotationConfig>> => {
  const response = await apiClient.patch<ApiResponse<CreativeRotationConfig>>(
    `/advertisements/rotation/advertisements/${advertisementId}/creatives`,
    payload,
  );
  return response.data;
};
