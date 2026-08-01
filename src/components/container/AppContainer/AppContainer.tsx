/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : AppContainer
 * Description : Responsive application container.
 * -----------------------------------------------------------------------------
 */

import type { PropsWithChildren } from "react";

import { cn } from "@/lib";

export default function AppContainer({ children }: PropsWithChildren) {
  return (
    <div
      className={cn(
        "mx-auto",
        "w-full",
        "max-w-screen-2xl",
        "px-4",
        "sm:px-6",
        "lg:px-8",
      )}
    >
      {children}
    </div>
  );
}
