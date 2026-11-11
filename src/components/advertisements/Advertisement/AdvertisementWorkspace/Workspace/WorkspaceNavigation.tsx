import type {
    WorkspaceSection,
} from "@/types/advertisementWorkspace.types";

import {
    workspaceNavigation,
} from "@/helpers/advertisementWorkspace.helpers";

import Surface from "@/components/ui/Surface";

interface AdvertisementWorkspaceNavigationProps {
    activeSection: WorkspaceSection;
    onSectionChange: (
        section: WorkspaceSection,
    ) => void;
}

const AdvertisementWorkspaceNavigation = ({
    activeSection,
    onSectionChange,
}: AdvertisementWorkspaceNavigationProps) => {
    return (
        <aside
            className="
                self-start
                lg:sticky
                lg:top-6
            "
        >
            <Surface
                className="
                    border
                    border-gray-200
                    p-2
                "
            >
                <nav
                    aria-label="Advertisement workspace"
                >
                    <div
                        className="
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-gray-500
                        "
                    >
                        Advertisement Workspace
                    </div>

                    <div
                        className="
                            flex
                            gap-1
                            overflow-x-auto
                            pb-1
                            lg:block
                            lg:overflow-visible
                        "
                    >
                        {workspaceNavigation.map(
                            (item) => {
                                const Icon = item.icon;

                                const active =
                                    activeSection ===
                                    item.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() =>
                                            onSectionChange(
                                                item.id,
                                            )
                                        }
                                        title={
                                            item.description
                                        }
                                        aria-current={
                                            active
                                                ? "page"
                                                : undefined
                                        }
                                        className={`
                                            relative
                                            z-0
                                            inline-flex
                                            min-w-max
                                            items-center
                                            gap-3
                                            rounded-md
                                            border
                                            border-transparent
                                            px-3
                                            py-2.5
                                            text-left
                                            text-sm
                                            font-semibold
                                            transition
                                            hover:z-10
                                            hover:bg-gray-50
                                            hover:text-gray-900
                                            focus:z-20
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-green-600
                                            focus:ring-offset-1
                                            lg:flex
                                            lg:w-full
                                            ${active
                                                ? "z-10 bg-green-50 text-green-800"
                                                : "text-gray-600"
                                            }
                                        `}
                                    >
                                        <Icon
                                            size={17}
                                            className="shrink-0"
                                            aria-hidden="true"
                                        />

                                        <span>
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            },
                        )}
                    </div>
                </nav>
            </Surface>
        </aside>
    );
};

export default AdvertisementWorkspaceNavigation;