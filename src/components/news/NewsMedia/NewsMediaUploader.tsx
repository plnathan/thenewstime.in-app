import {
    ImagePlus,
    Upload,
} from "lucide-react";
import {
    useRef,
    useState,
} from "react";

import { uploadNewsMedia } from "@/api/media.api";

import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";

import NewsMediaPreview from "./NewsMediaPreview";

import type {
    NewsMediaManagerProps,
} from "./NewsMedia.types";

const MAX_IMAGES = 10;

/**
 * Keep frontend validation aligned with
 * backend multer configuration:
 *
 * 5 MB per image.
 */
const MAX_FILE_SIZE =
    5 * 1024 * 1024;

const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

/**
 * Temporary admin identity until the
 * authentication/user module is implemented.
 */
const ADMIN_USER_ID = 1;

export default function NewsMediaUploader({
    newsId,
    media,
    onMediaChange,
    disabled = false,
}: NewsMediaManagerProps) {
    const inputRef =
        useRef<HTMLInputElement>(null);

    const [uploading, setUploading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const selectFiles = () => {
        if (
            disabled ||
            uploading ||
            media.length >= MAX_IMAGES
        ) {
            return;
        }

        inputRef.current?.click();
    };

    const handleFiles = async (
        files: FileList | null,
    ) => {
        if (!files || files.length === 0) {
            return;
        }

        setError(null);

        const selectedFiles =
            Array.from(files);

        if (
            media.length +
            selectedFiles.length >
            MAX_IMAGES
        ) {
            setError(
                `A maximum of ${MAX_IMAGES} images can be uploaded for one news article.`,
            );

            return;
        }

        for (const file of selectedFiles) {
            if (
                !ACCEPTED_TYPES.includes(
                    file.type,
                )
            ) {
                setError(
                    `${file.name} is not a supported image format.`,
                );

                return;
            }

            if (
                file.size >
                MAX_FILE_SIZE
            ) {
                setError(
                    `${file.name} exceeds the 5 MB image size limit.`,
                );

                return;
            }
        }

        try {
            setUploading(true);

            /*
             * Upload all selected images in
             * one request.
             *
             * Backend automatically assigns
             * displayOrder values.
             */
            const response =
                await uploadNewsMedia(
                    newsId,
                    selectedFiles,
                    ADMIN_USER_ID,
                );

            const uploadedMedia =
                response.data ?? [];

            onMediaChange([
                ...media,
                ...uploadedMedia,
            ]);
        } catch (error) {
            console.error(
                "Unable to upload image:",
                error,
            );

            setError(
                "Unable to upload the image. Please try again.",
            );
        } finally {
            setUploading(false);

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <ImagePlus
                                size={20}
                                className="text-green-700"
                            />

                            <Typography
                                as="h2"
                                variant="sectionTitle"
                                className="text-xl"
                            >
                                News Images
                            </Typography>
                        </div>

                        <Typography
                            variant="caption"
                            className="mt-1 block text-gray-500"
                        >
                            Upload up to {MAX_IMAGES} images.
                            The first image is used as the
                            primary image.
                        </Typography>
                    </div>

                    <Button
                        type="button"
                        onClick={selectFiles}
                        disabled={
                            disabled ||
                            uploading ||
                            media.length >=
                            MAX_IMAGES
                        }
                        loading={uploading}
                        leftIcon={
                            <Upload size={17} />
                        }
                    >
                        {uploading
                            ? "Uploading..."
                            : "Add Images"}
                    </Button>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_TYPES.join(
                        ",",
                    )}
                    className="hidden"
                    onChange={(event) =>
                        void handleFiles(
                            event.target.files,
                        )
                    }
                />

                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
            </div>

            <NewsMediaPreview
                newsId={newsId}
                media={media}
                onMediaChange={onMediaChange}
                disabled={
                    disabled || uploading
                }
            />
        </div>
    );
}