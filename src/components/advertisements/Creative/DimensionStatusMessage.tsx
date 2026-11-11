import {
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";

import type {
    CreativeDimensionComparison,
} from "../../../types/creative.types";

interface DimensionStatusMessageProps {
    comparison: CreativeDimensionComparison;
}

export default function DimensionStatusMessage({
    comparison,
}: DimensionStatusMessageProps) {
    if (comparison.status === "NOT_AVAILABLE") {
        return null;
    }

    if (comparison.status === "MATCH") {
        return (
            <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">
                <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                />

                <div>
                    <p className="font-medium">
                        Dimensions match
                    </p>

                    <p className="mt-0.5 text-xs text-green-700">
                        {comparison.message}
                    </p>
                </div>
            </div>
        );
    }

    if (comparison.status === "CLOSE") {
        return (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                />

                <div>
                    <p className="font-medium">
                        Small dimension difference
                    </p>

                    <p className="mt-0.5 text-xs text-amber-700">
                        {comparison.message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
            <AlertTriangle
                size={17}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
            />

            <div>
                <p className="font-medium">
                    Dimension mismatch
                </p>

                <p className="mt-0.5 text-xs text-red-700">
                    {comparison.message}
                </p>
            </div>
        </div>
    );
}