//import { MessageCircle } from "lucide-react";

interface AdvertisementProps {
    className?: string;
}

export default function Advertisement({
    className = "",
}: AdvertisementProps) {
    return (
        <aside
            aria-label="Advertisement"
            className={`flex h-full w-full ${className}`}
        >
            <div
                className="
          flex
          h-full
          min-h-0
          w-full
          flex-col
          items-center
          justify-center
          overflow-hidden
          rounded-lg
          border
          border-gray-200
          bg-gray-50
          px-3
          py-4
          text-center
        "
            >
                <span
                    className="
            text-xs
            font-medium
            tracking-wide
            text-gray-500
          "
                >
                    For Advertisement
                </span>

                {/* <span
                    className="
            mt-2
            text-xs
            font-medium
            text-gray-500
          "
                >
                    For advertisement
                </span> */}

                {/* <span
                    className="
            mt-1.5
            inline-flex
            items-center
            gap-1.5
            text-xs
            font-medium
            text-gray-600
          "
                >
                    <MessageCircle
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                    />

                    86089 34064
                </span> */}
                <span
                    className="
    mt-1.5
    inline-flex
    items-center
    gap-1.5
    text-xs
    font-semibold
    text-green-700
  "
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        aria-hidden="true"
                    >
                        <path
                            fill="currentColor"
                            d="M12.04 2C6.51 2 2 6.51 2 12.04c0 1.77.46 3.43 1.34 4.9L2 22l5.2-1.36a9.98 9.98 0 0 0 4.84 1.25h.01c5.53 0 10.03-4.51 10.03-10.04C22.08 6.51 17.57 2 12.04 2Zm0 18.2h-.01a8.3 8.3 0 0 1-4.23-1.16l-.3-.18-3.09.81.83-3.01-.2-.31a8.28 8.28 0 1 1 7 3.85Zm4.55-6.2c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.45-1.36-1.7-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.57c.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z"
                        />
                    </svg>

                    86089 34064 (WhatsApp Only)
                </span>
            </div>
        </aside>
    );
}