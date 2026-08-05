import { Link } from "react-router-dom";

interface Props {
    title: string;
    slug: string;
}

export default function BreakingHeadline({
    title,
    slug,
}: Props) {
    return (
        <Link
            to={`/news/${slug}`}
            className="
        inline-flex
        items-center
        whitespace-nowrap

        px-6

        text-sm
        font-medium

        text-neutral-900

        hover:text-red-600

        transition-colors
      "
        >
            <span
                className="
          mr-3

          text-red-600

          text-lg

          leading-none
        "
            >
                •
            </span>

            {title}
        </Link>
    );
}