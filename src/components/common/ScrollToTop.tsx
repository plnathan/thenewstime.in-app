import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname, search, hash, key } = useLocation();
    const previousPathname = useRef<string | null>(null);

    useEffect(() => {
        const samePaginatedList =
            (pathname === "/admin/advertisements/list" ||
                pathname === "/admin/news/list") &&
            previousPathname.current === pathname;
        previousPathname.current = pathname;
        if (samePaginatedList) return;
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [pathname, search, hash, key]);

    return null;
}
