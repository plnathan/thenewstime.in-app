import {
    ChevronLeft,
    ChevronRight,
    Star,
    Trash2,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";

import type { NewsMedia } from "./NewsMedia.types";

interface Props {
    media: NewsMedia;

    index: number;

    total: number;

    onDelete: () => void;

    onMoveLeft: () => void;

    onMoveRight: () => void;

    disabled?: boolean;
}

export default function NewsMediaItem({
    media,
    index,
    total,
    onDelete,
    onMoveLeft,
    onMoveRight,
    disabled = false,
}: Props) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="relative aspect-[16/10] bg-gray-100">
                <img
                    src={
                        media.thumbnailUrl ||
                        media.fileUrl
                    }
                    alt={
                        media.altText ??
                        media.originalFileName ??
                        "News image"
                    }
                    className="h-full w-full object-cover"
                />

                {index === 0 && (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-700 px-2.5 py-1 text-xs font-semibold text-white">
                        <Star
                            size={12}
                            fill="currentColor"
                        />
                        Primary
                    </div>
                )}

                <div className="absolute right-3 top-3 rounded-full bg-black/65 px-2 py-1 text-xs font-medium text-white">
                    #{index + 1}
                </div>
            </div>

            <div className="space-y-3 p-3">
                <Typography
                    variant="caption"
                    className="block truncate text-gray-600"
                >
                    {media.originalFileName}
                </Typography>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={onMoveLeft}
                            disabled={
                                disabled || index === 0
                            }
                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Move image left"
                        >
                            <ChevronLeft size={17} />
                        </button>

                        <button
                            type="button"
                            onClick={onMoveRight}
                            disabled={
                                disabled ||
                                index === total - 1
                            }
                            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Move image right"
                        >
                            <ChevronRight size={17} />
                        </button>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={onDelete}
                        disabled={disabled}
                        leftIcon={
                            <Trash2 size={15} />
                        }
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}