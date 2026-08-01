/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Divider
 * File        : Divider.types.ts
 * Description : Divider component type definitions.
 * Author      : TheNewsTime Team
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import type { HTMLAttributes, ReactNode } from "react";

export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;

  /**
   * Optional label displayed in the center.
   */
  label?: ReactNode;

  /**
   * Margin on block axis.
   */
  spacing?: "none" | "sm" | "md" | "lg";

  className?: string;
}
