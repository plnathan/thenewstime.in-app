import { useState } from "react";

import {
    deleteNewsMedia,
    reorderNewsMedia,
} from "@/api/media.api";

import Typography from "@/components/ui/Typography";

import NewsMediaItem from "./NewsMediaItem";

import type { NewsMedia } from "./NewsMedia.types";

interface Props {
    newsId: number;

    media: NewsMedia[];

    onMediaChange: (
        media: NewsMedia[],
    ) => void;

    disabled?: boolean;
}

export default function NewsMediaPreview({
    newsId,
    media,
    onMediaChange,
    disabled = false,
}: Props) {
    const [busy, setBusy] =
        useState(false);

    const orderedMedia = [...media].sort(
        (a, b) =>
            a.displayOrder -
            b.displayOrder,
    );

    const move = async (
        index: number,
        direction: -1 | 1,
    ) => {
        const targetIndex =
            index + direction;

        if (
            targetIndex < 0 ||
            targetIndex >= orderedMedia.length
        ) {
            return;
        }

        const next = [...orderedMedia];

        const current = next[index];

        const target =
            next[targetIndex];

        if (!current || !target) {
            return;
        }

        next[index] = target;
        next[targetIndex] = current;

        const reordered = next.map(
            (item, itemIndex) => ({
                ...item,
                displayOrder:
                    itemIndex + 1,
            }),
        );

        try {
            setBusy(true);

            await reorderNewsMedia(
                newsId,
                reordered.map(
                    (item) => item.id,
                ),
            );

            onMediaChange(reordered);
        } catch (error) {
            console.error(
                "Unable to reorder news media:",
                error,
            );
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (
        item: NewsMedia,
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to remove this image from the news article?",
            );

        if (!confirmed) {
            return;
        }

        try {
            setBusy(true);

            await deleteNewsMedia(
                newsId,
                item.id,
            );

            const remaining =
                orderedMedia
                    .filter(
                        (mediaItem) =>
                            mediaItem.id !==
                            item.id,
                    )
                    .map(
                        (mediaItem, index) => ({
                            ...mediaItem,
                            displayOrder:
                                index + 1,
                        }),
                    );

            /*
             * Re-persist the order after deletion
             * so there are no gaps.
             */
            if (remaining.length > 0) {
                await reorderNewsMedia(
                    newsId,
                    remaining.map(
                        (mediaItem) =>
                            mediaItem.id,
                    ),
                );
            }

            onMediaChange(remaining);
        } catch (error) {
            console.error(
                "Unable to delete news media:",
                error,
            );
        } finally {
            setBusy(false);
        }
    };

    if (orderedMedia.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
                <Typography
                    variant="body"
                    className="text-gray-500"
                >
                    No images uploaded yet.
                </Typography>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <Typography
                    as="h3"
                    variant="sectionTitle"
                    className="text-lg"
                >
                    Uploaded Images
                </Typography>

                <Typography
                    variant="caption"
                    className="mt-1 block text-gray-500"
                >
                    The first image is the primary
                    image used for the homepage
                    hero and thumbnail.
                </Typography>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {orderedMedia.map(
                    (item, index) => (
                        <NewsMediaItem
                            key={item.id}
                            media={item}
                            index={index}
                            total={orderedMedia.length}
                            disabled={
                                disabled || busy
                            }
                            onDelete={() =>
                                void handleDelete(
                                    item,
                                )
                            }
                            onMoveLeft={() =>
                                void move(index, -1)
                            }
                            onMoveRight={() =>
                                void move(index, 1)
                            }
                        />
                    ),
                )}
            </div>
        </div>
    );
}