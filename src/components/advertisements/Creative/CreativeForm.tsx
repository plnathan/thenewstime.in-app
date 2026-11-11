import {
    Info,
    Star,
} from "lucide-react";
import type {
    ChangeEvent,
    RefObject,
} from "react";

import CreativeContentEditor from "./CreativeContentEditor";
import CreativeTypeSelector from "./CreativeTypeSelector";
import CreativeVariantSelector from "./CreativeVariantSelector";
import DimensionGuidance from "./CreativeDimensionGuidance";
import DimensionStatusMessage from "./DimensionStatusMessage";
import type {
    AdvertisementCreativePlacementFormat,
    AdvertisementCreativeType,
    AdvertisementCreativeVariant,
    CreativeFormState,
    CreativeDimensionComparison
} from "@/types/creative.types";

interface CreativeFormProps {
    form: CreativeFormState;
    isUploading: boolean;
    editingCreativeId: string | null;
    error: string | null;
    placementFormat:
    | AdvertisementCreativePlacementFormat
    | null;
    expectedWidth: number | null;
    expectedHeight: number | null;
    currentDimensionComparison: CreativeDimensionComparison;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onTypeChange: (
        value: AdvertisementCreativeType,
    ) => void;
    onVariantChange: (
        value: AdvertisementCreativeVariant,
    ) => void;
    onFieldChange: (
        field: keyof CreativeFormState,
        value: string | boolean,
    ) => void;
    onFileChange: (
        event: ChangeEvent<HTMLInputElement>,
    ) => void;
    onSave: () => void;
    onReset: () => void;
}

export default function CreativeForm({
    form,
    isUploading,
    editingCreativeId,
    error,
    placementFormat,
    expectedWidth,
    expectedHeight,
    currentDimensionComparison,
    fileInputRef,
    onTypeChange,
    onVariantChange,
    onFieldChange,
    onFileChange,
    onSave,
    onReset,
}: CreativeFormProps) {
    return (
        <div className="space-y-5">
            <DimensionGuidance
                placementFormat={placementFormat}
            />

            <CreativeTypeSelector
                value={form.creativeType}
                onChange={onTypeChange}
            />

            <CreativeVariantSelector
                value={form.variant}
                onChange={onVariantChange}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                    <label
                        htmlFor="creative-title"
                        className="mb-2 block text-sm font-medium text-gray-800"
                    >
                        Creative Title
                        <span className="ml-1 text-red-500">
                            *
                        </span>
                    </label>

                    <input
                        id="creative-title"
                        type="text"
                        value={form.title}
                        onChange={(event) =>
                            onFieldChange(
                                "title",
                                event.target.value,
                            )
                        }
                        placeholder="Enter a title for this creative"
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                </div>

                <div>
                    <label
                        htmlFor="creative-alt-text"
                        className="mb-2 block text-sm font-medium text-gray-800"
                    >
                        Alt Text
                    </label>

                    <input
                        id="creative-alt-text"
                        type="text"
                        value={form.altText}
                        onChange={(event) =>
                            onFieldChange(
                                "altText",
                                event.target.value,
                            )
                        }
                        placeholder="Describe the creative image"
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-4 flex items-start gap-3">
                    <Info
                        size={18}
                        className="mt-0.5 shrink-0 text-gray-500"
                        aria-hidden="true"
                    />

                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            Creative dimensions
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                            For image and video files, the dimensions
                            are detected automatically and cannot be
                            edited manually.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label
                            htmlFor="creative-width"
                            className="mb-2 block text-sm font-medium text-gray-800"
                        >
                            Actual Width
                        </label>

                        <input
                            id="creative-width"
                            type="number"
                            min="1"
                            value={form.widthPx}
                            readOnly
                            aria-readonly="true"
                            placeholder="Automatically detected"
                            className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="creative-height"
                            className="mb-2 block text-sm font-medium text-gray-800"
                        >
                            Actual Height
                        </label>

                        <input
                            id="creative-height"
                            type="number"
                            min="1"
                            value={form.heightPx}
                            readOnly
                            aria-readonly="true"
                            placeholder="Automatically detected"
                            className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            <DimensionStatusMessage
                comparison={currentDimensionComparison}
            />

            <CreativeContentEditor
                isUploading={isUploading}
                form={form}
                placementFormat={placementFormat}
                expectedWidth={expectedWidth}
                expectedHeight={expectedHeight}
                currentDimensionComparison={
                    currentDimensionComparison
                }
                fileInputRef={fileInputRef}
                onFileChange={onFileChange}
                onFieldChange={onFieldChange}
            />

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <input
                    type="checkbox"
                    checked={form.isPrimary}
                    onChange={(event) =>
                        onFieldChange(
                            "isPrimary",
                            event.target.checked,
                        )
                    }
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />

                <span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                        <Star
                            size={16}
                            className="text-amber-500"
                            aria-hidden="true"
                        />
                        Set as primary creative
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-gray-500">
                        The primary creative for this variant will
                        be preferred during delivery.
                    </span>
                </span>
            </label>

            {error && (
                <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onReset}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    {editingCreativeId
                        ? "Cancel Edit"
                        : "Clear"}
                </button>

                <button
                    type="button"
                    onClick={onSave}
                    className="rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    {editingCreativeId
                        ? "Update Creative"
                        : "Add Creative"}
                </button>
            </div>
        </div>
    );
}