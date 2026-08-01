/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Chip
 * File        : Chip.variants.ts
 * Description : Chip variant definitions.
 * Author      : TheNewsTime Team
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { cva } from "class-variance-authority";

export const chipVariants = cva(
  [
    "inline-flex",
    "items-center",
    "gap-2",
    "rounded-full",
    "font-medium",
    "transition-all",
    "duration-200",
    "select-none",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-green-500",
  ],
  {
    variants: {
      variant: {
        filled: "bg-green-600 text-white hover:bg-green-700",

        outline:
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",

        soft: "bg-green-50 text-green-700 hover:bg-green-100",
      },

      size: {
        sm: "h-8 px-3 text-xs",

        md: "h-9 px-4 text-sm",

        lg: "h-10 px-5 text-base",
      },

      selected: {
        true: "ring-2 ring-green-500",
        false: "",
      },
    },

    defaultVariants: {
      variant: "outline",
      size: "md",
      selected: false,
    },
  },
);
