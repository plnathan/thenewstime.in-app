import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  onPrevious: () => void;
  onNext: () => void;
}

export default function HeroNavigation({
  onPrevious,
  onNext,
}: Props) {
  return (
    <>
      <button
        onClick={onPrevious}
        aria-label="Previous"

        className="
          absolute

          left-4
          md:left-5
          lg:left-6

          top-[45%]
          -translate-y-1/2

          z-40

          flex
          h-11
          w-11

          items-center
          justify-center

          rounded-full

          bg-black/40

          text-white

          backdrop-blur-sm

          transition-all

          hover:bg-black/60
        "
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={onNext}
        aria-label="Next"

        className="
          absolute

          right-4
          md:right-5
          lg:right-6

          top-[45%]
          -translate-y-1/2

          z-40

          flex
          h-11
          w-11

          items-center
          justify-center

          rounded-full

          bg-black/40

          text-white

          backdrop-blur-sm

          transition-all

          hover:bg-black/60
        "
      >
        <ChevronRight size={22} />
      </button>
    </>
  );
}