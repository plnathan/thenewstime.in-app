import apiClient from "@/api/axios";
import type {
  AdvertisementClient,
  AdvertisementBusinessType,
} from "./advertisement.api";

// export type AdvertisementClientStatus =
//     | "ACTIVE"
//     | "INACTIVE"
//     | "ARCHIVED"
//     | string;

export interface AdvertisementClientListMeta {
  page?: number;
  pageSize?: number;
  totalRecords?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface AdvertisementClientListResponse {
  success: boolean;
  message: string;
  data: AdvertisementClient[];
  errors: unknown;
  meta: AdvertisementClientListMeta | null;
}

export interface AdvertisementClientResponse {
  success: boolean;
  message: string;
  data: AdvertisementClient;
  errors: unknown;
  meta: unknown;
}

export interface AdvertisementClientQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  businessTypeId?: number;
}

export const getAdvertisementClients = async (
  params?: AdvertisementClientQuery,
): Promise<AdvertisementClientListResponse> => {
  const response = await apiClient.get<AdvertisementClientListResponse>(
    "/advertisements/clients",
    {
      params,
    },
  );

  return response.data;
};

export const getAdvertisementClientById = async (
  id: number,
): Promise<AdvertisementClientResponse> => {
  const response = await apiClient.get<AdvertisementClientResponse>(
    `/advertisements/clients/${id}`,
  );

  return response.data;
};

export interface AdvertisementClientMutation {
  clientCode?: string;
  name?: string;
  displayName?: string;
  businessName?: string;
  businessTypeId?: number;
  website?: string;
  websiteUrl?: string;
  primaryAddress?: string;
  communicationAddress?: string;
  contactPerson?: string;
  contactNo?: string;
  alternateMobile?: string;
  email?: string;
  alternateEmail?: string;
  status?: "ACTIVE" | "INACTIVE" | "BLOCKED";
  notes?: string;
}

export const createAdvertisementClient = async (
  payload: AdvertisementClientMutation & { clientCode: string; name: string },
): Promise<AdvertisementClientResponse> => {
  const response = await apiClient.post<AdvertisementClientResponse>(
    "/advertisements/clients",
    payload,
  );
  return response.data;
};

export const updateAdvertisementClient = async (
  id: number,
  payload: AdvertisementClientMutation,
): Promise<AdvertisementClientResponse> => {
  const response = await apiClient.patch<AdvertisementClientResponse>(
    `/advertisements/clients/${id}`,
    payload,
  );
  return response.data;
};

export interface AdvertisementClientSummary {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
}

export const getAdvertisementClientSummary =
  async (): Promise<AdvertisementClientSummary> => {
    const response = await apiClient.get<{
      success: boolean;
      data: AdvertisementClientSummary;
    }>("/dashboard/clients-summary");
    return response.data.data;
  };

/** Active and inactive business types for Client Configuration. */
export const getAdvertisementBusinessTypes = async (): Promise<
  AdvertisementBusinessType[]
> => {
  const response = await apiClient.get<{
    success: boolean;
    data: AdvertisementBusinessType[];
  }>("/advertisements/clients/business-types");
  return response.data.data;
};
