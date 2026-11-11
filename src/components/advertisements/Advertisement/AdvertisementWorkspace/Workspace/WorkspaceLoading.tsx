import type {
    WorkspaceLoadingProps,
} from "@/types/advertisement.types";

const WorkspaceLoading = ({
    summaryCardCount = 4,
}: WorkspaceLoadingProps) => {
    return (
        <div
            className="
                flex
                flex-col
                gap-6
            "
        >
            <div
                className="
                    h-5
                    w-32
                    animate-pulse
                    rounded
                    bg-gray-200
                "
            />

            <div
                className="
                    h-10
                    w-3/4
                    animate-pulse
                    rounded
                    bg-gray-200
                "
            />

            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                "
            >
                {Array.from({
                    length: summaryCardCount,
                }).map(
                    (_, index) => (
                        <div
                            key={index}
                            className="
                                h-28
                                animate-pulse
                                rounded-xl
                                bg-gray-100
                            "
                        />
                    ),
                )}
            </div>

            <div
                className="
                    h-96
                    animate-pulse
                    rounded-xl
                    bg-gray-100
                "
            />
        </div>
    );
};

export default WorkspaceLoading;