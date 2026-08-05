import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
}

export default function HeroNavigation({
  onPrevious,
  onNext,
}: HeroNavigationProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Previous slide"
        onClick={onPrevious}
        className="
            absolute
            left-4
            top-1/2
            z-20
            hidden
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-black/30
            p-2
            text-white
            transition-all
            duration-300
            hover:bg-black/60
            md:flex
            "
      >
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        aria-label="Next slide"
        onClick={onNext}
        className="
            absolute
            right-4
            top-1/2
            z-20
            hidden
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-black/30
            p-2
            text-white
            transition-all
            duration-300
            hover:bg-black/60
            md:flex
            "
      >
        <ChevronRight size={22} />
      </button>
    </>
  );
}
