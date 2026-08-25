import { useEffect, useRef } from "react";

import { createNewsRead } from "@/api/news-reads.api";
import { getNewsReadSessionId } from "@/utils/session/sessionId";

interface UseNewsReadOptions {
  newsId?: number;
  status?: string;
}

/**
 * Record a news read when a published article is opened.
 *
 * Read tracking is intentionally fire-and-forget.
 * Tracking failures must never affect the article experience.
 */
export function useNewsRead({ newsId, status }: UseNewsReadOptions): void {
  const trackedNewsIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!newsId || status !== "PUBLISHED") {
      return;
    }

    /**
     * Prevent the same mounted component from issuing the
     * request more than once for the same article.
     */
    if (trackedNewsIdRef.current === newsId) {
      return;
    }

    trackedNewsIdRef.current = newsId;

    const trackRead = async () => {
      try {
        const sessionId = getNewsReadSessionId();

        await createNewsRead({
          newsId,
          sessionId,
        });
      } catch (error) {
        /**
         * Read tracking must never interfere with the
         * article page.
         */
        console.error("Unable to record news read:", error);
      }
    };

    void trackRead();
  }, [newsId, status]);
}
