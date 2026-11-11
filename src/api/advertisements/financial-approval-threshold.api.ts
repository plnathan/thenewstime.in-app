import apiClient from "@/api/axios";
import type { ApiResponse } from "@/types/api";

export type FinancialApprovalType =
  | "DISCOUNT"
  | "ADJUSTMENT"
  | "REFUND"
  | "PARTIAL_REFUND"
  | "CREDIT_EXCEPTION";

export type FinancialApprovalThresholdStatus = "ACTIVE" | "INACTIVE";

export interface FinancialApprovalThreshold {
  id: number;
  approvalType: FinancialApprovalType;
  amountThreshold: number | null;
  percentageThreshold: number | null;
  status: FinancialApprovalThresholdStatus;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialApprovalThresholdInput {
  approvalType: FinancialApprovalType;
  amountThreshold?: number | null;
  percentageThreshold?: number | null;
}

interface ThresholdListResponse {
  success: boolean;
  message: string;
  data: FinancialApprovalThreshold[];
  errors: unknown;
  meta: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  } | null;
}

const BASE_PATH = "/advertisements/financial-approval-thresholds";

export const getFinancialApprovalThresholds = async (): Promise<
  FinancialApprovalThreshold[]
> => {
  const response = await apiClient.get<ThresholdListResponse>(BASE_PATH, {
    params: {
      page: 1,
      pageSize: 100,
    },
  });

  return response.data.data;
};

export const createFinancialApprovalThreshold = async (
  payload: FinancialApprovalThresholdInput,
): Promise<ApiResponse<FinancialApprovalThreshold>> => {
  const response = await apiClient.post<
    ApiResponse<FinancialApprovalThreshold>
  >(BASE_PATH, payload);

  return response.data;
};

export const updateFinancialApprovalThreshold = async (
  id: number,
  payload: Partial<FinancialApprovalThresholdInput>,
): Promise<ApiResponse<FinancialApprovalThreshold>> => {
  const response = await apiClient.patch<
    ApiResponse<FinancialApprovalThreshold>
  >(`${BASE_PATH}/${id}`, payload);

  return response.data;
};

export const activateFinancialApprovalThreshold = async (
  id: number,
): Promise<ApiResponse<FinancialApprovalThreshold>> => {
  const response = await apiClient.post<
    ApiResponse<FinancialApprovalThreshold>
  >(`${BASE_PATH}/${id}/activate`);

  return response.data;
};

export const deactivateFinancialApprovalThreshold = async (
  id: number,
): Promise<ApiResponse<FinancialApprovalThreshold>> => {
  const response = await apiClient.post<
    ApiResponse<FinancialApprovalThreshold>
  >(`${BASE_PATH}/${id}/deactivate`);

  return response.data;
};
