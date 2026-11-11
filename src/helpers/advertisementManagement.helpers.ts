import type {
  AdvertisementListItem,
  AdvertisementWorkflowStatus,
} from "@/api/advertisements/advertisement.api";

export const DEFAULT_PAGE_SIZE = 10;

export const EMPTY_OVERVIEW = {
  draft: 0,
  pendingApproval: 0,
  active: 0,
  completed: 0,
};

export const EMPTY_PAGINATION = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalRecords: 0,
};

export const formatDate = (value: string | null): string => {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not scheduled";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value: string | null): string => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getWorkflowStatus = (
  advertisement: AdvertisementListItem,
): AdvertisementWorkflowStatus => {
  const value = advertisement.workflowStatus?.trim().toUpperCase();

  if (
    value === "DRAFT" ||
    value === "SUBMITTED" ||
    value === "APPROVED" ||
    value === "REJECTED" ||
    value === "ON_HOLD" ||
    value === "ARCHIVED"
  ) {
    return value;
  }

  return "DRAFT";
};

export const getApiErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      response?: {
        data?: {
          message?: unknown;
        };
      };
      message?: unknown;
    };

    const responseMessage = candidate.response?.data?.message;

    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }
  }

  return "We couldn't load advertisements. Please try again.";
};

export const getTotalPages = (pagination: {
  totalRecords: number;
  pageSize: number;
}): number => {
  if (pagination.totalRecords <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(pagination.totalRecords / pagination.pageSize));
};

export const getVisiblePageNumbers = (
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> => {
  if (totalPages <= 7) {
    return Array.from(
      {
        length: totalPages,
      },
      (_, index) => index + 1,
    );
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
};
