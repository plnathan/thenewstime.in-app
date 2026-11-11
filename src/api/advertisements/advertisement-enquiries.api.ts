import apiClient from "@/api/axios";

export type EnquirySource = "FOOTER" | "HOUSE_AD";
export type EnquiryPage = "HOME" | "NEWS_LIST" | "NEWS_DETAIL";
export interface AdvertisementEnquiryInput {
  fullName: string;
  companyName?: string;
  mobileNumber: string;
  email?: string;
  advertisementType?: "DISPLAY" | "SIDEBAR" | "MODAL" | "OTHER";
  pageTypes?: EnquiryPage[];
  placementTypes?: string[];
  preferredStartDate?: string;
  preferredEndDate?: string;
  additionalRequirements?: string;
  source: EnquirySource;
  sourceAdvertisementId?: number;
  sourcePlacementId?: number;
  website?: string;
  captchaToken?: string;
}
export async function submitAdvertisementEnquiry(
  payload: AdvertisementEnquiryInput,
): Promise<void> {
  await apiClient.post("/advertisement-enquiries", payload);
}

export type EnquiryStatus = "PENDING" | "RESPONDED" | "REJECTED" | "BOOKED";
export interface AdvertisementEnquiryRecord extends AdvertisementEnquiryInput {
  id: string;
  status: EnquiryStatus;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface EnquiryFilters {
  name?: string;
  company?: string;
  mobile?: string;
  status?: EnquiryStatus | "";
  page: number;
  pageSize: number;
}
export async function listAdvertisementEnquiries(filters: EnquiryFilters) {
  const params = {
    page: filters.page,
    pageSize: filters.pageSize,
    ...(filters.name?.trim() ? { name: filters.name.trim() } : {}),
    ...(filters.company?.trim() ? { company: filters.company.trim() } : {}),
    ...(filters.mobile?.trim() ? { mobile: filters.mobile.trim() } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };
  const { data } = await apiClient.get<{
    data: AdvertisementEnquiryRecord[];
    meta: { total: number; page: number; pageSize: number };
  }>("/advertisement-enquiries/admin", { params });
  return data;
}
export async function updateAdvertisementEnquiry(
  id: string,
  input: { status?: EnquiryStatus; remarks?: string | null },
) {
  await apiClient.patch(
    `/advertisement-enquiries/admin/${encodeURIComponent(id)}`,
    input,
  );
}
export async function deleteAdvertisementEnquiry(id: string) {
  await apiClient.delete(
    `/advertisement-enquiries/admin/${encodeURIComponent(id)}`,
  );
}

export interface AdvertisementEnquiryStatistics {
  total: number;
  PENDING: number;
  RESPONDED: number;
  BOOKED: number;
  REJECTED: number;
}

export async function getAdvertisementEnquiryStatistics(): Promise<AdvertisementEnquiryStatistics> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: AdvertisementEnquiryStatistics;
  }>("/advertisement-enquiries/admin/stats");
  return data.data;
}
