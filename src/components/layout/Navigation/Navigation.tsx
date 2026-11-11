import { cn } from "@/lib";

import NavigationItem from "./NavigationItem";
import { navigationItems } from "./navigation.data";
import type { NavigationProps } from "./Navigation.types";

// Header-only exclusions. Other pages retain the original navigation data.
const headerItems = navigationItems.filter(
  (item) => item.id !== 6 && item.id !== 8,
);

// Desktop navigation stops at மாவட்டம்; the hamburger contains the rest.
const desktopItems = headerItems.filter((item) =>
  [1, 10, 2, 3, 4, 11].includes(item.id),
);

export default function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn("w-full min-w-0 overflow-hidden", className)} aria-label="News navigation">
      {/* Desktop: fit six primary links without a scrollbar. */}
      <div className="hidden h-12 min-w-0 items-center justify-center overflow-hidden lg:flex">
        {desktopItems.map((item) => (
          <NavigationItem key={item.id} item={item} />
        ))}
      </div>

      {/* Mobile/tablet: swipe remains available, but scrollbars are invisible. */}
      <div
        className="tnt-nav-swipe flex h-12 min-w-0 items-center overflow-x-auto overflow-y-hidden whitespace-nowrap lg:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {headerItems.map((item) => (
          <NavigationItem key={item.id} item={item} />
        ))}
      </div>
      <style>{`.tnt-nav-swipe::-webkit-scrollbar { display: none; width: 0; height: 0; }`}</style>
    </nav>
  );
}
