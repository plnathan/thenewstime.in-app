/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Chip
 * File        : Chip.tsx
 * Description : Interactive chip component.
 * Author      : TheNewsTime Team
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { forwardRef } from "react";

import { cn } from "@/lib";

import { chipVariants } from "./Chip.variants";
import type { ChipProps } from "./Chip.types";

const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      children,
      className,
      variant,
      size,
      selected = false,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected}
        className={cn(
          chipVariants({
            variant,
            size,
            selected,
          }),
          className,
        )}
        {...props}
      >
        {leftIcon}

        <span>{children}</span>

        {rightIcon}
      </button>
    );
  },
);

Chip.displayName = "Chip";

export default Chip;
