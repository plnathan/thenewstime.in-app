import type { LucideIcon } from "lucide-react";

import type {
  AdvertisementListItem,
  AdvertisementWorkflowStatus,
} from "@/api/advertisements/advertisement.api";

export type WorkspaceSection =
  | "overview"
  | "client"
  | "details"
  | "creative"
  | "placement"
  | "rotation"
  | "pricing"
  | "payments"
  | "financial"
  | "schedule"
  | "targeting"
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
}

export interface WorkspaceOverviewProps {
  advertisement: AdvertisementListItem;
  readiness: ReadinessItem[];
  readinessReady: number;
  readinessTotal: number;
  canApprove: boolean;
}

export interface AdvertisementWorkspacePricingProps {
  advertisement: AdvertisementListItem;
  canEditCommercials: boolean;
}

/**
 * Pricing information used by the Advertisement Workspace.
 *
 * standardAmount:
 *   System-derived amount from the pricing/rate-card snapshot.
 *   This value is read-only and must never be edited from the UI.
 *
 * advertisementAmount:
 *   Final commercial amount stored on the advertisement.
 *   This is the amount that can be updated from the Commercials UI.
 *
 * agreedAmount has intentionally been removed.
 */
export interface PricingSummary {
  standardAmount: number | null;
  advertisementAmount: number | null;
  discountPercentage: number | null;
  discountAmount: number | null;
  adjustmentAmount: number | null;
  advancePercentage: number | null;
  advanceAmount: number | null;
  balanceAmount: number | null;
  balancePercentage: number | null;
  durationDays: number | null;
  currencyCode: string;
}

export interface PricingField {
  label: string;
  value: string;
  helper?: string;
}

export interface WorkspacePricingStatus {
  state: ReadinessState;
  label: string;
  description: string;
}

/**
 * Props for the advertisement Payments workspace.
 */
export interface AdvertisementWorkspacePaymentsProps {
  advertisementId: number;
  currencyCode: string;
  canManagePayments: boolean;
}

/**
 * Financial approval workflow status.
 *
 * This aliases the existing advertisement workflow status type
 * for compatibility with the workspace's existing API contracts.
 */
export type WorkspaceWorkflowStatus = AdvertisementWorkflowStatus;
