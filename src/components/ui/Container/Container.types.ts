/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Container
 * File        : Container.types.ts
 * Description : Container component type definitions.
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import type { ReactNode } from "react";

export interface ContainerProps {
  children: ReactNode;

  /**
   * Render as HTML element
   * Default: div
   */
  as?: keyof React.JSX.IntrinsicElements;

  /**
   * Remove horizontal padding
   */
  fluid?: boolean;

  /**
   * Maximum width
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";

  className?: string;
}
