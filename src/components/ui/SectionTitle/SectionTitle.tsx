/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : SectionTitle
 * File        : SectionTitle.tsx
 * Description : Newspaper section title.
 * Author      : TheNewsTime Team
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib";

import Typography from "../Typography";
//import IconButton from "../IconButton";

import type { SectionTitleProps } from "./SectionTitle.types";

export default function SectionTitle({
  title,
  subtitle,
  icon,
  actionLabel,
  onActionClick,
  className,
  ...props
}: SectionTitleProps) {
  return (
    <div className={cn("border-b border-gray-200 pb-3", className)} {...props}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded bg-green-600" />

          {icon}

          <div>
            <Typography variant="sectionTitle">{title}</Typography>

            {subtitle && (
              <Typography variant="caption" className="mt-1">
                {subtitle}
              </Typography>
            )}
          </div>
        </div>

        {actionLabel && (
          <button
            type="button"
            onClick={onActionClick}
            className="group inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
          >
            {actionLabel}

            <ChevronRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        )}
      </div>
    </div>
  );
}
