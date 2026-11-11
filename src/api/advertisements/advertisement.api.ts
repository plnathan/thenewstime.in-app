import apiClient from "@/api/axios";
import type { ApiResponse } from "@/types/api";

import type {
  AdvertisementPlacement,
  AdvertisementPlacementFormat,
} from "./placements.api";

import type {
  AdvertisementCreative,
  CreateAdvertisementCreativeInput,
  UpdateAdvertisementCreativeInput,
} from "@/types/creative.types";

export type AdvertisementWorkflowStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "ON_HOLD"
  | "ARCHIVED";

export type AdvertisementStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "ARCHIVED";

export type AdvertisementType =
  | "DISPLAY"
  | "BANNER"
  | "NATIVE"
  | "MODAL"
  | "OVERLAY";

export interface AdvertisementBusinessType {
  id: number;
  code: string;
  displayName: string;
  description: string | null;
  displayOrder: number;
  status: "ACTIVE" | "INACTIVE";
}

export type AdvertisementClientStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export type AdvertisementHoldType = "AUTOMATIC" | "MANUAL";

/* ------------------------------------------------------------
 * Advertisement Client
 * ------------------------------------------------------------ */

export interface AdvertisementClient {
  id: number;
  name: string;
  displayName: string | null;
  contactPerson: string | null;
  email: string | null;
  mobile: string | null;
  websiteUrl: string | null;
  status: AdvertisementClientStatus;
  notes: string | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string;
  approvedAt?: string | null;
  onHoldAt?: string | null;
  activatedAt?: string | null;
  pausedAt?: string | null;
  stoppedAt?: string | null;
  updatedAt: string;
  clientCode: string;
  businessName: string | null;
  businessTypeId: number | null;

  /**
   * Related business type name returned by APIs that flatten
   * the business type relation.
   */
  businessTypeName?: string | null;

  /**
   * Optional related business type object.
   *
   * This is not a direct database column.
   */
  businessType?: AdvertisementBusinessType | null;

  website: string | null;
  primaryAddress: string | null;
  communicationAddress: string | null;
  contactNo: string | null;
  alternateMobile: string | null;
  alternateEmail: string | null;
  adCreationHold: boolean;
  adCreationHoldType: AdvertisementHoldType | null;
  adCreationHoldReason: string | null;
  adCreationHoldRemarks: string | null;
  adCreationHoldAt: string | null;
  adCreationHoldBy: number | null;
  adCreationUnholdAt: string | null;
  adCreationUnholdBy: number | null;
  adCreationUnholdReason: string | null;
  paymentAttentionRequired: boolean;
  companyName: string | null;
  designation: string | null;
  phone: string | null;
  registeredAddress: string | null;
  billingAddress: string | null;
  gstNumber: string | null;
  taxNumber: string | null;
}

/* ------------------------------------------------------------
 * Advertisement Pricing
 * ------------------------------------------------------------ */

export type AdvertisementPricingUnit =
  | "DAY"
  | "WEEK"
  | "MONTH"
  | "IMPRESSION"
  | "CAMPAIGN"
  | "FIXED";

export interface AdvertisementPricing {
  pricingPlacementId: number | null;
  pricingUnit: AdvertisementPricingUnit | null;
  pricingQuantity: string | number | null;
  standardAmount: string | number | null;
  advertisementAmount: string | number | null;
  discountPercentage: string | number | null;
  discountAmount: string | number | null;
  advancePercentage: string | number | null;
  advanceAmount: string | number | null;
  adjustmentAmount: string | number | null;
  currencyCode: string;
}

/* ------------------------------------------------------------
 * Advertisement List / Detail
 * ------------------------------------------------------------ */

export interface AdvertisementListItem {
  id: number;
  clientId: number | null;
  clientName: string | null;
  clientCode: string | null;
  isHouseAd?: boolean;
  name: string;
  internalName?: string | null;
  advertisementType: AdvertisementType;
  priority: number;
  status: AdvertisementStatus;
  workflowStatus: AdvertisementWorkflowStatus;
  startAt: string | null;
  endAt: string | null;
  advertisementAmount: string | number | null;
  standardAmount: string | number | null;
  discountPercentage: string | number | null;
  discountAmount: string | number | null;
  advancePercentage: string | number | null;
  advanceAmount: string | number | null;
  adjustmentAmount: string | number | null;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
  /** Approval and operational audit fields; absent until provided by the list API. */
  approvedAt?: string | null;
  activatedAt?: string | null;
  pausedAt?: string | null;
  onHoldAt?: string | null;
  stoppedAt?: string | null;
}

/**
 * Full advertisement record returned by the detail endpoint.
 *
 * Based on public.advertisements plus related client,
 * pricing and persisted placement information.
 */
export interface AdvertisementDetails extends AdvertisementListItem {
  campaignId: number | null;
  destinationUrl: string | null;
  isClickable: boolean;
  openInNewTab: boolean;
  notes: string | null;
  submittedAt: string | null;
  submittedBy: number | null;
  approvedAt: string | null;
  approvedBy: number | null;
  rejectedAt: string | null;
  rejectedBy: number | null;
  rejectionReason: string | null;
  onHoldAt: string | null;
  onHoldBy: number | null;
  onHoldReason: string | null;
  adjustmentReason: string | null;
  adjustmentBy: number | null;
  adjustmentAt: string | null;
  isHouseAd: boolean;
  createdBy: number | null;
  updatedBy: number | null;
  pricingPlacementId: number | null;
  pricingUnit: AdvertisementPricingUnit | null;
  pricingQuantity: string | number | null;

  /**
   * Persisted runtime advertisement placement.
   */
  placement: AdvertisementPlacement | null;

  /**
   * Related advertisement client.
   */
  client?: AdvertisementClient | null;
}

/* ------------------------------------------------------------
 * Placement Types
 * ------------------------------------------------------------ */

export type { AdvertisementPlacementFormat };

export interface AdvertisementListMeta {
  page?: number;
  pageSize?: number;
  totalRecords?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface AdvertisementListResponse {
  success: boolean;
  message: string;
  data: AdvertisementListItem[];
  errors: unknown;
  meta: AdvertisementListMeta | null;
}

export interface AdvertisementQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  placementType?: string;
  /** Derived delivery/workflow condition; requires backend implementation. */
  operationalCondition?:
    | "ACTIVE"
    | "PAUSED"
    | "COMPLETED"
    | "ON_HOLD"
    | "STOPPED"
    | "ARCHIVED";
  startDate?: string;
  endDate?: string;
  clientId?: number;
  workflowStatus?: AdvertisementWorkflowStatus;
  status?: AdvertisementStatus;
}

/* ------------------------------------------------------------
 * Create / Update Advertisement
 * ------------------------------------------------------------ */

export interface CreateAdvertisementInput {
  clientId?: number;
  isHouseAd?: boolean;

  /**
   * Persisted runtime advertisement placement selected
   * during the Advertisement Create workflow.
   */
  placementId: number;

  name: string;
  internalName?: string;
  advertisementType?: AdvertisementType;
  destinationUrl?: string;
  priority?: number;
  startAt?: string | Date;
  endAt?: string | Date;
  isClickable?: boolean;
  openInNewTab?: boolean;
  notes?: string;

  /**
   * Negotiated advertisement amount.
   *
   * Maps to advertisements.advertisement_amount.
   */
  advertisementAmount?: number;

  currencyCode?: string;
  campaignId?: number;
  pricing?: AdvertisementPricingInput;
}

export interface UpdateAdvertisementInput {
  name?: string;
  internalName?: string;
  advertisementType?: AdvertisementType;
  destinationUrl?: string;
  priority?: number;
  startAt?: string | Date;
  endAt?: string | Date;
  isClickable?: boolean;
  openInNewTab?: boolean;
  notes?: string;

  /**
   * Negotiated advertisement amount.
   *
   * Maps to advertisements.advertisement_amount.
   */
  advertisementAmount?: number;

  discountPercentage?: number;
  discountAmount?: number;
  advancePercentage?: number;
  advanceAmount?: number;
  currencyCode?: string;
  campaignId?: number;
  isHouseAd?: boolean;

  /**
   * Runtime advertisement placement.
   */
  placementId?: number;

  pricing?: AdvertisementPricingInput;

  /*
   * IMPORTANT:
   *
   * standardAmount is intentionally not accepted here.
   *
   * standard_amount is system-derived and read-only.
   *
   * agreedAmount is intentionally not accepted because
   * agreed_amount no longer exists in the database.
   */
}

export interface CreateAdvertisementResponse {
  success: boolean;
  message: string;
  data: AdvertisementListItem;
  errors: unknown;
  meta: unknown;
}

export interface UpdateAdvertisementResponse {
  success: boolean;
  message: string;
  data: AdvertisementListItem;
  errors: unknown;
  meta: unknown;
}

export interface SubmitAdvertisementInput {
  remarks?: string;
}

export interface SubmitAdvertisementResponse {
  success: boolean;
  message: string;
  data: AdvertisementListItem;
  errors: unknown;
  meta: unknown;
}

/* ------------------------------------------------------------
 * Advertisement API
 * ------------------------------------------------------------ */

export const getAdvertisements = async (
  params?: AdvertisementQuery,
): Promise<AdvertisementListResponse> => {
  const response = await apiClient.get<AdvertisementListResponse>(
    "/advertisements",
    {
      params,
    },
  );

  return response.data;
};

export const getAdvertisementById = async (
  id: number,
): Promise<ApiResponse<AdvertisementDetails>> => {
  const response = await apiClient.get<ApiResponse<AdvertisementDetails>>(
    `/advertisements/${id}`,
  );

  return response.data;
};

export const createAdvertisement = async (
  payload: CreateAdvertisementInput,
): Promise<CreateAdvertisementResponse> => {
  const response = await apiClient.post<CreateAdvertisementResponse>(
    "/advertisements",
    payload,
  );

  return response.data;
};

export const updateAdvertisement = async (
  id: number,
  payload: UpdateAdvertisementInput,
): Promise<UpdateAdvertisementResponse> => {
  const response = await apiClient.patch<UpdateAdvertisementResponse>(
    `/advertisements/${id}`,
    payload,
  );

  return response.data;
};

export const submitAdvertisement = async (
  id: number,
  payload: SubmitAdvertisementInput = {},
): Promise<SubmitAdvertisementResponse> => {
  const response = await apiClient.post<SubmitAdvertisementResponse>(
    `/advertisements/${id}/submit`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export interface ApproveAdvertisementInput {
  remarks?: string;
}

export type ApproveAdvertisementResponse = SubmitAdvertisementResponse;

/**
 * Approve a submitted advertisement.
 *
 * Final advertisement approval is separate from submitting an
 * advertisement for approval and from financial approval.
 *
 * POST /advertisements/:id/approve
 */
export const approveAdvertisement = async (
  id: number,
  payload: ApproveAdvertisementInput = {},
): Promise<ApproveAdvertisementResponse> => {
  const response = await apiClient.post<ApproveAdvertisementResponse>(
    `/advertisements/${id}/approve`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

/* ------------------------------------------------------------
 * Advertisement Operational Activation
 * ------------------------------------------------------------ */

export interface ActivateAdvertisementInput {
  /**
   * Required explanation for activating the advertisement.
   */
  remarks: string;
}

export type ActivateAdvertisementResponse = ApiResponse<AdvertisementDetails>;

/**
 * Activate an approved advertisement for its eligible schedule.
 *
 * Approval and operational activation are separate operations:
 * - Approval sets workflowStatus to APPROVED.
 * - Activation sets the operational advertisement and eligible
 *   schedule to ACTIVE after backend readiness validation.
 *
 * The backend validates the campaign window, schedule, placement,
 * creative, rotation and other activation requirements.
 *
 * POST /advertisements/:id/activate
 */
export const activateAdvertisement = async (
  id: number,
  payload: ActivateAdvertisementInput,
): Promise<ActivateAdvertisementResponse> => {
  const remarks = payload.remarks.trim();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("A valid advertisement ID is required.");
  }

  if (!remarks) {
    throw new Error("Activation remarks are required.");
  }

  const response = await apiClient.post<ActivateAdvertisementResponse>(
    `/advertisements/${id}/activate`,
    { remarks },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

/**
 * Operational lifecycle actions. The backend remains authoritative for
 * state transitions and go-live eligibility; these methods only submit
 * the requested action and its audit remarks.
 */
export interface AdvertisementWorkflowActionInput {
  remarks?: string;
}

export interface AdvertisementHoldInput {
  reason: string;
  remarks?: string;
}

const postAdvertisementWorkflowAction = async (
  id: number,
  action: "pause" | "resume" | "stop" | "archive",
  payload: AdvertisementWorkflowActionInput = {},
): Promise<SubmitAdvertisementResponse> => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("A valid advertisement ID is required.");
  }

  const response = await apiClient.post<SubmitAdvertisementResponse>(
    `/advertisements/${id}/${action}`,
    payload,
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data;
};

export const pauseAdvertisement = (
  id: number,
  payload: AdvertisementWorkflowActionInput = {},
) => postAdvertisementWorkflowAction(id, "pause", payload);

export const resumeAdvertisement = (
  id: number,
  payload: AdvertisementWorkflowActionInput = {},
) => postAdvertisementWorkflowAction(id, "resume", payload);

export const stopAdvertisement = (
  id: number,
  payload: AdvertisementWorkflowActionInput = {},
) => postAdvertisementWorkflowAction(id, "stop", payload);

export const archiveAdvertisement = (
  id: number,
  payload: AdvertisementWorkflowActionInput = {},
) => postAdvertisementWorkflowAction(id, "archive", payload);

export const holdAdvertisement = async (
  id: number,
  payload: AdvertisementHoldInput,
): Promise<SubmitAdvertisementResponse> => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("A valid advertisement ID is required.");
  }
  if (!payload.reason.trim()) {
    throw new Error("A reason is required to place an advertisement on hold.");
  }
  const response = await apiClient.post<SubmitAdvertisementResponse>(
    `/advertisements/${id}/hold`,
    {
      reason: payload.reason.trim(),
      ...(payload.remarks?.trim() ? { remarks: payload.remarks.trim() } : {}),
    },
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data;
};

/* ------------------------------------------------------------
 * Advertisement Creative Upload
 * ------------------------------------------------------------ */

export interface AdvertisementCreativeUploadResult {
  resourceType: "image" | "video";
  secureUrl: string;
  publicId: string;
  format: string;
  mimeType: string;
  fileName: string;
  fileSizeBytes: number;
  widthPx: number;
  heightPx: number;
  thumbnailUrl: string | null;
}

/**
 * Upload an image/video to Cloudinary before saving the creative.
 *
 * The backend chooses the appropriate Cloudinary folder based on
 * the validated MIME type.
 */
export const uploadAdvertisementCreative = async (
  file: File,
): Promise<AdvertisementCreativeUploadResult> => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiClient.post<
    ApiResponse<AdvertisementCreativeUploadResult>
  >("/advertisements/creatives/upload", formData);

  if (!response.data.data) {
    throw new Error(
      "The upload succeeded without returning creative metadata.",
    );
  }

  return response.data.data;
};

/* ------------------------------------------------------------
 * Persisted Advertisement Creatives
 * ------------------------------------------------------------ */

export type AdvertisementCreativeListResponse = ApiResponse<
  AdvertisementCreative[]
>;

export type AdvertisementCreativeResponse = ApiResponse<AdvertisementCreative>;

/**
 * Retrieve the creatives currently persisted for an advertisement.
 *
 * Endpoint:
 * GET /api/v1/advertisements/:advertisementId/creatives
 */
export const getAdvertisementCreatives = async (
  advertisementId: number,
): Promise<AdvertisementCreativeListResponse> => {
  const response = await apiClient.get<AdvertisementCreativeListResponse>(
    `/advertisements/${advertisementId}/creatives`,
  );

  return response.data;
};

/**
 * Create a persisted creative record for an advertisement.
 *
 * The mediaUrl should be the existing Cloudinary secure URL.
 * This function does not upload the file again.
 */
export const createAdvertisementCreative = async (
  advertisementId: number,
  payload: CreateAdvertisementCreativeInput,
): Promise<AdvertisementCreativeResponse> => {
  const response = await apiClient.post<AdvertisementCreativeResponse>(
    `/advertisements/${advertisementId}/creatives`,
    payload,
  );

  return response.data;
};

/**
 * Update a previously persisted creative record.
 */
export const updateAdvertisementCreative = async (
  advertisementId: number,
  creativeId: number,
  payload: UpdateAdvertisementCreativeInput,
): Promise<AdvertisementCreativeResponse> => {
  const response = await apiClient.patch<AdvertisementCreativeResponse>(
    `/advertisements/${advertisementId}/creatives/${creativeId}`,
    payload,
  );

  return response.data;
};

/**
 * Remove a persisted creative record from an advertisement.
 */
export const deleteAdvertisementCreative = async (
  advertisementId: number,
  creativeId: number,
): Promise<AdvertisementCreativeResponse> => {
  const response = await apiClient.delete<AdvertisementCreativeResponse>(
    `/advertisements/${advertisementId}/creatives/${creativeId}`,
  );

  return response.data;
};

/* ------------------------------------------------------------
 * Advertisement Rotation
 * ------------------------------------------------------------ */

export type AdvertisementRotationMode = "TIME_BASED";

export type AdvertisementRotationStrategy = "ROUND_ROBIN";

export type AdvertisementRotationMemberStatus = "ACTIVE" | "INACTIVE";

export interface AdvertisementRotationConfig {
  placementId: number;
  rotationEnabled: boolean;
  rotationMode: AdvertisementRotationMode;
  rotationIntervalSeconds: number;
  rotationStrategy: AdvertisementRotationStrategy;
}

export interface AdvertisementRotationMember {
  id: number;
  placementId: number;
  advertisementId: number;
  advertisementName: string;
  advertisementStatus: AdvertisementStatus;
  advertisementWorkflowStatus: AdvertisementWorkflowStatus;
  priority: number;
  status: AdvertisementRotationMemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdvertisementRotationConfigInput {
  rotationEnabled?: boolean;
  rotationMode?: AdvertisementRotationMode;
  rotationIntervalSeconds?: number;
  rotationStrategy?: AdvertisementRotationStrategy;
}

export interface CreateAdvertisementRotationMemberInput {
  advertisementId: number;
  priority?: number;
  status?: AdvertisementRotationMemberStatus;
}

export interface UpdateAdvertisementRotationMemberInput {
  priority?: number;
  status?: AdvertisementRotationMemberStatus;
}

export type AdvertisementRotationConfigResponse =
  ApiResponse<AdvertisementRotationConfig>;

export type AdvertisementRotationMembersResponse = ApiResponse<
  AdvertisementRotationMember[]
>;

export type AdvertisementRotationMemberResponse =
  ApiResponse<AdvertisementRotationMember>;

/**
 * Retrieve rotation settings for a placement.
 *
 * GET /advertisements/rotation/placements/:placementId
 */
export const getAdvertisementRotationConfig = async (
  placementId: number,
): Promise<AdvertisementRotationConfigResponse> => {
  const response = await apiClient.get<AdvertisementRotationConfigResponse>(
    `/advertisements/rotation/placements/${placementId}`,
  );

  return response.data;
};

/**
 * Update rotation settings for a placement.
 *
 * PATCH /advertisements/rotation/placements/:placementId
 */
export const updateAdvertisementRotationConfig = async (
  placementId: number,
  payload: UpdateAdvertisementRotationConfigInput,
): Promise<AdvertisementRotationConfigResponse> => {
  const response = await apiClient.patch<AdvertisementRotationConfigResponse>(
    `/advertisements/rotation/placements/${placementId}`,
    payload,
  );

  return response.data;
};

/**
 * List rotation members assigned to a placement.
 *
 * GET /advertisements/rotation/placements/:placementId/members
 */
export const getAdvertisementRotationMembers = async (
  placementId: number,
): Promise<AdvertisementRotationMembersResponse> => {
  const response = await apiClient.get<AdvertisementRotationMembersResponse>(
    `/advertisements/rotation/placements/${placementId}/members`,
  );

  return response.data;
};

/**
 * Add an advertisement to a placement's rotation.
 *
 * POST /advertisements/rotation/placements/:placementId/members
 */
export const addAdvertisementRotationMember = async (
  placementId: number,
  payload: CreateAdvertisementRotationMemberInput,
): Promise<AdvertisementRotationMemberResponse> => {
  const response = await apiClient.post<AdvertisementRotationMemberResponse>(
    `/advertisements/rotation/placements/${placementId}/members`,
    payload,
  );

  return response.data;
};

/**
 * Update a rotation member's priority or membership status.
 *
 * PATCH /advertisements/rotation/placements/:placementId/members/:memberId
 */
export const updateAdvertisementRotationMember = async (
  placementId: number,
  memberId: number,
  payload: UpdateAdvertisementRotationMemberInput,
): Promise<AdvertisementRotationMemberResponse> => {
  const response = await apiClient.patch<AdvertisementRotationMemberResponse>(
    `/advertisements/rotation/placements/${placementId}/members/${memberId}`,
    payload,
  );

  return response.data;
};

/**
 * Deactivate a rotation member.
 *
 * DELETE /advertisements/rotation/placements/:placementId/members/:memberId
 */
export const removeAdvertisementRotationMember = async (
  placementId: number,
  memberId: number,
): Promise<AdvertisementRotationMemberResponse> => {
  const response = await apiClient.delete<AdvertisementRotationMemberResponse>(
    `/advertisements/rotation/placements/${placementId}/members/${memberId}`,
  );

  return response.data;
};

/* ------------------------------------------------------------
 * Advertisement Targeting
 * ------------------------------------------------------------ */

export type AdvertisementTargetType =
  | "SITE"
  | "NEWS"
  | "CATEGORY"
  | "STATE"
  | "DISTRICT"
  | "COUNTRY";

export interface AdvertisementTarget {
  id: number;
  advertisementId: number;
  targetType: AdvertisementTargetType;
  targetValue: string;
  isInclude: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
  updatedBy: number | null;
  createdByName: string | null;
  updatedByName: string | null;
}

export interface CreateAdvertisementTargetInput {
  targetType: AdvertisementTargetType;
  targetValue: string;
  isInclude: boolean;
}

export interface UpdateAdvertisementTargetInput {
  targetType?: AdvertisementTargetType;
  targetValue?: string;
  isInclude?: boolean;
}

export type AdvertisementTargetResponse = ApiResponse<AdvertisementTarget>;

export type AdvertisementTargetsResponse = ApiResponse<AdvertisementTarget[]>;

export const getAdvertisementTargets = async (
  advertisementId: number,
): Promise<AdvertisementTargetsResponse> => {
  const response = await apiClient.get<AdvertisementTargetsResponse>(
    `/advertisements/${advertisementId}/targets`,
  );

  return response.data;
};

export const createAdvertisementTarget = async (
  advertisementId: number,
  payload: CreateAdvertisementTargetInput,
): Promise<AdvertisementTargetResponse> => {
  const response = await apiClient.post<AdvertisementTargetResponse>(
    `/advertisements/${advertisementId}/targets`,
    payload,
  );

  return response.data;
};

export const updateAdvertisementTarget = async (
  advertisementId: number,
  targetId: number,
  payload: UpdateAdvertisementTargetInput,
): Promise<AdvertisementTargetResponse> => {
  const response = await apiClient.patch<AdvertisementTargetResponse>(
    `/advertisements/${advertisementId}/targets/${targetId}`,
    payload,
  );

  return response.data;
};

export const deleteAdvertisementTarget = async (
  advertisementId: number,
  targetId: number,
): Promise<ApiResponse<{ id: number }>> => {
  const response = await apiClient.delete<ApiResponse<{ id: number }>>(
    `/advertisements/${advertisementId}/targets/${targetId}`,
  );

  return response.data;
};

export const replaceAdvertisementTargets = async (
  advertisementId: number,
  targets: CreateAdvertisementTargetInput[],
): Promise<AdvertisementTargetsResponse> => {
  const response = await apiClient.put<AdvertisementTargetsResponse>(
    `/advertisements/${advertisementId}/targets`,
    { targets },
  );

  return response.data;
};

/* ------------------------------------------------------------
 * Advertisement Payments
 * ------------------------------------------------------------ */

export type AdvertisementPaymentType =
  | "ADVANCE"
  | "REGULAR"
  | "FINAL"
  | "INSTALLMENT";

export type AdvertisementPaymentStatus =
  | "PENDING"
  | "RECEIVED"
  | "VERIFIED"
  | "CANCELLED"
  | "REFUNDED";

export type AdvertisementPaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "UPI"
  | "CARD"
  | "CHEQUE"
  | "DEMAND_DRAFT"
  | "OTHER";

export interface AdvertisementPayment {
  id: number;
  advertisementId: number;
  paymentType: AdvertisementPaymentType;
  amount: string | number;
  paymentDate: string;
  paymentMethod: AdvertisementPaymentMethod;
  transactionReference: string | null;
  notes: string | null;
  /** Normalized from the backend's paymentStatus field. */
  status: AdvertisementPaymentStatus;
  paymentStatus?: AdvertisementPaymentStatus;

  recordedBy: number | null;
  recordedAt: string | null;

  verifiedBy: number | null;
  verifiedAt: string | null;

  cancelledBy: number | null;
  cancelledAt: string | null;
  cancellationReason: string | null;

  refundedBy: number | null;
  refundedAt: string | null;

  createdAt: string;
  updatedAt: string;

  recordedByName?: string | null;
  verifiedByName?: string | null;
  cancelledByName?: string | null;
  refundedByName?: string | null;
}

export interface CreateAdvertisementPaymentInput {
  advertisementId: number;
  paymentType: AdvertisementPaymentType;
  amount: number;
  paymentDate?: string;
  paymentMethod: AdvertisementPaymentMethod;
  transactionReference?: string;
  notes?: string;
}

export interface UpdateAdvertisementPaymentInput {
  paymentType?: AdvertisementPaymentType;
  amount?: number;
  paymentDate?: string;
  paymentMethod?: AdvertisementPaymentMethod;
  transactionReference?: string | null;
  notes?: string | null;
}

export interface VerifyAdvertisementPaymentInput {
  remarks?: string;
}

export interface CancelAdvertisementPaymentInput {
  cancellationReason: string;
}

export interface AdvertisementPaymentRefund {
  id: number;
  paymentId: number;
  financialApprovalId?: number | null;
  amount: string | number;
  refundDate: string;
  refundReference: string | null;
  refundReason: string | null;
  refundedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdvertisementPaymentRefundInput {
  paymentId: number;
  financialApprovalId: number;
  amount?: number;
  refundDate?: string;
  refundReference?: string;
  refundReason?: string;
}

export interface AdvertisementPaymentSummary {
  advertisementId: number;

  /**
   * May be null if the backend cannot determine the commercial amount.
   */
  advertisementAmount: string | number | null;

  discountAmount: string | number;
  adjustmentAmount: string | number;

  /**
   * Advance Required is the configured commercial advance target.
   * It is not itself a payment transaction.
   */
  advanceRequiredAmount?: string | number | null;

  /**
   * Advance Received is the verified amount collected against
   * the advance target, net of applicable refunds.
   */
  advanceReceivedAmount?: string | number | null;

  /**
   * Advance Pending is the remaining advance target.
   * It must never be negative.
   */
  advancePendingAmount?: string | number | null;

  /**
   * Sum of verified payment transactions before refunds.
   */
  verifiedPaymentAmount: string | number;

  refundedAmount: string | number;

  /**
   * Verified receipts less refunds.
   */
  netPaidAmount: string | number;

  /**
   * May be null when the advertisement amount cannot be established.
   */
  outstandingAmount: string | number | null;
}

export type AdvertisementPaymentsResponse = ApiResponse<AdvertisementPayment[]>;

export type AdvertisementPaymentResponse = ApiResponse<AdvertisementPayment>;

export type AdvertisementPaymentSummaryResponse =
  ApiResponse<AdvertisementPaymentSummary>;

export type AdvertisementPaymentRefundsResponse = ApiResponse<
  AdvertisementPaymentRefund[]
>;

export type AdvertisementPaymentRefundResponse =
  ApiResponse<AdvertisementPaymentRefund>;

/**
 * List payment transactions for an advertisement.
 *
 * GET /advertisements/payments?advertisementId=:advertisementId
 */
export const getAdvertisementPayments = async (
  advertisementId: number,
): Promise<AdvertisementPaymentsResponse> => {
  const response = await apiClient.get<AdvertisementPaymentsResponse>(
    "/advertisements/payments",
    {
      params: {
        advertisementId,
      },
    },
  );

  // The backend serializes payment state as `paymentStatus`; older UI code
  // expects `status`. Keep both populated so refund selectors and existing
  // workspace consumers use the same verified-payment state.
  const result = response.data;
  return {
    ...result,
    data: (result.data ?? []).map((payment) => ({
      ...payment,
      status: payment.paymentStatus ?? payment.status,
    })),
  };
};

/**
 * Retrieve an individual payment record.
 *
 * GET /advertisements/payments/:paymentId
 */
export const getAdvertisementPaymentById = async (
  paymentId: number,
): Promise<AdvertisementPaymentResponse> => {
  const response = await apiClient.get<AdvertisementPaymentResponse>(
    `/advertisements/payments/${paymentId}`,
  );

  return response.data;
};

/**
 * Record a payment against an advertisement.
 *
 * POST /advertisements/payments
 */
export const createAdvertisementPayment = async (
  payload: CreateAdvertisementPaymentInput,
): Promise<AdvertisementPaymentResponse> => {
  const response = await apiClient.post<AdvertisementPaymentResponse>(
    "/advertisements/payments",
    payload,
  );

  return response.data;
};

/**
 * Update a payment record when permitted by the backend.
 *
 * PATCH /advertisements/payments/:paymentId
 */
export const updateAdvertisementPayment = async (
  paymentId: number,
  payload: UpdateAdvertisementPaymentInput,
): Promise<AdvertisementPaymentResponse> => {
  const response = await apiClient.patch<AdvertisementPaymentResponse>(
    `/advertisements/payments/${paymentId}`,
    payload,
  );

  return response.data;
};

/**
 * Verify a payment.
 *
 * POST /advertisements/payments/:paymentId/verify
 */
export const verifyAdvertisementPayment = async (
  paymentId: number,
  payload?: VerifyAdvertisementPaymentInput,
): Promise<AdvertisementPaymentResponse> => {
  const response = await apiClient.post<AdvertisementPaymentResponse>(
    `/advertisements/payments/${paymentId}/verify`,
    payload ?? {},
  );

  return response.data;
};

/**
 * Cancel a payment.
 *
 * POST /advertisements/payments/:paymentId/cancel
 */
export const cancelAdvertisementPayment = async (
  paymentId: number,
  payload: CancelAdvertisementPaymentInput,
): Promise<AdvertisementPaymentResponse> => {
  const response = await apiClient.post<AdvertisementPaymentResponse>(
    `/advertisements/payments/${paymentId}/cancel`,
    payload,
  );

  return response.data;
};

/**
 * Retrieve payment totals for an advertisement.
 *
 * GET /advertisements/payments/:advertisementId/summary
 */
export const getAdvertisementPaymentSummary = async (
  advertisementId: number,
): Promise<AdvertisementPaymentSummaryResponse> => {
  const response = await apiClient.get<AdvertisementPaymentSummaryResponse>(
    `/advertisements/payments/${advertisementId}/summary`,
  );

  return response.data;
};

/**
 * List refunds associated with a payment.
 *
 * GET /advertisements/payments/:paymentId/refunds
 */
export const getAdvertisementPaymentRefunds = async (
  paymentId: number,
): Promise<AdvertisementPaymentRefundsResponse> => {
  const response = await apiClient.get<AdvertisementPaymentRefundsResponse>(
    `/advertisements/payments/${paymentId}/refunds`,
  );

  return response.data;
};

/**
 * Record a refund against a payment.
 *
 * POST /advertisements/payments/:paymentId/refunds
 */
export const createAdvertisementPaymentRefund = async (
  paymentId: number,
  payload: CreateAdvertisementPaymentRefundInput,
): Promise<AdvertisementPaymentRefundResponse> => {
  const response = await apiClient.post<AdvertisementPaymentRefundResponse>(
    `/advertisements/payments/${paymentId}/refunds`,
    payload,
  );

  return response.data;
};

/* ------------------------------------------------------------
 * Advertisement Financial Approval
 * ------------------------------------------------------------ */

export type AdvertisementFinancialApprovalType =
  | "DISCOUNT"
  | "ADJUSTMENT"
  | "REFUND"
  | "PARTIAL_REFUND"
  | "CREDIT_EXCEPTION";

export type AdvertisementFinancialApprovalStatus =
  | "SUBMITTED"
  | "HOLD"
  | "APPROVED"
  | "REJECTED";

/**
 * Financial approval request.
 *
 * CREDIT_EXCEPTION represents an approved exception for an outstanding
 * balance. It is not a payment, discount, or adjustment.
 *
 * Date values accept serialized API strings and Date values so this
 * interface remains compatible with existing API consumers.
 */
export interface AdvertisementFinancialApproval {
  id: number;
  advertisementId: number;
  clientId: number;
  paymentId: number | null;

  approvalType: AdvertisementFinancialApprovalType;

  requestedAmount: number | null;
  requestedPercentage: number | null;

  approvedAmount: number | null;
  approvedPercentage: number | null;

  status: AdvertisementFinancialApprovalStatus;

  requestedBy: number;
  requestedAt: string | Date;

  reviewedBy: number | null;
  reviewedAt: string | Date | null;

  holdReason: string | null;
  rejectionReason: string | null;
  approvalRemarks: string | null;

  /**
   * Credit Exception details.
   */
  creditExceptionReason?: string | null;
  expectedPaymentDueDate?: string | Date | null;
  overdueAt?: string | Date | null;

  /**
   * Revocation audit metadata.
   */
  revokedBy?: number | null;
  revokedAt?: string | Date | null;
  revocationReason?: string | null;

  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Audit entry for a financial approval status transition.
 */
export interface AdvertisementFinancialApprovalHistory {
  id: number;
  approvalId: number;

  fromStatus: AdvertisementFinancialApprovalStatus | null;
  toStatus: AdvertisementFinancialApprovalStatus;

  actionBy: number;
  actionAt: string | Date;

  remarks: string | null;
  holdReason: string | null;
  rejectionReason: string | null;

  /**
   * Credit Exception history snapshots.
   */
  creditExceptionReason?: string | null;
  expectedPaymentDueDate?: string | Date | null;
  approvedAmount?: number | null;
  overdueAt?: string | Date | null;

  /**
   * Revocation audit metadata.
   */
  revokedBy?: number | null;
  revokedAt?: string | Date | null;
  revocationReason?: string | null;
}

export interface CreateAdvertisementFinancialApprovalInput {
  advertisementId: number;
  clientId: number;
  paymentId?: number | null;

  approvalType: AdvertisementFinancialApprovalType;

  requestedAmount?: number | null;
  requestedPercentage?: number | null;

  approvalRemarks?: string | null;

  /**
   * Required by backend validation for CREDIT_EXCEPTION requests.
   */
  creditExceptionReason?: string | null;
  expectedPaymentDueDate?: string | null;
}

/**
 * The backend accepts either approvalRemarks or the legacy remarks
 * property for updating remarks. Keep both optional for compatibility.
 */
export interface UpdateAdvertisementFinancialApprovalRemarksInput {
  approvalRemarks?: string | null;
  remarks?: string | null;
}

export interface HoldAdvertisementFinancialApprovalInput {
  holdReason: string;
  remarks?: string | null;
}

export interface RejectAdvertisementFinancialApprovalInput {
  rejectionReason: string;
  remarks?: string | null;
}

export interface ApproveAdvertisementFinancialApprovalInput {
  approvedAmount?: number | null;
  approvedPercentage?: number | null;
  approvalRemarks?: string | null;
  remarks?: string | null;
}

/**
 * Credit Exception-specific approval input.
 *
 * The approved amount is the maximum outstanding balance that may remain
 * unpaid under this exception. It is not a payment or a discount.
 */
export interface ApproveAdvertisementCreditExceptionInput {
  approvedAmount: number;
  approvalRemarks?: string | null;
}

export interface ResubmitAdvertisementFinancialApprovalInput {
  approvalRemarks?: string | null;
  remarks?: string | null;
}

export interface AdvertisementFinancialApprovalListFilters {
  advertisementId?: number;
  clientId?: number;
  paymentId?: number;
  approvalType?: AdvertisementFinancialApprovalType;
  status?: AdvertisementFinancialApprovalStatus;
  requestedBy?: number;
  reviewedBy?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Summary of an advertisement's outstanding balance and approved
 * Credit Exception coverage.
 *
 * Credit Exception coverage is not money received and must not be
 * included in the payment total.
 */
export interface AdvertisementCreditExceptionSummary {
  advertisementId: number;
  outstandingAmount: number;
  approvedExceptionAmount: number;
  uncoveredOutstandingAmount: number;
  hasApprovedCreditException: boolean;
  isOverdue: boolean;
  expectedPaymentDueDate: string | null;
}

/**
 * Result of checking whether an outstanding balance is fully covered
 * by approved Credit Exceptions.
 */
export interface AdvertisementCreditExceptionCoverage {
  advertisementId: number;
  outstandingAmount: number;
  coveredAmount: number;
  uncoveredAmount: number;
  isFullyCovered: boolean;
}

export type AdvertisementFinancialApprovalResponse =
  ApiResponse<AdvertisementFinancialApproval>;

export type AdvertisementFinancialApprovalHistoryResponse = ApiResponse<
  AdvertisementFinancialApprovalHistory[]
>;

export interface AdvertisementFinancialApprovalListMeta {
  page?: number;
  pageSize?: number;
  totalRecords?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface AdvertisementFinancialApprovalListResponse {
  success: boolean;
  message: string;
  data: AdvertisementFinancialApproval[];
  errors: unknown;
  meta: AdvertisementFinancialApprovalListMeta | null;
}

export type AdvertisementCreditExceptionSummaryResponse =
  ApiResponse<AdvertisementCreditExceptionSummary>;

export type AdvertisementCreditExceptionCoverageResponse =
  ApiResponse<AdvertisementCreditExceptionCoverage>;

const FINANCIAL_APPROVAL_BASE = "/advertisements/payments/financial-approval";

/**
 * Retrieve financial approval requests with optional filters and pagination.
 *
 * GET /advertisements/payments/financial-approval
 */
export const getAdvertisementFinancialApprovals = async (
  filters: AdvertisementFinancialApprovalListFilters = {},
): Promise<AdvertisementFinancialApprovalListResponse> => {
  const response =
    await apiClient.get<AdvertisementFinancialApprovalListResponse>(
      FINANCIAL_APPROVAL_BASE,
      {
        params: filters,
      },
    );

  return response.data;
};

/**
 * Retrieve the latest financial approval request for an advertisement.
 *
 * GET /advertisements/payments/financial-approval/advertisements/:advertisementId/latest
 */
export const getLatestAdvertisementFinancialApproval = async (
  advertisementId: number,
): Promise<ApiResponse<AdvertisementFinancialApproval | null>> => {
  const response = await apiClient.get<
    ApiResponse<AdvertisementFinancialApproval | null>
  >(`${FINANCIAL_APPROVAL_BASE}/advertisements/${advertisementId}/latest`);

  return response.data;
};

/**
 * Retrieve the workflow history for one financial approval request.
 *
 * GET /advertisements/payments/financial-approval/:id/history
 */
export const getAdvertisementFinancialApprovalHistory = async (
  approvalId: number,
): Promise<AdvertisementFinancialApprovalHistoryResponse> => {
  const response =
    await apiClient.get<AdvertisementFinancialApprovalHistoryResponse>(
      `${FINANCIAL_APPROVAL_BASE}/${approvalId}/history`,
    );

  return response.data;
};

/**
 * Create a financial approval request.
 *
 * POST /advertisements/payments/financial-approval
 */
export const createAdvertisementFinancialApproval = async (
  payload: CreateAdvertisementFinancialApprovalInput,
): Promise<AdvertisementFinancialApprovalResponse> => {
  const response = await apiClient.post<AdvertisementFinancialApprovalResponse>(
    FINANCIAL_APPROVAL_BASE,
    payload,
  );

  return response.data;
};

/**
 * Update request remarks.
 *
 * PATCH /advertisements/payments/financial-approval/:id/remarks
 */
export const updateAdvertisementFinancialApprovalRemarks = async (
  approvalId: number,
  payload: UpdateAdvertisementFinancialApprovalRemarksInput,
): Promise<AdvertisementFinancialApprovalResponse> => {
  const response =
    await apiClient.patch<AdvertisementFinancialApprovalResponse>(
      `${FINANCIAL_APPROVAL_BASE}/${approvalId}/remarks`,
      payload,
    );

  return response.data;
};

/**
 * Place a submitted request on hold.
 *
 * POST /advertisements/payments/financial-approval/:id/hold
 */
export const holdAdvertisementFinancialApproval = async (
  approvalId: number,
  payload: HoldAdvertisementFinancialApprovalInput,
): Promise<AdvertisementFinancialApprovalResponse> => {
  const response = await apiClient.post<AdvertisementFinancialApprovalResponse>(
    `${FINANCIAL_APPROVAL_BASE}/${approvalId}/hold`,
    payload,
  );

  return response.data;
};

/**
 * Reject a submitted or held request.
 *
 * POST /advertisements/payments/financial-approval/:id/reject
 */
export const rejectAdvertisementFinancialApproval = async (
  approvalId: number,
  payload: RejectAdvertisementFinancialApprovalInput,
): Promise<AdvertisementFinancialApprovalResponse> => {
  const response = await apiClient.post<AdvertisementFinancialApprovalResponse>(
    `${FINANCIAL_APPROVAL_BASE}/${approvalId}/reject`,
    payload,
  );

  return response.data;
};

/**
 * Approve a submitted or held financial approval request.
 *
 * The backend evaluates the configured threshold when the request
 * is approved from SUBMITTED. An exceeded threshold can result in
 * HOLD instead of APPROVED.
 *
 * POST /advertisements/payments/financial-approval/:id/approve
 */
export const approveAdvertisementFinancialApproval = async (
  approvalId: number,
  payload: ApproveAdvertisementFinancialApprovalInput,
): Promise<AdvertisementFinancialApprovalResponse> => {
  const response = await apiClient.post<AdvertisementFinancialApprovalResponse>(
    `${FINANCIAL_APPROVAL_BASE}/${approvalId}/approve`,
    payload,
  );

  return response.data;
};

/**
 * Resubmit a held or rejected request.
 *
 * POST /advertisements/payments/financial-approval/:id/resubmit
 */
export const resubmitAdvertisementFinancialApproval = async (
  approvalId: number,
  payload: ResubmitAdvertisementFinancialApprovalInput,
): Promise<AdvertisementFinancialApprovalResponse> => {
  const response = await apiClient.post<AdvertisementFinancialApprovalResponse>(
    `${FINANCIAL_APPROVAL_BASE}/${approvalId}/resubmit`,
    payload,
  );

  return response.data;
};

/* ------------------------------------------------------------
 * Advertisement Pricing Input
 * ------------------------------------------------------------ */

export interface AdvertisementPricingInput {
  placementId: number;
  pricingUnit: AdvertisementPricingUnit;
  quantity: number;
}

/** Manual operational resume, not workflow hold release. */
export const resumeAdvertisementDelivery = async (
  id: number,
  payload: AdvertisementWorkflowActionInput = {},
): Promise<SubmitAdvertisementResponse> => {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error("A valid advertisement ID is required.");
  const response = await apiClient.post<SubmitAdvertisementResponse>(
    `/advertisements/${id}/resume-delivery`,
    payload,
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data;
};

/** Persist a one-to-one match between an executed refund and an approved,
 * already-applied commercial discount. This does not alter amounts itself. */
export interface AdvertisementRefundCommercialMatch {
  id: number;
  advertisementId: number;
  refundId: number;
  discountApprovalId: number;
  matchedAmount: number;
  matchedAt?: string;
}

export const matchAdvertisementRefundToDiscount = async (
  refundId: number,
  discountApprovalId: number,
): Promise<ApiResponse<AdvertisementRefundCommercialMatch>> => {
  const response = await apiClient.post<
    ApiResponse<AdvertisementRefundCommercialMatch>
  >(`/advertisements/payments/refunds/${refundId}/commercial-match`, {
    discountApprovalId,
  });
  return response.data;
};

export const getAdvertisementRefundCommercialMatches = async (
  advertisementId: number,
): Promise<ApiResponse<AdvertisementRefundCommercialMatch[]>> => {
  const response = await apiClient.get<
    ApiResponse<AdvertisementRefundCommercialMatch[]>
  >(`/advertisements/payments/commercial-matches/${advertisementId}`);
  return response.data;
};
