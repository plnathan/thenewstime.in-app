import { cn } from "@/lib";

import NavigationItem from "./NavigationItem";
import { navigationItems } from "./navigation.data";

import type { NavigationProps } from "./Navigation.types";

export default function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn("border-b", "border-gray-200", "bg-white", className)}>
      <div
        className="
            mx-auto
            flex
            h-12
            max-w-7xl
            items-center
            justify-start
            overflow-x-auto
            whitespace-nowrap
            scrollbar-hide
            lg:justify-center"
      >
        {navigationItems.map((item) => (
          <NavigationItem key={item.id} item={item} />
        ))}
      </div>
    </nav>
  );
}
