import type {
  AdvertisementFinancialApproval,
  AdvertisementTarget,
  AdvertisementListItem,
  AdvertisementWorkflowStatus,
} from "@/api/advertisements/advertisement.api";

import type {
  PricingSummary,
  ReadinessItem,
  WorkspaceNavigationItem,
  WorkspacePricingStatus,
  WorkspaceSection,
} from "@/types/advertisementWorkspace.types";

import {
  CalendarDays,
  CreditCard,
  FileImage,
  Gauge,
  Layers3,
  Link2,
  Megaphone,
  PackageCheck,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Target,
  WalletCards,
} from "lucide-react";

import type { AdvertisementPlacement } from "@/api/advertisements/placements.api";

import type {
  AdvertisementCreative,
  AdvertisementCreativePreviewResponse,
} from "@/api/advertisements/creatives.api";

import type {
  AdvertisementPayment,
  AdvertisementPaymentSummary,
  AdvertisementRotationConfig,
  AdvertisementRotationMember,
} from "@/api/advertisements/advertisement.api";

type VerificationStatus = "LOADING" | "VERIFIED" | "ERROR";

export const workspaceNavigation: WorkspaceNavigationItem[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Advertisement summary and approval readiness",
    icon: Gauge,
  },
  {
    id: "client",
    label: "Client",
    description: "Client profile and commercial relationship",
    icon: PackageCheck,
  },
  {
    id: "details",
    label: "Details",
    description: "Advertisement configuration",
    icon: Settings2,
  },
  {
    id: "placement",
    label: "Placement",
    description: "Site placement and format",
    icon: Layers3,
  },
  {
    id: "creative",
    label: "Creative",
    description: "Advertisement creative assets",
    icon: FileImage,
  },
  {
    id: "schedule",
    label: "Schedule",
    description: "Campaign start and end schedule",
    icon: CalendarDays,
  },
  {
    id: "pricing",
    label: "Pricing & Commercials",
    description: "Rate card, advertisement amount and advance",
    icon: WalletCards,
  },
  {
    id: "rotation",
    label: "Rotation",
    description: "Rotation settings and placement members",
    icon: RotateCcw,
  },
  {
    id: "targeting",
    label: "Targeting",
    description:
      "Configure advertisement targeting rules for Audience, Geography and Device",
    icon: Target,
  },
  {
    id: "payments",
    label: "Payments",
    description:
      "Review payments, verification, refunds, and outstanding balances",
    icon: CreditCard,
  },
  {
    id: "financial",
    label: "Financial Approval",
    description:
      "Review financial approval requests, decisions, and workflow history.",
    icon: ShieldCheck,
  },
  {
    id: "delivery",
    label: "Delivery",
    description: "Delivery eligibility and status",
    icon: Megaphone,
  },
  {
    id: "tracking",
    label: "Tracking",
    description: "Impressions, clicks and metrics",
    icon: Link2,
  },
];

export const findWorkspaceNavigationItem = (
  section: WorkspaceSection,
): WorkspaceNavigationItem | undefined =>
  workspaceNavigation.find((item) => item.id === section);

export const parseNullableNumber = (
  value: string | number | null | undefined,
): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

export const formatMoney = (
  amount: string | number | null | undefined,
  currencyCode: string,
): string => {
  const numericAmount = parseNullableNumber(amount);

  if (numericAmount === null) {
    return "Not configured";
  }

  const currency = currencyCode || "INR";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${currency} ${numericAmount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }
};

export const formatNumber = (value: number | null): string => {
  if (value === null) {
    return "Not configured";
  }

  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

export const formatPercentage = (
  value: string | number | null | undefined,
): string => {
  const numericValue = parseNullableNumber(value);

  if (numericValue === null) {
    return "Not configured";
  }

  return `${numericValue.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}%`;
};

export const getDurationDays = (
  startAt: string | null,
  endAt: string | null,
): number | null => {
  if (!startAt || !endAt) {
    return null;
  }

  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null;
  }

  return Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1;
};

/**
 * Builds the pricing summary directly from the advertisement API response.
 *
 * standardAmount maps to advertisements.standard_amount.
 * advertisementAmount maps to advertisements.advertisement_amount.
 *
 * These values must never be interchanged.
 */
export const getPricingSummary = (
  advertisement: AdvertisementListItem,
): PricingSummary => {
  const standardAmount = parseNullableNumber(advertisement.standardAmount);
  const advertisementAmount = parseNullableNumber(
    advertisement.advertisementAmount,
  );
  const discountPercentage = parseNullableNumber(
    advertisement.discountPercentage,
  );
  const discountAmount = parseNullableNumber(advertisement.discountAmount);
  const adjustmentAmount = parseNullableNumber(advertisement.adjustmentAmount);
  const advancePercentage = parseNullableNumber(
    advertisement.advancePercentage,
  );
  const advanceAmount = parseNullableNumber(advertisement.advanceAmount);

  const balanceAmount =
    advertisementAmount !== null && advanceAmount !== null
      ? Math.max(advertisementAmount - advanceAmount, 0)
      : null;

  const balancePercentage =
    advertisementAmount !== null &&
    advertisementAmount > 0 &&
    balanceAmount !== null
      ? (balanceAmount / advertisementAmount) * 100
      : null;

  return {
    standardAmount,
    advertisementAmount,
    discountPercentage,
    discountAmount,
    adjustmentAmount,
    advancePercentage,
    advanceAmount,
    balanceAmount,
    balancePercentage,
    durationDays: getDurationDays(advertisement.startAt, advertisement.endAt),
    currencyCode: advertisement.currencyCode || "INR",
  };
};

export const getPricingStatus = (
  advertisement: AdvertisementListItem,
): WorkspacePricingStatus => {
  if (advertisement.isHouseAd === true) {
    return {
      state: "READY",
      label: "House advertisement — not applicable",
      description:
        "In-house inventory does not require a paid rate card or commercial amount.",
    };
  }
  const pricing = getPricingSummary(advertisement);

  if (pricing.standardAmount === null && pricing.advertisementAmount === null) {
    return {
      state: "MISSING",
      label: "Pricing incomplete",
      description:
        "A system-derived standard amount and advertisement amount are required.",
    };
  }

  if (pricing.advertisementAmount === null) {
    return {
      state: "MISSING",
      label: "Advertisement amount required",
      description:
        "The final commercial advertisement amount has not been configured.",
    };
  }

  if (pricing.standardAmount === null) {
    return {
      state: "REQUIRES_VERIFICATION",
      label: "Rate-card verification required",
      description:
        "The advertisement amount is present, but the system-derived standard amount is unavailable.",
    };
  }

  return {
    state: "READY",
    label: "Commercial amount configured",
    description:
      "Standard pricing and the final advertisement amount are available for verification.",
  };
};

/**
 * An advance target is a commercial setting, not a payment receipt.
 *
 * No configured advance target does not, by itself, prove that an advance
 * is required. Any mandatory collection requirement must be enforced by
 * the applicable backend workflow rules.
 */
export const getAdvanceStatus = (
  advertisement: AdvertisementListItem,
): WorkspacePricingStatus => {
  if (advertisement.isHouseAd === true) {
    return {
      state: "READY",
      label: "House advertisement — not applicable",
      description: "No customer advance is required for in-house advertising.",
    };
  }
  const pricing = getPricingSummary(advertisement);

  if (pricing.advanceAmount === null && pricing.advancePercentage === null) {
    return {
      state: "READY",
      label: "No advance configured",
      description:
        "No advance target is configured. This alone does not block approval; any mandatory advance collection requirement must be enforced by the applicable workflow rules.",
    };
  }

  if (
    pricing.advanceAmount !== null &&
    pricing.advertisementAmount !== null &&
    pricing.advanceAmount > pricing.advertisementAmount
  ) {
    return {
      state: "MISSING",
      label: "Advance exceeds advertisement amount",
      description:
        "The advance amount cannot be greater than the final advertisement amount.",
    };
  }

  return {
    state: "READY",
    label: "Advance configured",
    description:
      "Advance amount information is available for commercial verification. Actual receipts are tracked separately in Payments.",
  };
};

export interface PlacementCreativeReadinessContext {
  placement: AdvertisementPlacement | null;

  /**
   * Keep placement verification independent of Creative verification.
   * Optional for compatibility with existing callers.
   */
  placementVerificationStatus?: VerificationStatus;

  creatives: AdvertisementCreative[] | null;
  previews: AdvertisementCreativePreviewResponse | null;
  verificationStatus: VerificationStatus;

  targets?: AdvertisementTarget[] | null;
  targetingVerificationStatus?: VerificationStatus;

  rotationConfig: AdvertisementRotationConfig | null;
  rotationMembers: AdvertisementRotationMember[] | null;
  rotationVerificationStatus: VerificationStatus;

  /** Payment records and authoritative backend reconciliation summary. */
  payments?: AdvertisementPayment[] | null;
  paymentSummary?: AdvertisementPaymentSummary | null;
  paymentVerificationStatus?: VerificationStatus;

  /** Financial approval requests are not payment transactions. */
  financialApprovals?: AdvertisementFinancialApproval[] | null;
  financialApprovalVerificationStatus?: VerificationStatus;

  /** Combined payment and credit-coverage verification status. */
  pricingReadinessVerificationStatus?: VerificationStatus;
}

const isPositiveDimension = (
  value: number | null | undefined,
): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const isApprovedPreviewStatus = (status: string | undefined): boolean =>
  status === "EXACT_MATCH" || status === "SLIGHTLY_DIFFERENT";

/** Match the creative editor's 30px-per-dimension acceptance rule. */
const isAcceptedCreativePreview = (
  preview: NonNullable<AdvertisementCreativePreviewResponse["desktop"]>,
): boolean => {
  if (isApprovedPreviewStatus(preview.status)) return true;

  // Only override legacy dimension/aspect-ratio statuses, never unrelated errors.
  if (
    preview.status !== "DIMENSION_MISMATCH" &&
    preview.status !== "ASPECT_RATIO_MISMATCH"
  )
    return false;

  const expected = preview.expected;
  const actual = preview.actual;
  if (
    !isPositiveDimension(expected.widthPx) ||
    !isPositiveDimension(expected.heightPx) ||
    !isPositiveDimension(actual.widthPx) ||
    !isPositiveDimension(actual.heightPx)
  )
    return false;

  return (
    actual.widthPx >= expected.widthPx - 30 &&
    actual.heightPx >= expected.heightPx - 30
  );
};

const getPlacementReadiness = (
  context?: PlacementCreativeReadinessContext,
): ReadinessItem => {
  if (!context) {
    return {
      label: "Placement",
      description:
        "Placement configuration has not yet been verified against the persisted placement record.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  const verificationStatus =
    context.placementVerificationStatus ?? context.verificationStatus;

  if (verificationStatus === "LOADING") {
    return {
      label: "Placement",
      description:
        "The saved placement and format configuration is still being verified.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (verificationStatus === "ERROR") {
    return {
      label: "Placement",
      description:
        "The saved placement configuration could not be verified. Refresh the workspace and try again.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  const placement = context.placement;

  if (!placement) {
    return {
      label: "Placement",
      description:
        "No persisted placement is associated with this advertisement.",
      state: "MISSING",
    };
  }

  if (placement.status !== "ACTIVE" || placement.isEnabled !== true) {
    return {
      label: "Placement",
      description:
        "The selected placement must be active and enabled before approval.",
      state: "MISSING",
    };
  }

  const format = placement.format;

  if (!format || !Number.isInteger(format.id) || format.id <= 0) {
    return {
      label: "Placement",
      description:
        "The placement does not have a valid persisted advertisement format.",
      state: "MISSING",
    };
  }

  const hasDesktopDimensions =
    isPositiveDimension(format.widthPx) && isPositiveDimension(format.heightPx);

  const hasMobileWidth = isPositiveDimension(format.mobileWidthPx);
  const hasMobileHeight = isPositiveDimension(format.mobileHeightPx);

  if (!hasDesktopDimensions) {
    return {
      label: "Placement",
      description:
        "The selected format has incomplete or invalid Desktop dimensions.",
      state: "MISSING",
    };
  }

  if (hasMobileWidth !== hasMobileHeight) {
    return {
      label: "Placement",
      description:
        "Mobile format dimensions are incomplete. Configure both width and height, or leave both unset.",
      state: "MISSING",
    };
  }

  if (
    !hasMobileWidth &&
    (format.mobileWidthPx != null || format.mobileHeightPx != null)
  ) {
    return {
      label: "Placement",
      description:
        "Mobile format dimensions are incomplete. Configure both width and height, or leave both unset.",
      state: "MISSING",
    };
  }

  return {
    label: "Placement",
    description:
      `The persisted placement "${placement.displayName}" is active and enabled, ` +
      `and its format "${format.displayName}" has valid Desktop dimensions.`,
    state: "READY",
  };
};

const getCreativeReadiness = (
  context?: PlacementCreativeReadinessContext,
): ReadinessItem => {
  if (!context) {
    return {
      label: "Creative",
      description:
        "Saved creative assets and preview compatibility have not yet been verified.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (context.verificationStatus === "LOADING") {
    return {
      label: "Creative",
      description:
        "Saved creative assets and placement previews are still being verified.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (context.verificationStatus === "ERROR") {
    return {
      label: "Creative",
      description:
        "Creative records or preview compatibility could not be verified. Refresh the workspace and try again.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  const { placement, creatives, previews } = context;

  if (!placement || !placement.format) {
    return {
      label: "Creative",
      description:
        "A valid saved placement and format are required before creative compatibility can be checked.",
      state: "MISSING",
    };
  }

  if (!creatives || creatives.length === 0) {
    return {
      label: "Creative",
      description:
        "No saved creative assets were found for this advertisement.",
      state: "MISSING",
    };
  }

  const activeCreatives = creatives.filter(
    (creative) => creative.status === "ACTIVE",
  );

  if (activeCreatives.length === 0) {
    return {
      label: "Creative",
      description:
        "There are no active saved creative assets. At least one active primary creative is required.",
      state: "MISSING",
    };
  }

  const desktopPrimaryCreatives = activeCreatives.filter(
    (creative) => creative.variant === "DESKTOP" && creative.isPrimary,
  );

  if (desktopPrimaryCreatives.length === 0) {
    return {
      label: "Creative",
      description: `${activeCreatives.filter((creative) => creative.variant === "DESKTOP").length} active Desktop creative(s) exist, but none is designated as primary. Set one active Desktop creative as primary to verify the delivery preview.`,
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (desktopPrimaryCreatives.length > 1) {
    return {
      label: "Creative",
      description:
        "More than one active primary Desktop creative exists. Review the saved primary designation.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  const desktopPrimary = desktopPrimaryCreatives[0];

  if (!desktopPrimary) {
    return {
      label: "Creative",
      description: "The active primary Desktop creative could not be resolved.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  const format = placement.format;

  if (
    !desktopPrimary.mediaUrl.trim() ||
    desktopPrimary.formatId !== format.id
  ) {
    return {
      label: "Creative",
      description:
        "The primary Desktop creative has no media URL or is not linked to the selected placement format.",
      state: "MISSING",
    };
  }

  const desktopPreview = previews?.desktop;

  if (!desktopPreview) {
    return {
      label: "Creative",
      description:
        "A Desktop preview is unavailable, so creative compatibility cannot be confirmed.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (desktopPreview.creativeId !== desktopPrimary.id) {
    return {
      label: "Creative",
      description:
        "The Desktop preview does not correspond to the active primary Desktop creative.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (!isAcceptedCreativePreview(desktopPreview)) {
    return {
      label: "Creative",
      description: `The Desktop creative needs review: ${desktopPreview.statusMessage}`,
      state:
        desktopPreview.status === "DIMENSION_MISMATCH" ||
        desktopPreview.status === "ASPECT_RATIO_MISMATCH"
          ? "MISSING"
          : "REQUIRES_VERIFICATION",
    };
  }

  const mobileDimensionsConfigured =
    isPositiveDimension(format.mobileWidthPx) &&
    isPositiveDimension(format.mobileHeightPx);

  const mobilePrimaryCreatives = activeCreatives.filter(
    (creative) => creative.variant === "MOBILE" && creative.isPrimary,
  );

  if (mobilePrimaryCreatives.length > 1) {
    return {
      label: "Creative",
      description:
        "More than one active primary Mobile creative exists. Review the saved primary designation.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  const mobilePrimary = mobilePrimaryCreatives[0];

  if (mobileDimensionsConfigured && !mobilePrimary) {
    const mobilePreview = previews?.mobile;

    if (!mobilePreview) {
      return {
        label: "Creative",
        description:
          "A primary Desktop creative is configured, but the Mobile fallback preview is unavailable. Refresh the workspace to verify fallback compatibility.",
        state: "REQUIRES_VERIFICATION",
      };
    }

    if (
      mobilePreview.creativeId !== desktopPrimary.id ||
      !mobilePreview.usesDesktopFallback ||
      mobilePreview.renderMode !== "FALLBACK_DESKTOP"
    ) {
      return {
        label: "Creative",
        description:
          "A separate Mobile creative is optional, but the saved Mobile preview has not confirmed that the primary Desktop creative can be used as its fallback.",
        state: "REQUIRES_VERIFICATION",
      };
    }

    if (!isAcceptedCreativePreview(mobilePreview)) {
      return {
        label: "Creative",
        description: `The Desktop fallback for Mobile needs review: ${mobilePreview.statusMessage}`,
        state:
          mobilePreview.status === "DIMENSION_MISMATCH" ||
          mobilePreview.status === "ASPECT_RATIO_MISMATCH"
            ? "MISSING"
            : "REQUIRES_VERIFICATION",
      };
    }

    return {
      label: "Creative",
      description:
        "The active primary Desktop creative is saved and compatible with the selected format. A separate Mobile creative is not configured; the verified Desktop fallback will be used for Mobile.",
      state: "READY",
    };
  }

  if (mobilePrimary) {
    if (
      !mobilePrimary.mediaUrl.trim() ||
      mobilePrimary.formatId !== format.id
    ) {
      return {
        label: "Creative",
        description:
          "The primary Mobile creative has no media URL or is not linked to the selected placement format.",
        state: "MISSING",
      };
    }

    const mobilePreview = previews?.mobile;

    if (!mobilePreview) {
      return {
        label: "Creative",
        description:
          "A Mobile preview is unavailable, so creative compatibility cannot be confirmed.",
        state: "REQUIRES_VERIFICATION",
      };
    }

    if (
      mobilePreview.creativeId !== mobilePrimary.id ||
      mobilePreview.usesDesktopFallback
    ) {
      return {
        label: "Creative",
        description:
          "The Mobile preview does not confirm the configured primary Mobile creative.",
        state: "REQUIRES_VERIFICATION",
      };
    }

    if (!isAcceptedCreativePreview(mobilePreview)) {
      return {
        label: "Creative",
        description: `The Mobile creative needs review: ${mobilePreview.statusMessage}`,
        state:
          mobilePreview.status === "DIMENSION_MISMATCH" ||
          mobilePreview.status === "ASPECT_RATIO_MISMATCH"
            ? "MISSING"
            : "REQUIRES_VERIFICATION",
      };
    }
  }

  return {
    label: "Creative",
    description: mobilePrimary
      ? "Active primary Desktop and Mobile creatives are saved and compatible with the placement format (up to 30px smaller per dimension, or larger)."
      : "An active primary Desktop creative is saved, linked to the selected format, and within the supported preview tolerance.",
    state: "READY",
  };
};

const getTargetingReadiness = (
  context?: PlacementCreativeReadinessContext,
): ReadinessItem => {
  const label = "Targeting";
  if (
    !context ||
    context.targetingVerificationStatus === "LOADING" ||
    context.targetingVerificationStatus === undefined
  ) {
    return {
      label,
      state: "REQUIRES_VERIFICATION",
      description: "Saved targeting rules are being verified.",
    };
  }
  if (context.targetingVerificationStatus === "ERROR" || !context.targets) {
    return {
      label,
      state: "REQUIRES_VERIFICATION",
      description:
        "Targeting rules could not be loaded. Refresh the workspace to verify them.",
    };
  }
  const targets = context.targets;
  if (targets.length === 0) {
    return {
      label,
      state: "READY",
      description:
        "No targeting restrictions are configured. The advertisement may be delivered to all eligible contexts.",
    };
  }
  const validTypes = new Set([
    "SITE",
    "NEWS",
    "CATEGORY",
    "STATE",
    "DISTRICT",
    "COUNTRY",
  ]);
  const seen = new Map<string, boolean>();
  for (const rule of targets) {
    const value = rule.targetValue?.trim();
    if (
      !validTypes.has(rule.targetType) ||
      !value ||
      (rule.targetType === "NEWS" &&
        (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))))
    ) {
      return {
        label,
        state: "MISSING",
        description:
          "A saved targeting rule has an invalid type or value. Correct it in Targeting.",
      };
    }
    const key = `${rule.targetType}:${value.toLowerCase()}`;
    const prior = seen.get(key);
    if (prior !== undefined && prior !== rule.isInclude) {
      return {
        label,
        state: "REQUIRES_VERIFICATION",
        description:
          "Conflicting include and exclude rules target the same value. Review Targeting.",
      };
    }
    seen.set(key, rule.isInclude);
  }
  return {
    label,
    state: "READY",
    description: `${targets.length} saved targeting rule(s) verified (${targets.filter((r) => r.isInclude).length} include, ${targets.filter((r) => !r.isInclude).length} exclude).`,
  };
};

const getRotationReadiness = (
  context?: PlacementCreativeReadinessContext,
): ReadinessItem => {
  if (!context) {
    return {
      label: "Rotation",
      description:
        "The persisted rotation configuration and placement members have not been verified.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (context.rotationVerificationStatus === "LOADING") {
    return {
      label: "Rotation",
      description:
        "The saved rotation configuration and placement members are being verified.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (context.rotationVerificationStatus === "ERROR") {
    return {
      label: "Rotation",
      description:
        "Rotation configuration or placement members could not be loaded. Refresh the workspace and try again.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  const {
    rotationConfig: config,
    rotationMembers: members,
    placement,
  } = context;

  if (!config || !members) {
    return {
      label: "Rotation",
      description:
        "The saved rotation configuration or member list is unavailable.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (!placement) {
    return {
      label: "Rotation",
      description:
        "A persisted placement is required to verify rotation configuration and membership.",
      state: "MISSING",
    };
  }

  if (!Number.isInteger(config.placementId) || config.placementId <= 0) {
    return {
      label: "Rotation",
      description:
        "The saved rotation configuration is not associated with a valid placement.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (config.placementId !== placement.id) {
    return {
      label: "Rotation",
      description:
        "The saved rotation configuration does not belong to the advertisement's persisted placement. Refresh and verify the placement association.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (members.some((member) => member.placementId !== config.placementId)) {
    return {
      label: "Rotation",
      description:
        "The saved rotation member list contains a record associated with another placement. Refresh and verify the persisted membership data.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  /*
   * A persisted, verified disabled configuration is valid.
   * Active members are required only when rotation is enabled.
   */
  if (!config.rotationEnabled) {
    return {
      label: "Rotation",
      description:
        "Rotation is disabled for this placement. The persisted configuration and member list have been verified; active rotation members are not required.",
      state: "READY",
    };
  }

  if (
    config.rotationMode !== "TIME_BASED" ||
    config.rotationStrategy !== "ROUND_ROBIN" ||
    !Number.isInteger(config.rotationIntervalSeconds) ||
    config.rotationIntervalSeconds <= 0
  ) {
    return {
      label: "Rotation",
      description:
        "Enabled rotation requires TIME_BASED mode, ROUND_ROBIN strategy, and a positive whole-number rotation interval.",
      state: "MISSING",
    };
  }

  const activeMembers = members.filter((member) => member.status === "ACTIVE");

  if (activeMembers.length === 0) {
    return {
      label: "Rotation",
      description:
        "Rotation is enabled, but this placement has no active rotation members.",
      state: "MISSING",
    };
  }

  if (activeMembers.length > 10) {
    return {
      label: "Rotation",
      description:
        "This placement has more than 10 active rotation members. Review the existing members before adding or activating more.",
      state: "MISSING",
    };
  }

  const invalidMember = activeMembers.find(
    (member) =>
      !Number.isInteger(member.advertisementId) ||
      member.advertisementId <= 0 ||
      !Number.isInteger(member.priority) ||
      member.priority < 0 ||
      !member.advertisementName.trim(),
  );

  if (invalidMember) {
    return {
      label: "Rotation",
      description:
        "One or more active rotation members have invalid advertisement, name, or priority data.",
      state: "MISSING",
    };
  }

  const seenAdvertisementIds = new Set<number>();

  for (const member of activeMembers) {
    if (seenAdvertisementIds.has(member.advertisementId)) {
      return {
        label: "Rotation",
        description:
          "The same advertisement appears more than once among the active rotation members.",
        state: "MISSING",
      };
    }

    seenAdvertisementIds.add(member.advertisementId);
  }

  const priorities = activeMembers.map((member) => member.priority);

  if (new Set(priorities).size !== priorities.length) {
    return {
      label: "Rotation",
      description:
        "Active rotation members have duplicate priorities. Review the saved priorities to verify the intended rotation order.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  const ineligibleMember = activeMembers.find(
    (member) =>
      member.advertisementStatus !== "ACTIVE" ||
      member.advertisementWorkflowStatus !== "APPROVED",
  );

  if (ineligibleMember) {
    return {
      label: "Rotation",
      description:
        "At least one active rotation member is not both an ACTIVE advertisement and workflow-APPROVED. Review member eligibility before approval.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  return {
    label: "Rotation",
    description:
      `Rotation is enabled with ${activeMembers.length} active members. ` +
      "The persisted configuration, placement association, active-member limit, unique priorities, and member eligibility have been verified.",
    state: "READY",
  };
};

/**
 * Normalize payment status consistently with WorkspacePayments.
 *
 * Some API responses expose `status`; others expose `paymentStatus`.
 * Prefer `status` when available, and fall back to `paymentStatus`.
 * Unknown or missing statuses remain unresolved and must not be treated
 * as verified.
 */
const getPaymentStatus = (payment: AdvertisementPayment): string => {
  const paymentWithOptionalStatus = payment as AdvertisementPayment & {
    paymentStatus?: unknown;
  };

  const status =
    paymentWithOptionalStatus.status ?? paymentWithOptionalStatus.paymentStatus;

  return typeof status === "string" && status.trim() !== ""
    ? status.trim().toUpperCase()
    : "UNKNOWN";
};

const isActiveFinancialApproval = (
  approval: AdvertisementFinancialApproval,
): boolean => approval.revokedAt == null;

const getApprovedCreditExceptionCoverage = (
  approvals: AdvertisementFinancialApproval[],
): number => {
  return approvals
    .filter(
      (approval) =>
        isActiveFinancialApproval(approval) &&
        approval.approvalType === "CREDIT_EXCEPTION" &&
        approval.status === "APPROVED",
    )
    .reduce((total, approval) => {
      const amount =
        parseNullableNumber(approval.approvedAmount) ??
        parseNullableNumber(approval.requestedAmount);

      return amount !== null && amount > 0 ? total + amount : total;
    }, 0);
};

const getPricingReadiness = (
  advertisement: AdvertisementListItem,
  context?: PlacementCreativeReadinessContext,
): WorkspacePricingStatus => {
  if (advertisement.isHouseAd === true) {
    return {
      state: "READY",
      label: "House advertisement — not applicable",
      description:
        "Paid pricing, payment settlement and credit coverage are not required for house inventory.",
    };
  }
  const commercialStatus = getPricingStatus(advertisement);

  if (commercialStatus.state !== "READY") {
    return commercialStatus;
  }

  /*
   * Compatibility for existing callers that do not provide payment
   * verification context.
   */
  if (!context || context.paymentVerificationStatus === undefined) {
    return commercialStatus;
  }

  if (context.pricingReadinessVerificationStatus === "LOADING") {
    return {
      state: "REQUIRES_VERIFICATION",
      label: "Checking payment and credit coverage",
      description:
        "Payment records, the outstanding balance, and approved Credit Exception coverage are being verified.",
    };
  }

  if (context.pricingReadinessVerificationStatus === "ERROR") {
    return {
      state: "REQUIRES_VERIFICATION",
      label: "Payment and credit coverage unavailable",
      description:
        "Payment records or approved Credit Exception coverage could not be verified. Refresh the workspace before approval.",
    };
  }

  if (context.paymentVerificationStatus === "LOADING") {
    return {
      state: "REQUIRES_VERIFICATION",
      label: "Payment verification required",
      description:
        "Commercial amounts are configured, but payment records and the outstanding balance are still being verified.",
    };
  }

  if (
    context.paymentVerificationStatus === "ERROR" ||
    context.payments == null ||
    context.paymentSummary == null
  ) {
    return {
      state: "REQUIRES_VERIFICATION",
      label: "Payment records unavailable",
      description:
        "Payment records or the authoritative backend payment summary could not be verified. Refresh the workspace and try again.",
    };
  }

  const activePayments = context.payments.filter((payment) => {
    const status = getPaymentStatus(payment);
    return status !== "CANCELLED" && status !== "REFUNDED";
  });

  if (
    activePayments.some((payment) => getPaymentStatus(payment) !== "VERIFIED")
  ) {
    return {
      state: "REQUIRES_VERIFICATION",
      label: "Payment verification required",
      description:
        "At least one active payment record is not verified. Resolve pending or unverified payment records before considering payment readiness complete.",
    };
  }

  const rawOutstandingAmount = context.paymentSummary.outstandingAmount;
  const outstandingAmount =
    rawOutstandingAmount === null ||
    rawOutstandingAmount === undefined ||
    rawOutstandingAmount === ""
      ? Number.NaN
      : Number(rawOutstandingAmount);

  if (!Number.isFinite(outstandingAmount)) {
    return {
      state: "REQUIRES_VERIFICATION",
      label: "Outstanding balance unavailable",
      description:
        "The backend did not return a valid outstanding balance. Refresh the payment summary before approval.",
    };
  }

  const hasVerifiedPayment = activePayments.some(
    (payment) => getPaymentStatus(payment) === "VERIFIED",
  );

  /*
   * A Credit Exception authorizes deferred payment. It is never counted
   * as money received. Only active, approved exceptions provide coverage.
   */
  if (outstandingAmount > 0) {
    if (context.financialApprovalVerificationStatus === "LOADING") {
      return {
        state: "REQUIRES_VERIFICATION",
        label: "Credit exception verification required",
        description:
          "An outstanding balance remains. Approved Credit Exception coverage is still being verified.",
      };
    }

    if (
      context.financialApprovalVerificationStatus === "ERROR" ||
      context.financialApprovals == null
    ) {
      return {
        state: "REQUIRES_VERIFICATION",
        label: "Credit exception coverage unavailable",
        description:
          "An outstanding balance remains, but approved Credit Exception coverage could not be verified. Refresh the workspace before approval.",
      };
    }

    const coverage = getApprovedCreditExceptionCoverage(
      context.financialApprovals,
    );

    if (coverage >= outstandingAmount) {
      return {
        state: "READY",
        label: "Outstanding balance covered by credit exception",
        description: `The outstanding balance of ${outstandingAmount.toLocaleString(
          "en-IN",
          { maximumFractionDigits: 2 },
        )} is covered by approved Credit Exception(s) totalling ${coverage.toLocaleString(
          "en-IN",
          { maximumFractionDigits: 2 },
        )}. This is approved credit coverage, not a payment receipt. Record and verify payment only when money is actually received.`,
      };
    }

    if (coverage > 0) {
      const uncoveredAmount = outstandingAmount - coverage;

      return {
        state: "REQUIRES_VERIFICATION",
        label: "Outstanding balance partly covered",
        description: `Approved Credit Exception coverage is insufficient. ${uncoveredAmount.toLocaleString(
          "en-IN",
          { maximumFractionDigits: 2 },
        )} remains uncovered. Resolve the remaining balance or obtain additional approval.`,
      };
    }

    if (activePayments.length === 0) {
      return {
        state: "MISSING",
        label: "Payment or credit authorization required",
        description:
          "An outstanding balance remains, with no active payment record and no approved Credit Exception covering the balance.",
      };
    }

    return {
      state: "REQUIRES_VERIFICATION",
      label: "Outstanding balance due",
      description: hasVerifiedPayment
        ? "Payment records have been verified, but the backend still reports an outstanding balance. Settle the balance or obtain sufficient approved Credit Exception coverage."
        : "An outstanding balance remains. Verify the payment records and reconcile the authoritative backend summary.",
    };
  }

  if (outstandingAmount < 0) {
    return {
      state: "REQUIRES_VERIFICATION",
      label: "Payment balance needs review",
      description:
        "The backend summary reports a negative outstanding balance. Reconcile payment and refund records before approval.",
    };
  }

  if (!hasVerifiedPayment && activePayments.length > 0) {
    return {
      state: "REQUIRES_VERIFICATION",
      label: "Payment reconciliation required",
      description:
        "The backend reports no outstanding balance, but there is no verified payment record confirming settlement. Reconcile the payment summary before approval.",
    };
  }

  return {
    state: "READY",
    label: hasVerifiedPayment
      ? "Payments verified and settled"
      : "No outstanding balance",
    description: hasVerifiedPayment
      ? "Commercial amounts are configured, active payment records are verified, and the backend-confirmed outstanding balance is zero."
      : "The backend-confirmed outstanding balance is zero. No payment receipt is inferred from a Credit Exception or an advance configuration.",
  };
};

/**
 * Evaluates persisted financial approval records.
 *
 * A financial approval request is not required merely because an
 * advertisement has a discount or an outstanding balance. Applicable
 * backend threshold rules determine whether a separate request is required.
 *
 * Unresolved requests block final approval. Revoked requests are excluded.
 * Payment settlement and Credit Exception coverage are evaluated separately.
 */
const getFinancialApprovalReadiness = (
  context?: PlacementCreativeReadinessContext,
): ReadinessItem => {
  if (!context) {
    return {
      label: "Financial Approval",
      description:
        "Financial approval records have not been verified. Refresh the workspace before final approval.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  const verificationStatus = context.financialApprovalVerificationStatus;

  if (verificationStatus === "LOADING") {
    return {
      label: "Financial Approval",
      description:
        "Financial approval requests and their current decisions are still being verified.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (verificationStatus === "ERROR") {
    return {
      label: "Financial Approval",
      description:
        "Financial approval records could not be loaded. Refresh the workspace before final approval.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  if (context.financialApprovals == null) {
    return {
      label: "Financial Approval",
      description:
        "The financial approval list is unavailable. The absence of a request cannot be assumed until the records have been loaded successfully.",
      state: "REQUIRES_VERIFICATION",
    };
  }

  const activeApprovals = context.financialApprovals.filter(
    isActiveFinancialApproval,
  );

  const pendingApprovals = activeApprovals.filter(
    (approval) => approval.status === "SUBMITTED" || approval.status === "HOLD",
  );

  if (pendingApprovals.length > 0) {
    const types = [
      ...new Set(
        pendingApprovals.map((approval) =>
          approval.approvalType.replace(/_/g, " "),
        ),
      ),
    ];

    return {
      label: "Financial Approval",
      description: `There ${
        pendingApprovals.length === 1 ? "is" : "are"
      } ${pendingApprovals.length} unresolved financial approval request${
        pendingApprovals.length === 1 ? "" : "s"
      } (${types.join(
        ", ",
      )}). Approve, reject, or otherwise resolve the pending request${
        pendingApprovals.length === 1 ? "" : "s"
      } before final advertisement approval.`,
      state: "REQUIRES_VERIFICATION",
    };
  }

  // Rejected requests are historical decisions, not unresolved requests.
  // They remain available in the Financial Approval workspace for audit.
  // A rejected request must not independently block advertisement approval.
  // Current commercial eligibility, thresholds, and payment coverage are
  // checked by their respective readiness rules and backend validation.
  return {
    label: "Financial Approval",
    description:
      activeApprovals.length > 0
        ? "No financial approval request is pending or on hold. Rejected requests remain in audit history and do not independently block approval. Current commercial thresholds and payment eligibility must still pass their own validations."
        : "Financial approval records have been verified. No unresolved financial approval request exists; a separate request is not required merely because a discount or outstanding balance exists.",
    state: "READY",
  };
};

export const buildReadiness = (
  advertisement: AdvertisementListItem,
  context?: PlacementCreativeReadinessContext,
): ReadinessItem[] => {
  const isHouseAd = advertisement.isHouseAd === true;
  const hasClient = isHouseAd || Boolean(advertisement.clientId);
  const hasName = Boolean(advertisement.name?.trim());
  const hasSchedule = Boolean(advertisement.startAt && advertisement.endAt);

  const pricingStatus = getPricingReadiness(advertisement, context);
  const advanceStatus = getAdvanceStatus(advertisement);

  return [
    {
      label: "Client",
      description: isHouseAd
        ? "Not applicable: this is an in-house advertisement and requires no external client."
        : hasClient
          ? "A client is associated with this advertisement."
          : "A client must be selected before submission.",
      state: hasClient ? "READY" : "MISSING",
    },
    {
      label: "Advertisement Details",
      description: hasName
        ? "Core advertisement details are available."
        : "Advertisement name and required details are incomplete.",
      state: hasName ? "READY" : "MISSING",
    },
    getPlacementReadiness(context),
    getCreativeReadiness(context),
    getTargetingReadiness(context),
    {
      label: "Pricing",
      description: pricingStatus.description,
      state: pricingStatus.state,
    },
    {
      label: "Advance Amount",
      description: advanceStatus.description,
      state: advanceStatus.state,
    },
    getRotationReadiness(context),
    {
      label: "Schedule",
      description: hasSchedule
        ? "Start and end dates are available."
        : "A valid campaign schedule is required.",
      state: hasSchedule ? "READY" : "MISSING",
    },
    isHouseAd
      ? {
          label: "Financial Approval",
          state: "READY",
          description:
            "Not applicable: house inventory has no customer financial approval requirement.",
        }
      : getFinancialApprovalReadiness(context),
  ];
};

export const formatWorkflowStatus = (
  status: AdvertisementWorkflowStatus,
): string =>
  status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const getApprovalMessage = (
  status: AdvertisementWorkflowStatus,
): string => {
  switch (status) {
    case "DRAFT":
      return "Submit the advertisement for review before final approval.";

    case "SUBMITTED":
      return "Complete any outstanding readiness checks before final approval.";

    case "APPROVED":
      return "The advertisement has received final advertisement approval.";

    case "REJECTED":
      return "The advertisement was rejected. Review the decision and follow the permitted resubmission workflow.";

    case "ON_HOLD":
      return "The advertisement is on hold. Resolve the hold before proceeding with delivery.";

    case "ARCHIVED":
      return "The advertisement is archived and is not eligible for normal delivery.";

    default:
      return "Refresh the workspace to verify the advertisement workflow status.";
  }
};
