/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Format Utilities
 * File       : truncate.ts
 * Description: String truncation helper.
 * Version    : 1.0.0
 * -----------------------------------------------------------------------------
 */

export interface TruncateOptions {
  suffix?: string;
  preserveWords?: boolean;
}

const DEFAULT_OPTIONS: Required<TruncateOptions> = {
  suffix: "...",
  preserveWords: true,
};

export function truncate(
  value: string,
  maxLength: number,
  options: TruncateOptions = {},
): string {
  if (!value) {
    return "";
  }

  if (value.length <= maxLength) {
    return value;
  }

  const settings = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  let result = value.slice(0, maxLength);

  if (settings.preserveWords) {
    const lastSpace = result.lastIndexOf(" ");

    if (lastSpace > 0) {
      result = result.slice(0, lastSpace);
    }
  }

  return `${result}${settings.suffix}`;
}
