/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Theme
 * File       : radius.ts
 * Description: Border radius design tokens.
 * Version    : 1.0.0
 * -----------------------------------------------------------------------------
 */

export const RADIUS = Object.freeze({
  none: "0",

  xs: "2px",

  sm: "4px",

  md: "8px",

  lg: "12px",

  xl: "16px",

  "2xl": "24px",

  full: "9999px",
} as const);

export type RadiusName = keyof typeof RADIUS;
