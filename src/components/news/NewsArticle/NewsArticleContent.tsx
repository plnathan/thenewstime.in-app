import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";
import { splitNewsContent } from "@/utils/news";

interface NewsArticleContentProps {
  content: string;
  media?: NewsMedia[];
  showAdPlaceholder?: boolean;
  advertisementPosition?: number;
}

export default function NewsArticleContent({
  content,
  media = [],
  showAdPlaceholder = true,
  advertisementPosition = 4,
}: NewsArticleContentProps) {
  const paragraphs = splitNewsContent(content);

  const orderedMedia = [...media].sort(
    (a, b) =>
      a.displayOrder -
      b.displayOrder,
  );

  /*
   * Image #1 is always the primary image.
   *
   * For 2–3 images:
   *   - Image #1 stays at the top of the article.
   *   - Images #2 and #3 are displayed between paragraphs.
   *
   * For 4+ images:
   *   - Images are handled by the article carousel,
   *     outside this component.
   */
  const inlineMedia =
    orderedMedia.length >= 2 &&
      orderedMedia.length <= 3
      ? orderedMedia.slice(1)
      : [];

  return (
    <div className="space-y-0">
      {paragraphs.map(
        (paragraph, index) => {
          const paragraphNumber =
            index + 1;

          const inlineImage =
            inlineMedia[index];

          const shouldShowAdvertisement =
            showAdPlaceholder &&
            paragraphNumber ===
            advertisementPosition;

          return (
            <div
              key={`${paragraphNumber}-${paragraph.slice(
                0,
                32,
              )}`}
            >
              <p
                className={[
                  "indent-7 sm:indent-10",
                  "font-[Noto_Sans_Tamil,Inter,system-ui,sans-serif]",
                  "text-[1.05rem] sm:text-[1.1rem]",
                  "leading-[2] sm:leading-[2.05]",
                  "tracking-[0.005em]",
                  "text-gray-800",
                  index > 0
                    ? "mt-7 sm:mt-8"
                    : "",
                ].join(" ")}
              >
                {paragraph}
              </p>

              {inlineImage && (
                <figure className="my-8 overflow-hidden rounded-xl bg-gray-100 sm:my-10">
                  <img
                    src={inlineImage.fileUrl}
                    alt={
                      inlineImage.altText ??
                      inlineImage.originalFileName ??
                      "News image"
                    }
                    className="w-full object-cover"
                  />

                  {inlineImage.caption && (
                    <figcaption className="px-3 py-2 text-xs text-gray-500">
                      {
                        inlineImage.caption
                      }
                    </figcaption>
                  )}
                </figure>
              )}

              {shouldShowAdvertisement && (
                <div
                  className="my-10 sm:my-12"
                  aria-label="Advertisement placeholder"
                >
                  <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                        Advertisement
                      </span>

                      <p className="mt-2 text-sm text-gray-500">
                        விளம்பரத்திற்கான இடம்
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        },
      )}
    </div>
  );
}