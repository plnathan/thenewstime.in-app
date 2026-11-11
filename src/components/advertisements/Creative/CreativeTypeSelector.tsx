import {
    Code2,
    FileImage,
    FileText,
    FileVideo,
} from "lucide-react";

import type {
    AdvertisementCreativeType,
} from "../../../types/creative.types";

interface CreativeTypeSelectorProps {
    value: AdvertisementCreativeType;
    onChange: (
        value: AdvertisementCreativeType,
    ) => void;
}

const options: Array<{
    value: AdvertisementCreativeType;
    label: string;
    description: string;
}> = [
        {
            value: "IMAGE",
            label: "Image",
            description: "JPG, PNG, WebP and similar images",
        },
        {
            value: "VIDEO",
            label: "Video",
            description: "Video advertisement creative",
        },
        {
            value: "HTML",
            label: "HTML",
            description: "Custom HTML creative content",
        },
        {
            value: "TEXT",
            label: "Text",
            description: "Text-based advertisement creative",
        },
    ];

export default function CreativeTypeSelector({
    value,
    onChange,
}: CreativeTypeSelectorProps) {
    return (
        <fieldset>
            <legend className="mb-2 block text-sm font-medium text-gray-800">
                Creative Type
            </legend>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {options.map((option) => {
                    const selected =
                        value === option.value;

                    const Icon =
                        option.value === "IMAGE"
                            ? FileImage
                            : option.value === "VIDEO"
                                ? FileVideo
                                : option.value === "HTML"
                                    ? Code2
                                    : FileText;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                                onChange(option.value)
                            }
                            className={[
                                "flex min-h-[82px] items-start gap-3 rounded-lg border p-3 text-left transition",
                                selected
                                    ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
                            ].join(" ")}
                            aria-pressed={selected}
                        >
                            <Icon
                                size={19}
                                className={[
                                    "mt-0.5 shrink-0",
                                    selected
                                        ? "text-green-700"
                                        : "text-gray-500",
                                ].join(" ")}
                                aria-hidden="true"
                            />

                            <span className="min-w-0">
                                <span
                                    className={[
                                        "block text-sm font-semibold",
                                        selected
                                            ? "text-green-900"
                                            : "text-gray-800",
                                    ].join(" ")}
                                >
                                    {option.label}
                                </span>

                                <span className="mt-1 block text-xs leading-4 text-gray-500">
                                    {option.description}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}