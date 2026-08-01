/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : IconButton
 * File        : IconButton.variants.ts
 * -----------------------------------------------------------------------------
 */

import { cva } from "class-variance-authority";

export const iconButtonVariants = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "transition-all",
    "duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-green-500",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-green-600 text-white hover:bg-green-700",

        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",

        ghost: "hover:bg-gray-100",

        outline: "border border-gray-300 bg-white hover:bg-gray-50",
      },

      size: {
        sm: "h-8 w-8",

        md: "h-10 w-10",

        lg: "h-12 w-12",
      },

      rounded: {
        true: "rounded-full",

        false: "rounded-lg",
      },
    },

    defaultVariants: {
      variant: "ghost",

      size: "md",

      rounded: true,
    },
  },
);
