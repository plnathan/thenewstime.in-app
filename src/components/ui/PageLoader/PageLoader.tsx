import type { PageLoaderProps } from "./PageLoader.types";

export default function PageLoader({
    message = "செய்தி ஏற்றப்படுகிறது...",
    variant = "page",
}: PageLoaderProps) {
    const isPage = variant === "page";

    return (
        <div
            className={`
        flex
        w-full
        items-center
        justify-center
        ${isPage ? "min-h-[60vh]" : "min-h-[300px]"}
      `}
            role="status"
            aria-live="polite"
            aria-label={message}
        >
            <div
                className="
          flex
          flex-col
          items-center
          justify-center
          text-center
        "
            >
                {/* Animated Brand Loader */}
                <div
                    className={`
            relative
            flex
            items-center
            justify-center
            ${isPage ? "h-24 w-24" : "h-20 w-20"}
          `}
                >
                    {/* Outer pulse ring */}
                    <span
                        className="
              absolute
              inset-0
              animate-ping
              rounded-full
              border
              border-green-500/30
            "
                        aria-hidden="true"
                    />

                    {/* Middle ring */}
                    <span
                        className="
              absolute
              inset-2
              rounded-full
              border-2
              border-green-100
            "
                        aria-hidden="true"
                    />

                    {/* Rotating green ring */}
                    <span
                        className="
              absolute
              inset-2
              animate-spin
              rounded-full
              border-2
              border-transparent
              border-t-green-600
              border-r-green-600
            "
                        aria-hidden="true"
                    />

                    {/* Brand mark */}
                    <div
                        className="
              relative
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-sm
              ring-1
              ring-green-100
            "
                    >
                        <span
                            className="
                text-lg
                font-extrabold
                tracking-tight
                text-green-700
              "
                        >
                            TNT
                        </span>
                    </div>
                </div>

                {/* Brand name */}
                <div
                    className="
            mt-5
            text-base
            font-bold
            tracking-tight
            text-gray-800
          "
                >
                    thenewstime
                    <span className="text-green-600">.in</span>
                </div>

                {/* Loading message */}
                <p
                    className="
            mt-2
            text-sm
            font-medium
            text-gray-500
          "
                >
                    {message}
                </p>

                {/* Animated dots */}
                <div
                    className="
            mt-3
            flex
            items-center
            gap-1.5
          "
                    aria-hidden="true"
                >
                    <span
                        className="
              h-1.5
              w-1.5
              animate-bounce
              rounded-full
              bg-green-600
              [animation-delay:-0.3s]
            "
                    />

                    <span
                        className="
              h-1.5
              w-1.5
              animate-bounce
              rounded-full
              bg-green-600
              [animation-delay:-0.15s]
            "
                    />

                    <span
                        className="
              h-1.5
              w-1.5
              animate-bounce
              rounded-full
              bg-green-600
            "
                    />
                </div>

                <span className="sr-only">{message}</span>
            </div>
        </div>
    );
}