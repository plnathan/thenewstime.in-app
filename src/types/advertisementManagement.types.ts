import type { ReactNode } from "react";

import type {
  AdvertisementListItem,
  AdvertisementWorkflowStatus,
} from "@/api/advertisements/advertisement.api";

export interface AdvertisementOverview {
  draft: number;
  pendingApproval: number;
  active: number;
  completed: number;
}

export interface AdvertisementPagination {
  page: number;
  pageSize: number;
  totalRecords: number;
}

export interface AdvertisementManagementRowProps {
  advertisement: AdvertisementListItem;
}

export interface AdvertisementPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  firstRecord: number;
  lastRecord: number;
  onPageSizeChange: (size: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
}

export interface OverviewCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}

export interface QuickActionCardProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
}

export type AdvertisementManagementWorkflowStatus = AdvertisementWorkflowStatus;
