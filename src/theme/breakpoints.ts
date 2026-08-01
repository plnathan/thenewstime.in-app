/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Theme
 * File       : breakpoints.ts
 * Version    : 1.0.0
 * Author     : TheNewsTime UI Framework
 * -----------------------------------------------------------------------------
 */

export const BREAKPOINTS = Object.freeze({
  mobile: 0,

  tablet: 640,

  laptop: 1024,

  desktop: 1280,

  wide: 1536,
} as const);

export type Breakpoint = keyof typeof BREAKPOINTS;
