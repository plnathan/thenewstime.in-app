import {
    FaFacebookF,
    FaWhatsapp,
    FaXTwitter,
} from "react-icons/fa6";

interface NewsSocialShareProps {
    title: string;
    slug: string;
}

function openShareWindow(url: string) {
    window.open(
        url,
        "_blank",
        "noopener,noreferrer,width=700,height=650",
    );
}

export default function NewsSocialShare({
    title,
    slug,
}: NewsSocialShareProps) {
    const articleUrl =
        `${window.location.origin}/news/${encodeURIComponent(slug)}`;

    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(title);

    const whatsappUrl =
        `https://wa.me/?text=${encodeURIComponent(
            `${title}\n${articleUrl}`,
        )}`;

    const facebookUrl =
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    const xUrl =
        `https://x.com/intent/post?text=${encodedTitle}&url=${encodedUrl}`;

    return (
        <div
            className="
        mt-4
        flex
        flex-wrap
        items-center
        gap-3
      "
        >
            <span
                className="
          font-[Noto_Sans_Tamil,Inter,system-ui,sans-serif]
          text-sm
          font-semibold
          text-gray-600
        "
            >
                பகிரவும்:
            </span>

            {/* WhatsApp */}
            <button
                type="button"
                onClick={() => openShareWindow(whatsappUrl)}
                aria-label="Share on WhatsApp"
                title="WhatsApp-ல் பகிரவும்"
                className="
          inline-flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          bg-[#25D366]
          text-white
          shadow-sm
          transition
          hover:scale-105
          hover:shadow-md
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#25D366]
          focus-visible:ring-offset-2
        "
            >
                <FaWhatsapp
                    className="h-5 w-5"
                    aria-hidden="true"
                />
            </button>

            {/* Facebook */}
            <button
                type="button"
                onClick={() => openShareWindow(facebookUrl)}
                aria-label="Share on Facebook"
                title="Facebook-ல் பகிரவும்"
                className="
          inline-flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          bg-[#1877F2]
          text-white
          shadow-sm
          transition
          hover:scale-105
          hover:shadow-md
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#1877F2]
          focus-visible:ring-offset-2
        "
            >
                <FaFacebookF
                    className="h-4 w-4"
                    aria-hidden="true"
                />
            </button>

            {/* X / Twitter */}
            <button
                type="button"
                onClick={() => openShareWindow(xUrl)}
                aria-label="Share on X"
                title="X-ல் பகிரவும்"
                className="
          inline-flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          bg-black
          text-white
          shadow-sm
          transition
          hover:scale-105
          hover:shadow-md
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-black
          focus-visible:ring-offset-2
        "
            >
                <FaXTwitter
                    className="h-4 w-4"
                    aria-hidden="true"
                />
            </button>
        </div>
    );
}