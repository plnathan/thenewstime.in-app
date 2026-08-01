/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Surface
 * File        : Surface.types.ts
 * Description : Surface (layout container) component.
 * Author      : TheNewsTime Team
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";

import { surfaceVariants } from "./Surface.variants";

export interface SurfaceProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof surfaceVariants> {
  hoverable?: boolean;

  clickable?: boolean;
}
