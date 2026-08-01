/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : HomeGrid
 * Description : Homepage content grid.
 * -----------------------------------------------------------------------------
 */

import type { PropsWithChildren, ReactNode } from "react";

interface HomeGridProps extends PropsWithChildren {
  sidebar?: ReactNode;
}

export default function HomeGrid({ children, sidebar }: HomeGridProps) {
  return (
    <div
      className="
        grid
        gap-8
        lg:grid-cols-8
      "
    >
      <div className="lg:col-span-5">{children}</div>

      {sidebar && <aside className="lg:col-span-3">{sidebar}</aside>}
    </div>
  );
}
