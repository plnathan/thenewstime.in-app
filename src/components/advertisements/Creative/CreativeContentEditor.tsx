import {
    FileCode2,
    FileText,
    Upload,
} from "lucide-react";
import type {
    ChangeEvent,
    RefObject,
} from "react";

import DimensionStatusMessage from "./DimensionStatusMessage";
import type {
    AdvertisementCreativePlacementFormat,
    CreativeFormState,
    CreativeDimensionComparison
} from "@/types/creative.types";

interface CreativeContentEditorProps {
    form: CreativeFormState;
    isUploading: boolean;
    placementFormat:
    | AdvertisementCreativePlacementFormat
    | null;
    expectedWidth: number | null;
    expectedHeight: number | null;
    currentDimensionComparison: CreativeDimensionComparison;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onFileChange: (
        event: ChangeEvent<HTMLInputElement>,
    ) => void;
    onFieldChange: (
        field: keyof CreativeFormState,
        value: string | boolean,
    ) => void;
}

export default function CreativeContentEditor({
    form,
    isUploading,
    placementFormat,
    expectedWidth,
    expectedHeight,
    currentDimensionComparison,
    fileInputRef,
    onFileChange,
    onFieldChange,
}: CreativeContentEditorProps) {
    const isMediaType =
        form.creativeType === "IMAGE" ||
        form.creativeType === "VIDEO";

    const acceptedFileTypes =
        form.creativeType === "IMAGE"
            ? "image/*"
            : "video/*";

    const typeLabel =
        form.creativeType === "IMAGE"
            ? "image"
            : "video";

    if (isMediaType) {
        return (
            <div className="space-y-4">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                        Creative File
                    </label>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedFileTypes}
                        onChange={onFileChange}
                        className="sr-only"
                        tabIndex={-1}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            fileInputRef.current?.click()
                        }
                        className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-green-400 hover:bg-green-50/40"
                    >
                        <Upload
                            size={24}
                            className="text-gray-500"
                            aria-hidden="true"
                        />

                        <span className="mt-3 text-sm font-semibold text-gray-800">
                            {form.fileName
                                ? "Replace creative file"
                                : `Upload ${typeLabel} creative`}
                        </span>

                        <span className="mt-1 text-xs text-gray-500">
                            Select a {typeLabel} file to automatically
                            detect its dimensions.
                        </span>
                    </button>

                    {form.fileName && (
                        <div className="mt-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                            Selected file:{" "}
                            <span className="font-medium text-gray-800">
                                {form.fileName}
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Expected Width
                        </p>

                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            {expectedWidth !== null
                                ? `${expectedWidth} px`
                                : "Unavailable"}
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Expected Height
                        </p>

                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            {expectedHeight !== null
                                ? `${expectedHeight} px`
                                : "Unavailable"}
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Actual Width
                        </p>

                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            {isUploading ? (
                                <span className="inline-flex items-center gap-2 text-green-700" role="status">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" aria-hidden="true" />
                                    Detecting...
                                </span>
                            ) : form.widthPx
                                ? `${form.widthPx} px`
                                : "Not detected"}
                        </p>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Actual Height
                        </p>

                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            {isUploading ? (
                                <span className="inline-flex items-center gap-2 text-green-700" role="status">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" aria-hidden="true" />
                                    Detecting...
                                </span>
                            ) : form.heightPx
                                ? `${form.heightPx} px`
                                : "Not detected"}
                        </p>
                    </div>
                </div>

                {isUploading && (
                    <p className="flex items-center gap-2 text-sm text-green-700" role="status" aria-live="polite">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" aria-hidden="true" />
                        Uploading creative and detecting actual dimensions. Please wait...
                    </p>
                )}

                {!isUploading && <DimensionStatusMessage
                    comparison={
                        currentDimensionComparison
                    }
                />}

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Contextual Creative Preview
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                The saved creative will be displayed
                                according to the selected placement.
                            </p>
                        </div>

                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            {form.variant === "DESKTOP"
                                ? "Desktop"
                                : "Mobile"}
                        </span>
                    </div>

                    {placementFormat && (
                        <p className="mt-3 text-xs text-gray-500">
                            Placement format:{" "}
                            <span className="font-medium text-gray-700">
                                {placementFormat.displayName ||
                                    placementFormat.code ||
                                    "Selected format"}
                            </span>
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <label
                    htmlFor="creative-content"
                    className="mb-2 block text-sm font-medium text-gray-800"
                >
                    Creative Content
                </label>

                <textarea
                    id="creative-content"
                    value={form.mediaUrl}
                    onChange={(event) =>
                        onFieldChange(
                            "mediaUrl",
                            event.target.value,
                        )
                    }
                    rows={10}
                    placeholder={
                        form.creativeType === "HTML"
                            ? "<div>Your advertisement HTML...</div>"
                            : "Enter advertisement text..."
                    }
                    className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2.5 font-mono text-sm text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
            </div>

            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-3">
                {form.creativeType === "HTML" ? (
                    <FileCode2
                        size={18}
                        className="mt-0.5 shrink-0 text-gray-500"
                        aria-hidden="true"
                    />
                ) : (
                    <FileText
                        size={18}
                        className="mt-0.5 shrink-0 text-gray-500"
                        aria-hidden="true"
                    />
                )}

                <p className="text-xs leading-5 text-gray-600">
                    {form.creativeType === "HTML"
                        ? "HTML creative content is stored as text. Production sanitization and rendering rules should be applied before delivery."
                        : "Text creative content will be rendered according to the selected placement and delivery configuration."}
                </p>
            </div>
        </div>
    );
}