/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Utilities
 * File       : formatDate.ts
 * Description: Shared date formatting helper.
 * Version    : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { format, isValid } from "date-fns";

export function formatDate(
  date: Date | string,
  pattern = "dd MMM yyyy",
  fallback = "-",
): string {
  const value = typeof date === "string" ? new Date(date) : date;

  if (!isValid(value)) {
    return fallback;
  }

  return format(value, pattern);
}
