import { useSyncExternalStore } from "react";

import PageLoader from "@/components/ui/PageLoader/PageLoader";

import {
    getNavigationLoading,
    subscribeNavigationLoading,
} from "@/utils/navigationLoader";

export default function NavigationLoader() {
    const loading = useSyncExternalStore(
        subscribeNavigationLoading,
        getNavigationLoading,
        getNavigationLoading,
    );

    if (!loading) {
        return null;
    }

    return (
        <div
            className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        bg-white
      "
        >
            <PageLoader
                message="செய்தி ஏற்றப்படுகின்றன..."
                variant="page"
            />
        </div>
    );
}