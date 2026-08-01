/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Button
 * File        : Button.types.ts
 * Description : Button component type definitions.
 * Author      : TheNewsTime Team
 * Version     : 1.1.0
 * -----------------------------------------------------------------------------
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "./Button.variants";

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;

  leftIcon?: ReactNode;

  rightIcon?: ReactNode;

  loading?: boolean;

  loadingText?: string;
}
