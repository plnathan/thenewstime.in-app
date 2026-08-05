import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroTicker() {
  return (
    <div
      className="
        flex
        h-11
        items-center
        border-y
        bg-white
      "
    >
      <div
        className="
          bg-red-600
          px-5
          py-2
          text-sm
          font-bold
          text-white
          uppercase

          clip-breaking
        "
      >
        BREAKING
      </div>

      <div
        className="
          flex-1
          overflow-hidden
          whitespace-nowrap
          px-4
          text-sm
        "
      >
        • இந்திய புதிய செய்திகள் • தமிழகத்தில் கனமழைக்கு வாய்ப்பு • சென்னை
        போக்குவரத்து மாற்றம்
      </div>

      <button className="px-2">
        <ChevronLeft size={18} />
      </button>

      <button className="px-2">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
