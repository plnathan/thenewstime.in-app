/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Theme
 * File       : shadows.ts
 * Description: Shadow design tokens.
 * Version    : 1.0.0
 * -----------------------------------------------------------------------------
 */

export const SHADOWS = Object.freeze({
  none: "none",

  sm: "0 1px 2px rgba(0,0,0,0.05)",

  md: "0 4px 8px rgba(0,0,0,0.08)",

  lg: "0 10px 25px rgba(0,0,0,0.10)",

  drawer: "0 8px 32px rgba(0,0,0,0.15)",

  dropdown: "0 12px 28px rgba(0,0,0,0.12)",
} as const);

export type ShadowName = keyof typeof SHADOWS;
