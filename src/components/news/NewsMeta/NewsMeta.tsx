import {
  Clock3,
  Eye,
  MessageSquare,
  Volume2,
} from "lucide-react";

import Typography from "@/components/ui/Typography";

import { formatRelativeTime } from "@/utils/date/formatRelativeTime";

interface NewsMetaProps {
  publishedAt?: string | Date | null;
  views?: number;
  comments?: number;
  audioAvailable?: boolean;
  compact?: boolean;
  className?: string;
}

const TEMP_COMMENTS_COUNT = 1;

export default function NewsMeta({
  publishedAt,
  views = 0,
  //comments = 0,
  audioAvailable = false,
  compact = false,
  className = "",
}: NewsMetaProps) {
  const relativeTime = formatRelativeTime(publishedAt);

  return (
    <div
      className={[
        "flex flex-wrap items-center gap-x-4 gap-y-2",
        compact ? "text-xs" : "text-sm",
        className,
      ].join(" ")}
    >
      {relativeTime && (
        <span className="inline-flex items-center gap-1.5">
          <Clock3
            className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
            aria-hidden="true"
          />

          <Typography
            as="span"
            variant="caption"
          >
            {relativeTime}
          </Typography>
        </span>
      )}

      <span className="inline-flex items-center gap-1.5">
        <Eye
          className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
          aria-hidden="true"
        />

        <Typography
          as="span"
          variant="caption"
        >
          {views}
        </Typography>
      </span>

      <span className="inline-flex items-center gap-1.5">
        <MessageSquare
          className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
          aria-hidden="true"
        />

        <Typography
          as="span"
          variant="caption"
        >
          {TEMP_COMMENTS_COUNT}
        </Typography>
      </span>

      {audioAvailable && (
        <span
          className="inline-flex items-center gap-1.5"
          title="Audio available"
        >
          <Volume2
            className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
            aria-hidden="true"
          />

          <Typography
            as="span"
            variant="caption"
          >
            Audio
          </Typography>
        </span>
      )}
    </div>
  );
}