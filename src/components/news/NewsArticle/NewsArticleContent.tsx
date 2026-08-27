import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";
import Advertisement from "@/components/advertisement/Advertisement";

interface NewsArticleContentProps {
  content: string;
  media?: NewsMedia[];
  showAdPlaceholder?: boolean;
}

type ContentBlock =
  | {
    type: "heading";
    text: string;
  }
  | {
    type: "paragraph";
    text: string;
  }
  | {
    type: "bulletList";
    items: string[];
  };

interface RenderableContentBlock {
  block: ContentBlock;
  paragraphNumber: number;
  media?: NewsMedia;
}

function parseNewsContent(content: string): ContentBlock[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  const blocks: ContentBlock[] = [];

  let paragraphLines: string[] = [];
  let bulletItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    const text = paragraphLines
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (text) {
      blocks.push({
        type: "paragraph",
        text,
      });
    }

    paragraphLines = [];
  };

  const flushBullets = () => {
    if (bulletItems.length === 0) {
      return;
    }

    blocks.push({
      type: "bulletList",
      items: [...bulletItems],
    });

    bulletItems = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    /*
     * Blank line:
     * End the current paragraph or bullet list.
     */
    if (!line) {
      flushParagraph();
      flushBullets();
      return;
    }

    /*
     * Heading:
     *
     * ## Heading
     */
    if (line.startsWith("## ")) {
      flushParagraph();
      flushBullets();

      const heading = line.slice(3).trim();

      if (heading) {
        blocks.push({
          type: "heading",
          text: heading,
        });
      }

      return;
    }

    /*
     * Bullet:
     *
     * - Item
     * * Item
     */
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();

      bulletItems.push(line.slice(2).trim());

      return;
    }

    /*
     * Normal text.
     */
    flushBullets();

    paragraphLines.push(line);
  });

  /*
   * Flush any content remaining at the end.
   */
  flushParagraph();
  flushBullets();

  return blocks;
}

export default function NewsArticleContent({
  content,
  media = [],
  showAdPlaceholder = true,
}: NewsArticleContentProps) {
  const contentBlocks = parseNewsContent(content);

  const orderedMedia = [...media].sort(
    (a, b) => a.displayOrder - b.displayOrder,
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
    orderedMedia.length >= 2 && orderedMedia.length <= 3
      ? orderedMedia.slice(1)
      : [];

  /*
   * Count actual paragraph blocks.
   *
   * Headings and bullet lists do not count as paragraphs.
   */
  const paragraphCount = contentBlocks.filter(
    (block) => block.type === "paragraph",
  ).length;

  /*
   * --------------------------------------------------
   * Determine advertisement position.
   *
   * 0 inline images:
   *   After paragraph 4.
   *
   * 2 inline images:
   *   After paragraph 3.
   *
   * 3 inline images:
   *   After paragraph 4.
   *
   * If there are fewer paragraphs, the ad appears
   * after the final available paragraph.
   * --------------------------------------------------
   */
  const advertisementParagraph =
    inlineMedia.length > 0
      ? Math.min(inlineMedia.length + 1, paragraphCount)
      : Math.min(4, paragraphCount);

  /*
   * --------------------------------------------------
   * Create renderable blocks.
   *
   * Paragraph numbers are derived from the block's
   * position instead of mutating a counter during render.
   *
   * This avoids React compiler errors caused by
   * reassigning a variable after render has started.
   * --------------------------------------------------
   */
  const renderableBlocks: RenderableContentBlock[] = contentBlocks.map(
    (block, index) => {
      const paragraphNumber =
        contentBlocks
          .slice(0, index + 1)
          .filter((item) => item.type === "paragraph").length;

      const previousParagraphCount =
        contentBlocks
          .slice(0, index)
          .filter((item) => item.type === "paragraph").length;

      const mediaForParagraph =
        block.type === "paragraph"
          ? inlineMedia[previousParagraphCount]
          : undefined;

      return {
        block,
        paragraphNumber,
        media: mediaForParagraph,
      };
    },
  );

  return (
    <div className="space-y-0">
      {renderableBlocks.map(
        ({ block, paragraphNumber, media: inlineImage }, index) => {
          /*
           * --------------------------------------------------
           * HEADING
           * --------------------------------------------------
           */
          if (block.type === "heading") {
            return (
              <h3
                key={`heading-${index}`}
                className={[
                  "mt-7 sm:mt-8",
                  "font-[Noto_Sans_Tamil,Inter,system-ui,sans-serif]",
                  "text-[1.15rem] sm:text-[1.25rem]",
                  "font-bold",
                  "leading-[1.6]",
                  "tracking-[0.005em]",
                  "text-gray-900",
                ].join(" ")}
              >
                {block.text}
              </h3>
            );
          }

          /*
           * --------------------------------------------------
           * BULLET LIST
           * --------------------------------------------------
           */
          if (block.type === "bulletList") {
            return (
              <ul
                key={`bullets-${index}`}
                className={[
                  "my-5 sm:my-6",
                  "ml-6 sm:ml-8",
                  "list-disc",
                  "space-y-2",
                  "font-[Noto_Sans_Tamil,Inter,system-ui,sans-serif]",
                  "text-[1rem] sm:text-[1rem]",
                  "leading-[2] sm:leading-[2.05]",
                  "tracking-[0.005em]",
                  "text-gray-800",
                ].join(" ")}
              >
                {block.items.map((item, itemIndex) => (
                  <li
                    key={`bullet-${index}-${itemIndex}`}
                    className="pl-1"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            );
          }

          /*
           * --------------------------------------------------
           * PARAGRAPH
           * --------------------------------------------------
           */
          const shouldShowAdvertisement =
            showAdPlaceholder &&
            paragraphNumber === advertisementParagraph;

          return (
            <div key={`paragraph-${index}`}>
              <p
                className={[
                  "indent-7 sm:indent-10",
                  "font-[Noto_Sans_Tamil,Inter,system-ui,sans-serif]",
                  "text-[1rem] sm:text-[1rem]",
                  "leading-[2] sm:leading-[2.05]",
                  "tracking-[0.005em]",
                  "text-gray-800",
                  paragraphNumber > 1 ? "mt-7 sm:mt-8" : "",
                ].join(" ")}
              >
                {block.text}
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
                      bg-gray-100
                    "
                    onError={(event) => {
                      event.currentTarget.src = "/assets/hero.png";
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