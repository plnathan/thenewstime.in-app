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

          left-2
          sm:left-3
          md:left-5
          lg:left-6

          top-[45%]
          -translate-y-1/2

          z-40

          flex

          h-9
          w-9

          sm:h-10
          sm:w-10

          md:h-11
          md:w-11

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
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={onNext}
        aria-label="Next"
        className="
          absolute

          right-2
          sm:right-3
          md:right-5
          lg:right-6

          top-[45%]
          -translate-y-1/2

          z-40

          flex

          h-9
          w-9

          sm:h-10
          sm:w-10

          md:h-11
          md:w-11

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
        <ChevronRight size={20} />
      </button>
    </>
  );
}