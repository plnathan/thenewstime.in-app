/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : MainLayout
 * Description : Root application layout.
 * -----------------------------------------------------------------------------
 */

import type { MainLayoutProps } from "./MainLayout.types";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopBottom from "@/components/ui/ScrollToTopBottom/ScrollToTopBottom";

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
      <ScrollToTopBottom />
    </div>
  );
}