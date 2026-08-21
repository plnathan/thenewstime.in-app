import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";
import { splitNewsContent } from "@/utils/news";
import Advertisement from "@/components/advertisement/Advertisement";

interface NewsArticleContentProps {
  content: string;
  media?: NewsMedia[];
  showAdPlaceholder?: boolean;
}

export default function NewsArticleContent({
  content,
  media = [],
  showAdPlaceholder = true,
}: NewsArticleContentProps) {
  const paragraphs = splitNewsContent(content);

  const orderedMedia = [...media].sort(
    (a, b) =>
      a.displayOrder -
      b.displayOrder,
  );

  /*
   * --------------------------------------------------
   * INLINE MEDIA
   *
   * 0–1 images:
   *   No inline images.
   *
   * 2–3 images:
   *   Image #1 is displayed by NewsArticle.
   *   Images #2/#3 are inserted between paragraphs.
   *
   * 4+ images:
   *   All images are handled by
   *   NewsArticleHeroCarousel.
   * --------------------------------------------------
   */
  const inlineMedia =
    orderedMedia.length >= 2 &&
      orderedMedia.length <= 3
      ? orderedMedia.slice(1)
      : [];

  /*
   * --------------------------------------------------
   * Determine where the advertisement should appear.
   *
   * 2 images:
   *   paragraph
   *   image #2
   *   paragraph
   *   advertisement
   *
   * 3 images:
   *   paragraph
   *   image #2
   *   paragraph
   *   image #3
   *   paragraph
   *   advertisement
   *
   * For articles with fewer paragraphs, the ad falls
   * after the final available paragraph.
   * --------------------------------------------------
   */
  const advertisementParagraph =
    inlineMedia.length > 0
      ? Math.min(
        inlineMedia.length + 1,
        paragraphs.length,
      )
      : Math.min(4, paragraphs.length);

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
            advertisementParagraph;

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
                  "text-[1rem] sm:text-[1rem]",
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
                    className="
                        aspect-[16/9]
                        w-full
                        object-contain
                        bg-gray-100"
                    onError={(event) => {
                      event.currentTarget.src =
                        "/assets/hero.png";
                    }}
                  />

                  {inlineImage.caption && (
                    <figcaption className="px-3 py-2 text-xs text-gray-500 sm:px-4">
                      {inlineImage.caption}
                    </figcaption>
                  )}
                </figure>
              )}

              {shouldShowAdvertisement && (
                <div className="my-10 sm:my-12">
                  <Advertisement />
                </div>
              )}
            </div>
          );
        },
      )}
    </div>
  );
}