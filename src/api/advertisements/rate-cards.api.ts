import apiClient from "@/api/axios";

export type AdvertisementRateCardPricingUnit =
  | "DAY"
  | "WEEK"
  | "MONTH"
  | "IMPRESSION"
  | "CAMPAIGN"
  | "FIXED";

export type AdvertisementRateCardStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

/**
 * PostgreSQL timestamptz values are serialized as strings by the API.
 * Accept Date as well to remain compatible with locally constructed values.
 */
export interface AdvertisementRateCard {
  id: number;
  placementId: number;
  pricingUnit: AdvertisementRateCardPricingUnit;
  rateAmount: number;
  currencyCode: string;
  effectiveFrom: string | Date;
  effectiveTo: string | Date | null;
  status: AdvertisementRateCardStatus;
  createdBy: number;
  updatedBy: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateAdvertisementRateCardInput {
  placementId: number;
  pricingUnit: AdvertisementRateCardPricingUnit;
  rateAmount: number;
  currencyCode?: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status?: AdvertisementRateCardStatus;
}

export interface UpdateAdvertisementRateCardInput {
  placementId?: number;
  pricingUnit?: AdvertisementRateCardPricingUnit;
  rateAmount?: number;
  currencyCode?: string;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  status?: AdvertisementRateCardStatus;
}

export interface AdvertisementRateCardSearchFilters {
  placementId?: number;
  pricingUnit?: AdvertisementRateCardPricingUnit;
  status?: AdvertisementRateCardStatus;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
  meta?: unknown;
}

const BASE_PATH = "/advertisements/rate-cards";

const getData = <T>(response: { data: ApiResponse<T> }): T =>
  response.data.data;

export const getAdvertisementRateCards = async (
  filters: AdvertisementRateCardSearchFilters = {},
): Promise<AdvertisementRateCard[]> => {
  const response = await apiClient.get<ApiResponse<AdvertisementRateCard[]>>(
    BASE_PATH,
    { params: filters },
  );

  return getData(response);
};

export const getAdvertisementRateCardById = async (
  id: number,
): Promise<AdvertisementRateCard> => {
  const response = await apiClient.get<ApiResponse<AdvertisementRateCard>>(
    `${BASE_PATH}/${id}`,
  );

  return getData(response);
};

export const createAdvertisementRateCard = async (
  input: CreateAdvertisementRateCardInput,
): Promise<AdvertisementRateCard> => {
  const response = await apiClient.post<ApiResponse<AdvertisementRateCard>>(
    BASE_PATH,
    input,
  );

  return getData(response);
};

export const updateAdvertisementRateCard = async (
  id: number,
  input: UpdateAdvertisementRateCardInput,
): Promise<AdvertisementRateCard> => {
  const response = await apiClient.patch<ApiResponse<AdvertisementRateCard>>(
    `${BASE_PATH}/${id}`,
    input,
  );

  return getData(response);
};

export const deactivateAdvertisementRateCard = async (
  id: number,
): Promise<AdvertisementRateCard> => {
  const response = await apiClient.delete<ApiResponse<AdvertisementRateCard>>(
    `${BASE_PATH}/${id}`,
  );

  return getData(response);
};

export const archiveAdvertisementRateCard = async (
  id: number,
): Promise<AdvertisementRateCard> => {
  const response = await apiClient.post<ApiResponse<AdvertisementRateCard>>(
    `${BASE_PATH}/${id}/archive`,
  );

  return getData(response);
};
