import { Search } from "lucide-react";

export default function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Search"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          transition-colors
          hover:bg-gray-100
        "
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}
