/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Component   : NewsMeta
 * -----------------------------------------------------------------------------
 */

import type { HTMLAttributes } from "react";

import {
  Clock3,
  Eye,
  MessageSquare,
  Volume2,
} from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { isAdminUser } from "@/auth/auth.utils";

import { cn } from "@/lib";

export interface NewsMetaProps
  extends HTMLAttributes<HTMLDivElement> {
  publishedAt: string | null;
  views?: number;
  comments?: number;
  readingTime?: string;
  audioAvailable?: boolean;
  live?: boolean;
  compact?: boolean;
}

function formatRelativeTime(
  publishedAt: string | null,
): string {
  if (!publishedAt) {
    return "";
  }

  const publishedDate = new Date(publishedAt);

  if (Number.isNaN(publishedDate.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = now.getTime() - publishedDate.getTime();

  if (diffMs < 0) {
    return "";
  }

  const diffMinutes = Math.floor(
    diffMs / (1000 * 60),
  );

  if (diffMinutes < 1) {
    return "இப்போது";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} நிமிடங்களுக்கு முன்`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} மணி நேரத்திற்கு முன்`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays} நாட்களுக்கு முன்`;
  }

  return publishedDate.toLocaleDateString(
    "ta-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export default function NewsMeta({
  publishedAt,
  views,
  comments,
  readingTime,
  audioAvailable,
  live = false,
  compact = false,
  className,
  ...props
}: NewsMetaProps) {
  const { user } = useAuth();
  const showAdminMeta = isAdminUser(user);
  /*
   * Engagement information is intentionally visible only
   * to authenticated ADMIN / SUPER_ADMIN users.
   *
   * Public visitors should not see views/comments for now.
   */
  //const showEngagement = isAdminUser(user);

  const relativeTime = formatRelativeTime(
    publishedAt,
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 text-gray-500",
        compact ? "text-xs" : "text-sm",
        className,
      )}
      {...props}
    >
      {/* Published time */}
      {relativeTime && (
        <div className="flex items-center gap-1.5">
          <Clock3
            size={compact ? 13 : 15}
            aria-hidden="true"
          />

          <span>{relativeTime}</span>
        </div>
      )}

      {/* Live indicator */}
      {live && (
        <div
          className="
            flex
            items-center
            gap-1.5
            font-medium
            text-red-600
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-red-600
            "
            aria-hidden="true"
          />

          <span>LIVE</span>
        </div>
      )}

      {/* Admin-only engagement information */}
      {showAdminMeta && (
        <>
          {typeof views === "number" && (
            <div className="flex items-center gap-1.5">
              <Eye
                size={compact ? 13 : 15}
                aria-hidden="true"
              />

              <span>{views}</span>
            </div>
          )}

          {typeof comments === "number" && (
            <div className="flex items-center gap-1.5">
              <MessageSquare
                size={compact ? 13 : 15}
                aria-hidden="true"
              />

              <span>{comments}</span>
            </div>
          )}
        </>
      )}

      {/* Reading time */}
      {readingTime && (
        <span>{readingTime}</span>
      )}

      {/* Audio availability */}
      {audioAvailable && (
        <div className="flex items-center gap-1.5">
          <Volume2
            size={compact ? 13 : 15}
            aria-hidden="true"
          />

          <span>Audio</span>
        </div>
      )}
    </div>
  );
}