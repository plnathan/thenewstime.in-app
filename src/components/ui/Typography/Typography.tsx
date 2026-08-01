/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Typography
 * File        : Typography.tsx
 * Description : Newspaper typography component.
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { cn } from "@/lib";

import type { TypographyProps, TypographyElement } from "./Typography.types";

const VARIANT_CLASSES = {
  heroTitle: "text-3xl font-bold leading-tight tracking-tight md:text-4xl",

  headline: "text-4xl md:text-5xl font-extrabold tracking-tight leading-tight",

  articleTitle: "text-xl md:text-2xl font-bold leading-snug",

  sectionTitle: "text-2xl font-bold tracking-tight",

  summary: "text-base md:text-lg leading-7 text-gray-600",

  body: "text-base leading-8 text-gray-800",

  caption: "text-sm text-gray-500",

  timestamp: "text-xs uppercase tracking-wide text-gray-500",

  breaking: "text-sm font-bold uppercase tracking-wider text-red-600",
} satisfies Record<string, string>;

export default function Typography({
  as,
  children,
  variant = "body",
  className,
  ...props
}: TypographyProps) {
  const Component: TypographyElement =
    as ??
    (variant === "headline"
      ? "h1"
      : variant === "articleTitle"
        ? "h2"
        : variant === "sectionTitle"
          ? "h3"
          : "p");

  return (
    <Component className={cn(VARIANT_CLASSES[variant], className)} {...props}>
      {children}
    </Component>
  );
}
