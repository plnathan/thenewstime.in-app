/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : MainContent
 * -----------------------------------------------------------------------------
 */

import type { PropsWithChildren } from "react";

export default function MainContent({ children }: PropsWithChildren) {
  return <main className="min-w-0">{children}</main>;
}
