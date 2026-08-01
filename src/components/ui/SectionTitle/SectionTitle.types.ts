/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : SectionTitle
 * File        : SectionTitle.types.ts
 * Description : Section title component.
 * Author      : TheNewsTime Team
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import type { HTMLAttributes, ReactNode } from "react";

export interface SectionTitleProps extends HTMLAttributes<HTMLDivElement> {
  title: string;

  subtitle?: string;

  icon?: ReactNode;

  actionLabel?: string;

  onActionClick?: () => void;

  className?: string;
}
