import apiClient from "@/api/axios";

const API_BASE_URL = "/advertisements";

export type AdvertisementCreativeType = "IMAGE" | "VIDEO" | "HTML" | "TEXT";

export type AdvertisementCreativeStatus = "ACTIVE" | "INACTIVE";

export type AdvertisementCreativeVariant = "DESKTOP" | "MOBILE";

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
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateAdvertisementCreativeInput {
  formatId?: number | null;
  creativeType: AdvertisementCreativeType;
  variant?: AdvertisementCreativeVariant;
  title?: string | null;
  altText?: string | null;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  widthPx?: number | null;
  heightPx?: number | null;
  displayOrder?: number;
  isPrimary?: boolean;
  status?: AdvertisementCreativeStatus;
}

export interface UpdateAdvertisementCreativeInput {
  formatId?: number | null;
  creativeType?: AdvertisementCreativeType;
  variant?: AdvertisementCreativeVariant;
  title?: string | null;
  altText?: string | null;
  mediaUrl?: string;
  thumbnailUrl?: string | null;
  widthPx?: number | null;
  heightPx?: number | null;
  displayOrder?: number;
  isPrimary?: boolean;
  status?: AdvertisementCreativeStatus;
}

export interface AdvertisementCreativeDimensions {
  widthPx: number | null;
  heightPx: number | null;
  aspectRatio: number | null;
}

export interface AdvertisementCreativePreview {
  creativeId: number;
  advertisementId: number;
  formatId: number | null;
  creativeType: AdvertisementCreativeType;
  variant: AdvertisementCreativeVariant;
  previewUrl: string;
  thumbnailUrl: string | null;
  expected: AdvertisementCreativeDimensions;
  actual: AdvertisementCreativeDimensions;
  status: AdvertisementCreativePreviewStatus;
  statusMessage: string;
  renderMode: AdvertisementCreativeRenderMode;
  usesDesktopFallback: boolean;
}

export interface AdvertisementCreativePreviewResponse {
  desktop: AdvertisementCreativePreview | null;
  mobile: AdvertisementCreativePreview | null;
}

type UnknownRecord = Record<string, unknown>;

const getAdvertisementCreativesUrl = (advertisementId: number): string =>
  `${API_BASE_URL}/${advertisementId}/creatives`;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCreativeRecord = (value: unknown): value is AdvertisementCreative => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (typeof value.id === "number" || typeof value.id === "string") &&
    (typeof value.advertisementId === "number" ||
      typeof value.advertisementId === "string") &&
    typeof value.mediaUrl === "string" &&
    typeof value.creativeType === "string" &&
    typeof value.variant === "string"
  );
};

const isPreviewRecord = (
  value: unknown,
): value is AdvertisementCreativePreview => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (typeof value.creativeId === "number" ||
      typeof value.creativeId === "string") &&
    typeof value.previewUrl === "string" &&
    isRecord(value.expected) &&
    isRecord(value.actual)
  );
};

const unwrapPayload = (payload: unknown): unknown => {
  let current = payload;

  const envelopeKeys = ["data", "result", "payload", "response"] as const;

  for (let depth = 0; depth < 8; depth += 1) {
    if (!isRecord(current)) {
      return current;
    }

    let unwrapped = false;

    for (const key of envelopeKeys) {
      if (key in current && current[key] !== undefined) {
        current = current[key];
        unwrapped = true;
        break;
      }
    }

    if (!unwrapped) {
      return current;
    }
  }

  return current;
};

const findCreativeArray = (payload: unknown, depth = 0): unknown[] | null => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload) || depth >= 8) {
    return null;
  }

  const collectionKeys = [
    "creatives",
    "advertisementCreatives",
    "items",
    "records",
    "rows",
    "results",
    "list",
  ] as const;

  for (const key of collectionKeys) {
    const candidate = payload[key];

    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  const envelopeKeys = ["data", "result", "payload", "response"] as const;

  for (const key of envelopeKeys) {
    const candidate = payload[key];

    if (candidate !== undefined) {
      const result = findCreativeArray(candidate, depth + 1);

      if (result !== null) {
        return result;
      }
    }
  }

  return null;
};

const normalizeCreativeList = (payload: unknown): AdvertisementCreative[] => {
  const unwrapped = unwrapPayload(payload);
  const creatives = findCreativeArray(unwrapped);

  if (creatives === null) {
    const responseDescription = isRecord(unwrapped)
      ? Object.keys(unwrapped).join(", ")
      : unwrapped === null
        ? "null"
        : Array.isArray(unwrapped)
          ? "array"
          : typeof unwrapped;

    throw new Error(
      "The creative API returned an unexpected response. " +
        `Expected a creative array but received: ${responseDescription}.`,
    );
  }

  if (!creatives.every(isCreativeRecord)) {
    throw new Error(
      "The creative API returned a list containing invalid creative records. " +
        "Verify the field names returned by the backend.",
    );
  }

  return creatives as AdvertisementCreative[];
};

const normalizePreviewResponse = (
  payload: unknown,
): AdvertisementCreativePreviewResponse => {
  let current = payload;

  for (let depth = 0; depth < 8; depth += 1) {
    if (!isRecord(current)) {
      break;
    }

    if ("desktop" in current || "mobile" in current) {
      const normalizePreview = (
        value: unknown,
      ): AdvertisementCreativePreview | null => {
        if (value === null || value === undefined) {
          return null;
        }

        return isPreviewRecord(value)
          ? (value as AdvertisementCreativePreview)
          : null;
      };

      return {
        desktop: normalizePreview(current.desktop),
        mobile: normalizePreview(current.mobile),
      };
    }

    const wrapperKeys = [
      "data",
      "result",
      "payload",
      "response",
      "preview",
      "previews",
    ] as const;

    let unwrapped = false;

    for (const key of wrapperKeys) {
      if (key in current && current[key] !== undefined) {
        current = current[key];
        unwrapped = true;
        break;
      }
    }

    if (!unwrapped) {
      break;
    }
  }

  const responseDescription = isRecord(current)
    ? Object.keys(current).join(", ")
    : current === null
      ? "null"
      : Array.isArray(current)
        ? "array"
        : typeof current;

  throw new Error(
    "The creative preview API returned an unexpected response. " +
      `Received: ${responseDescription}.`,
  );
};

const normalizeSingleCreative = (payload: unknown): AdvertisementCreative => {
  const unwrapped = unwrapPayload(payload);

  if (!isCreativeRecord(unwrapped)) {
    throw new Error("The creative API did not return a valid creative record.");
  }

  return unwrapped as AdvertisementCreative;
};

const normalizeSinglePreview = (
  payload: unknown,
): AdvertisementCreativePreview => {
  const unwrapped = unwrapPayload(payload);

  if (!isPreviewRecord(unwrapped)) {
    throw new Error(
      "The creative preview API did not return a valid preview record.",
    );
  }

  return unwrapped as AdvertisementCreativePreview;
};

export const getAdvertisementCreatives = async (
  advertisementId: number,
): Promise<AdvertisementCreative[]> => {
  const response = await apiClient.get<unknown>(
    getAdvertisementCreativesUrl(advertisementId),
  );

  return normalizeCreativeList(response.data);
};

export const getAdvertisementCreativeById = async (
  advertisementId: number,
  creativeId: number,
): Promise<AdvertisementCreative> => {
  const response = await apiClient.get<unknown>(
    `${getAdvertisementCreativesUrl(advertisementId)}/${creativeId}`,
  );

  return normalizeSingleCreative(response.data);
};

export const getAdvertisementCreativePreviews = async (
  advertisementId: number,
): Promise<AdvertisementCreativePreviewResponse> => {
  const response = await apiClient.get<unknown>(
    `${getAdvertisementCreativesUrl(advertisementId)}/preview`,
  );

  return normalizePreviewResponse(response.data);
};

export const getAdvertisementCreativePreview = async (
  advertisementId: number,
  creativeId: number,
): Promise<AdvertisementCreativePreview> => {
  const response = await apiClient.get<unknown>(
    `${getAdvertisementCreativesUrl(advertisementId)}/${creativeId}/preview`,
  );

  return normalizeSinglePreview(response.data);
};

export const createAdvertisementCreative = async (
  advertisementId: number,
  input: CreateAdvertisementCreativeInput,
): Promise<AdvertisementCreative> => {
  const response = await apiClient.post<unknown>(
    getAdvertisementCreativesUrl(advertisementId),
    input,
  );

  return normalizeSingleCreative(response.data);
};

export const updateAdvertisementCreative = async (
  advertisementId: number,
  creativeId: number,
  input: UpdateAdvertisementCreativeInput,
): Promise<AdvertisementCreative> => {
  const response = await apiClient.patch<unknown>(
    `${getAdvertisementCreativesUrl(advertisementId)}/${creativeId}`,
    input,
  );

  return normalizeSingleCreative(response.data);
};

export const deactivateAdvertisementCreative = async (
  advertisementId: number,
  creativeId: number,
): Promise<AdvertisementCreative> => {
  const response = await apiClient.delete<unknown>(
    `${getAdvertisementCreativesUrl(advertisementId)}/${creativeId}`,
  );

  return normalizeSingleCreative(response.data);
};

/** Changes delivery eligibility of a logical desktop/mobile slide. */
export const setCreativeDeliveryEnabled = async (
  advertisementId: number,
  creativeId: number,
  enabled: boolean,
): Promise<void> => {
  await apiClient.patch(
    `${getAdvertisementCreativesUrl(advertisementId)}/${creativeId}/delivery-status`,
    { enabled },
  );
};
