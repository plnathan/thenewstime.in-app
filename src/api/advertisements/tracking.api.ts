import apiClient from "@/api/axios";
import type { ApiResponse } from "@/types/api";

export interface AdvertisementMetricsTotals {
  impressions: number;
  clicks: number;
  uniqueImpressionVisitors: number;
  uniqueClickVisitors: number;
  clickThroughRate: number;
}

export interface AdvertisementDailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
}

export interface AdvertisementPlacementMetric {
  placementId: number;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
}

export interface AdvertisementCreativeMetric {
  creativeId: number;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
}

export interface AdvertisementMetrics {
  advertisementId: number;
  period: { from: string | Date | null; to: string | Date | null };
  totals: AdvertisementMetricsTotals;
  daily: AdvertisementDailyMetric[];
  placements: AdvertisementPlacementMetric[];
  creatives: AdvertisementCreativeMetric[];
}

export interface AdvertisementMetricsQuery {
  from?: string;
  to?: string;
}

export const getAdvertisementMetrics = async (
  advertisementId: number,
  query: AdvertisementMetricsQuery = {},
): Promise<ApiResponse<AdvertisementMetrics>> => {
  const response = await apiClient.get<ApiResponse<AdvertisementMetrics>>(
    `/advertisements/tracking/metrics/${advertisementId}`,
    { params: query },
  );
  return response.data;
};
