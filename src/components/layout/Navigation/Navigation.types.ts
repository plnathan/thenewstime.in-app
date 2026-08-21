import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  id: number;
  label: string;
  path: string;
  icon?: LucideIcon;
}

export interface NavigationProps {
  className?: string;
}
