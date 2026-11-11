import type { ChangeEvent, RefObject } from "react";

export type AdvertisementCreativeType = "IMAGE" | "VIDEO" | "HTML" | "TEXT";

export type AdvertisementCreativeVariant = "DESKTOP" | "MOBILE";

export type AdvertisementCreativeStatus = "ACTIVE" | "INACTIVE";

export type AdvertisementCreativePreviewStatus =
  | "EXACT_MATCH"
  | "SLIGHTLY_DIFFERENT"
  | "DIMENSION_MISMATCH"
  | "ASPECT_RATIO_MISMATCH"
  | "DIMENSIONS_NOT_AVAILABLE"
  | "NO_EXPECTED_DIMENSIONS";

export type AdvertisementCreativeRenderMode =
  | "CONTAIN"
  | "NATIVE"
  | "FALLBACK_DESKTOP";

export type CreativeDimensionStatus =
  | "NOT_AVAILABLE"
  | "MATCH"
  | "CLOSE"
  | "MISMATCH";

export interface AdvertisementCreative {
  id: number;
  advertisementId: number;
  formatId: number | null;
  creativeType: AdvertisementCreativeType;
  variant: AdvertisementCreativeVariant;
  title: string | null;
  altText: string | null;
  mediaUrl: string;
  thumbnailUrl: string | null;
  widthPx: number | null;
  heightPx: number | null;
  displayOrder: number;
  isPrimary: boolean;
  status: AdvertisementCreativeStatus;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdvertisementCreativeInput {
  formatId?: number | null | undefined;
  creativeType: AdvertisementCreativeType;
  variant?: AdvertisementCreativeVariant | undefined;
  title?: string | null | undefined;
  altText?: string | null | undefined;
  mediaUrl: string;
  thumbnailUrl?: string | null | undefined;
  widthPx?: number | null | undefined;
  heightPx?: number | null | undefined;
  displayOrder?: number | undefined;
  isPrimary?: boolean | undefined;
  status?: AdvertisementCreativeStatus | undefined;
}

export interface UpdateAdvertisementCreativeInput {
  formatId?: number | null | undefined;
  creativeType?: AdvertisementCreativeType | undefined;
  variant?: AdvertisementCreativeVariant | undefined;
  title?: string | null | undefined;
  altText?: string | null | undefined;
  mediaUrl?: string | undefined;
  thumbnailUrl?: string | null | undefined;
  widthPx?: number | null | undefined;
  heightPx?: number | null | undefined;
  displayOrder?: number | undefined;
  isPrimary?: boolean | undefined;
  status?: AdvertisementCreativeStatus | undefined;
}

/**
 * Placement format information used by the Advertisement Create
 * workflow.
 *
 * Desktop dimensions are represented by widthPx/heightPx.
 * Mobile dimensions are represented separately because a responsive
 * placement format may define different Desktop and Mobile targets.
 */
export interface AdvertisementCreativePlacementFormat {
  id: number;
  code: string | null;
  displayName: string | null;

  widthPx: number | null;
  heightPx: number | null;

  mobileWidthPx?: number | null | undefined;
  mobileHeightPx?: number | null | undefined;

  isResponsive: boolean;
}

export interface AdvertisementCreativeItem {
  id: string;
  creativeType: AdvertisementCreativeType;
  variant: AdvertisementCreativeVariant;
  title: string;
  altText: string;
  mediaUrl: string;
  fileName: string;
  fileSizeBytes: number | null;
  mimeType: string | null;
  widthPx: number | null;
  heightPx: number | null;
  isPrimary: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface AdvertisementCreativeValue {
  creatives: AdvertisementCreativeItem[];
}

export interface AdvertisementCreativeProps {
  value: AdvertisementCreativeValue;
  onChange: (value: AdvertisementCreativeValue) => void;
  placementFormat: AdvertisementCreativePlacementFormat | null;
  placementName?: string;
}

export interface CreativeFormState {
  creativeType: AdvertisementCreativeType;
  variant: AdvertisementCreativeVariant;
  title: string;
  altText: string;
  mediaUrl: string;
  fileName: string;
  fileSizeBytes: number | null;
  mimeType: string | null;
  widthPx: string;
  heightPx: string;
  isPrimary: boolean;
}

export interface CreativeDimensionComparison {
  status: CreativeDimensionStatus;
  widthDifference: number | null;
  heightDifference: number | null;
  expectedWidthPx: number | null;
  expectedHeightPx: number | null;
  actualWidthPx: number | null;
  actualHeightPx: number | null;
  message: string;
}

export interface CreativeFormProps {
  form: CreativeFormState;
  placementFormat: AdvertisementCreativePlacementFormat | null;
  editingCreativeId: string | null;
  error: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  currentDimensionComparison: CreativeDimensionComparison;
  onTypeChange: (creativeType: AdvertisementCreativeType) => void;
  onVariantChange: (variant: AdvertisementCreativeVariant) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFieldChange: (
    field: keyof CreativeFormState,
    value: string | boolean,
  ) => void;
  onReset: () => void;
  onSave: () => void;
}

export interface CreativeTypeSelectorProps {
  value: AdvertisementCreativeType;
  onChange: (creativeType: AdvertisementCreativeType) => void;
}

export interface CreativeVariantSelectorProps {
  value: AdvertisementCreativeVariant;
  onChange: (variant: AdvertisementCreativeVariant) => void;
}

export interface CreativeContentEditorProps {
  form: CreativeFormState;
  placementFormat: AdvertisementCreativePlacementFormat | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFieldChange: (
    field: keyof CreativeFormState,
    value: string | boolean,
  ) => void;
}

export interface CreativeDimensionGuidanceProps {
  placementFormat: AdvertisementCreativePlacementFormat | null;
  variant?: AdvertisementCreativeVariant;
}

export interface CreativeDimensionStatusProps {
  comparison: CreativeDimensionComparison;
}

export interface CreativeListProps {
  creatives: AdvertisementCreativeItem[];
  placementFormat: AdvertisementCreativePlacementFormat | null;
  editingCreativeId: string | null;
  onEdit: (creative: AdvertisementCreativeItem) => void;
  onDelete: (creativeId: string) => void;
  onSetPrimary: (creativeId: string) => void;
}

export interface CreativeListItemProps {
  creative: AdvertisementCreativeItem;
  placementFormat: AdvertisementCreativePlacementFormat | null;
  editingCreativeId: string | null;
  onEdit: (creative: AdvertisementCreativeItem) => void;
  onDelete: (creativeId: string) => void;
  onSetPrimary: (creativeId: string) => void;
}

export interface CreativePreviewProps {
  variant: AdvertisementCreativeVariant;
  creativeType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  title: string;
  altText: string;
  actualWidthPx: number | null;
  actualHeightPx: number | null;
  expectedWidthPx: number | null;
  expectedHeightPx: number | null;
  placementName: string;
  status: CreativeDimensionStatus;
  statusMessage: string;
}

export type CreativeDimensionPreviewStatus = CreativeDimensionStatus;

export interface CreativeValidationResult {
  isValid: boolean;
  message: string | null;
  invalidCreativeId: string | null;
}
