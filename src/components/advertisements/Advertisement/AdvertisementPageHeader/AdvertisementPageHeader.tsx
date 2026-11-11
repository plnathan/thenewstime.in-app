import {
    ArrowLeft,
    Plus,
} from "lucide-react";
import {
    Link,
} from "react-router-dom";

import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";

interface AdvertisementPageHeaderProps {
    title: string;
    description?: string;
    backTo?: string;
    backLabel?: string;
    createTo?: string;
    createLabel?: string;
    onCreate?: () => void;
    createDisabled?: boolean;
    children?: React.ReactNode;
}

export default function AdvertisementPageHeader({
    title,
    description,
    backTo,
    backLabel = "Back",
    createTo,
    createLabel = "New Advertisement",
    onCreate,
    createDisabled = false,
    children,
}: AdvertisementPageHeaderProps) {
    return (
        <div className="mb-6">
            {backTo && (
                <Link
                    to={backTo}
                    className="
                        mb-4
                        inline-flex
                        min-h-10
                        items-center
                        gap-2
                        rounded-lg
                        px-2
                        text-sm
                        font-medium
                        text-gray-600
                        transition
                        hover:bg-green-50
                        hover:text-green-700
                        focus:outline-none
                        focus:ring-2
                        focus:ring-green-500
                        focus:ring-offset-2
                    "
                >
                    <ArrowLeft
                        size={17}
                        aria-hidden="true"
                    />

                    <span>{backLabel}</span>
                </Link>
            )}

            <div
                className="
                    flex
                    flex-col
                    gap-4
                    lg:flex-row
                    lg:items-end
                    lg:justify-between
                "
            >
                <div className="min-w-0">
                    <Typography
                        as="h1"
                        variant="headline"
                        className="text-2xl md:text-3xl"
                    >
                        {title}
                    </Typography>

                    {description && (
                        <Typography
                            variant="caption"
                            className="mt-1.5 block max-w-3xl"
                        >
                            {description}
                        </Typography>
                    )}
                </div>

                {(createTo || onCreate || children) && (
                    <div
                        className="
                            flex
                            w-full
                            flex-col
                            gap-2
                            sm:w-auto
                            sm:flex-row
                            sm:items-center
                        "
                    >
                        {children}

                        {createTo ? (
                            <Link
                                to={createTo}
                                className="w-full sm:w-auto"
                            >
                                <Button
                                    type="button"
                                    size="md"
                                    leftIcon={
                                        <Plus size={17} />
                                    }
                                    className="w-full sm:w-auto"
                                >
                                    {createLabel}
                                </Button>
                            </Link>
                        ) : onCreate ? (
                            <Button
                                type="button"
                                size="md"
                                leftIcon={
                                    <Plus size={17} />
                                }
                                disabled={createDisabled}
                                onClick={onCreate}
                                className="w-full sm:w-auto"
                            >
                                {createLabel}
                            </Button>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}