import apiClient from "./axios";

import type { ApiResponse } from "@/types/api";

export type {
  CountryItem,
  DistrictItem,
  MasterDataItem,
  StateItem,
} from "@/types/master-data.types";

import type {
  CountryItem,
  DistrictItem,
  MasterDataItem,
  StateItem,
} from "@/types/master-data.types";

/**
 * Get active categories.
 */
export const getCategories = async (): Promise<
  ApiResponse<MasterDataItem[]>
> => {
  const response = await apiClient.get<ApiResponse<MasterDataItem[]>>(
    "/master-data/categories",
  );

  return response.data;
};

/**
 * Get active countries.
 */
export const getCountries = async (): Promise<ApiResponse<CountryItem[]>> => {
  const response = await apiClient.get<ApiResponse<CountryItem[]>>(
    "/master-data/countries",
  );

  return response.data;
};

/**
 * Get active states for a country.
 */
export const getStates = async (
  countryId: number,
): Promise<ApiResponse<StateItem[]>> => {
  const response = await apiClient.get<ApiResponse<StateItem[]>>(
    "/master-data/states",
    {
      params: {
        countryId,
      },
    },
  );

  return response.data;
};

/**
 * Get active districts for a state.
 */
export const getDistricts = async (
  stateId: number,
): Promise<ApiResponse<DistrictItem[]>> => {
  const response = await apiClient.get<ApiResponse<DistrictItem[]>>(
    "/master-data/districts",
    {
      params: {
        stateId,
      },
    },
  );

  return response.data;
};
