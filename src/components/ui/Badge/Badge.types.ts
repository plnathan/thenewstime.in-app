/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Badge
 * File        : Badge.types.ts
 * Description : Badge component type definitions.
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "breaking"
  | "live"
  | "exclusive"
  | "category"
  | "success"
  | "warning"
  | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  rounded?: boolean;
}
