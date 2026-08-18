import apiClient from "./axios";

import type { ApiResponse } from "@/types/api";
import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";

/**
 * Get all media associated with a news article.
 */
export const getNewsMedia = async (
  newsId: number,
): Promise<ApiResponse<NewsMedia[]>> => {
  const response = await apiClient.get<ApiResponse<NewsMedia[]>>(
    `/media/news/${newsId}`,
  );

  return response.data;
};

/**
 * Upload one or more images for a news article.
 *
 * IMPORTANT:
 * Backend expects:
 *   files[]
 *   uploadedBy
 *   metadata (optional)
 */
export const uploadNewsMedia = async (
  newsId: number,
  files: File[],
  uploadedBy: number,
): Promise<ApiResponse<NewsMedia[]>> => {
  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  formData.append("uploadedBy", String(uploadedBy));

  const response = await apiClient.post<ApiResponse<NewsMedia[]>>(
    `/media/news/${newsId}`,
    formData,
  );

  return response.data;
};

/**
 * Delete a news image.
 */
export const deleteNewsMedia = async (
  newsId: number,
  mediaId: number,
): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/media/news/${newsId}/${mediaId}`,
  );

  return response.data;
};

/**
 * Persist media ordering.
 *
 * The backend expects:
 *
 * {
 *   items: [
 *     {
 *       mediaId,
 *       displayOrder
 *     }
 *   ]
 * }
 */
export const reorderNewsMedia = async (
  newsId: number,
  mediaIds: number[],
): Promise<ApiResponse<NewsMedia[]>> => {
  const items = mediaIds.map((mediaId, index) => ({
    mediaId,
    displayOrder: index + 1,
  }));

  const response = await apiClient.patch<ApiResponse<NewsMedia[]>>(
    `/media/news/${newsId}/order`,
    {
      items,
    },
  );

  return response.data;
};
