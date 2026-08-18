import apiClient from "./axios";

import type { ApiResponse } from "@/types/api";

export interface MasterDataItem {
  id: number;
  code: string;
  displayName: string;
  urlName: string;
}

export interface CountryItem extends MasterDataItem {
  isoCode: string | null;
}

export interface StateItem extends MasterDataItem {
  countryId: number;
}

export interface DistrictItem extends MasterDataItem {
  stateId: number;
}

export const getCategories = async (): Promise<
  ApiResponse<MasterDataItem[]>
> => {
  const response = await apiClient.get<ApiResponse<MasterDataItem[]>>(
    "/master-data/categories",
  );

  return response.data;
};

export const getCountries = async (): Promise<ApiResponse<CountryItem[]>> => {
  const response = await apiClient.get<ApiResponse<CountryItem[]>>(
    "/master-data/countries",
  );

  return response.data;
};

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
