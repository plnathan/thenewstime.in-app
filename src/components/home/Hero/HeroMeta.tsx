import { Eye, MessageCircle } from "lucide-react";

interface Props {
  publishedAt: string | null;
  views?: number;
  comments?: number;
}

export default function HeroMeta({
  publishedAt,
  views = 0,
  comments = 0,
}: Props) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("ta-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "";

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
      {formattedDate && (
        <span>
          {formattedDate}
        </span>
      )}

      <span className="inline-flex items-center gap-1">
        <Eye size={14} />
        {views.toLocaleString()}
      </span>

      <span className="inline-flex items-center gap-1">
        <MessageCircle size={14} />
        {comments.toLocaleString()}
      </span>
    </div>
  );
}