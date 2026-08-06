import { Clock3, Eye, MessageSquare } from "lucide-react";

interface Props {
  publishedAt: string;
  views: number;
  comments: number;
}

export default function HeroMeta({
  views,
  comments,
}: Props) {
  return (
    <div
      className="
        mt-4

        flex
        flex-wrap
        items-center

        gap-4

        text-xs

        text-white/90

        sm:text-sm

        lg:gap-5
      "
    >
      <span className="flex items-center gap-1.5">
        <Clock3 className="h-4 w-4" />
        3 hours ago
      </span>

      <span className="flex items-center gap-1.5">
        <Eye className="h-4 w-4" />
        {views.toLocaleString()}
      </span>

      <span className="flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4" />
        {comments}
      </span>
    </div>
  );
}