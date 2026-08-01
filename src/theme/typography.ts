/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Theme
 * File       : typography.ts
 * Version    : 1.0.0
 * Author     : TheNewsTime UI Framework
 * -----------------------------------------------------------------------------
 */

export const TYPOGRAPHY = Object.freeze({
  display: {
    fontSize: "3rem",
    fontWeight: 700,
    lineHeight: 1.15,
  },

  hero: {
    fontSize: "2.5rem",
    fontWeight: 700,
    lineHeight: 1.2,
  },

  pageTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1.25,
  },

  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    lineHeight: 1.35,
  },

  newsTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    lineHeight: 1.45,
  },

  body: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.8,
  },

  summary: {
    fontSize: "0.95rem",
    fontWeight: 400,
    lineHeight: 1.7,
  },

  caption: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.6,
  },

  meta: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: 1.5,
  },
} as const);
