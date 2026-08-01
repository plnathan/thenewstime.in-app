/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Divider
 * File        : Divider.tsx
 * Description : Reusable divider component.
 * Author      : TheNewsTime Team
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { cn } from "@/lib";

import type { DividerProps } from "./Divider.types";

const SPACING = {
  none: "",
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
} as const;

export default function Divider({
  orientation = "horizontal",
  label,
  spacing = "md",
  className,
  ...props
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        aria-orientation="vertical"
        className={cn("h-full w-px bg-gray-200", className)}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        className={cn("flex items-center", SPACING[spacing], className)}
        {...props}
      >
        <div className="h-px flex-1 bg-gray-200" />

        <span className="px-3 text-sm font-medium text-gray-500">{label}</span>

        <div className="h-px flex-1 bg-gray-200" />
      </div>
    );
  }

  return (
    <div
      className={cn("h-px w-full bg-gray-200", SPACING[spacing], className)}
      {...props}
    />
  );
}
