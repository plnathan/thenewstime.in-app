interface CreativeMediaPreviewProps {
    creativeType:
    | "IMAGE"
    | "VIDEO"
    | "HTML"
    | "TEXT";
    mediaUrl: string;
    altText?: string;
    title?: string;
    className?: string;
}

export default function CreativeMediaPreview({
    creativeType,
    mediaUrl,
    altText,
    title,
    className = "",
}: CreativeMediaPreviewProps) {
    if (!mediaUrl) {
        return null;
    }

    if (creativeType === "IMAGE") {
        return (
            <img
                src={mediaUrl}
                alt={altText || title || "Advertisement creative"}
                className={[
                    "h-full w-full object-contain",
                    className,
                ].join(" ")}
            />
        );
    }

    if (creativeType === "VIDEO") {
        return (
            <video
                src={mediaUrl}
                controls
                preload="metadata"
                className={[
                    "h-full w-full object-contain",
                    className,
                ].join(" ")}
                aria-label={
                    title || "Advertisement video creative"
                }
            />
        );
    }

    return null;
}