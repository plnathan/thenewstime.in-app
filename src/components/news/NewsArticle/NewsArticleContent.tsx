import { useState } from "react";
import type { NewsMedia } from "@/components/news/NewsMedia/NewsMedia.types";
import LiveAdvertisementPlacement from "@/components/advertisements/Advertisement/LiveAdvertisementPlacement";

interface NewsArticleContentProps {
  content: string;
  media?: NewsMedia[];
  showAdPlaceholder?: boolean;
  newsId?: number;
  fallbackThumbnailUrl?: string | null;
  fallbackTitle?: string;
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

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
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
  newsId,
  fallbackThumbnailUrl,
  fallbackTitle,
}: NewsArticleContentProps) {
  const [failedThumbnail, setFailedThumbnail] = useState<string | null>(null);
  const contentBlocks = parseNewsContent(content);

  const orderedMedia = [...media].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  // Up to four images are inline. With five or more, only the first
  // three are inline and all remaining images go into the end carousel.
  const inlineMedia = orderedMedia.slice(0, orderedMedia.length > 4 ? 3 : 4);

  // Preserve the thumbnail for articles without any uploaded media.
  const validThumbnail = fallbackThumbnailUrl?.trim() || null;
  const showFallbackThumbnail = orderedMedia.length === 0 && Boolean(validThumbnail && validThumbnail !== failedThumbnail);

  /*
   * Count actual paragraph blocks.
   *
   * Headings and bullet lists do not count as paragraphs.
   */
  const paragraphCount = contentBlocks.filter(
    (block) => block.type === "paragraph",
  ).length;

  // Keep BETWEEN after a paragraph; it is not a footer placement.
  const advertisementParagraph = Math.min(
    inlineMedia.length > 0 ? inlineMedia.length + 1 : 4,
    paragraphCount,
  );

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
      {showFallbackThumbnail && (
        <figure className="mb-8 overflow-hidden rounded-xl bg-gray-100">
          <img src={validThumbnail ?? undefined} alt={fallbackTitle ?? "News image"}
            className="aspect-[16/9] w-full object-contain bg-gray-100"
            onError={() => setFailedThumbnail(validThumbnail)} />
        </figure>
      )}
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
                  "mt-5 sm:mt-6",
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
                  "leading-[1.75] sm:leading-[1.85]",
                  "tracking-[0.005em]",
                  "text-gray-800",
                ].join(" ")}
              >
                {block.items.map((item, itemIndex) => (
                  <li
                    key={`bullet-${index}-${itemIndex}`}
                    className="pl-1"
                  >
                    {renderInlineFormatting(item)}
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

              <p
                className={[
                  "indent-7 sm:indent-10",
                  "font-[Noto_Sans_Tamil,Inter,system-ui,sans-serif]",
                  "text-[1rem] sm:text-[1rem]",
                  "leading-[1.75] sm:leading-[1.85]",
                  "tracking-[0.005em]",
                  "text-gray-800",
                  paragraphNumber > 1 ? "mt-4 sm:mt-5" : "",
                ].join(" ")}
              >
                {renderInlineFormatting(block.text)}
              </p>

              {shouldShowAdvertisement && (
                <div className="my-10 sm:my-12">
                  <LiveAdvertisementPlacement
                    placementCode="NEWS_DETAIL_BETWEEN"
                    newsId={newsId}
                  />
                </div>
              )}
            </div>
          );
        },
      )}
      {inlineMedia.slice(Math.min(paragraphCount, inlineMedia.length)).map((item, index) => (
        <figure key={`trailing-media-${index}`} className="my-8 overflow-hidden rounded-xl bg-gray-100 sm:my-10">
          <img src={item.fileUrl}
            alt={item.altText ?? item.originalFileName ?? "News image"}
            className="aspect-[16/9] w-full object-contain bg-gray-100"
            onError={() => setFailedThumbnail(validThumbnail)} />
          {item.caption && (
            <figcaption className="px-3 py-2 text-xs text-gray-500 sm:px-4">{item.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}