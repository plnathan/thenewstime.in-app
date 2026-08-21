import { cn } from "@/lib";

import NavigationItem from "./NavigationItem";
import { navigationItems } from "./navigation.data";

import type { NavigationProps } from "./Navigation.types";

const hiddenNavigationIds = new Set([6, 8, 9]);

export default function Navigation({
  className,
}: NavigationProps) {
  const visibleNavigationItems = navigationItems.filter(
    (item) => !hiddenNavigationIds.has(item.id),
  );

  return (
    <nav
      className={cn(
        "w-full",
        className,
      )}
    >
      <div
        className="
        flex
        h-12
        items-center
        justify-start
        overflow-x-auto
        whitespace-nowrap
        scrollbar-hide
        lg:justify-center
      "
      >
        {visibleNavigationItems.map((item) => (
          <NavigationItem
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </nav>
  );
}