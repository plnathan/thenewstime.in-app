/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Badge
 * File        : Badge.tsx
 * Description : Reusable badge component.
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { cn } from "@/lib";

import type { BadgeProps } from "./Badge.types";

const VARIANT_CLASSES = {
  primary: "bg-green-600 text-white",

  secondary: "bg-gray-100 text-gray-700",

  breaking: "bg-red-600 text-white",

  live: "bg-orange-500 text-white",

  exclusive: "bg-purple-700 text-white",

  category: "bg-emerald-50 text-emerald-700 border border-emerald-200",

  success: "bg-green-100 text-green-700",

  warning: "bg-yellow-100 text-yellow-800",

  danger: "bg-red-100 text-red-700",
} satisfies Record<string, string>;

export default function Badge({
  children,
  variant = "primary",
  rounded = true,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "px-2.5 py-1",
        "text-xs font-semibold uppercase tracking-wide",
        rounded ? "rounded-full" : "rounded-md",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
