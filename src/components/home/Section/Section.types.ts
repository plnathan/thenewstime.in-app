import type { ReactNode } from "react";

export interface SectionProps {
  title: string;

  subtitle?: string;

  actionLabel?: string;

  onActionClick?: () => void;

  children: ReactNode;

  className?: string;
}
