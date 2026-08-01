import { NavLink } from "react-router-dom";

import { cn } from "@/lib";

import type { NavigationItem as Item } from "./Navigation.types";

interface Props {
  item: Item;
}

export default function NavigationItem({ item }: Props) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          "relative",
          "whitespace-nowrap",
          "px-4",
          "py-3",
          "text-sm",
          "font-medium",
          "transition-colors",
          isActive ? "text-green-700" : "text-gray-700 hover:text-green-700",
        )
      }
    >
      {({ isActive }) => (
        <>
          {item.label}

          {isActive && (
            <span
              className="
                absolute
                bottom-0
                left-2
                right-2
                h-0.5
                rounded-full
                bg-green-700
              "
            />
          )}
        </>
      )}
    </NavLink>
  );
}
