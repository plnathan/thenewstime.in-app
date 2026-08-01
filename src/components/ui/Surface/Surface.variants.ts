/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Surface
 * File        : Surface.variants.ts
 * -----------------------------------------------------------------------------
 */

import { cva } from "class-variance-authority";

export const surfaceVariants = cva(["bg-white", "transition-all", "duration-200"], {
  variants: {
    layout: {
      default: "",

      newspaper: "border-b border-gray-200 py-4",

      card: "border border-gray-200 rounded-lg p-4",
    },
    padding: {
      none: "",

      xs: "p-2",

      sm: "p-3",

      md: "p-4",

      lg: "p-6",
    },

    border: {
      none: "",

      bottom: "border-b border-gray-200",

      all: "border border-gray-200",
    },

    radius: {
      none: "",

      sm: "rounded",

      md: "rounded-lg",

      lg: "rounded-xl",
    },

    shadow: {
      none: "",

      sm: "shadow-sm",

      md: "shadow",
    },
  },

  defaultVariants: {
    padding: "none",

    border: "none",

    radius: "none",

    shadow: "none",
  },
});
