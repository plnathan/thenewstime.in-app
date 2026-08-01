/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Hooks
 * File       : useBreakpoint.ts
 * Description: Responsive breakpoint hook.
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { useEffect, useState } from "react";
import { BREAKPOINTS } from "@/theme";

export type Breakpoint = "mobile" | "tablet" | "laptop" | "desktop";

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.tablet) {
    return "mobile";
  }

  if (width < BREAKPOINTS.laptop) {
    return "tablet";
  }

  if (width < BREAKPOINTS.desktop) {
    return "laptop";
  }

  return "desktop";
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
    getBreakpoint(window.innerWidth),
  );

  useEffect(() => {
    const onResize = (): void => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return breakpoint;
}
