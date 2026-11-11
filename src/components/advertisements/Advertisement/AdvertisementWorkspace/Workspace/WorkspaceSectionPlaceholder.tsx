import Surface from "@/components/ui/Surface";
import Typography from "@/components/ui/Typography";

import {
    findWorkspaceNavigationItem,
} from "@/helpers/advertisementWorkspace.helpers";

import type {
    WorkspaceSection,
} from "@/types/advertisementWorkspace.types";

interface AdvertisementWorkspaceSectionPlaceholderProps {
    section: WorkspaceSection;
}

const AdvertisementWorkspaceSectionPlaceholder = ({
    section,
}: AdvertisementWorkspaceSectionPlaceholderProps) => {
    const item =
        findWorkspaceNavigationItem(
            section,
        );

    const Icon =
        item?.icon;

    return (
        <Surface
            className="
                border
                border-gray-200
                p-6
                sm:p-8
            "
        >
            <div
                className="
                    flex
                    min-h-64
                    flex-col
                    items-center
                    justify-center
                    text-center
                "
            >
                <div
                    className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-green-50
                        text-green-700
                    "
                >
                    {Icon && (
                        <Icon
                            size={22}
                            aria-hidden="true"
                        />
                    )}
                </div>

                <Typography
                    as="h2"
                    variant="headline"
                    className="mt-4 text-lg"
                >
                    {item?.label ??
                        "Workspace Section"}
                </Typography>

                <Typography
                    as="p"
                    variant="body"
                    className="
                        mt-2
                        max-w-lg
                        text-sm
                        text-gray-600
                    "
                >
                    {item?.description}
                </Typography>

                <Typography
                    as="p"
                    variant="body"
                    className="
                        mt-4
                        max-w-lg
                        text-xs
                        leading-5
                        text-gray-500
                    "
                >
                    This section will consume its
                    corresponding advertisement API
                    integration in a later implementation
                    phase.
                </Typography>
            </div>
        </Surface>
    );
};

export default AdvertisementWorkspaceSectionPlaceholder;