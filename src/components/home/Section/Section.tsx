/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : Section
 * -----------------------------------------------------------------------------
 */

import SectionTitle from "@/components/ui/SectionTitle";

import type { SectionProps } from "./Section.types";

export default function Section({
  title,
  subtitle,
  actionLabel,
  onActionClick,
  children,
}: SectionProps) {
  return (
    <section className="mb-10">
      <SectionTitle
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        onActionClick={onActionClick}
      />

      <div className="mt-5">{children}</div>
    </section>
  );
}
