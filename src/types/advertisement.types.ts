import type { LucideIcon } from "lucide-react";

import type {
  AdvertisementDetails,
  AdvertisementListItem,
  AdvertisementWorkflowStatus,
} from "@/api/advertisements/advertisement.api";

export type WorkspaceSection =
  | "overview"
  | "client"
  | "details"
  | "placement"
  | "creative"
  | "schedule"
  | "pricing"
  | "rotation"
  | "targeting"
  | "payments"
  | "financial"
  | "delivery"
  | "tracking";

export interface WorkspaceNavigationItem {
  id: WorkspaceSection;
  label: string;
  description: string;
  icon: LucideIcon;
}

export type ReadinessState = "READY" | "REQUIRES_VERIFICATION" | "MISSING";

export interface ReadinessItem {
  label: string;
  description: string;
  state: ReadinessState;
}

export interface WorkspaceSummaryCardProps {
  label: string;
  value: string;
  secondary: string;
  icon: LucideIcon;
}

export interface WorkspaceSummaryFieldProps {
  label: string;
  value: string;
}

export interface WorkspaceOverviewProps {
  advertisement: AdvertisementListItem;
  readiness: ReadinessItem[];
  readinessReady: number;
  readinessTotal: number;
  canApprove: boolean;
}

export interface WorkspaceNavigationProps {
  activeSection: WorkspaceSection;
  onSectionChange: (section: WorkspaceSection) => void;
}

export interface WorkspaceHeaderProps {
  advertisement: AdvertisementListItem;
  workflowStatus: AdvertisementWorkflowStatus;
  refreshing: boolean;
  onBack: () => void;
  onContinueDraft: () => void;
  onRefresh: () => void;
}

/**
 * Full advertisement details displayed by the Workspace Details section.
 */
export interface WorkspaceDetailsProps {
  advertisement: AdvertisementDetails;
}

export interface WorkspaceSectionPlaceholderProps {
  section: WorkspaceSection;
}

export interface WorkspaceLoadingProps {
  summaryCardCount?: number;
}
