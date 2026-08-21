import { NavLink, useLocation } from "react-router-dom";

import { cn } from "@/lib";

import type { NavigationItem as Item } from "./Navigation.types";

interface Props {
  item: Item;
}

export default function NavigationItem({ item }: Props) {
  const location = useLocation();

  const [itemPath, itemQuery] = item.path.split("?");

  const currentParams = new URLSearchParams(
    location.search,
  );

  const itemParams = new URLSearchParams(
    itemQuery ?? "",
  );

  const isActive =
    location.pathname === itemPath &&
    currentParams.toString() === itemParams.toString();

  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={() =>
        cn(
          "relative",
          "flex",
          "items-center",
          "gap-1.5",
          "whitespace-nowrap",
          "px-4",
          "py-3",
          "text-sm",
          "font-medium",
          "transition-colors",
          isActive
            ? "text-green-700"
            : "text-gray-700 hover:text-green-700",
        )
      }
    >
      {Icon && (
        <Icon
          size={16}
          strokeWidth={2}
          aria-hidden="true"
        />
      )}

      <span>{item.label}</span>

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
    </NavLink>
  );
}