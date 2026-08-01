/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : MainLayout
 * Description : Root application layout.
 * -----------------------------------------------------------------------------
 */

import type { MainLayoutProps } from "./MainLayout.types";

export default function MainLayout({ children }: MainLayoutProps) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
