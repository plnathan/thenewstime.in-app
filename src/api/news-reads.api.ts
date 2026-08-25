import apiClient from "./axios";

import type { ApiResponse } from "../types/api";

export interface CreateNewsReadInput {
  newsId: number;
  sessionId: string;
  visitorId?: string | null;
  ipHash?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  deviceType?: string | null;
  userAgent?: string | null;
}

export interface NewsRead {
  id: number;
  newsId: number;
  sessionId: string;
  visitorId: string | null;
  ipHash: string | null;
  browser: string | null;
  operatingSystem: string | null;
  deviceType: string | null;
  userAgent: string | null;
  readAt: string;
}

/**
 * Record a news read.
 *
 * The backend handles duplicate reads for the same
 * session/article within the configured duplicate window.
 */
export const createNewsRead = async (
  payload: CreateNewsReadInput,
): Promise<ApiResponse<NewsRead | null>> => {
  const response = await apiClient.post<ApiResponse<NewsRead | null>>(
    "/news-reads",
    payload,
  );

  return response.data;
};
