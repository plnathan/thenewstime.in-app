/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : IconButton
 * -----------------------------------------------------------------------------
 */

import { forwardRef } from "react";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib";

import { iconButtonVariants } from "./IconButton.variants";
import type { IconButtonProps } from "./IconButton.types";

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      loading = false,

      className,

      variant,

      size,

      rounded,

      disabled,

      type = "button",

      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          iconButtonVariants({
            variant,
            size,
            rounded,
          }),
          className,
        )}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : icon}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";

export default IconButton;
