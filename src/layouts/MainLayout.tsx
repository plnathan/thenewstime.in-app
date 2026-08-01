/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : MainLayout
 * Description : Root application layout.
 * -----------------------------------------------------------------------------
 */

import type { MainLayoutProps } from "./MainLayout.types";
import Header from "@/components/layout/Header";

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      {children}
    </div>
  );
}
