/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : HomeGrid
 * Description : Homepage content and advertisement sidebar layout.
 * -----------------------------------------------------------------------------
 */

import type { PropsWithChildren, ReactNode } from "react";

interface HomeGridProps extends PropsWithChildren {
  sidebar?: ReactNode;
}

export default function HomeGrid({ children, sidebar }: HomeGridProps) {
  return (
    <div
      className={
        sidebar
          ? "grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_300px]"
          : "grid grid-cols-1"
      }
    >
      <div className="min-w-0">{children}</div>

      {sidebar && (
        <aside className="min-w-0 w-full lg:w-[300px] lg:justify-self-end">
          {sidebar}
        </aside>
      )}
    </div>
  );
}
