import SectionTitle from "@/components/ui/SectionTitle";

import type { SectionProps } from "./Section.types";

export default function Section({
  title,
  subtitle,
  actionLabel,
  onActionClick,
  children,
  className,
}: SectionProps) {
  return (
    <section className={className ?? "mb-10"}>
      <SectionTitle
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        onActionClick={onActionClick}
      />

      <div className="mt-2">{children}</div>
    </section>
  );
}