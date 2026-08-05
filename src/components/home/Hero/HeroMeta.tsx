import { Clock3, Eye, MessageSquare } from "lucide-react";

interface Props {
  publishedAt: string;
  views: number;
  comments: number;
}

// export default function HeroMeta({ publishedAt, views, comments }: Props) {
export default function HeroMeta({ views, comments }: Props) {
  return (
    <div
      className="
        mt-4
        flex
        flex-wrap
        items-center
        gap-5
        text-sm
        text-white
      "
    >
      <span className="flex items-center gap-1">
        <Clock3 size={15} />
        {/* {publishedAt} or formatRelativeTime(publishedAt) */}3 hours ago
      </span>

      <span className="flex items-center gap-1">
        <Eye size={15} />
        {views.toLocaleString()}
      </span>

      <span className="flex items-center gap-1">
        <MessageSquare size={15} />
        {comments}
      </span>
    </div>
  );
}
