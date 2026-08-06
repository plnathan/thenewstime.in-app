import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    onPrevious?: () => void;
    onNext?: () => void;
}

export default function BreakingControls({
    onPrevious,
    onNext,
}: Props) {
    return (
        <div
            className="
        flex
        shrink-0

        border-l
        border-neutral-200

        bg-white
      "
        >
            <button
                onClick={onPrevious}
                aria-label="Previous Breaking News"
                className="
          flex
          items-center
          justify-center

          h-10
          w-10

          sm:h-11
          sm:w-11

          md:h-12
          md:w-12

          transition-colors

          hover:bg-neutral-100
        "
            >
                <ChevronLeft
                    className="
            h-4
            w-4

            sm:h-5
            sm:w-5
          "
                />
            </button>

            <button
                onClick={onNext}
                aria-label="Next Breaking News"
                className="
          flex
          items-center
          justify-center

          h-10
          w-10

          sm:h-11
          sm:w-11

          md:h-12
          md:w-12

          transition-colors

          hover:bg-neutral-100
        "
            >
                <ChevronRight
                    className="
            h-4
            w-4

            sm:h-5
            sm:w-5
          "
                />
            </button>
        </div>
    );
}