/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Device Utilities
 * File       : device.ts
 * Description: Responsive device helpers.
 * Version    : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { BREAKPOINTS } from "@/theme";

export function isMobile(width: number): boolean {
  return width < BREAKPOINTS.tablet;
}

export function isTablet(width: number): boolean {
  return width >= BREAKPOINTS.tablet && width < BREAKPOINTS.laptop;
}

export function isLaptop(width: number): boolean {
  return width >= BREAKPOINTS.laptop && width < BREAKPOINTS.desktop;
}

export function isDesktop(width: number): boolean {
  return width >= BREAKPOINTS.desktop;
}
