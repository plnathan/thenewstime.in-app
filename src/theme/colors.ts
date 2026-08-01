/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Theme
 * File       : colors.ts
 * Version    : 1.0.0
 * Author     : TheNewsTime UI Framework
 * -----------------------------------------------------------------------------
 */

export const COLORS = Object.freeze({
  primary: "#0F8A4B",
  primaryDark: "#0B6D3A",
  primaryLight: "#EAF7F0",

  breaking: "#D62828",
  breakingLight: "#FDECEC",

  accent: "#F4B400",

  success: "#16A34A",
  warning: "#F59E0B",
  error: "#DC2626",
  info: "#2563EB",

  text: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#6B7280",
  textInverse: "#FFFFFF",

  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceAlt: "#F9FAFB",

  border: "#E5E7EB",
  borderLight: "#F3F4F6",

  overlay: "rgba(17, 24, 39, 0.45)",

  transparent: "transparent",
} as const);

export type ColorName = keyof typeof COLORS;
