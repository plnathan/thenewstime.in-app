/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Utilities
 * File       : formatTime.ts
 * Description: Shared time formatting helper.
 * Version    : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { format, isValid } from "date-fns";

export function formatTime(
  date: Date | string,
  pattern = "hh:mm a",
  fallback = "-",
): string {
  const value = typeof date === "string" ? new Date(date) : date;

  if (!isValid(value)) {
    return fallback;
  }

  return format(value, pattern);
}
