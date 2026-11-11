import { useEffect } from "react";

export const DEFAULT_NEWS_PAGE_TITLE =
  "தமிழ் செய்திகள் | Tamil News | Latest Tamil News | Tamil Online News | ";

/** Restore the default title when navigating away from an article. */
export function usePageTitle(title?: string | null): void {
  useEffect(() => {
    document.title = title?.trim() || DEFAULT_NEWS_PAGE_TITLE;
    return () => {
      document.title = DEFAULT_NEWS_PAGE_TITLE;
    };
  }, [title]);
}
