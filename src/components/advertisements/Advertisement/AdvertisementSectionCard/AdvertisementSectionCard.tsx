import type {
    ReactNode,
} from "react";

import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

interface AdvertisementSectionCardProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export default function AdvertisementSectionCard({
    title,
    description,
    icon,
    action,
    children,
    className = "",
}: AdvertisementSectionCardProps) {
    return (
        <Surface
            padding="lg"
            border="all"
            radius="lg"
            className={className}
        >
            <div
                className="
                    mb-5
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                "
            >
                <div className="flex min-w-0 gap-3">
                    {icon && (
                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-green-50
                                text-green-700
                            "
                        >
                            {icon}
                        </div>
                    )}

                    <div className="min-w-0">
                        <Typography
                            as="h2"
                            variant="sectionTitle"
                            className="text-lg"
                        >
                            {title}
                        </Typography>

                        {description && (
                            <Typography
                                variant="caption"
                                className="mt-1 block"
                            >
                                {description}
                            </Typography>
                        )}
                    </div>
                </div>

                {action && (
                    <div className="shrink-0">
                        {action}
                    </div>
                )}
            </div>

            {children}
        </Surface>
    );
}