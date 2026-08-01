/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Surface
 * File        : Surface.tsx
 * -----------------------------------------------------------------------------
 */

import { forwardRef } from "react";

import { cn } from "@/lib";

import { surfaceVariants } from "./Surface.variants";
import type { SurfaceProps } from "./Surface.types";

const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      className,

      layout,

      padding,

      border,

      radius,

      shadow,

      hoverable = false,

      clickable = false,

      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          surfaceVariants({
            layout,
            padding,
            border,
            radius,
            shadow,
          }),

          hoverable && "hover:bg-gray-50",

          clickable && "cursor-pointer",

          className,
        )}
        {...props}
      />
    );
  },
);

Surface.displayName = "Surface";

export default Surface;
