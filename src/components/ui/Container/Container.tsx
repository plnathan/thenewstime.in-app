/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : Container
 * File        : Container.tsx
 * Description : Responsive page container.
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { cn } from "@/lib";
import type { ContainerProps } from "./Container.types";

const SIZE_CLASSES = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
} as const;

export default function Container({
  as: Component = "div",
  children,
  fluid = false,
  size = "xl",
  className,
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full",
        SIZE_CLASSES[size],
        !fluid && "px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </Component>
  );
}
