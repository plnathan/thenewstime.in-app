import "./breaking.css";

import BreakingControls from "./BreakingControls";
import BreakingHeadline from "./BreakingHeadline";

import type { NewsView } from "@/types";

interface Props {
    news: NewsView[];
}

export default function BreakingTicker({
    news,
}: Props) {
    const items = news.filter((x) => x.breaking);

    if (!items.length) {
        return null;
    }

    return (
        <section
            className="
        mt-4

        flex
        items-center

        overflow-hidden

        rounded-md

        border

        border-neutral-300

        bg-white
      "
        >
            {/* Label */}

            <div
                className="
          flex
          h-12
          shrink-0
          items-center

          bg-red-600

          px-6
        "
            >
                <span
                    className="
            text-sm
            font-bold

            uppercase

            tracking-wide

            text-white
          "
                >
                    BREAKING
                </span>
            </div>

            {/* Headlines */}

            <div
                className="
          breaking-wrapper

          flex-1

          overflow-hidden
        "
            >
                <div className="breaking-track">
                    {[...items, ...items].map((item, index) => (
                        <BreakingHeadline
                            key={`${item.id}-${index}`}
                            title={item.title}
                            slug={item.slug}
                        />
                    ))}
                </div>
            </div>

            <BreakingControls />
        </section>
    );
}