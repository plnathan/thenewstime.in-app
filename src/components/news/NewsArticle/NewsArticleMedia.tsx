import { useState } from "react";

import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";

interface Props {
    media: NewsMedia[];
}

export default function NewsArticleMedia({
    media,
}: Props) {
    const orderedMedia = [
        ...media,
    ].sort(
        (a, b) =>
            a.displayOrder -
            b.displayOrder,
    );

    const [activeIndex, setActiveIndex] =
        useState(0);

    if (orderedMedia.length <= 1) {
        return null;
    }

    const active =
        orderedMedia[activeIndex];

    if (!active) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="overflow-hidden rounded-xl bg-gray-100">
                <img
                    src={active.fileUrl}
                    alt={
                        active.altText ??
                        active.originalFileName ??
                        "News image"
                    }
                    className="aspect-[16/9] w-full object-cover"
                />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {orderedMedia.map(
                    (item, index) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                                setActiveIndex(index)
                            }
                            className={[
                                "h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition",
                                index === activeIndex
                                    ? "border-green-600"
                                    : "border-transparent",
                            ].join(" ")}
                            aria-label={`View image ${index + 1}`}
                        >
                            <img
                                src={item.thumbnailUrl ?? item.fileUrl}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ),
                )}
            </div>
        </div>
    );
}