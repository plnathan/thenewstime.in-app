/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Button
 * File        : Button.tsx
 * Description : Reusable button component.
 * Author      : TheNewsTime Team
 * Version     : 1.1.0
 * -----------------------------------------------------------------------------
 */

import { forwardRef } from "react";

import { cn } from "@/lib";

import { buttonVariants } from "./Button.variants";
import type { ButtonProps } from "./Button.types";

const LoadingSpinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      opacity="0.25"
    />

    <path
      d="M22 12A10 10 0 0012 2"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      type = "button",

      leftIcon,
      rightIcon,

      loading = false,
      loadingText,

      children,

      disabled,

      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading}
        className={cn(
          buttonVariants({
            variant,
            size,
            fullWidth,
          }),
          className,
        )}
        {...props}
      >
        <span className="inline-flex items-center gap-2">
          {loading ? (
            <>
              <LoadingSpinner />

              {loadingText ?? children}
            </>
          ) : (
            <>
              {leftIcon}

              {children}

              {rightIcon}
            </>
          )}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
