/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : NewsMeta
 * File        : NewsMeta.tsx
 * Description : Reusable metadata row.
 * -----------------------------------------------------------------------------
 */

import {
  BookOpen,
  Clock3,
  Eye,
  MessageSquare,
  Radio,
  Volume2,
} from "lucide-react";

import { cn } from "@/lib";

import type { NewsMetaProps } from "./NewsMeta.types";

/**
 * Returns relative time.
 */
function formatRelativeTime(date: string): string {
  const published = new Date(date).getTime();
  const now = Date.now();

  const seconds = Math.floor((now - published) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export default function NewsMeta({
  publishedAt,
  views,
  comments,
  readingTime,
  audioAvailable = false,
  live = false,
  compact = false,
  className,
  ...props
}: NewsMetaProps) {
  return (
    <div
      className={cn(
        `
          flex
          flex-wrap
          items-center

          gap-x-4
          gap-y-2

          text-gray-500

          ${compact ? "text-[11px]" : "text-xs sm:text-sm"}
        `,
        className,
      )}
      {...props}
    >
      {/* Published */}

      <span className="inline-flex items-center gap-1">
        <Clock3 size={compact ? 12 : 14} />

        {formatRelativeTime(publishedAt)}
      </span>

      {/* Reading Time */}

      {readingTime !== undefined && (
        <span className="inline-flex items-center gap-1">
          <BookOpen size={compact ? 12 : 14} />
          {readingTime} min
        </span>
      )}

      {/* Audio */}

      {audioAvailable && (
        <span className="inline-flex items-center gap-1">
          <Volume2 size={compact ? 12 : 14} />
          Audio
        </span>
      )}

      {/* Live */}

      {live && (
        <span className="inline-flex items-center gap-1 font-semibold text-red-600">
          <Radio size={compact ? 12 : 14} />
          LIVE
        </span>
      )}

      {/* Views */}

      {views !== undefined && (
        <span className="inline-flex items-center gap-1">
          <Eye size={compact ? 12 : 14} />

          {Intl.NumberFormat("en-IN").format(views)}
        </span>
      )}

      {/* Comments */}

      {comments !== undefined && (
        <span className="inline-flex items-center gap-1">
          <MessageSquare size={compact ? 12 : 14} />

          {comments}
        </span>
      )}
    </div>
  );
}