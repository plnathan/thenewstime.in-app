import { FileCode2, FileImage, FileText, FileVideo } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type {
  AdvertisementCreativeItem,
  AdvertisementCreativePlacementFormat,
  AdvertisementCreativeType,
  AdvertisementCreativeValue,
  AdvertisementCreativeVariant,
  CreativeDimensionComparison,
  CreativeDimensionStatus,
  CreativeFormState,
  CreativeValidationResult,
} from "@/types/creative.types";

export interface PlacementContext {
  position: "TOP" | "BETWEEN" | "CONTENT" | "BOTTOM" | "SIDEBAR" | "MODAL";
  placementLabel: string;
  pageLabel: string;
}

export const DIMENSION_TOLERANCE_PX = 30;

export const createEmptyForm = (): CreativeFormState => ({
  creativeType: "IMAGE",
  variant: "DESKTOP",
  title: "",
  altText: "",
  mediaUrl: "",
  fileName: "",
  fileSizeBytes: null,
  mimeType: null,
  widthPx: "",
  heightPx: "",
  isPrimary: false,
});

export const isObjectUrl = (url: string): boolean => url.startsWith("blob:");

export const getCreativeTypeLabel = (
  creativeType: AdvertisementCreativeType,
): string => {
  switch (creativeType) {
    case "IMAGE":
      return "Image";

    case "VIDEO":
      return "Video";

    case "HTML":
      return "HTML";

    case "TEXT":
      return "Text";

    default:
      return creativeType;
  }
};

export const getVariantLabel = (
  variant: AdvertisementCreativeVariant,
): string => (variant === "DESKTOP" ? "Desktop" : "Mobile");

export const getFileSizeLabel = (size: number | null): string => {
  if (!size) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const getDimensionValue = (value: number | null | undefined): string => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "—";
  }

  return `${value}px`;
};

export const parsePositiveInteger = (
  value: string | number | null | undefined,
): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (
    !Number.isFinite(numericValue) ||
    !Number.isInteger(numericValue) ||
    numericValue <= 0
  ) {
    return null;
  }

  return numericValue;
};

export const getTypeIcon = (
  creativeType: AdvertisementCreativeType,
): LucideIcon => {
  switch (creativeType) {
    case "IMAGE":
      return FileImage;

    case "VIDEO":
      return FileVideo;

    case "HTML":
      return FileCode2;

    case "TEXT":
      return FileText;

    default:
      return FileText;
  }
};

export const getPlacementContext = (
  placementName: string | null | undefined,
): PlacementContext => {
  const rawName = placementName?.trim() ?? "";

  const normalized = rawName.toUpperCase();

  if (normalized.includes("MODAL") || normalized.includes("OVERLAY")) {
    return {
      position: "MODAL",
      placementLabel: rawName || "Modal Advertisement",
      pageLabel: "Page Overlay",
    };
  }

  if (
    normalized.includes("SIDEBAR") ||
    normalized.includes("SIDE_BAR") ||
    normalized.includes("SIDE-BAR")
  ) {
    return {
      position: "SIDEBAR",
      placementLabel: rawName || "Sidebar Advertisement",
      pageLabel: getPlacementPageLabel(normalized),
    };
  }

  if (normalized.includes("TOP") || normalized.includes("HEADER")) {
    return {
      position: "TOP",
      placementLabel: rawName || "Top Advertisement",
      pageLabel: getPlacementPageLabel(normalized),
    };
  }

  if (normalized.includes("BOTTOM") || normalized.includes("FOOTER")) {
    return {
      position: "BOTTOM",
      placementLabel: rawName || "Bottom Advertisement",
      pageLabel: getPlacementPageLabel(normalized),
    };
  }

  if (normalized.includes("BETWEEN") || normalized.includes("INLINE")) {
    return {
      position: "BETWEEN",
      placementLabel: rawName || "Between Content Advertisement",
      pageLabel: getPlacementPageLabel(normalized),
    };
  }

  return {
    position: "CONTENT",
    placementLabel: rawName || "Content Advertisement",
    pageLabel: getPlacementPageLabel(normalized),
  };
};

const getPlacementPageLabel = (normalizedPlacementName: string): string => {
  if (normalizedPlacementName.includes("HOME")) {
    return "Homepage";
  }

  if (
    normalizedPlacementName.includes("NEWS_LIST") ||
    normalizedPlacementName.includes("NEWS LIST") ||
    normalizedPlacementName.includes("LIST")
  ) {
    return "News List";
  }

  if (
    normalizedPlacementName.includes("NEWS_DETAIL") ||
    normalizedPlacementName.includes("NEWS DETAIL") ||
    normalizedPlacementName.includes("DETAIL")
  ) {
    return "News Detail";
  }

  return "News Page";
};

export const getExpectedDimensions = (
  placementFormat: AdvertisementCreativePlacementFormat | null,
  variant: AdvertisementCreativeVariant,
): {
  widthPx: number | null;
  heightPx: number | null;
} => {
  if (!placementFormat) {
    return {
      widthPx: null,
      heightPx: null,
    };
  }

  if (variant === "MOBILE") {
    return {
      widthPx: placementFormat.mobileWidthPx ?? null,
      heightPx: placementFormat.mobileHeightPx ?? null,
    };
  }

  return {
    widthPx: placementFormat.widthPx,
    heightPx: placementFormat.heightPx,
  };
};

export const getDimensionComparison = (
  widthPx: number | null,
  heightPx: number | null,
  placementFormat: AdvertisementCreativePlacementFormat | null,
  variant: AdvertisementCreativeVariant = "DESKTOP",
): CreativeDimensionComparison => {
  const { widthPx: expectedWidthPx, heightPx: expectedHeightPx } =
    getExpectedDimensions(placementFormat, variant);
  const modalFormat = /MODAL/i.test(
    `${placementFormat?.code ?? ""} ${placementFormat?.displayName ?? ""}`,
  );
  if (
    modalFormat &&
    widthPx !== null &&
    heightPx !== null &&
    widthPx > 0 &&
    heightPx > 0
  ) {
    return {
      status: "MATCH",
      widthDifference: null,
      heightDifference: null,
      expectedWidthPx,
      expectedHeightPx,
      actualWidthPx: widthPx,
      actualHeightPx: heightPx,
      message:
        "Modal creative uses its natural proportions; fixed placement dimensions are not required.",
    };
  }

  if (
    !placementFormat ||
    widthPx === null ||
    heightPx === null ||
    expectedWidthPx === null ||
    expectedHeightPx === null
  ) {
    return {
      status: "NOT_AVAILABLE",
      widthDifference: null,
      heightDifference: null,
      expectedWidthPx,
      expectedHeightPx,
      actualWidthPx: widthPx,
      actualHeightPx: heightPx,
      message: !placementFormat
        ? "Placement format dimensions are unavailable. Select a configured placement format before uploading production creative content."
        : variant === "MOBILE"
          ? "Mobile placement format dimensions are unavailable. Configure Mobile dimensions for the selected placement before uploading Mobile creative content."
          : "Desktop placement format dimensions are unavailable. Configure Desktop dimensions for the selected placement before uploading Desktop creative content.",
    };
  }

  const widthDifference = widthPx - expectedWidthPx;

  const heightDifference = heightPx - expectedHeightPx;

  if (widthDifference === 0 && heightDifference === 0) {
    return {
      status: "MATCH",
      widthDifference,
      heightDifference,
      expectedWidthPx,
      expectedHeightPx,
      actualWidthPx: widthPx,
      actualHeightPx: heightPx,
      message: "Creative dimensions exactly match the placement format.",
    };
  }

  // Larger assets are downscaled without upscaling or cropping. The image
  // renderer uses object-contain, preserving PNG transparency and proportions.
  if (
    widthDifference >= -DIMENSION_TOLERANCE_PX &&
    heightDifference >= -DIMENSION_TOLERANCE_PX
  ) {
    return {
      status: "CLOSE",
      widthDifference,
      heightDifference,
      expectedWidthPx,
      expectedHeightPx,
      actualWidthPx: widthPx,
      actualHeightPx: heightPx,
      message:
        "Creative dimensions are accepted (up to 30 px smaller per dimension, or larger). The image will be fitted proportionally without distortion.",
    };
  }
  return {
    status: "MISMATCH",
    widthDifference,
    heightDifference,
    expectedWidthPx,
    expectedHeightPx,
    actualWidthPx: widthPx,
    actualHeightPx: heightPx,
    message:
      "Creative is more than 30 px smaller than the configured placement in width or height.",
  };
};

export const getDimensionStatusLabel = (
  status: CreativeDimensionStatus,
): string => {
  switch (status) {
    case "MATCH":
      return "Dimensions match";

    case "CLOSE":
      return "Small dimension difference";

    case "MISMATCH":
      return "Dimension mismatch";

    case "NOT_AVAILABLE":
    default:
      return "Dimensions unavailable";
  }
};

const parsePositiveDimension = (value: number | null): number | null => {
  if (
    value === null ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
};

export const validateCreativeItem = (
  creative: AdvertisementCreativeItem,
  placementFormat: AdvertisementCreativePlacementFormat | null,
): string | null => {
  if (!creative.title.trim()) {
    return "Creative title is required.";
  }

  if (!creative.mediaUrl.trim()) {
    if (
      creative.creativeType === "IMAGE" ||
      creative.creativeType === "VIDEO"
    ) {
      return `Please select a ${creative.creativeType.toLowerCase()} file.`;
    }

    if (creative.creativeType === "HTML") {
      return "HTML content is required.";
    }

    return "Text content is required.";
  }

  if (creative.creativeType === "IMAGE" || creative.creativeType === "VIDEO") {
    // Previously uploaded Cloudinary media is restored from the API without
    // mimeType (the creative record does not persist that metadata). Its HTTPS
    // URL and stored dimensions are sufficient for draft-step validation;
    // newly selected files are still validated during upload.
    const isSavedRemoteMedia = /^https:\/\/[^\s]+$/i.test(creative.mediaUrl);
    if (
      (!creative.mimeType || !creative.mimeType.trim()) &&
      !isSavedRemoteMedia
    ) {
      return `The ${creative.creativeType.toLowerCase()} file type could not be determined. Please select the file again.`;
    }

    const width = parsePositiveDimension(creative.widthPx);

    const height = parsePositiveDimension(creative.heightPx);

    if (width === null || height === null) {
      return "Creative dimensions could not be detected. Please select the file again.";
    }
  }

  if (creative.creativeType === "HTML" || creative.creativeType === "TEXT") {
    const width = parsePositiveDimension(creative.widthPx);

    const height = parsePositiveDimension(creative.heightPx);

    const desktopConfigured =
      placementFormat?.widthPx !== null && placementFormat?.heightPx !== null;

    const mobileConfigured =
      placementFormat?.mobileWidthPx !== null &&
      placementFormat?.mobileHeightPx !== null;

    if (desktopConfigured || mobileConfigured) {
      if (width === null || height === null) {
        return `Actual width and height are required for ${getCreativeTypeLabel(
          creative.creativeType,
        ).toLowerCase()} creatives for this placement.`;
      }
    } else if (
      (creative.widthPx !== null && width === null) ||
      (creative.heightPx !== null && height === null)
    ) {
      return "Creative width and height must be positive whole numbers.";
    }
  }

  const comparison = getDimensionComparison(
    creative.widthPx,
    creative.heightPx,
    placementFormat,
    creative.variant,
  );

  if (comparison.status === "NOT_AVAILABLE") {
    return comparison.message;
  }

  if (comparison.status === "MISMATCH") {
    return comparison.message;
  }

  return null;
};

export const validateAdvertisementCreatives = (
  value: AdvertisementCreativeValue,
  placementFormat: AdvertisementCreativePlacementFormat | null,
): CreativeValidationResult => {
  if (!placementFormat) {
    return {
      isValid: false,
      message:
        "Placement format dimensions are unavailable. Select a configured placement format before uploading production creative content.",
      invalidCreativeId: null,
    };
  }

  const hasDesktopDimensions =
    placementFormat.widthPx !== null && placementFormat.heightPx !== null;

  const modalFormat = /MODAL/i.test(
    `${placementFormat.code ?? ""} ${placementFormat.displayName ?? ""}`,
  );
  if (!hasDesktopDimensions && !modalFormat) {
    return {
      isValid: false,
      message:
        "Desktop placement format dimensions are unavailable. Configure the selected placement format before continuing.",
      invalidCreativeId: null,
    };
  }

  if (value.creatives.length === 0) {
    return {
      isValid: false,
      message: "Add at least one creative before continuing to Schedule.",
      invalidCreativeId: null,
    };
  }

  for (const creative of value.creatives) {
    const error = validateCreativeItem(creative, placementFormat);

    if (error) {
      return {
        isValid: false,
        message: error,
        invalidCreativeId: creative.id,
      };
    }
  }

  const variants: AdvertisementCreativeVariant[] = Array.from(
    new Set(value.creatives.map((creative) => creative.variant)),
  );

  for (const variant of variants) {
    const variantCreatives = value.creatives.filter(
      (creative) => creative.variant === variant,
    );

    const primaryCreatives = variantCreatives.filter(
      (creative) => creative.isPrimary,
    );

    if (primaryCreatives.length === 0) {
      return {
        isValid: false,
        message: `Select one primary ${getVariantLabel(
          variant,
        ).toLowerCase()} creative before continuing.`,
        invalidCreativeId: variantCreatives[0]?.id ?? null,
      };
    }

    if (primaryCreatives.length > 1) {
      return {
        isValid: false,
        message: `Only one primary ${getVariantLabel(
          variant,
        ).toLowerCase()} creative is allowed.`,
        invalidCreativeId: primaryCreatives[1]?.id ?? null,
      };
    }
  }

  return {
    isValid: true,
    message: null,
    invalidCreativeId: null,
  };
};
