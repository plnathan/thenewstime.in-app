import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BreakingNewsControls() {
  return (
    <div className="hidden items-center lg:flex">
      <button className="p-2 hover:bg-gray-100">
        <ChevronLeft size={16} />
      </button>

      <button className="p-2 hover:bg-gray-100">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
