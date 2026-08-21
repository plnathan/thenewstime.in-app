/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : UI Primitives
 * Component   : SectionTitle
 * File        : SectionTitle.tsx
 * Description : Newspaper section title.
 * -----------------------------------------------------------------------------
 */

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib";

import Typography from "../Typography";

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
    <div
      className={cn(
        `
          flex
          items-end
          justify-between
          gap-4

          border-b
          border-neutral-200

          pb-3

          flex-wrap
        `,
        className
      )}
      {...props}
    >
      {/* Left */}

      <div className="flex items-center gap-3 min-w-0">
        {/* Green Accent */}

        <span
          className="
            h-8
            w-1

            rounded-full

            bg-green-600

            shrink-0
          "
        />

        {icon}

        <div className="min-w-0">
          <Typography
            variant="sectionTitle"
            className="
                whitespace-nowrap
                leading-none

                text-xl
                font-extrabold

                text-neutral-900

                md:text-2xl
              "
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="caption"
              className="
                mt-1

                text-neutral-500
              "
            >
              {subtitle}
            </Typography>
          )}
        </div>
      </div>

      {/* Right */}

      {actionLabel && (
        <button
          type="button"
          onClick={onActionClick}
          className="
            group

            inline-flex
            items-center
            gap-1

            whitespace-nowrap

            text-sm
            font-semibold

            text-green-700

            transition-colors

            hover:text-green-800
          "
        >
          {actionLabel}

          <ChevronRight
            size={16}
            className="
              transition-transform
              duration-200

              group-hover:translate-x-1
            "
          />
        </button>
      )}
    </div>
  );
}