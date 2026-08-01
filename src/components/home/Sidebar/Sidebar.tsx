import type { PropsWithChildren } from "react";

export default function Sidebar({ children }: PropsWithChildren) {
  return <div className="space-y-8">{children}</div>;
}
