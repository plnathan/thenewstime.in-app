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
                className="
          p-3

          hover:bg-neutral-100
        "
            >
                <ChevronLeft size={18} />
            </button>

            <button
                onClick={onNext}
                className="
          p-3

          hover:bg-neutral-100
        "
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}