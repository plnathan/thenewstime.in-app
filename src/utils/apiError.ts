import axios from "axios";

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data && typeof data === "object") {
      const responseData = data as {
        message?: unknown;
        error?: unknown;
        details?: unknown;
      };

      for (const value of [
        responseData.message,
        responseData.error,
        responseData.details,
      ]) {
        if (typeof value === "string" && value.trim()) {
          return value;
        }
      }
    }

    return fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
