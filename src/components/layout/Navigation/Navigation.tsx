import { cn } from "@/lib";

import NavigationItem from "./NavigationItem";
import { navigationItems } from "./navigation.data";

import type { NavigationProps } from "./Navigation.types";

export default function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn("border-b", "border-gray-200", "bg-white", className)}>
      <div
        className="
          flex
          overflow-x-auto
          scrollbar-hide

          lg:justify-center
        "
      >
        {navigationItems.map((item) => (
          <NavigationItem key={item.id} item={item} />
        ))}
      </div>
    </nav>
  );
}
