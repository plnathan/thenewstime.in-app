/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : NewsMeta
 * File        : NewsMeta.tsx
 * Description : Reusable metadata row.
 * Author      : TheNewsTime Team
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import {
  Clock3,
  Eye,
  MessageSquare,
  Volume2,
  BookOpen,
  Radio,
} from "lucide-react";

import { cn } from "@/lib";
import { formatDate } from "@/utils";

import type { NewsMetaProps } from "./NewsMeta.types";

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
        "flex flex-wrap items-center gap-4 text-gray-500",
        compact ? "text-xs" : "text-sm",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        <Clock3 size={14} />
        {formatDate(publishedAt)}
      </span>

      {readingTime !== undefined && (
        <span className="inline-flex items-center gap-1">
          <BookOpen size={14} />
          {readingTime} min read
        </span>
      )}

      {audioAvailable && (
        <span className="inline-flex items-center gap-1">
          <Volume2 size={14} />
          Audio
        </span>
      )}

      {live && (
        <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
          <Radio size={14} />
          LIVE
        </span>
      )}

      {views !== undefined && (
        <span className="inline-flex items-center gap-1">
          <Eye size={14} />
          {Intl.NumberFormat("en-IN").format(views)}
        </span>
      )}

      {comments !== undefined && (
        <span className="inline-flex items-center gap-1">
          <MessageSquare size={14} />
          {comments}
        </span>
      )}
    </div>
  );
}
