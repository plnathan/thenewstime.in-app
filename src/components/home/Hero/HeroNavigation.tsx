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

          left-3
          sm:left-1
          md:left-5
          lg:left-6

          top-1/2
          -translate-y-1/2

          z-40

          flex
          items-center
          justify-center

          h-10
          w-10

          sm:h-11
          sm:w-11

          md:h-12
          md:w-12

          rounded-full

          bg-black/40

          text-white

          backdrop-blur-sm

          transition-all
          duration-200

          hover:bg-black/60
        "
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={onNext}
        aria-label="Next"
        className="
          absolute

          right-3
          sm:right-3
          md:right-5
          lg:right-6

          top-1/2
          -translate-y-1/2

          z-40

          flex
          items-center
          justify-center

          h-10
          w-10

          sm:h-11
          sm:w-11

          md:h-12
          md:w-12

          rounded-full

          bg-black/40

          text-white

          backdrop-blur-sm

          transition-all
          duration-200

          hover:bg-black/60
        "
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </>
  );
}