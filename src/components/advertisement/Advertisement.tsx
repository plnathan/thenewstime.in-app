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
          items-center
          justify-center
          overflow-hidden
          rounded-lg
          border
          border-gray-200
          bg-gray-50
        "
            >
                <span
                    className="
            text-xs
            font-medium
            tracking-wide
            text-gray-400
          "
                >
                    Advertisement
                </span>
            </div>
        </aside>
    );
}