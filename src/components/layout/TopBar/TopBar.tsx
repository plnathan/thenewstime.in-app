import { formatDate } from "@/utils";

import type { TopBarProps } from "./TopBar.types";

export default function TopBar({ show = true }: TopBarProps) {
  if (!show) return null;

  return (
    <div
      className="
        hidden
        lg:flex
        h-10
        items-center
        justify-between
        border-b
        border-gray-200
        bg-gray-50
        px-6
        text-sm
        text-gray-600
      "
    >
      <span>{formatDate(new Date())}</span>{" "}
      {/* {new Date().toLocaleDateString("en-IN")} */}
      <div className="flex items-center gap-6">
        <span>E-Paper</span>
        <span>தமிழ்</span>
      </div>
    </div>
  );
}
