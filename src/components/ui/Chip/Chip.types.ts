/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Chip
 * File        : Chip.types.ts
 * Description : Chip component type definitions.
 * Author      : TheNewsTime Team
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";

import { chipVariants } from "./Chip.variants";

export interface ChipProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  children: ReactNode;

  selected?: boolean;

  leftIcon?: ReactNode;

  rightIcon?: ReactNode;
}
