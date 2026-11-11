import {
    Monitor,
    Smartphone,
} from "lucide-react";

import type {
    AdvertisementCreativeVariant,
} from "../../../types/creative.types";

interface CreativeVariantSelectorProps {
    value: AdvertisementCreativeVariant;
    onChange: (
        value: AdvertisementCreativeVariant,
    ) => void;
}

export default function CreativeVariantSelector({
    value,
    onChange,
}: CreativeVariantSelectorProps) {
    return (
        <fieldset>
            <legend className="mb-2 block text-sm font-medium text-gray-800">
                Creative Variant
            </legend>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() =>
                        onChange("DESKTOP")
                    }
                    className={[
                        "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition",
                        value === "DESKTOP"
                            ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                            : "border-gray-200 bg-white hover:border-gray-300",
                    ].join(" ")}
                    aria-pressed={
                        value === "DESKTOP"
                    }
                >
                    <Monitor
                        size={19}
                        className={
                            value === "DESKTOP"
                                ? "text-green-700"
                                : "text-gray-500"
                        }
                        aria-hidden="true"
                    />

                    <span>
                        <span className="block text-sm font-semibold text-gray-800">
                            Desktop
                        </span>

                        <span className="mt-0.5 block text-xs text-gray-500">
                            Desktop creative variant
                        </span>
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onChange("MOBILE")
                    }
                    className={[
                        "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition",
                        value === "MOBILE"
                            ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                            : "border-gray-200 bg-white hover:border-gray-300",
                    ].join(" ")}
                    aria-pressed={
                        value === "MOBILE"
                    }
                >
                    <Smartphone
                        size={19}
                        className={
                            value === "MOBILE"
                                ? "text-green-700"
                                : "text-gray-500"
                        }
                        aria-hidden="true"
                    />

                    <span>
                        <span className="block text-sm font-semibold text-gray-800">
                            Mobile
                        </span>

                        <span className="mt-0.5 block text-xs text-gray-500">
                            Mobile creative variant
                        </span>
                    </span>
                </button>
            </div>
        </fieldset>
    );
}