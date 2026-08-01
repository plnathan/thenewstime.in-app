/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Typography
 * File        : Typography.types.ts
 * Description : Typography component type definitions.
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import type { HTMLAttributes, ReactNode } from "react";

export type TypographyElement =
  | "p"
  | "span"
  | "div"
  | "label"
  | "small"
  | "strong"
  | "em"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

export type TypographyVariant =
  | "heroTitle"
  | "headline"
  | "articleTitle"
  | "sectionTitle"
  | "summary"
  | "body"
  | "caption"
  | "timestamp"
  | "breaking";

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;

  variant?: TypographyVariant;

  as?: TypographyElement;

  className?: string;
}
